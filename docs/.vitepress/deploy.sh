#!/bin/bash
set -e

SERVER_USER=${SERVER_USER}
SERVER_IP=${SERVER_IP}
SERVER_PATH=${SERVER_PATH}

if [ -z "$SERVER_USER" ] || [ -z "$SERVER_IP" ] || [ -z "$SERVER_PATH" ]; then
  echo "缺少必要的环境变量 SERVER_USER / SERVER_IP / SERVER_PATH"
  exit 1
fi

echo "🚀 开始构建 VitePress文档.."
npm run docs:build

echo "🚀 开始部署到服务器: ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH} .."
scp -r ./docs/.vitepress/dist/* ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}

echo "✅ 部署完成!"
