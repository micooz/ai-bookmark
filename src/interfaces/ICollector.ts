import type { BookmarkItem } from '../typings/bookmark';

export interface ICollector {
  fetch(bookmark: BookmarkItem): Promise<string>;
}
