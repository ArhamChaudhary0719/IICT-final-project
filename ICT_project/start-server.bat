@echo off
echo Starting HealthCare+ Patient Portal on http://127.0.0.1:8080/index.html
echo Press Ctrl+C to stop the server.
start "" "http://127.0.0.1:8080/index.html"
python -m http.server 8080 -b 127.0.0.1
