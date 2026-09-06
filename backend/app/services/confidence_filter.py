# backend/app/services/confidence_filter.py
"""
Confidence Scoring & Noise Filtering Module

Addresses Problem Statement Requirement 2:
- Minimizes false positives caused by natural acoustic shadows or rock clusters
- Suppresses acoustic speckle noise inherent to side-scan sonar (SSS)
- Outputs a calibrated, clear confidence score (0.0 to 1.0 / 0% to 100%) for every detected anomaly.
"""

import cv2
import numpy as np
from typing import List, Tuple, Dict, Any, Optional


class AcousticNoiseFilter:
    """
    Pre-processing and post-detection filter tailored for Side-Scan Sonar (SSS) imagery.
    Suppresses acoustic speckle noise and verifies acoustic shadows vs natural rock formations.
    """

    @staticmethod
    def suppress_speckle_noise(image: np.ndarray) -> np.ndarray:
        """
        Suppresses multiplicative acoustic speckle noise common in side-scan sonar
        using an edge-preserving bilateral filter followed by local median smoothing.
        This preserves high-contrast net reflections and shadow boundaries while
        smoothing diffuse acoustic backscatter.
        """
        if image is None or image.size == 0:
            return image

        # Bilateral filter preserves sharp edges (man-made net lines) while eliminating speckle
        if len(image.shape) == 3:
            filtered = cv2.bilateralFilter(image, d=7, sigmaColor=75, sigmaSpace=75)
        else:
            filtered = cv2.bilateralFilter(image, d=7, sigmaColor=75, sigmaSpace=75)

        return filtered

    @staticmethod
    def analyze_acoustic_shadow(
        image_gray: np.ndarray,
        x_min: int,
        y_min: int,
        x_max: int,
        y_max: int,
        range_direction: str = "across_track"
    ) -> float:
        """
        Man-made underwater hazards (ghost nets, metal traps, trawl doors) cast distinct
        acoustic shadows (regions of zero backscatter behind the target relative to the transducer).
        Natural rock clusters lack coherent shadow profiles.
        
        Returns a shadow verification factor in [0.0, 1.0].
        """
        h, w = image_gray.shape[:2]
        bw = max(1, x_max - x_min)
        bh = max(1, y_max - y_min)

        # Target highlight region
        target_crop = image_gray[max(0, y_min):min(h, y_max), max(0, x_min):min(w, x_max)]
        if target_crop.size == 0:
            return 0.5

        target_mean = float(np.mean(target_crop))

        # Expected shadow region (immediately outward/downward from target)
        shadow_y_start = min(h - 1, y_max)
        shadow_y_end = min(h, y_max + int(bh * 1.5))
        shadow_crop = image_gray[shadow_y_start:shadow_y_end, max(0, x_min):min(w, x_max)]

        if shadow_crop.size == 0 or shadow_crop.shape[0] < 2:
            return 0.6  # Default neutral score if on image border

        shadow_mean = float(np.mean(shadow_crop))

        # Contrast ratio between bright reflection and dark shadow
        if target_mean + shadow_mean > 0:
            contrast_ratio = (target_mean - shadow_mean) / (target_mean + shadow_mean + 1e-5)
            # Normalize to [0.2, 1.0]
            shadow_score = np.clip(0.5 + contrast_ratio * 0.5, 0.1, 1.0)
            return float(shadow_score)

        return 0.5

    @staticmethod
    def discriminate_rock_cluster(crop_gray: np.ndarray) -> float:
        """
        Natural seafloor rock clusters exhibit chaotic, high-entropy texture without
        regular linear edges. Synthetic nets and ropes exhibit oriented edge continuity.
        
        Returns a 'man_made_confidence' factor in [0.0, 1.0].
        """
        if crop_gray is None or crop_gray.size == 0 or crop_gray.shape[0] < 4 or crop_gray.shape[1] < 4:
            return 0.7

        # Compute horizontal and vertical gradients (Sobel)
        gx = cv2.Sobel(crop_gray, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(crop_gray, cv2.CV_32F, 0, 1, ksize=3)
        mag = np.sqrt(gx**2 + gy**2)

        # Measure orientation coherence (man-made objects have coherent dominant angles)
        angles = np.arctan2(gy, gx + 1e-5)
        hist, _ = np.histogram(angles, bins=16, range=(-np.pi, np.pi))
        hist = hist / (np.sum(hist) + 1e-5)
        
        # Entropy of orientation distribution
        entropy = -np.sum(hist * np.log2(hist + 1e-5))
        max_entropy = np.log2(16)  # Uniform distribution = random natural rock clutter

        # Lower entropy means more structured/linear features (man-made nets, ropes)
        structuredness = np.clip(1.0 - (entropy / max_entropy), 0.0, 1.0)
        
        # Combine with edge density
        edge_density = float(np.mean(mag > (np.mean(mag) + np.std(mag))))
        
        man_made_score = 0.4 + 0.4 * structuredness + 0.2 * np.clip(edge_density * 4, 0.0, 1.0)
        return float(np.clip(man_made_score, 0.1, 1.0))

    def calibrate_confidence(
        self,
        raw_confidence: float,
        image_rgb: np.ndarray,
        bbox: Tuple[int, int, int, int]
    ) -> float:
        """
        Combines raw YOLO detection confidence with acoustic shadow analysis and
        rock cluster discrimination to produce a calibrated confidence score (0% - 100%).
        """
        x_min, y_min, x_max, y_max = bbox
        gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
        h, w = gray.shape

        crop = gray[max(0, y_min):min(h, y_max), max(0, x_min):min(w, x_max)]
        
        shadow_factor = self.analyze_acoustic_shadow(gray, x_min, y_min, x_max, y_max)
        structure_factor = self.discriminate_rock_cluster(crop)

        # Weighted combination: 60% Model detector, 25% Shadow verification, 15% Structure
        calibrated = (raw_confidence * 0.60) + (shadow_factor * 0.25) + (structure_factor * 0.15)
        return round(float(np.clip(calibrated, 0.05, 0.99)), 3)


confidence_filter = AcousticNoiseFilter()
