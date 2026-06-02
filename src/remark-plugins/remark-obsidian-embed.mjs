// src/remark-plugins/remark-obsidian-embed.mjs
import { visit } from 'unist-util-visit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '../content/notes');

const EMBED_REGEX = /!\[\[([^\[\]]+)\]\]/g;
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

/**
 * remark 插件: 将 ![[文件]] 解析为嵌入内容
 * - 图片文件 (.png/.jpg/...) → <img>
 * - Markdown 文件 (.md) → 内联笔记内容
 */
export default function remarkObsidianEmbed(options = {}) {
  const contentDir = options.contentDir || CONTENT_DIR;

  return (tree, file) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof node.value !== 'string') return;

      const matches = [...node.value.matchAll(EMBED_REGEX)];
      if (matches.length === 0) return;

      const parts = [];
      let lastIndex = 0;

      for (const match of matches) {
        const fullMatch = match[0];
        const embedTarget = match[1].trim();
        const matchStart = match.index;

        if (matchStart > lastIndex) {
          parts.push({ type: 'text', value: node.value.slice(lastIndex, matchStart) });
        }

        const ext = path.extname(embedTarget).toLowerCase();
        const isImage = IMAGE_EXTENSIONS.includes(ext);

        if (isImage) {
          // 图片嵌入 → <img>
          const imgPath = `/notes/${embedTarget}`;
          parts.push({
            type: 'image',
            url: imgPath,
            alt: embedTarget,
            title: null,
            data: {
              hProperties: { loading: 'lazy', class: 'embedded-image' },
            },
          });
        } else if (ext === '.md' || !ext) {
          // Markdown 嵌入 → 尝试读取文件内容
          const mdPath = resolveEmbedPath(contentDir, embedTarget);
          if (mdPath && fs.existsSync(mdPath)) {
            const content = fs.readFileSync(mdPath, 'utf-8');
            const body = content.replace(/^---[\s\S]*?---\n*/, '');
            parts.push({
              type: 'text',
              value: body,
            });
          } else {
            parts.push({
              type: 'text',
              value: '文件不存在',
              data: { hName: 'span', hProperties: { class: 'embed-broken' } },
            });
          }
        } else {
          // 其他文件类型 → 下载链接
          parts.push({
            type: 'link',
            url: `/notes/${embedTarget}`,
            title: embedTarget,
            children: [{ type: 'text', value: `附件: ${embedTarget}` }],
          });
        }

        lastIndex = matchStart + fullMatch.length;
      }

      if (lastIndex < node.value.length) {
        parts.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
}

function resolveEmbedPath(contentDir, target) {
  const withExt = target.endsWith('.md') ? target : `${target}.md`;
  const fullPath = path.join(contentDir, withExt);
  if (fs.existsSync(fullPath)) return fullPath;

  if (target.endsWith('.md')) return null;
  const noExtPath = path.join(contentDir, target);
  if (fs.existsSync(noExtPath)) return noExtPath;

  return null;
}
