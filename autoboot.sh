#!/bin/bash

# Set environment
PROJECT_ROOT="/opt/soundOfNovels/NovelsAdmin"  # Project root directory
BUILD_DIR="$PROJECT_ROOT/dist"                 # Build output directory
LOG_FILE="$PROJECT_ROOT/vue_autobot.log"       # Log file path
PID_FILE="$PROJECT_ROOT/vue_autobot.pid"       # PID file path
PORT=27788                                     # Service port 27788

log_message() {
    echo "$(date "+%Y-%m-%d %H:%M:%S") - $1" >> "$LOG_FILE"
}

use_node_version() {
    log_message "Switching to Node v23.4.0..."
    fnm use 23 >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        log_message "Failed to switch Node version!"
        echo "Failed to switch Node version!"
        exit 1
    fi
    log_message "Switched to Node v23.4.0 successfully"
}

update_code() {
    log_message "Pulling latest code from Git..."
    cd "$PROJECT_ROOT" || exit
    git fetch --all >> "$LOG_FILE" 2>&1
    git reset --hard origin/main >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        log_message "Git pull failed"
        echo "Git pull failed!"
        exit 1
    fi
    log_message "Git pull succeeded"
}

# Start the service
start() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log_message "Service is already running, skipping..."
        echo "Service is already running, PID: $(cat $PID_FILE)"
        exit 1
    fi

    log_message "Switching to the correct Node version..."
    use_node_version  # Ensure the correct Node version is used

    log_message "Updating local code..."
    update_code  # Force pull the latest code from the remote repository

    log_message "Installing dependencies..."
    npm install >> "$LOG_FILE" 2>&1

    log_message "Building the Vue project..."
    npm run build >> "$LOG_FILE" 2>&1

    log_message "Starting the service..."
    nohup npx serve -s "$BUILD_DIR" -l $PORT >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    log_message "Service started, PID: $(cat $PID_FILE)"
    echo "Service started, PID: $(cat $PID_FILE)"
}

# Stop the service
stop() {
    if [ ! -f "$PID_FILE" ] || ! kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log_message "Service is not running, skipping stop."
        echo "Service is not running, cannot stop."
        exit 1
    fi

    log_message "Stopping the service..."
    kill "$(cat "$PID_FILE")" && rm -f "$PID_FILE"
    log_message "Service stopped."
    echo "Service stopped."
}

# Restart the service
restart() {
    log_message "Restarting the service..."
    stop
    start
}

# Display usage
usage() {
    echo "Usage: $0 {start|stop|restart}"
    exit 1
}

# Handle the input command
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    *)
        usage
        ;;
esac