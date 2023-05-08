import type { Document } from 'langchain/document';
import type { BookmarkItem } from '../typings/bookmark';

export interface IVectorStore {
  add(bookmark: BookmarkItem): Promise<void>;
  similaritySearch(query: string, k?: number | undefined): Promise<Document[]>;
}
