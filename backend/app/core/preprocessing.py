# backend/app/core/preprocessing.py
import cv2
import numpy as np
from typing import Tuple, Optional


def load_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    """Decode raw image bytes into an RGB NumPy array."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image_bgr is None:
        raise ValueError("Invalid image content or unsupported format")
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    return image_rgb


def apply_sonar_enhancement(image_rgb: np.ndarray) -> np.ndarray:
    """
    Apply side-scan sonar image normalization (CLAHE contrast equalization)
    to highlight low-reflectivity netting and geometric acoustic shadows.
    """
    # Convert to LAB color space
    lab = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    
    # Apply Contrast Limited Adaptive Histogram Equalization to L-channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)
    
    # Merge channels back and convert to RGB
    enhanced_lab = cv2.merge((cl, a_channel, b_channel))
    enhanced_rgb = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)
    return enhanced_rgb


def compute_pixel_area(x_min: int, y_min: int, x_max: int, y_max: int) -> float:
    """Compute width * height in pixel coordinates."""
    w = max(0, x_max - x_min)
    h = max(0, y_max - y_min)
    return float(w * h)
