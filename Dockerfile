# Dockerfile for XBlock Development Environment
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y build-essential git && \
    rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . /app/

# Install Python dependencies and set up environment
RUN bash setup_env.sh

# Expose default port
EXPOSE 8000

# Start server
CMD ["bash", "start_server.sh"]
