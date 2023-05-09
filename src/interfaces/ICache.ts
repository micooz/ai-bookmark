import type { Document } from 'langchain/document';
import type { BookmarkItem } from '../typings/bookmark';

export interface ICache {
  isEmpty(): Promise<boolean>;
  has(bookmarkId: string): Promise<boolean>;
  save(bookmark: BookmarkItem, data: string): Promise<void>;
  getDocuments(bookmarkId: string): Promise<Document[]>;
}
