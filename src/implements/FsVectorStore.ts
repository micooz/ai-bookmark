import fs from 'fs-extra';
import { inject, injectable } from 'inversify';
import type { Document } from 'langchain/document';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { ServiceKeys } from '../constants';
import type { ICache } from '../interfaces/ICache';
import { IEmbeddings } from '../interfaces/IEmbeddings';
import type { IVectorStore } from '../interfaces/IVectorStore';
import type { BookmarkItem } from '../typings/bookmark';

@injectable()
export class FsVectorStore implements IVectorStore {
  private folder = '.cache/vectorstore/HNSWLib';

  private store?: HNSWLib;

  constructor(
    @inject(ServiceKeys.Cache) private cache: ICache,
    @inject(ServiceKeys.Embeddings) private embeddings: IEmbeddings,
  ) {
    fs.ensureDirSync(this.folder);
  }

  private async init() {
    if (this.store) {
      return;
    }

    if (fs.existsSync(`${this.folder}/hnswlib.index`)) {
      this.store = await HNSWLib.load(
        this.folder,
        this.embeddings.createInstance({ maxRetries: 1 }),
      );
    } else {
      this.store = await HNSWLib.fromTexts(
        ['initial text'],
        [{}],
        this.embeddings.createInstance({ maxRetries: 1 }),
      );
      await this.store.save(this.folder);
    }

    return this.store;
  }

  async add(bookmark: BookmarkItem): Promise<void> {
    await this.init();
    const documents = await this.cache.getDocuments(bookmark.id);

    await this.store!.addDocuments(documents);
    await this.store!.save(this.folder);
  }

  async similaritySearch(query: string, k?: number): Promise<Document[]> {
    await this.init();
    return this.store!.similaritySearch(query, k);
  }
}
