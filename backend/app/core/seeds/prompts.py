"""
Seed Data: Default Prompt Templates

Migrated from app/prompts/defaults.py into the unified seed registry.
These 8 system prompts are automatically inserted on first startup.
"""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

_SEEDS = [
    SeedEntry(
        type=DocumentType.PROMPT_TEMPLATE,
        seed_key="prompt:system_prompt",
        tags=["seed", "prompt", "system"],
        data={
            "name": "system_prompt",
            "category": "system",
            "description": "Main system prompt that defines the AI assistant's role and behavior",
            "variables": [],
            "version": 1,
            "template": (
                "You are an AI research assistant for Ottawa's economic development team.\n"
                "Your role is to help analysts understand quarterly reports and economic data.\n"
                "\n"
                "Guidelines:\n"
                "- Answer based ONLY on the provided context. Do not make up information.\n"
                "- If the context does not contain relevant information, say so clearly.\n"
                "- Always cite your sources using numeric format [1], [2] (Page X). "
                "The number refers to the source index in the context.\n"
                "- Provide specific numbers and data points when available.\n"
                "- Be concise but thorough.\n"
                "- Support both English and French queries. Respond in the same language as the query.\n"
                "- When showing trends, mention specific quarters and values.\n"
                "- If asked about topics outside Ottawa economic development, politely redirect."
            ),
        },
    ),
    SeedEntry(
        type=DocumentType.PROMPT_TEMPLATE,
        seed_key="prompt:rag_context",
        tags=["seed", "prompt", "rag_context"],
        data={
            "name": "rag_context",
            "category": "rag_context",
            "description": "Template for injecting retrieved document context into the conversation",
            "variables": ["context"],
            "version": 1,
            "template": (
                "Based on the following retrieved documents, answer the user's question.\n"
                "\n"
                "{context}\n"
                "\n"
                "Important:\n"
                "- Use ONLY the information from the documents above.\n"
                "- Cite sources using [N] (Page X) format for each claim, where N is the "
                "document number above.\n"
                "- If the documents don't contain relevant information, say:\n"
                '  "I could not find relevant information in the available documents."\n'
                "- Provide a confidence level (High/Medium/Low) at the end of your response."
            ),
        },
    ),
    SeedEntry(
        type=DocumentType.PROMPT_TEMPLATE,
        seed_key="prompt:citation_format",
        tags=["seed", "prompt", "citation"],
        data={
            "name": "citation_format",
            "category": "citation",
            "description": "Instructions for formatting citations in responses",
            "variables": ["title", "page", "relevance_note"],
            "version": 1,
            "template": (
                "Format your citations as follows:\n"
                "- Inline: [Source: {title}, Page {page}]\n"
                '- At the end, list all sources used under "Sources:"\n'
                "  1. {title} (Page {page}) - {relevance_note}"
            ),
        },
    ),
    SeedEntry(
        type=DocumentType.PROMPT_TEMPLATE,
        seed_key="prompt:no_results",
        tags=["seed", "prompt", "no_results"],
        data={
            "name": "no_results",
            "category": "no_results",
            "description": "Fallback message when no relevant documents are found",
            "variables": [],
            "version": 1,
            "template": (
                "I could not find relevant information in the available documents "
                "to answer your question.\n"
                "\n"
                "You might try:\n"
                "- Rephrasing your question with different keywords\n"
                "- Asking about a specific quarter or economic indicator\n"
                "- Checking if the relevant report has been uploaded to the system"
            ),
        },
    ),
    SeedEntry(
        type=DocumentType.PROMPT_TEMPLATE,
        seed_key="prompt:chart_extraction",
        tags=["seed", "prompt", "chart"],
        data={
            "name": "chart_extraction",
            "category": "chart",
            "description": "Prompt for extracting chart data from document content",
            "variables": ["query", "content"],
            "version": 1,
            "template": (
                "You are a data analyst specialized in economic reports.\n"
                "Extract numeric data from the provided text to create a structured "
                "chart JSON that helps answer the user's query.\n"
                "\n"
                "User Query: {query}\n"
                "Text Content: {content}\n"
                "\n"
                "Instructions:\n"
                "1. Identify if there's sufficient numeric data to form a trend, "
                "comparison, or distribution.\n"
                "2. Choose the best chart type:\n"
                "   - 'line' for trends over time (quarters, years).\n"
                "   - 'bar' for comparisons between categories.\n"
                "   - 'pie' for parts of a whole (percentages).\n"
                "3. If data is insufficient or irrelevant to the query, return strictly 'null'.\n"
                "4. If data is found, return a VALID JSON object with:\n"
                '   - "type": "line" | "bar" | "pie"\n'
                '   - "title": Concise chart title\n'
                '   - "x_key": Name of the primary category key (e.g., "period", "category")\n'
                '   - "y_keys": List of numeric data keys (e.g., ["value", "growth"])\n'
                '   - "data": List of objects (e.g. [{{"period": "2023 Q1", "value": 12.5}}, ...])\n'
                "\n"
                "Output ONLY the JSON or 'null'. Do not include markdown formatting or extra text."
            ),
        },
    ),
    SeedEntry(
        type=DocumentType.PROMPT_TEMPLATE,
        seed_key="prompt:eval_coherence",
        tags=["seed", "prompt", "evaluation"],
        data={
            "name": "eval_coherence",
            "category": "evaluation",
            "description": "Evaluation prompt for response coherence",
            "variables": ["query", "response"],
            "version": 1,
            "template": (
                "Evaluate the COHERENCE of the response — how logically structured "
                "and easy to follow it is.\n"
                "\n"
                "Query: {query}\n"
                "Response: {response}\n"
                "\n"
                "Rating scale:\n"
                "1 = Completely incoherent, disorganized\n"
                "2 = Mostly incoherent, hard to follow\n"
                "3 = Partially coherent, some logical flow\n"
                "4 = Mostly coherent, well-structured\n"
                "5 = Perfectly coherent, excellent logical flow\n"
                "\n"
                'Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}'
            ),
        },
    ),
    SeedEntry(
        type=DocumentType.PROMPT_TEMPLATE,
        seed_key="prompt:eval_relevancy",
        tags=["seed", "prompt", "evaluation"],
        data={
            "name": "eval_relevancy",
            "category": "evaluation",
            "description": "Evaluation prompt for response relevancy",
            "variables": ["query", "response"],
            "version": 1,
            "template": (
                "Evaluate the RELEVANCY of the response — how well it addresses "
                "the user's query.\n"
                "\n"
                "Query: {query}\n"
                "Response: {response}\n"
                "\n"
                "Rating scale:\n"
                "1 = Completely irrelevant\n"
                "2 = Mostly irrelevant, answers a different question\n"
                "3 = Partially relevant, addresses some aspects\n"
                "4 = Mostly relevant, covers key points\n"
                "5 = Perfectly relevant, directly and fully addresses the query\n"
                "\n"
                'Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}'
            ),
        },
    ),
    SeedEntry(
        type=DocumentType.PROMPT_TEMPLATE,
        seed_key="prompt:eval_grounding",
        tags=["seed", "prompt", "evaluation"],
        data={
            "name": "eval_grounding",
            "category": "evaluation",
            "description": "Evaluation prompt for response grounding (hallucination check)",
            "variables": ["context", "response"],
            "version": 1,
            "template": (
                "Evaluate the GROUNDING of the response — whether all claims are "
                "supported by the provided context.\n"
                "Check for any hallucinated or fabricated information.\n"
                "\n"
                "Context: {context}\n"
                "Response: {response}\n"
                "\n"
                "Rating scale:\n"
                "1 = Completely fabricated, no grounding in context\n"
                "2 = Mostly fabricated, few claims supported\n"
                "3 = Partially grounded, some unsupported claims\n"
                "4 = Mostly grounded, minor unsupported details\n"
                "5 = Perfectly grounded, all claims traceable to context\n"
                "\n"
                'Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}'
            ),
        },
    ),
]

SeedRegistry.register_many(_SEEDS)
