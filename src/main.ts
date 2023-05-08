import { PromisePool } from '@supercharge/promise-pool';
import { ServiceKeys, container } from '.';
import type { IBookmark } from './interfaces/IBookmark';
import type { ICache } from './interfaces/ICache';
import type { ICollector } from './interfaces/ICollector';
import type { ILLM } from './interfaces/ILLM';
import type { IVectorStore } from './interfaces/IVectorStore';
import type { BookmarkItem } from './typings/bookmark';

export default async function main(argv: any[]) {
  if (argv[0] === 'init') {
    await init();
    return;
  }

  await interaction();
}

async function init() {
  const bookmark = container.get<IBookmark>(ServiceKeys.Bookmark);
  const collector = container.get<ICollector>(ServiceKeys.Collector);
  const cache = container.get<ICache>(ServiceKeys.Cache);
  const vectorStore = container.get<IVectorStore>(ServiceKeys.VectorStore);

  console.log('> detecting bookmark ...');
  const bookmarks = await bookmark.getBookmarkList();
  console.log(`> ${bookmarks.length} in total`);

  const prefix = ' '.repeat(3);

  async function task(bookmark: BookmarkItem) {
    const stdout: string[][] = [];

    try {
      stdout.push([`> processing bookmark: ${JSON.stringify(bookmark)}`]);

      if (await cache.has(bookmark.id)) {
        stdout.push([prefix, 'cache found, skipped.']);
      } else {
        stdout.push([prefix, 'fetching...']);
        const html = await collector.fetch(bookmark);

        stdout.push([prefix, 'caching...']);
        await cache.save(bookmark, html);

        stdout.push([
          prefix,
          'computing embeddings and save to vector store...',
          '\n',
        ]);
        await vectorStore.add(bookmark);
      }
    } catch (err: any) {
      stdout.push([prefix, err.message, 'skipped.']);
    }

    console.log(stdout.map((line) => line.join(' ')).join('\n'));
  }

  await PromisePool.withConcurrency(10).for(bookmarks).process(task);

  console.log('> all done.')
}

async function interaction() {
  const llm = container.get<ILLM>(ServiceKeys.LLM);

  const question = 'CSS 三角形生成器';

  try {
    console.log(`> Question:`, question);
    const answer = await llm.ask(question);
    console.log('< Answer:');
    console.log(answer);
  } catch (err: any) {
    console.error('>', err.message);
  }
}
