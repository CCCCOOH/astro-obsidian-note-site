// src/remark-plugins/remark-obsidian-highlight.mjs
import { visit } from 'unist-util-visit';

const HIGHLIGHT_REGEX = /==([^=]+)==/g;

/**
 * remark 插件: 将 ==高亮文本== 转为 <mark> 标签
 */
export default function remarkObsidianHighlight() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof node.value !== 'string') return;

      const matches = [...node.value.matchAll(HIGHLIGHT_REGEX)];
      if (matches.length === 0) return;

      const parts = [];
      let lastIndex = 0;

      for (const match of matches) {
        const fullMatch = match[0];
        const highlightText = match[1];
        const matchStart = match.index;

        if (matchStart > lastIndex) {
          parts.push({ type: 'text', value: node.value.slice(lastIndex, matchStart) });
        }

        parts.push({
          type: 'text',
          value: highlightText,
          data: { hName: 'mark', hProperties: { class: 'obsidian-highlight' } },
        });

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
