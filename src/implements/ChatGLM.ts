import axios from 'axios';
import { inject, injectable } from 'inversify';
import type { CallbackManagerForLLMRun } from 'langchain/callbacks';
import { BaseLLM } from 'langchain/llms/base';
import type { Generation, LLMResult } from 'langchain/schema';
import lodash from 'lodash';
import { ServiceKeys } from '../constants';
import type { ILLM } from '../interfaces/ILLM';
import type { IVectorStore } from '../interfaces/IVectorStore';

@injectable()
export class ChatGLM implements ILLM {
  constructor(
    @inject(ServiceKeys.VectorStore) private vectorStore: IVectorStore,
  ) {}

  async buildPrompt(context: string, question: string): Promise<string> {
    return `已知信息：\n\n${context}\n\n根据以上信息，简洁且准确地回答问题，提供对应网站说明和网址，不要出现重复内容，不要拼凑网址或编造其他内容，如果无法找到答案，请说 “没有找到相关内容”。\n\n问题是：${question}`;
  }

  async ask(question: string): Promise<string> {
    const model = new ChatGLMLLM({});

    const similarDocuments = await this.vectorStore.similaritySearch(
      question,
      5,
    );

    const context = similarDocuments
      .map(
        (item) => `网址：${item.metadata.url}\n说明：${item.pageContent}`,
      )
      .join('\n\n');

    const prompt = await this.buildPrompt(context, question);

    const result = await model.generate([prompt]);
    return result.generations[0][0].text;
  }
}

type ChatGLMResponse = {
  response: string;
  history: string;
  status: number;
  time: string;
};

class ChatGLMLLM extends BaseLLM {
  private api = process.env.CHATGLM_API || 'http://0.0.0.0:8000/';

  async _generate(
    prompts: string[],
    stop?: string[] | this['CallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<LLMResult> {
    const subPrompts = lodash.chunk(prompts, 20);

    const generations: Generation[][] = [];

    for (const prompt of subPrompts) {
      const { data } = await axios<ChatGLMResponse>({
        url: this.api,
        method: 'POST',
        data: {
          prompt: prompt.join('\n'),
          history: [],
          // max_length,
          // top_p,
          temperature: 1.0,
        },
      });

      const generation: Generation[] = [
        { text: data.response, generationInfo: undefined },
      ];

      generations.push(generation);
    }

    return {
      generations,
      llmOutput: {},
    };
  }

  _llmType(): string {
    return 'chatlgm';
  }
}
