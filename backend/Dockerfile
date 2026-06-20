# Backend image: a small Python container that runs the FastAPI app.
FROM python:3.12-slim

# Don't write .pyc files; show logs immediately (unbuffered).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (this layer is cached unless requirements change).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code.
COPY . .

EXPOSE 8000

# Start the API server.
# - host 0.0.0.0 makes it reachable from outside the container.
# - Render provides the port to listen on via the PORT env var; default to 8000
#   locally. The shell form lets ${PORT} be expanded at runtime.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
