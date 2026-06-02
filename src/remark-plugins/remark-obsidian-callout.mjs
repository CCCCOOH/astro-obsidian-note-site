// src/remark-plugins/remark-obsidian-callout.mjs
import { visit } from 'unist-util-visit';

const CALLOUT_REGEX = /^\[!(\w+)\]\s*(.*)/i;
const KNOWN_TYPES = ['note', 'warning', 'tip', 'important', 'caution', 'info', 'abstract', 'success', 'question', 'danger'];

/**
 * remark 插件: 将 > [!note] 格式的 blockquote 转换为 callout div
 * 支持嵌套: > [!note] > [!warning] 内层
 */
export default function remarkObsidianCallout() {
  return (tree) => {
    visit(tree, 'blockquote', (node, index, parent) => {
      if (!parent || !node.children || node.children.length === 0) return;

      const firstChild = node.children[0];
      if (firstChild.type !== 'paragraph' || !firstChild.children) return;

      const firstText = firstChild.children[0];
      if (!firstText || firstText.type !== 'text') return;

      const match = firstText.value.match(CALLOUT_REGEX);
      if (!match) return;

      const calloutType = match[1].toLowerCase();
      const restContent = match[2];

      // 从第一个段落移除 callout 标记前缀
      if (restContent) {
        firstText.value = restContent;
      } else {
        // 如果只有标记没有文字，移除空的第一个段落
        firstChild.children.shift();
        if (firstChild.children.length === 0) {
          node.children.shift();
        }
      }

      // 构建 callout 节点
      const calloutNode = {
        type: 'paragraph',
        data: {
          hName: 'div',
          hProperties: {
            class: `callout callout-${calloutType}`,
            'data-callout-type': calloutType,
          },
        },
        children: [
          {
            type: 'paragraph',
            data: { hName: 'div', hProperties: { class: 'callout-title' } },
            children: [
              {
                type: 'text',
                data: { hName: 'span', hProperties: { class: 'callout-icon' } },
                value: calloutType === 'note' ? '📝' :
                       calloutType === 'warning' ? '⚠️' :
                       calloutType === 'tip' ? '💡' :
                       calloutType === 'important' ? '❗' :
                       calloutType === 'caution' ? '🚧' : '📌',
              },
              { type: 'text', value: calloutType.charAt(0).toUpperCase() + calloutType.slice(1) },
            ],
          },
          {
            type: 'paragraph',
            data: { hName: 'div', hProperties: { class: 'callout-body' } },
            children: node.children,
          },
        ],
      };

      parent.children.splice(index, 1, calloutNode);
      return index + 1;
    });
  };
}
