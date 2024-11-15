import uvicorn
from transformers import AutoTokenizer, AutoModel
from fastapi import FastAPI, Body
from pydantic import BaseModel
from contextlib import asynccontextmanager
import torch

DEVICE = "cuda"
DEVICE_ID = "0"
CUDA_DEVICE = f"{DEVICE}:{DEVICE_ID}" if DEVICE_ID else DEVICE

# tokenizer = AutoTokenizer.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True)
# # model = AutoModel.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True).half().cuda()
# model = AutoModel.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True).quantize(8).half().cuda()
# model.eval()
# response, history = model.chat(tokenizer, "搞掂咗啦！", history=[])
# print(response)

globalVaribles = {}

def torch_gc():
    if torch.cuda.is_available():
        with torch.cuda.device(CUDA_DEVICE):
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()

@asynccontextmanager
async def lifespan(app: FastAPI):
    globalVaribles["tokenizer"] = AutoTokenizer.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True)
    globalVaribles["model"] = AutoModel.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True).quantize(8).half().cuda()
    globalVaribles["model"].eval()
    yield
    torch_gc()

app = FastAPI(lifespan=lifespan)

@app.get('/')
async def index():
  return 'hello'

@app.post('/getTextReply')
async def getTextReply(text: str = Body(), history: list = Body()):
  print(text)
  print(history)
  response, history = globalVaribles["model"].chat(globalVaribles["tokenizer"], text, history=history)
  print(response)
  # return response
  return { "text": response, "history": history }
  # return '123'

if __name__ == '__main__':
    uvicorn.run("text2text:app", host="127.0.0.1", port=8001, reload=True)