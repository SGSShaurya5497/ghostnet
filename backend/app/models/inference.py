# backend/app/models/inference.py
import logging
import os
from pathlib import Path
from typing import Any, List, Optional
import numpy as np

from app.core.config import settings

logger = logging.getLogger("ghostnet.models")


class YOLOModelManager:
    _instance: Optional["YOLOModelManager"] = None
    _model: Any = None
    _is_loaded: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(YOLOModelManager, cls).__new__(cls)
        return cls._instance

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded and self._model is not None

    def load_model(self) -> bool:
        """Download (if needed) and load the YOLO weights."""
        if self._is_loaded and self._model is not None:
            return True

        try:
            from ultralytics import YOLO
            from huggingface_hub import hf_hub_download

            weights_path: Optional[str] = None
            
            # 1. Check local model_weights directory first
            local_candidate = Path(__file__).resolve().parent.parent.parent / "model_weights" / settings.MODEL_FILENAME
            if local_candidate.exists():
                weights_path = str(local_candidate)
                logger.info(f"Loading model from local path: {weights_path}")
            else:
                # 2. Download from Hugging Face repository
                logger.info(f"Downloading {settings.MODEL_FILENAME} from Hugging Face repo: {settings.MODEL_REPO}...")
                token = settings.HF_TOKEN if settings.HF_TOKEN else None
                weights_path = hf_hub_download(
                    repo_id=settings.MODEL_REPO,
                    filename=settings.MODEL_FILENAME,
                    repo_type="model",
                    token=token
                )
                logger.info(f"Hugging Face model ready at: {weights_path}")

            self._model = YOLO(weights_path)
            self._is_loaded = True
            logger.info("YOLO model successfully loaded and ready for inference.")
            return True
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}", exc_info=True)
            self._is_loaded = False
            self._model = None
            return False

    def predict(self, image: np.ndarray, conf: Optional[float] = None) -> List[Any]:
        """Run inference on an RGB image array."""
        if not self.is_loaded:
            loaded = self.load_model()
            if not loaded or self._model is None:
                raise RuntimeError("Model is not loaded and could not be initialized.")

        confidence = conf if conf is not None else settings.CONF_THRESHOLD
        results = self._model.predict(
            source=image,
            imgsz=settings.IMG_SIZE,
            conf=confidence,
            iou=settings.IOU_THRESHOLD,
            verbose=False,
            save=False
        )
        return results


model_manager = YOLOModelManager()
