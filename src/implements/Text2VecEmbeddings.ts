import axios from 'axios';
import { injectable } from 'inversify';
import { Embeddings, EmbeddingsParams } from 'langchain/embeddings/base';
import type { IEmbeddings } from '../interfaces/IEmbeddings';

@injectable()
export class Text2VecEmbeddings implements IEmbeddings {
  createInstance(params: EmbeddingsParams): Embeddings {
    return new _Text2VecEmbeddings(params);
  }
}

type Text2VecResponse = {
  embeddings: number[][];
};

class _Text2VecEmbeddings extends Embeddings {
  private api =
    process.env.TEXT2VEC_LARGE_CHINESE_API || 'http://0.0.0.0:9000/';

  async embedQuery(document: string): Promise<number[]> {
    return this._embed([document]).then((embeddings) => embeddings[0]);
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return this._embed(documents);
  }

  async _embed(texts: string[]): Promise<number[][]> {
    return this.caller.call(async () => {
      const { data } = await axios<Text2VecResponse>({
        url: this.api,
        method: 'POST',
        data: {
          sentences: texts,
        },
      });

      return data.embeddings;
    });
  }
}
