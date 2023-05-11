# ai-bookmark

> :warning: 本项目仅用作学习交流和技术可行性验证，请勿用于生产环境。

关联文章：[《大语言模型私有化部署和个性化调优的技术实践》](https://mp.weixin.qq.com/s/GbTw7G9glVQ6OdIf6ok9CA)。

一个基于 ChatGLM-6B 大语言模型和 Langchain 开发框架的用于搜索浏览器书签的 AI 助理。

支持离线私有部署，不依赖 OpenAI 等任何第三方 API。

## 依赖

- Framework：[Langchain（TypeScript）](https://js.langchain.com/docs/)
- LLM：[ChatGLM-6B](https://huggingface.co/THUDM/chatglm-6b)
- Embedding Model：[text2vec-large-chinese](https://huggingface.co/GanymedeNil/text2vec-large-chinese)
- Vector Database：[HNSWLib](https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/hnswlib)

## 软硬件要求

- Python 3.x（with PyTorch）
- Node.js 18.x
- 最低 16 GB 显存 

> macOS 平台请参考[这个文档](https://developer.apple.com/metal/pytorch/)安装支持 MPS 加速的 PyTorch。

## 用法

### 1. 下载代码和模型

```shell
git clone --recurse-submodules https://github.com/micooz/ai-bookmark
```

模型较大，若太慢或失败请使用魔法，手动下载并放置到对应位置：

- `model/chatglm-6b`：https://huggingface.co/THUDM/chatglm-6b/tree/main
- `model/text2vec-large-chinese`：https://huggingface.co/GanymedeNil/text2vec-large-chinese/tree/main

### 2. 安装依赖

```shell
# Node.js 依赖
npm i

# python 依赖
cd python && pip install -r requirements.txt
```

### 3. 启动 Embedding 模型和大语言模型

```shell
# http://0.0.0.0:8000/
npm run start:llm

# http://0.0.0.0:9000/
npm run start:embed
```

默认端口可在 `python/llm_api.py` 和 `python/embed_api.py` 中修改。修改后请同步创建 `.env` 文件，修改：

```shell
# .env
CHATGLM_API="http://0.0.0.0:8000/"
TEXT2VEC_LARGE_CHINESE_API="http://0.0.0.0:9000/"
```

### 4. 创建向量数据库

此命令自动获取书签，通过 Embedding API 计算文本向量并缓存到本地向量数据库中。

```shell
npm run start:init
```

### 5. 启动命令行交互界面

```shell
npm run start
```

输入对话问题即可等待 LLM 响应。

# License

MIT
