# -*- coding: utf-8 -*-
"""ghostnetPINGE - Inference (Local Version)

Pulls best.pt from the Hugging Face model repo and runs YOLO inference
on your images. Adapted from the original Colab notebook for local execution.

Requirements (install once):
    pip install -U ultralytics huggingface_hub

Usage:
    Optionally set HF_TOKEN as an environment variable, or the script will prompt you.
    Point SOURCE to your image folder or a single image file before running.
"""

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Hugging Face login
# ---------------------------------------------------------------------------
from huggingface_hub import login, hf_hub_download

hf_token = os.environ.get("HF_TOKEN", "").strip()
if not hf_token:
    hf_token = input(
        "Enter your Hugging Face token (press Enter to skip for public repos): "
    ).strip()

if hf_token:
    login(hf_token)
else:
    print("[info] No HF token provided – attempting anonymous access (public repos only).")

# ---------------------------------------------------------------------------
# Pull best.pt from Hugging Face
# ---------------------------------------------------------------------------
HF_MODEL_REPO = "zzephyrr/GhostNetyolo26m"
WEIGHT_FILE = "best.pt"

print(f"[inference] Downloading {WEIGHT_FILE} from {HF_MODEL_REPO} ...")
weights_path = hf_hub_download(
    repo_id=HF_MODEL_REPO,
    filename=WEIGHT_FILE,
    repo_type="model",
)
print(f"[inference] Model ready at: {weights_path}")

# ---------------------------------------------------------------------------
# Load YOLO model
# ---------------------------------------------------------------------------
from ultralytics import YOLO

model = YOLO(weights_path)

# ---------------------------------------------------------------------------
# Run inference
#
# Change SOURCE to point at your actual images or video:
#   - A folder of images: r"C:\path\to\images"
#   - A single image:     r"C:\path\to\image.jpg"
#   - A video file:       r"C:\path\to\video.mp4"
#   - Webcam:             0
# ---------------------------------------------------------------------------
SOURCE = r"C:\Users\rouna\Downloads\SIH\images"  # <-- Update this path

if not Path(str(SOURCE)).exists():
    print(f"[warning] SOURCE path not found: {SOURCE}")
    user_src = input("Enter path to your images/video (or press Enter for webcam): ").strip()
    SOURCE = user_src if user_src else 0

predictions = model.predict(
    source=SOURCE,
    imgsz=640,
    conf=0.25,
    save=True,      # annotated outputs -> runs/detect/predict*/
    save_txt=True,  # YOLO-format .txt labels alongside images
    save_conf=True, # include confidence scores in .txt labels
)

# ---------------------------------------------------------------------------
# Quick summary: how many Crab-Pot detections per image
# ---------------------------------------------------------------------------
for pred in predictions:
    n_dets = len(pred.boxes)
    print(f"{Path(pred.path).name}: {n_dets} Crab-Pot detection(s)")

if predictions:
    print("\nAnnotated outputs saved to:", predictions[0].save_dir)
else:
    print("\nNo predictions were made.")
