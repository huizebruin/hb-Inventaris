FROM python:3.12-slim

WORKDIR /app

# Dependencies eerst apart installeren voor betere layer-caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App-code (static/ wordt in docker-compose.yml als volume overheen gemount,
# maar staat ook hier zodat de image op zichzelf werkt zonder die mount)
COPY server.py .
COPY static/ ./static/

EXPOSE 5000

CMD ["python", "server.py"]
