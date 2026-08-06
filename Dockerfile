FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 10002
CMD gunicorn --bind 0.0.0.0:${PORT:-10002} --worker-class gevent --workers 1 --timeout 0 --keep-alive 7 bridge:app
