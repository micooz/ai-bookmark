from fastapi import FastAPI, Request
from transformers import AutoTokenizer, AutoModel
import uvicorn
import json
import datetime
import torch
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../model/chatglm-6b")

app = FastAPI()
tokenizer = None
model = None


def main():
    global model, tokenizer

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_PATH, trust_remote_code=True)

    model = AutoModel.from_pretrained(
        MODEL_PATH, trust_remote_code=True).half()

    if torch.cuda.is_available():
        model = model.cuda()
    elif torch.backends.mps.is_available():
        model = model.to('mps')

    model.eval()

    uvicorn.run(app, host='0.0.0.0', port=8000, workers=1)


@app.post("/")
async def handle_request(request: Request):
    json_post_raw = await request.json()
    json_post = json.dumps(json_post_raw)
    json_post_list = json.loads(json_post)

    prompt = json_post_list.get('prompt')
    history = json_post_list.get('history')
    max_length = json_post_list.get('max_length')
    top_p = json_post_list.get('top_p')
    temperature = json_post_list.get('temperature')

    response, history = model.chat(tokenizer,
                                   prompt,
                                   history=history,
                                   max_length=max_length if max_length else 2048,
                                   top_p=top_p if top_p else 0.7,
                                   temperature=temperature if temperature else 0.95)

    now = datetime.datetime.now()
    time = now.strftime("%Y-%m-%d %H:%M:%S")

    print(f"[{time}]\n> Question:\n{prompt}\n\n< Answer:\n{response}")
    torch_gc()

    return {
        "response": response,
        "history": history,
    }


def torch_gc():
    if torch.cuda.is_available():
        DEVICE = "cuda"
        DEVICE_ID = "0"
        CUDA_DEVICE = f"{DEVICE}:{DEVICE_ID}" if DEVICE_ID else DEVICE

        with torch.cuda.device(CUDA_DEVICE):
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()


if __name__ == '__main__':
    main()
