import logging
from typing import List
import numpy as np
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            try:
                # Lazy import to speed up initial server startup
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading SentenceTransformer model: {settings.EMBEDDING_MODEL}...")
                self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
                logger.info("SentenceTransformer model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load sentence-transformers model: {e}. Fallback mock active.")
                self._model = "fallback"
        return self._model

    def get_embedding(self, text: str) -> List[float]:
        if not text or not text.strip():
            return [0.0] * 384

        model = self.model
        if model == "fallback" or model is None:
            logger.warning("Using deterministic numpy fallback for embedding generation.")
            return self._get_fallback_embedding(text)

        try:
            # Generate 384-dimensional vector
            embedding = model.encode(text)
            if hasattr(embedding, "tolist"):
                return embedding.tolist()
            return [float(x) for x in embedding]
        except Exception as e:
            logger.error(f"Error generating embedding: {e}. Returning fallback.")
            return self._get_fallback_embedding(text)

    def _get_fallback_embedding(self, text: str) -> List[float]:
        # Generate a deterministic 384-dimensional vector based on the string hash
        seed = abs(hash(text)) % (2**32)
        state = np.random.RandomState(seed)
        vec = state.uniform(-1.0, 1.0, 384)
        # Normalize the vector
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_service = EmbeddingService()
