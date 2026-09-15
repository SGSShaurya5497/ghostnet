"""
ml/evaluate.py — GhostNet Model Evaluation Script

Loads the deployed model weights (same HF repo/filename as backend/app/models/inference.py)
and runs evaluation against a held-out validation set in ml/data/.

CURRENT STATE: No held-out validation set exists. This script will detect that
and exit with a clear, honest message. See ml/EVAL.md for details.

When a labeled dataset IS available (see ml/EVAL.md → "Concrete Next Step"):
  1. Place images in ml/data/images/val/
  2. Place YOLO-format labels in ml/data/labels/val/
  3. Create ml/data/data.yaml (see EVAL.md)
  4. Run: python evaluate.py
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
ML_DIR = Path(__file__).resolve().parent
DATA_DIR = ML_DIR / "data"
EVAL_DIR = ML_DIR / "eval_results"
DATA_YAML = DATA_DIR / "data.yaml"

# Mirror exactly what backend/app/models/inference.py does
MODEL_REPO = "zzephyrr/GhostNetyolo26m"
MODEL_FILENAME = "best.pt"


# ── Helpers ──────────────────────────────────────────────────────────────────

def _check_data_available() -> tuple[bool, str]:
    """Return (available, reason_if_not)."""
    if not DATA_YAML.exists():
        return False, f"data.yaml not found at {DATA_YAML}"
    val_images = DATA_DIR / "images" / "val"
    if not val_images.exists() or not any(val_images.iterdir()):
        return False, f"Validation image dir empty or missing: {val_images}"
    val_labels = DATA_DIR / "labels" / "val"
    if not val_labels.exists() or not any(val_labels.iterdir()):
        return False, f"Validation label dir empty or missing: {val_labels}"
    return True, ""


def _load_model():
    """Download (if needed) and load YOLO weights — mirrors inference.py exactly."""
    from ultralytics import YOLO
    from huggingface_hub import hf_hub_download

    local_candidate = ML_DIR.parent / "backend" / "model_weights" / MODEL_FILENAME
    if local_candidate.exists():
        weights_path = str(local_candidate)
        print(f"[evaluate] Loading model from local path: {weights_path}")
    else:
        hf_token = os.environ.get("HF_TOKEN") or None
        print(f"[evaluate] Downloading {MODEL_FILENAME} from {MODEL_REPO} ...")
        weights_path = hf_hub_download(
            repo_id=MODEL_REPO,
            filename=MODEL_FILENAME,
            repo_type="model",
            token=hf_token,
        )
        print(f"[evaluate] Model downloaded to: {weights_path}")

    return YOLO(weights_path)


def _run_val(model, data_yaml_path: Path) -> dict:
    """Run model.val() and return metrics dict."""
    print(f"[evaluate] Running validation against: {data_yaml_path}")
    metrics = model.val(
        data=str(data_yaml_path),
        imgsz=640,
        conf=0.25,
        iou=0.45,
        save_json=True,
        plots=True,
        verbose=True,
    )
    return metrics


def _save_results(metrics, save_dir: Path):
    """Parse ultralytics metrics object and save JSON + markdown + confusion matrix."""
    save_dir.mkdir(parents=True, exist_ok=True)

    # ultralytics metrics object attributes
    box = metrics.box
    results = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "model_repo": MODEL_REPO,
        "model_filename": MODEL_FILENAME,
        "dataset": str(DATA_YAML),
        "metrics": {
            "precision": round(float(box.mp), 4),       # mean precision
            "recall": round(float(box.mr), 4),           # mean recall
            "mAP50": round(float(box.map50), 4),         # mAP @ IoU=0.50
            "mAP50_95": round(float(box.map), 4),        # mAP @ IoU=0.50:0.95
            "fitness": round(float(box.fitness()), 4),
        },
        "per_class": [],
    }

    # Per-class breakdown (single class model will have one entry)
    class_names = metrics.names  # dict {int: str}
    for cls_idx, cls_name in class_names.items():
        try:
            results["per_class"].append({
                "class_id": int(cls_idx),
                "class_name": cls_name,
                "precision": round(float(box.p[cls_idx]), 4),
                "recall": round(float(box.r[cls_idx]), 4),
                "mAP50": round(float(box.ap50[cls_idx]), 4),
                "mAP50_95": round(float(box.ap[cls_idx]), 4),
            })
        except (IndexError, AttributeError):
            results["per_class"].append({
                "class_id": int(cls_idx),
                "class_name": cls_name,
                "note": "per-class breakdown not available",
            })

    # Save JSON
    json_path = save_dir / "metrics.json"
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"[evaluate] Metrics JSON saved: {json_path}")

    # Save Markdown table
    md_path = save_dir / "metrics.md"
    m = results["metrics"]
    md = f"""# GhostNet Evaluation Results

Generated: {results['generated_at']}
Model: `{MODEL_REPO}/{MODEL_FILENAME}`
Dataset: `{results['dataset']}`

## Overall Metrics

| Metric | Value |
|:---|:---|
| Precision | {m['precision']:.4f} |
| Recall | {m['recall']:.4f} |
| mAP@50 | {m['mAP50']:.4f} |
| mAP@50:95 | {m['mAP50_95']:.4f} |

## Per-Class Breakdown

| Class | Precision | Recall | mAP@50 | mAP@50:95 |
|:---|:---|:---|:---|:---|
"""
    for cls in results["per_class"]:
        if "precision" in cls:
            md += f"| {cls['class_name']} | {cls['precision']:.4f} | {cls['recall']:.4f} | {cls['mAP50']:.4f} | {cls['mAP50_95']:.4f} |\n"
        else:
            md += f"| {cls['class_name']} | — | — | — | — | {cls.get('note', '')} |\n"

    with open(md_path, "w") as f:
        f.write(md)
    print(f"[evaluate] Metrics markdown saved: {md_path}")

    # Copy confusion matrix from ultralytics save dir if it exists
    # ultralytics saves plots in the val run directory
    confusion_src = Path(metrics.save_dir) / "confusion_matrix.png"
    if confusion_src.exists():
        import shutil
        confusion_dst = save_dir / "confusion_matrix.png"
        shutil.copy2(confusion_src, confusion_dst)
        print(f"[evaluate] Confusion matrix saved: {confusion_dst}")
    else:
        print("[evaluate] No confusion matrix image found in ultralytics output dir.")

    return results


def _print_no_data_message(reason: str):
    msg = f"""
╔══════════════════════════════════════════════════════════════════════╗
║         GhostNet evaluate.py — No Validation Data Available          ║
╚══════════════════════════════════════════════════════════════════════╝

Reason: {reason}

This script is ready to run, but requires a labeled held-out validation
set. See ml/EVAL.md for the exact steps to create one.

Short version:
  1. Place sonar images in:  ml/data/images/val/
  2. Place YOLO labels in:   ml/data/labels/val/
  3. Create:                 ml/data/data.yaml  (see EVAL.md for format)
  4. Re-run:                 python evaluate.py

No metrics have been fabricated. The script exits cleanly.
"""
    print(msg)


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("GhostNet Model Evaluation")
    print("=" * 70)

    # Step 1: Check if data is available
    data_available, reason = _check_data_available()
    if not data_available:
        _print_no_data_message(reason)
        # Write a minimal JSON indicating no evaluation was run
        EVAL_DIR.mkdir(parents=True, exist_ok=True)
        no_eval_record = {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "status": "no_validation_data",
            "reason": reason,
            "model_repo": MODEL_REPO,
            "model_filename": MODEL_FILENAME,
            "metrics": None,
            "message": (
                "No held-out validation set is available. "
                "See ml/EVAL.md for the concrete next step. "
                "No metrics have been fabricated."
            ),
        }
        json_path = EVAL_DIR / "metrics.json"
        with open(json_path, "w") as f:
            json.dump(no_eval_record, f, indent=2)
        print(f"[evaluate] Status record written to: {json_path}")
        sys.exit(0)  # Clean exit — not an error, just no data

    # Step 2: Load model (same path as backend/app/models/inference.py)
    try:
        model = _load_model()
    except Exception as e:
        print(f"[evaluate] ERROR: Could not load model: {e}")
        sys.exit(1)

    # Step 3: Run validation
    try:
        metrics = _run_val(model, DATA_YAML)
    except Exception as e:
        print(f"[evaluate] ERROR during model.val(): {e}")
        sys.exit(1)

    # Step 4: Save results
    results = _save_results(metrics, EVAL_DIR)

    print("\n" + "=" * 70)
    print("EVALUATION COMPLETE")
    print(f"  Precision : {results['metrics']['precision']:.4f}")
    print(f"  Recall    : {results['metrics']['recall']:.4f}")
    print(f"  mAP50     : {results['metrics']['mAP50']:.4f}")
    print(f"  mAP50:95  : {results['metrics']['mAP50_95']:.4f}")
    print(f"\nFull results: {EVAL_DIR}")
    print("=" * 70)


if __name__ == "__main__":
    main()
