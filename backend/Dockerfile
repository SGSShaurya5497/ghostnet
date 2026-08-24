# Dockerfile — multi-stage build
# Installs libgl1 and system deps explicitly (required for OpenCV / onnxruntime)
# Use Docker on Render, not the Python buildpack

# FROM python:3.11-slim AS base
# RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# EXPOSE 8000
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
