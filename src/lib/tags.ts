// src/lib/tags.ts

export interface TagInfo {
  notes: { path: string; title: string }[];
  count: number;
}

export interface TagMap {
  [tag: string]: TagInfo;
}
