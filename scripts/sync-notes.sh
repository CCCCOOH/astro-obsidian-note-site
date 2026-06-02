#!/bin/bash
# scripts/sync-notes.sh
# 从 Obsidian Vault 同步笔记到项目目录
# 用法: bash scripts/sync-notes.sh [--link|--copy] <vault_path>

set -euo pipefail

MODE="${1:---link}"
VAULT_PATH="${2:-}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$PROJECT_DIR/src/content/notes"
DATA_DIR="$PROJECT_DIR/src/content/.data"
LOG_PREFIX="[sync-notes]"

echo "$LOG_PREFIX 开始同步笔记..."

# 如果没有提供 vault 路径，尝试从 .env 读取
if [ -z "$VAULT_PATH" ]; then
  if [ -f "$PROJECT_DIR/.env" ]; then
    VAULT_PATH=$(grep 'VAULT_PATH' "$PROJECT_DIR/.env" | cut -d'=' -f2)
  fi
fi

if [ -z "$VAULT_PATH" ]; then
  echo "$LOG_PREFIX 错误: 请提供 Obsidian Vault 路径"
  echo "用法: $0 [--link|--copy] <vault_path>"
  echo "或者创建 .env 文件: VAULT_PATH=/path/to/vault"
  exit 1
fi

if [ ! -d "$VAULT_PATH" ]; then
  echo "$LOG_PREFIX 错误: 路径不存在: $VAULT_PATH"
  exit 1
fi

# 清理旧的目标目录
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# 同步 Markdown 文件
echo "$LOG_PREFIX 同步文件..."

case "$MODE" in
  --link)
    echo "$LOG_PREFIX 模式: 硬链接 (即时反映修改)"
    find "$VAULT_PATH" -name '*.md' \
      -not -path '*/.obsidian/*' \
      -not -path '*/.trash/*' \
      -not -path '*/node_modules/*' \
      | while read -r file; do
        rel_path="${file#$VAULT_PATH/}"
        target="$TARGET_DIR/$rel_path"
        mkdir -p "$(dirname "$target")"
        ln -f "$file" "$target" 2>/dev/null || cp "$file" "$target"
      done
    ;;
  --copy)
    echo "$LOG_PREFIX 模式: 复制"
    find "$VAULT_PATH" -name '*.md' \
      -not -path '*/.obsidian/*' \
      -not -path '*/.trash/*' \
      -not -path '*/node_modules/*' \
      | while read -r file; do
        rel_path="${file#$VAULT_PATH/}"
        target="$TARGET_DIR/$rel_path"
        mkdir -p "$(dirname "$target")"
        cp "$file" "$target"
      done
    ;;
  *)
    echo "$LOG_PREFIX 未知模式: $MODE"
    exit 1
    ;;
esac

echo "$LOG_PREFIX 同步完成! 笔记已同步到 $TARGET_DIR"

# 自动运行数据处理
echo "$LOG_PREFIX 运行数据处理脚本..."
node "$PROJECT_DIR/scripts/process-data.mjs"

echo "$LOG_PREFIX 全部完成!"
