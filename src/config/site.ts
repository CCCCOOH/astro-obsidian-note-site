// src/config/site.ts — 网站全局配置

export interface NavItem {
  text: string;
  href: string;
  icon: string;
}

export interface SocialLink {
  label: string;
  url: string;
  icon?: string;
}

export const site = {
  /** 网站标题 */
  title: 'Astro Notes',
  /** 网站描述 */
  description: '基于 Obsidian 的静态笔记站点',
  /** 部署后的完整 URL（用于 SEO） */
  url: 'https://example.com',
  /** 网站底部的版权信息 */
  copyright: `Built with Astro + Obsidian`,
};

export const author = {
  /** 作者名称 */
  name: 'Author',
  /** 简短介绍 */
  bio: '一个笔记爱好者',
  /** 头像路径（放在 public/ 下） */
  avatar: '',
  /** 社交链接 */
  links: [] as SocialLink[],
};

/** 导航栏菜单 */
export const nav: NavItem[] = [
  { text: '首页', href: '/', icon: 'home' },
  { text: '分类', href: '/categories', icon: 'category' },
  { text: '标签', href: '/tags', icon: 'tag' },
  { text: '搜索', href: '/search', icon: 'search' },
  { text: '图谱', href: '/graph', icon: 'graph' },
  { text: '设置', href: '/settings', icon: 'settings' },
];

/** 主题配置 */
export const theme = {
  /** 默认主题 */
  default: 'light' as 'light' | 'dark',
  /** 是否允许暗色模式切换 */
  allowDark: true,
  /** 字体大小 (px) */
  fontSize: 16,
};
