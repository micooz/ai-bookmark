from fastapi import FastAPI, Request
from text2vec import SentenceModel
import uvicorn
import json
import os


MODEL_PATH = os.path.join(os.path.dirname(
    __file__), "../model/text2vec-large-chinese")

app = FastAPI()
model = SentenceModel(MODEL_PATH)


def main():
    uvicorn.run(app, host='0.0.0.0', port=9000, workers=1)


@app.post("/")
async def handle_request(request: Request):
    json_post_raw = await request.json()
    json_post = json.dumps(json_post_raw)
    json_post_list = json.loads(json_post)

    sentences = json_post_list.get('sentences')

    embeddings = model.encode(sentences)

    return {
        "embeddings": embeddings.tolist()
    }

if __name__ == '__main__':
    main()
