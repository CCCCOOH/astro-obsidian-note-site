// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import remarkWikilinks from './src/remark-plugins/remark-wikilinks.mjs';
import remarkObsidianCallout from './src/remark-plugins/remark-obsidian-callout.mjs';
import remarkObsidianEmbed from './src/remark-plugins/remark-obsidian-embed.mjs';
import remarkObsidianHighlight from './src/remark-plugins/remark-obsidian-highlight.mjs';

export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  markdown: {
    remarkPlugins: [
      remarkGfm,
      remarkMath,
      remarkWikilinks,
      remarkObsidianCallout,
      remarkObsidianEmbed,
      remarkObsidianHighlight,
    ],
    rehypePlugins: [
      rehypeKatex,
    ],
  },
  integrations: [sitemap()],
  srcDir: './src',
  publicDir: './public',
});
