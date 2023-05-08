import fs from 'fs-extra';
import { injectable } from 'inversify';
import os from 'os';
import type { IBookmark } from '../interfaces/IBookmark';
import type { BookmarkItem } from '../typings/bookmark';

type ChromeBookmarkItem = {
  type: 'folder' | 'url';
  name: string;
  guid: string;
  url?: string;
  children?: ChromeBookmarkItem[];
};

@injectable()
export class ChromeBookmark implements IBookmark {
  async findPath(): Promise<string> {
    const homedir = os.homedir();
    const platform = os.platform();

    if (platform === 'darwin') {
      return `${homedir}/Library/Application Support/Google/Chrome/Default/Bookmarks`;
    }
    if (platform === 'win32') {
      return `${homedir}\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks`;
    }

    return '';
  }

  async getBookmarkList(): Promise<BookmarkItem[]> {
    const filePath = await this.findPath();

    if (!filePath) {
      throw new Error('filePath cannot be empty');
    }

    let json: {
      roots: { bookmark_bar: ChromeBookmarkItem; other: ChromeBookmarkItem };
    };

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      json = JSON.parse(data);
    } catch (err: any) {
      throw new Error(`parse failed due to: ${err.message}`);
    }

    // TODO: only read from roots.bookmark_bar and roots.other
    const { bookmark_bar, other } = json.roots;

    const urls = [bookmark_bar, other].map((item) => this.extract(item)).flat();

    return urls;
  }

  private extract(item: ChromeBookmarkItem): BookmarkItem[] {
    if (item.type === 'folder' && item.children?.length) {
      return item.children.map((it) => this.extract(it)).flat();
    }
    if (item.type === 'url' && item.url) {
      return [
        {
          id: item.guid,
          name: item.name,
          url: item.url,
        },
      ];
    }
    return [];
  }
}
