"""
🔍 Vector Database Configuration

Configuration for vector database (ChromaDB) settings.
"""

from pathlib import Path
from typing import Optional

from app.core.config import Settings, get_settings
from app.core.data_paths import monk_paths


class VectorConfig:
    """Configuration for vector database operations."""

    def __init__(self, settings: Optional[Settings] = None):
        """
        Initialize vector database configuration.

        Args:
            settings: Application settings. If None, uses default settings.
        """
        self.settings = settings or get_settings()
        
        # Use monk directory for vector database storage
        self.persist_dir = monk_paths.VECTOR_DB_DIR
        
        # Ensure vector database directory exists
        Path(self.persist_dir).mkdir(parents=True, exist_ok=True)
        
        # Collection name for document chunks
        self.collection_name = "document_chunks"
        
        # Embedding dimension (384 for all-MiniLM-L6-v2, will be set when embedding is implemented)
        self.embedding_dimension = 384
        
        # Default similarity search parameters
        self.default_top_k = 5
        self.default_similarity_threshold = 0.7

    @property
    def get_persist_directory(self) -> str:
        """Get the persistent storage directory for ChromaDB."""
        return self.persist_dir

    @property
    def get_collection_name(self) -> str:
        """Get the default collection name."""
        return self.collection_name

    def get_collection_name_for_document(self, doc_id: str) -> str:
        """
        Get collection name for a specific document.
        
        Args:
            doc_id: Document identifier
            
        Returns:
            Collection name for the document
        """
        # Use a single collection for all documents, but can be customized
        return self.collection_name

