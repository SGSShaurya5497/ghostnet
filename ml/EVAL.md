# GhostNet Model Evaluation

**Model:** `zzephyrr/GhostNetyolo26m` → `best.pt` (YOLOv8 small, single-class: ghost-net / marine debris)
**Prepared:** 2026-09-15

---

## Honest Status: No Formal Held-Out Evaluation Exists

There is currently **no held-out validation or test set** for this model. This document explains exactly why, what evidence we do have, and what the concrete next step is to get a real number.

> This is the honest position. A fabricated mAP number that we cannot reproduce on demand is worse for technical judging than a clear explanation of why we don't have one yet.

---

## Why No Evaluation Exists

### 1. Training data is not recorded in this repository

`ml/train.py` is a stub (one comment line). The `ml/data/` directory contains only a `.gitkeep` file. The training dataset — wherever it was assembled — was not committed to the repo and no split methodology (train/val/test ratio, random seed, stratification) was recorded.

### 2. No training run artifacts exist in this repo

The `runs/` directory contains only `runs/detect/predict/` — a single YOLO inference run on an unlabeled video clip (`0.avi`). The 85 label files in that folder (`0_0.txt` … `0_86.txt`) are raw YOLO **prediction outputs** in the format:

```
class_id  cx  cy  bw  bh  confidence
0  0.154338  0.921991  0.0976723  0.0993726  0.505168
```

These are **model outputs with no corresponding ground-truth annotations**. There is no `results.csv`, no confusion matrix, no `val/` run, and no training metrics of any kind in this repository. Citing them as "indicative training metrics" would be incorrect — they are detections of unknown correctness on an unlabeled video.

### 3. The Hugging Face model repo has no linked dataset

`zzephyrr/GhostNetyolo26m` hosts only `best.pt`. No dataset card, no sibling dataset repository, and no README metrics were found in the HF repo.

---

## What We Do Know (Without Fabricating)

| Property | Value | Source |
|:---|:---|:---|
| Architecture | YOLOv8 small (YOLOv8s) | `best.pt` filename convention + ultralytics load |
| Task | Single-class object detection: marine debris / ghost net | Observed from prediction labels (always class `0`) |
| Classes detected | 1 (class 0 — inferred as "Crab-Pot" / ghost net from `features/common.py`) | Prediction label files |
| Confidence range observed | 0.34 – 0.51 on unlabeled video frames | `runs/detect/predict/labels/*.txt` |
| Detections per frame (unlabeled video) | 1–3 per frame across 85 frames | `runs/detect/predict/labels/*.txt` |
| Training origin | Unknown — not recorded | — |
| Held-out mAP50 | **Unknown — not measured** | — |
| Held-out precision | **Unknown — not measured** | — |
| Held-out recall | **Unknown — not measured** | — |

The observed confidence range (0.34–0.51) on the video is **not a performance metric** — it tells us the model is firing at moderate confidence on whatever was in that video, but without ground-truth boxes we cannot determine whether those are true positives or false positives.

---

## Concrete Next Step to Get Real Evaluation

This is a two-step process requiring approximately **4–6 hours of labeling work**:

### Step 1 — Acquire and Label ≥50 sonar images
1. Source real side-scan sonar frames (NOAA OER, project `demo_samples/`, or frames extracted from the existing `runs/detect/predict/0.avi` video).
2. Annotate each frame in [Roboflow](https://roboflow.com) or [CVAT](https://cvat.ai) with bounding boxes for marine debris / ghost nets. Use class ID `0`.
3. Export annotations in **YOLO format** (`.txt` files with `class_id cx cy bw bh` per line).

### Step 2 — Create a proper split and run evaluation
1. Place labeled images and labels into `ml/data/images/` and `ml/data/labels/`.
2. Create `ml/data/data.yaml`:
   ```yaml
   path: ./data
   train: images/train
   val: images/val
   nc: 1
   names: ['ghost_net']
   ```
3. Split into 80% train / 20% val (minimum 10 images in val for meaningful metrics).
4. Run the evaluation script:
   ```bash
   cd ml
   python evaluate.py
   ```
5. Results will be written to `ml/eval_results/` (metrics JSON, confusion matrix PNG, markdown table).

### What to expect (based on published literature)
YOLOv8s trained on domain-specific acoustic imagery typically achieves mAP50 of **0.45–0.75** depending on dataset size and image quality. With a small dataset (<200 images), false positive rate on natural seafloor features (rocks, sand ripples) is the primary weakness — the model will likely show high recall but lower precision until trained on more clutter examples.

---

## What to Tell Judges

> "We have a functional detection pipeline. Our training data was assembled externally and the split methodology was not preserved in this repository — this is a gap we own. The `ml/evaluate.py` script is ready to run the moment we have a labeled held-out set, which requires approximately 4–6 hours of annotation work. We can demonstrate live inference on real sonar frames and show confidence calibration behavior, but we are not quoting a mAP number we cannot verify."

This framing is technically honest and professionally credible. It demonstrates understanding of rigorous ML evaluation and pipeline readiness, which is more impressive than a number with no audit trail.

---

## Running the Evaluation Script (When Data Is Available)

```bash
cd ml
pip install -r requirements.txt   # includes ultralytics, huggingface_hub
python evaluate.py
# Outputs: ml/eval_results/metrics.json, ml/eval_results/metrics.md, ml/eval_results/confusion_matrix.png
```

See `ml/evaluate.py` for the full implementation.
