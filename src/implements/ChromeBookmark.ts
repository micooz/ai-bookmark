import type { IBookmark } from '../interfaces/IBookmark';
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

type BookmarkItem = {
  type: 'folder' | 'url';
  name: string;
  guid: string;
  children?: BookmarkItem[];
};

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

  async getUrls(): Promise<string[]> {
    const filePath = await this.findPath();

    if (!filePath) {
      throw new Error('filePath cannot be empty');
    }

    let json: { roots: { bookmark_bar: BookmarkItem } };

    try {
      const data = await readFile(filePath, 'utf-8');
      json = JSON.parse(data);
    } catch (err: any) {
      throw new Error(`parse failed due to: ${err.message}`);
    }


    // TODO: now only read from roots.bookmark_bar

    return [];
  }
}
