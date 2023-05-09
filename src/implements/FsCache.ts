import fs from 'fs-extra';
import { injectable } from 'inversify';
import type { Document } from 'langchain/document';
import type { ICache } from '../interfaces/ICache';
import { HtmlLoader } from '../loaders';
import type { BookmarkItem } from '../typings/bookmark';

@injectable()
export class FsCache implements ICache {
  private folder = '.cache';

  private getSubDir(bookmarkId: string) {
    return `${this.folder}/${bookmarkId}`;
  }

  async isEmpty(): Promise<boolean> {
    return fs.exists(this.folder);
  }

  async has(bookmarkId: string): Promise<boolean> {
    const metadataJson = `${this.getSubDir(bookmarkId)}/metadata.json`;
    return fs.exists(metadataJson);
  }

  async save(bookmark: BookmarkItem, data: string): Promise<void> {
    const dir = this.getSubDir(bookmark.id);
    await fs.ensureDir(dir);

    const metadataJson = `${dir}/metadata.json`;
    const indexHtml = `${dir}/index.html`;
    const documentsJson = `${dir}/documents.json`;

    // save metadata.json
    const metadata = {
      ...bookmark,
      timestamp: new Date().toISOString(),
    };
    await fs.writeJSON(metadataJson, metadata);

    // save raw data to index.html
    await fs.writeFile(indexHtml, data, 'utf-8');

    // convert to Documents then save to documents.json
    const loader = new HtmlLoader(indexHtml, metadata);
    const docs = await loader.load();

    await fs.writeJson(documentsJson, docs);
  }

  async getDocuments(bookmarkId: string): Promise<Document[]> {
    const dir = this.getSubDir(bookmarkId);
    const documentsJson = `${dir}/documents.json`;

    return fs.readJson(documentsJson);
  }
}
