// src/lib/notes.ts
import type { BacklinkItem } from './wikilinks';

export interface NoteMeta {
  slug: string;
  path: string;
  title: string;
  date: string | null;
  tags: string[];
}

export interface NoteEntry {
  slug: string;
  path: string;
  title: string;
  date: string | null;
  tags: string[];
  wikilinks: string[];
  backlinks: BacklinkItem[];
}
