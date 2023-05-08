import axios from 'axios';
import { injectable } from 'inversify';
import type { ICollector } from '../interfaces/ICollector';
import type { BookmarkItem } from '../typings/bookmark';

@injectable()
export class HTMLCollector implements ICollector {
  async fetch(bookmark: BookmarkItem): Promise<string> {
    const response = await axios({
      url: bookmark.url,
      timeout: 5000,
    });

    return response.data;
  }
}
