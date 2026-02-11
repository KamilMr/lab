FROM python:3.9-slim

# Install uv (recommended) and claude-monitor
RUN pip install uv
RUN uv tool install claude-monitor

# Add uv tool bin to PATH
ENV PATH="/root/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Default command
CMD ["claude-monitor"]
