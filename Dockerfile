FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 10002
CMD ["sh", "-c", "python bridge.py --port ${PORT:-10002} --agent-id ${ELEVENLABS_AGENT_ID} --api-key ${ELEVENLABS_API_KEY} --region ${ELEVENLABS_REGION:-default} --chunk-size ${CHUNK_SIZE:-6400}"]
