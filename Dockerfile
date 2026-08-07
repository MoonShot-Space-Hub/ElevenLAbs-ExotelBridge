FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 10002
CMD ["sh", "-c", "gunicorn --worker-class gevent --workers 1 --worker-connections 1000 --bind 0.0.0.0:${PORT:-10002} --timeout 120 --log-level info bridge:app"]
