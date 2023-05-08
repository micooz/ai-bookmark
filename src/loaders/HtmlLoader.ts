import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import { Document } from 'langchain/document';
import { BaseDocumentLoader } from 'langchain/document_loaders/base';

export class HtmlLoader extends BaseDocumentLoader {
  constructor(private filePath: string, private metadata: any) {
    super();
  }

  async load(): Promise<Document<Record<string, any>>[]> {
    const content = await fs.readFile(this.filePath, 'utf-8');
    const documents: Document[] = [];
    const $ = cheerio.load(content);

    const fields = [
      { name: 'title', selector: 'title' },
      { name: 'description', selector: 'meta[name=description]' },
      { name: 'keywords', selector: 'meta[name=keywords]' },
    ];

    for (const { name, selector } of fields) {
      const $el = $(selector);
      let content: string | undefined;

      if (selector.startsWith('meta')) {
        content = $el.attr('content');
      } else {
        content = $el.text();
      }

      if (content) {
        documents.push(
          new Document({
            metadata: { type: name, ...this.metadata },
            pageContent: content,
          }),
        );
      }
    }

    return documents;
  }
}
