const dotenv = require('dotenv');
dotenv.config();

const {
  container,
  ServiceKeys,
  ChromeBookmark,
  HTMLCollector,
  FsCache,
  Text2VecEmbeddings,
  FsVectorStore,
  ChatGLM,
} = require('../lib');

container.bind(ServiceKeys.Bookmark).to(ChromeBookmark);
container.bind(ServiceKeys.Collector).to(HTMLCollector);
container.bind(ServiceKeys.Cache).to(FsCache);
container.bind(ServiceKeys.Embeddings).to(Text2VecEmbeddings);
container.bind(ServiceKeys.VectorStore).to(FsVectorStore);
container.bind(ServiceKeys.LLM).to(ChatGLM);

const argv = process.argv.slice(2);
require('../lib/main').default(argv);
