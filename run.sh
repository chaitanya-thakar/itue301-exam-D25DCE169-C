#!/usr/bin/env bash

# ================================================================
# MedCare Plus - Hospital Appointment System (Multi-OS Launcher)
# Supported OS: Linux, macOS, WSL, Windows (Git Bash)
# ================================================================

echo "================================================================"
echo "  MedCare Plus - Hospital Appointment System (Linux/macOS)"
echo "================================================================"
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT" || exit 1

# 1. Clean up existing processes on port 5000 and 5173
echo "[1/4] Checking and freeing ports 5000 and 5173..."
if command -v lsof >/dev/null 2>&1; then
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
elif command -v fuser >/dev/null 2>&1; then
    fuser -k 5000/tcp 2>/dev/null || true
    fuser -k 5173/tcp 2>/dev/null || true
fi

# 2. Start Backend Server
echo "[2/4] Starting Backend Server on port 5000..."
cd "$PROJECT_ROOT/backend" || exit 1
node server.js &
BACKEND_PID=$!

sleep 2

# 3. Start Frontend App
echo "[3/4] Starting Frontend React App on port 5173..."
cd "$PROJECT_ROOT/frontend" || exit 1
npm run dev &
FRONTEND_PID=$!

sleep 2

# 4. Open default browser
echo "[4/4] Opening MedCare Plus in default browser..."
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:5173" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
    open "http://localhost:5173" >/dev/null 2>&1 &
fi

echo ""
echo "================================================================"
echo "  All Services are Running:"
echo "  - Frontend UI:   http://localhost:5173"
echo "  - Backend API:   http://localhost:5000"
echo "  - Health Check:  http://localhost:5000/api/v1/health"
echo "================================================================"
echo "Press [Ctrl+C] to stop both servers."
echo ""

# Trap Ctrl+C (SIGINT) to terminate child processes gracefully
cleanup() {
    echo ""
    echo "Stopping MedCare Plus servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
