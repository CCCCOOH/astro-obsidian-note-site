// scripts/process-data.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '../src/content/notes');
const DATA_DIR = path.resolve(__dirname, '../src/content/.data');

// 确保 .data 目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 扫描所有 .md 文件
function scanMarkdownFiles(dir) {
  const entries = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      entries.push(...scanMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      entries.push(fullPath);
    }
  }
  return entries;
}

// 解析 YAML frontmatter（简化版，不依赖外部库）
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { frontmatter: {}, body: content };

  const yamlBlock = match[1];
  const body = content.slice(match[0].length);
  const frontmatter = {};

  for (const line of yamlBlock.split('\n')) {
    const kvMatch = line.match(/^(\w+):\s*(.*)/);
    if (kvMatch) {
      let value = kvMatch[2].trim();
      // 解析 YAML 数组: [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      }
      frontmatter[kvMatch[1]] = value;
    }
  }

  return { frontmatter, body };
}

// 提取 Wikilinks [[target|text]]
function extractWikilinks(body) {
  const links = [];
  const regex = /\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\]/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    links.push({
      target: match[1].trim(),
      displayText: (match[2] || match[1]).trim(),
    });
  }
  return links;
}

// 提取行内标签 #tag
function extractInlineTags(body) {
  const tags = [];
  const regex = /(?:^|\s)#([\p{L}\p{N}_-]+)/gu;
  let match;
  while ((match = regex.exec(body)) !== null) {
    tags.push(match[1]);
  }
  return tags;
}

// === 主流程 ===
const files = scanMarkdownFiles(CONTENT_DIR);
console.log(`📁 扫描到 ${files.length} 个笔记文件`);

// 第一阶段: 提取原始数据
const notesData = [];
const wikilinkMap = {};
const allTags = {};
const backlinks = {};

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  const relativePath = path.relative(CONTENT_DIR, filePath).replace(/\.md$/, '');
  const slug = `notes/${relativePath}`;

  const wikilinks = extractWikilinks(body);
  const inlineTags = extractInlineTags(body);
  const tags = [...new Set([
    ...(Array.isArray(frontmatter.tags) ? frontmatter.tags : []),
    ...inlineTags,
  ])];

  notesData.push({
    slug,
    path: `/notes/${encodeURIComponent(relativePath)}`,
    title: frontmatter.title || path.basename(relativePath),
    date: frontmatter.date || null,
    tags,
    wikilinks,
    filePath,
  });

  const displayName = path.basename(relativePath, '.md');
  wikilinkMap[displayName] = { path: `/notes/${encodeURIComponent(relativePath)}`, slug };
  wikilinkMap[relativePath] = { path: `/notes/${encodeURIComponent(relativePath)}`, slug };
  wikilinkMap[`${relativePath}.md`] = { path: `/notes/${encodeURIComponent(relativePath)}`, slug };

  for (const tag of tags) {
    if (!allTags[tag]) allTags[tag] = new Set();
    allTags[tag].add(slug);
  }

  if (!backlinks[slug]) backlinks[slug] = [];
}

// 第二阶段: 计算 Backlinks
for (const note of notesData) {
  for (const wl of note.wikilinks) {
    const resolved = wikilinkMap[wl.target];
    if (resolved && resolved.slug !== note.slug) {
      if (!backlinks[resolved.slug]) backlinks[resolved.slug] = [];
      backlinks[resolved.slug].push({
        source: note.path,
        sourceTitle: note.title,
        displayText: wl.displayText,
      });
    }
  }
}

// 第三阶段: 生成图谱数据
const graphNodes = notesData.map(note => ({
  id: note.slug,
  label: note.title,
  size: Math.max(3, (backlinks[note.slug]?.length || 0) * 2 + 3),
  title: note.title,
}));

const graphEdges = [];
for (const note of notesData) {
  for (const wl of note.wikilinks) {
    const resolved = wikilinkMap[wl.target];
    if (resolved && resolved.slug !== note.slug) {
      graphEdges.push({
        from: note.slug,
        to: resolved.slug,
      });
    }
  }
}

// 写入输出文件
fs.writeFileSync(
  path.join(DATA_DIR, 'wikilinks.json'),
  JSON.stringify(wikilinkMap, null, 2),
  'utf-8'
);

const tagsJson = {};
for (const [tag, noteSet] of Object.entries(allTags)) {
  tagsJson[tag] = {
    notes: notesData.filter(n => noteSet.has(n.slug)).map(n => ({
      path: n.path,
      title: n.title,
    })),
    count: noteSet.size,
  };
}
fs.writeFileSync(
  path.join(DATA_DIR, 'tags.json'),
  JSON.stringify(tagsJson, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(DATA_DIR, 'backlinks.json'),
  JSON.stringify(backlinks, null, 2),
  'utf-8'
);

const edgeKeySet = new Set();
const uniqueEdges = graphEdges.filter(e => {
  const key = `${e.from}|${e.to}`;
  if (edgeKeySet.has(key)) return false;
  edgeKeySet.add(key);
  return true;
});

fs.writeFileSync(
  path.join(DATA_DIR, 'graph.json'),
  JSON.stringify({ nodes: graphNodes, edges: uniqueEdges }, null, 2),
  'utf-8'
);

console.log(`✅ 数据处理完成`);
console.log(`   wikilinks.json — ${Object.keys(wikilinkMap).length} 个映射条目`);
console.log(`   tags.json — ${Object.keys(tagsJson).length} 个标签`);
console.log(`   backlinks.json — ${Object.keys(backlinks).length} 个笔记的反向链接`);
console.log(`   graph.json — ${graphNodes.length} 个节点, ${uniqueEdges.length} 条边`);
