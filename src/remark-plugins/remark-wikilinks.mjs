// src/remark-plugins/remark-wikilinks.mjs
import { visit } from 'unist-util-visit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WIKILINK_MAP_PATH = path.resolve(__dirname, '../content/.data/wikilinks.json');

/**
 * remark 插件: 将 [[笔记名|别名]] 转为 <a> 标签
 * 读取 Transform 阶段生成的 wikilinks.json 进行 URL 映射
 */
export default function remarkWikilinks(options = {}) {
  // 允许通过选项注入映射（方便测试），否则从文件读取
  const wikilinkMap = options.wikilinkMap || loadWikilinkMap();

  const WIKILINK_REGEX = /\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\]/g;

  return (tree, file) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof node.value !== 'string') return;

      const matches = [...node.value.matchAll(WIKILINK_REGEX)];
      if (matches.length === 0) return;

      // 将文本节点替换为 文本+链接 混合节点
      const parts = [];
      let lastIndex = 0;

      for (const match of matches) {
        const fullMatch = match[0];
        const linkTarget = match[1].trim();
        const displayText = (match[2] || linkTarget).trim();
        const matchStart = match.index;

        // 匹配前的纯文本
        if (matchStart > lastIndex) {
          parts.push({
            type: 'text',
            value: node.value.slice(lastIndex, matchStart),
          });
        }

        // 查找 URL 映射
        const resolved = wikilinkMap[linkTarget] || wikilinkMap[`${linkTarget}|${displayText}`];
        const url = resolved ? resolved.path : `/notes/${linkTarget.split('/').map(s => encodeURIComponent(s)).join('/')}`;
        const isBroken = !resolved;

        parts.push({
          type: 'link',
          url: url,
          title: null,
          data: {
            hProperties: {
              class: isBroken ? 'wikilink wikilink-broken' : 'wikilink',
              'data-wikilink': linkTarget,
            },
            hName: 'a',
          },
          children: [{ type: 'text', value: displayText }],
        });

        lastIndex = matchStart + fullMatch.length;
      }

      // 尾部文本
      if (lastIndex < node.value.length) {
        parts.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      // 替换父节点的原文本节点为多节点
      parent.children.splice(index, 1, ...parts);
      return index + parts.length; // 跳过已处理的节点
    });
  };
}

function loadWikilinkMap() {
  try {
    if (fs.existsSync(WIKILINK_MAP_PATH)) {
      return JSON.parse(fs.readFileSync(WIKILINK_MAP_PATH, 'utf-8'));
    }
  } catch (e) {
    console.warn('⚠️ wikilinks.json not found, Wikilinks will render as broken links');
  }
  return {};
}
