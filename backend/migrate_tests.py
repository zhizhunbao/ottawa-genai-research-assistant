#!/usr/bin/env python3
"""Migrate test files to match app/ directory structure."""
import os
import shutil

BACKEND = os.path.dirname(os.path.abspath(__file__))
TESTS = os.path.join(BACKEND, "tests")

MOVES = {
    # tests/core/ → tests/azure/
    os.path.join("core", "test_azure_openai.py"): os.path.join("azure", "test_openai.py"),
    os.path.join("core", "test_azure_search.py"): os.path.join("azure", "test_search.py"),
    os.path.join("core", "test_azure_storage.py"): os.path.join("azure", "test_storage.py"),
    os.path.join("core", "test_rag_prompts.py"): os.path.join("azure", "test_prompts.py"),
    # tests/core/ → tests/doc_intel/
    os.path.join("core", "test_document_pipeline.py"): os.path.join("doc_intel", "test_pipeline.py"),
    os.path.join("core", "test_pdf_extractor.py"): os.path.join("doc_intel", "test_pdf_extractor.py"),
    os.path.join("core", "test_text_chunker.py"): os.path.join("doc_intel", "test_text_chunker.py"),
    # tests/ root → tests/evaluation/
    "test_evaluation.py": os.path.join("evaluation", "test_evaluation.py"),
}

NEW_DIRS = ["azure", "doc_intel", "evaluation"]

INIT_PY = '# test package\n'


def main():
    # 1. Create directories
    print("=== Step 1: Create test directories ===")
    for d in NEW_DIRS:
        dpath = os.path.join(TESTS, d)
        os.makedirs(dpath, exist_ok=True)
        init_path = os.path.join(dpath, "__init__.py")
        if not os.path.exists(init_path):
            with open(init_path, "w") as f:
                f.write(INIT_PY)
            print(f"  + tests/{d}/__init__.py")

    # 2. Move files
    print("\n=== Step 2: Move test files ===")
    moved = []
    for src_rel, dst_rel in MOVES.items():
        src = os.path.join(TESTS, src_rel)
        dst = os.path.join(TESTS, dst_rel)
        if not os.path.exists(src):
            print(f"  ⚠ SKIP: tests/{src_rel}")
            continue
        shutil.copy2(src, dst)
        os.remove(src)
        moved.append((src_rel, dst_rel))
        print(f"  ✅ tests/{src_rel} → tests/{dst_rel}")

    # 3. Check if core/ is now empty (except __init__.py and test_document_store.py)
    print("\n=== Step 3: Verify core/ ===")
    core_dir = os.path.join(TESTS, "core")
    remaining = [f for f in os.listdir(core_dir) if f != "__pycache__"]
    print(f"  Remaining in tests/core/: {remaining}")

    print(f"\n=== Summary ===")
    print(f"  Files moved: {len(moved)}")
    for src, dst in moved:
        print(f"    tests/{src} → tests/{dst}")


if __name__ == "__main__":
    main()
