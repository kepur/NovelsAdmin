#!/bin/bash

# 设置变量
PROJECT_ROOT="/opt/soundOfNovels/NovelsAdmin"  # 项目根目录
BUILD_DIR="$PROJECT_ROOT/dist"                 # 构建后的目录
LOG_FILE="$PROJECT_ROOT/vue_autobot.log"       # 日志文件
PID_FILE="$PROJECT_ROOT/vue_autobot.pid"       # PID 文件
PORT=27788                                     # 运行端口，更新为 27788

# 日志函数
log_message() {
    echo "$(date "+%Y-%m-%d %H:%M:%S") - $1" >> "$LOG_FILE"
}

# 确保使用正确的 Node 版本
use_node_version() {
    log_message "切换到 Node v23.4.0..."
    fnm use 23 >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        log_message "切换 Node 版本失败！"
        echo "切换 Node 版本失败！"
        exit 1
    fi
    log_message "已切换到 Node v23.4.0"
}

# 强制拉取远程最新代码
update_code() {
    log_message "放弃本地修改并拉取远程最新代码..."
    cd "$PROJECT_ROOT" || exit
    git fetch --all >> "$LOG_FILE" 2>&1
    git reset --hard origin/main >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        log_message "拉取最新代码失败！"
        echo "拉取最新代码失败！"
        exit 1
    fi
    log_message "成功拉取远程最新代码"
}

# 启动服务
start() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log_message "服务正在运行，跳过启动。"
        echo "服务已经在运行，PID: $(cat $PID_FILE)"
        exit 1
    fi

    log_message "切换到正确的 Node 版本..."
    use_node_version  # 确保使用正确的 Node 版本

    log_message "更新本地代码..."
    update_code  # 强制拉取远程最新代码

    log_message "安装依赖..."
    npm install >> "$LOG_FILE" 2>&1

    log_message "构建 Vue 项目..."
    npm run build >> "$LOG_FILE" 2>&1

    log_message "启动服务..."
    nohup npx serve -s "$BUILD_DIR" -l $PORT >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    log_message "服务已启动，PID: $(cat $PID_FILE)"
    echo "服务已启动，PID: $(cat $PID_FILE)"
}

# 停止服务
stop() {
    if [ ! -f "$PID_FILE" ] || ! kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log_message "服务未运行，跳过停止。"
        echo "服务未运行，无法停止。"
        exit 1
    fi

    log_message "停止服务..."
    kill "$(cat "$PID_FILE")" && rm -f "$PID_FILE"
    log_message "服务已停止。"
    echo "服务已停止。"
}

# 重启服务
restart() {
    log_message "重启服务..."
    stop
    start
}

# 显示用法
usage() {
    echo "用法: $0 {start|stop|restart}"
    exit 1
}

# 处理输入的命令
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
