import { Embeddings, EmbeddingsParams } from 'langchain/embeddings/base';

export interface IEmbeddings {
  createInstance(params: EmbeddingsParams): Embeddings;
}
