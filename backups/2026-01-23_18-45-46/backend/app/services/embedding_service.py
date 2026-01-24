"""
🔤 Embedding Service

Service for generating text embeddings using sentence-transformers.
"""

from typing import List, Optional

from loguru import logger
from sentence_transformers import SentenceTransformer


class EmbeddingService:
    """Service for generating text embeddings."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the embedding service.

        Args:
            model_name: Name of the sentence-transformers model to use.
                       Default: "all-MiniLM-L6-v2" (384 dimensions, fast and efficient)
        """
        self.model_name = model_name
        self.model: Optional[SentenceTransformer] = None
        self._load_model()

    def _load_model(self):
        """Load the sentence-transformers model."""
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Embedding model loaded successfully. Dimension: {self.get_embedding_dimension()}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise

    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of embeddings produced by this model.

        Returns:
            Embedding dimension (384 for all-MiniLM-L6-v2)
        """
        if self.model is None:
            return 384  # Default for all-MiniLM-L6-v2
        # Get dimension by encoding a dummy string
        try:
            dummy_embedding = self.model.encode("test", show_progress_bar=False)
            return len(dummy_embedding)
        except Exception:
            return 384

    def generate_embeddings(
        self, texts: List[str], batch_size: int = 32, show_progress: bool = False
    ) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.

        Args:
            texts: List of text strings to embed
            batch_size: Number of texts to process in each batch
            show_progress: Whether to show progress bar

        Returns:
            List of embedding vectors (each is a list of floats)
        """
        if not texts:
            return []

        if self.model is None:
            raise RuntimeError("Embedding model not loaded")

        try:
            logger.debug(f"Generating embeddings for {len(texts)} texts")
            # Generate embeddings using sentence-transformers
            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=show_progress,
                convert_to_numpy=True,
                normalize_embeddings=True,  # Normalize for cosine similarity
            )

            # Convert numpy arrays to lists of floats
            embeddings_list = [embedding.tolist() for embedding in embeddings]

            logger.debug(f"Generated {len(embeddings_list)} embeddings of dimension {len(embeddings_list[0]) if embeddings_list else 0}")
            return embeddings_list

        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.

        Args:
            text: Text string to embed

        Returns:
            Embedding vector as a list of floats
        """
        return self.generate_embeddings([text])[0]

