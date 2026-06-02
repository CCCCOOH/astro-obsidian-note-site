// src/lib/wikilinks.ts

export interface WikilinkEntry {
  path: string;
  slug: string;
  alias?: string;
}

export interface WikilinkMap {
  [targetName: string]: WikilinkEntry;
}

export interface BacklinkItem {
  source: string;
  sourceTitle: string;
  displayText: string;
}

export interface BacklinkMap {
  [slug: string]: BacklinkItem[];
}
