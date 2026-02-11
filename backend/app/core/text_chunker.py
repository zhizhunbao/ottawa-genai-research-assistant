"""
文档分块器

将长文本按语义分块，用于 RAG 管道中的 embedding 生成和索引。
分块策略: 按段落 → 按句子 → 硬分割
"""

import logging
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TextChunk:
    """文本分块"""
    text: str
    chunk_index: int        # 在整个文档中的分块序号 (0-indexed)
    page_number: int = 0    # 来源页码 (1-indexed, 0 表示未知)
    start_char: int = 0     # 在原文中的起始字符位置
    end_char: int = 0       # 在原文中的结束字符位置
    char_count: int = 0

    def __post_init__(self) -> None:
        self.char_count = len(self.text)


class TextChunker:
    """
    文本分块器

    将长文本分割为可索引的块，支持重叠以保留上下文。

    分块策略（按优先级）:
    1. 按段落边界分割
    2. 按句子边界分割
    3. 硬分割（按字符数）

    技术规格:
    - chunk_size: 1000 字符（默认）
    - chunk_overlap: 200 字符（默认）
    - min_chunk_size: 100 字符（默认）
    """

    # 句子分隔符正则
    SENTENCE_SEPARATORS = re.compile(r'(?<=[.!?。！？\n])\s+')

    # 段落分隔符正则
    PARAGRAPH_SEPARATORS = re.compile(r'\n\s*\n')

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        min_chunk_size: int = 100,
    ) -> None:
        """
        初始化分块器

        Args:
            chunk_size: 目标分块大小（字符数）
            chunk_overlap: 分块重叠大小（字符数）
            min_chunk_size: 最小分块大小（字符数），小于此值的块会被合并
        """
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be less than chunk_size")
        if min_chunk_size > chunk_size:
            raise ValueError("min_chunk_size must be less than or equal to chunk_size")

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunk_size = min_chunk_size

    def chunk_text(
        self,
        text: str,
        page_number: int = 0,
        start_chunk_index: int = 0,
    ) -> list[TextChunk]:
        """
        将文本分割为块

        Args:
            text: 要分割的文本
            page_number: 来源页码 (1-indexed)
            start_chunk_index: 分块起始序号

        Returns:
            分块列表
        """
        if not text or not text.strip():
            return []

        text = text.strip()

        # 如果文本本身就小于 chunk_size，直接返回
        if len(text) <= self.chunk_size:
            return [
                TextChunk(
                    text=text,
                    chunk_index=start_chunk_index,
                    page_number=page_number,
                    start_char=0,
                    end_char=len(text),
                )
            ]

        # 1. 先按段落分割
        paragraphs = self.PARAGRAPH_SEPARATORS.split(text)
        paragraphs = [p.strip() for p in paragraphs if p.strip()]

        # 2. 合并段落形成分块
        chunks = self._merge_into_chunks(paragraphs, page_number, start_chunk_index)

        return chunks

    def chunk_pages(
        self,
        pages: list[dict],
    ) -> list[TextChunk]:
        """
        将多页内容分块

        Args:
            pages: 页面列表，每项包含 'text' 和 'page_number'

        Returns:
            分块列表
        """
        all_chunks: list[TextChunk] = []
        chunk_index = 0

        for page in pages:
            text = page.get("text", "")
            page_number = page.get("page_number", 0)

            page_chunks = self.chunk_text(
                text=text,
                page_number=page_number,
                start_chunk_index=chunk_index,
            )

            all_chunks.extend(page_chunks)
            chunk_index += len(page_chunks)

        return all_chunks

    def _merge_into_chunks(
        self,
        segments: list[str],
        page_number: int,
        start_chunk_index: int,
    ) -> list[TextChunk]:
        """
        将文本片段（段落/句子）合并为适当大小的分块

        Args:
            segments: 文本片段列表
            page_number: 来源页码
            start_chunk_index: 起始分块序号

        Returns:
            分块列表
        """
        chunks: list[TextChunk] = []
        current_text = ""
        current_start = 0
        char_offset = 0
        chunk_index = start_chunk_index

        for segment in segments:
            # 如果当前段落本身超过 chunk_size，需要进一步分割
            if len(segment) > self.chunk_size:
                # 先把已积累的文本作为一个块
                if current_text.strip() and len(current_text.strip()) >= self.min_chunk_size:
                    chunks.append(TextChunk(
                        text=current_text.strip(),
                        chunk_index=chunk_index,
                        page_number=page_number,
                        start_char=current_start,
                        end_char=current_start + len(current_text.strip()),
                    ))
                    chunk_index += 1

                # 拆分大段落
                sub_chunks = self._split_large_segment(
                    segment, page_number, chunk_index, char_offset
                )
                chunks.extend(sub_chunks)
                chunk_index += len(sub_chunks)

                current_text = ""
                char_offset += len(segment) + 2  # +2 for paragraph separator
                current_start = char_offset
                continue

            # 检查添加这个段落后是否超过 chunk_size
            test_text = current_text + ("\n\n" if current_text else "") + segment

            if len(test_text) > self.chunk_size:
                # 当前块已满，保存并开始新块
                if current_text.strip() and len(current_text.strip()) >= self.min_chunk_size:
                    chunks.append(TextChunk(
                        text=current_text.strip(),
                        chunk_index=chunk_index,
                        page_number=page_number,
                        start_char=current_start,
                        end_char=current_start + len(current_text.strip()),
                    ))
                    chunk_index += 1

                # 添加重叠：从当前块末尾取 overlap 字符
                overlap_text = self._get_overlap_text(current_text)
                current_text = overlap_text + ("\n\n" if overlap_text else "") + segment
                current_start = char_offset - len(overlap_text) if overlap_text else char_offset
            else:
                current_text = test_text

            char_offset += len(segment) + 2  # +2 for paragraph separator

        # 处理最后一个块
        if current_text.strip():
            if len(current_text.strip()) >= self.min_chunk_size:
                chunks.append(TextChunk(
                    text=current_text.strip(),
                    chunk_index=chunk_index,
                    page_number=page_number,
                    start_char=current_start,
                    end_char=current_start + len(current_text.strip()),
                ))
            elif chunks:
                # 如果最后一段太短，合并到前一个块
                last_chunk = chunks[-1]
                merged_text = last_chunk.text + "\n\n" + current_text.strip()
                chunks[-1] = TextChunk(
                    text=merged_text,
                    chunk_index=last_chunk.chunk_index,
                    page_number=page_number,
                    start_char=last_chunk.start_char,
                    end_char=current_start + len(current_text.strip()),
                )
            else:
                # 只有一个很短的段落但没有其他块
                chunks.append(TextChunk(
                    text=current_text.strip(),
                    chunk_index=chunk_index,
                    page_number=page_number,
                    start_char=current_start,
                    end_char=current_start + len(current_text.strip()),
                ))

        return chunks

    def _split_large_segment(
        self,
        text: str,
        page_number: int,
        start_chunk_index: int,
        char_offset: int,
    ) -> list[TextChunk]:
        """
        分割超长段落

        先按句子分割，如果还是太长则硬分割。

        Args:
            text: 超长文本
            page_number: 来源页码
            start_chunk_index: 起始分块序号
            char_offset: 在原文中的偏移量

        Returns:
            分块列表
        """
        # 先按句子分割
        sentences = self.SENTENCE_SEPARATORS.split(text)
        sentences = [s.strip() for s in sentences if s.strip()]

        if len(sentences) > 1:
            # 可以按句子分割
            return self._merge_into_chunks(
                sentences, page_number, start_chunk_index
            )

        # 无法按句子分割，硬分割
        chunks: list[TextChunk] = []
        chunk_index = start_chunk_index
        step = self.chunk_size - self.chunk_overlap
        pos = 0

        while pos < len(text):
            end = min(pos + self.chunk_size, len(text))
            chunk_text = text[pos:end].strip()

            if chunk_text and len(chunk_text) >= self.min_chunk_size:
                chunks.append(TextChunk(
                    text=chunk_text,
                    chunk_index=chunk_index,
                    page_number=page_number,
                    start_char=char_offset + pos,
                    end_char=char_offset + end,
                ))
                chunk_index += 1
            elif chunk_text and chunks:
                # 合并到前一个块
                last = chunks[-1]
                chunks[-1] = TextChunk(
                    text=last.text + " " + chunk_text,
                    chunk_index=last.chunk_index,
                    page_number=page_number,
                    start_char=last.start_char,
                    end_char=char_offset + end,
                )

            pos += step

        return chunks

    def _get_overlap_text(self, text: str) -> str:
        """
        获取重叠文本

        从文本末尾截取 overlap 字符，尽量在句子/词边界处断开。

        Args:
            text: 原文

        Returns:
            重叠文本
        """
        if not text or self.chunk_overlap <= 0:
            return ""

        overlap = text[-self.chunk_overlap:]

        # 尝试在句子边界处断开
        sentence_match = self.SENTENCE_SEPARATORS.search(overlap)
        if sentence_match:
            return overlap[sentence_match.end():]

        # 尝试在词边界处断开
        space_idx = overlap.find(" ")
        if space_idx > 0:
            return overlap[space_idx + 1:]

        return overlap
