import uvicorn
from fastapi import FastAPI, Body
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from contextlib import asynccontextmanager

DEVICE = "cuda"
DEVICE_ID = "0"
CUDA_DEVICE = f"{DEVICE}:{DEVICE_ID}" if DEVICE_ID else DEVICE

class Data(BaseModel):
   history: list

globalVaribles = {}

def sentiment(text, tokenizer, model):
    """Processes the text using the model and returns its logits.
    In this case, it's interpreted as the sentiment score for that text."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512).to(globalVaribles["device"])
    with torch.no_grad():
        logits = model(**inputs).logits.squeeze().cpu()
    return logits.tolist()

def torch_gc():
    if torch.cuda.is_available():
        with torch.cuda.device(CUDA_DEVICE):
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()

@asynccontextmanager
async def lifespan(app: FastAPI):
    model_name="agentlans/mdeberta-v3-base-sentiment"
    # Put model on GPU or else CPU
    globalVaribles["tokenizer"] = AutoTokenizer.from_pretrained(model_name)
    globalVaribles["model"] = AutoModelForSequenceClassification.from_pretrained(model_name)
    # globalVaribles["device"] = torch.device("cuda")
    globalVaribles["device"] = torch.device("cpu")
    globalVaribles["model"] = globalVaribles["model"].to(globalVaribles["device"])
    yield
    torch_gc()

app = FastAPI(lifespan=lifespan)

@app.get('/')
async def index():
  return 'sentiment'

@app.post('/getSentiment')
async def getSentiment(data: Data):
  posNum = 0
  negNum = 0


  for item in data.history:
      if item["role"] == "user":
          if sentiment(item["content"], globalVaribles["tokenizer"], globalVaribles["model"]) > 0:
            posNum = posNum + 1
          else:
            negNum = negNum + 1

  return { "pos": posNum, "neg": negNum }

if __name__ == '__main__':
    uvicorn.run("sentiment:app", host="127.0.0.1", port=8004, reload=True)

