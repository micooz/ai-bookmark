import type { BookmarkItem } from '../typings/bookmark';

export interface IBookmark {
  findPath(): Promise<string>;
  getBookmarkList(): Promise<BookmarkItem[]>;
}
