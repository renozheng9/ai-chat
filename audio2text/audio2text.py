from funasr import AutoModel
from funasr.utils.postprocess_utils import rich_transcription_postprocess

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

from modelscope.pipelines import pipeline
import torch
from contextlib import asynccontextmanager

DEVICE = "cuda"
DEVICE_ID = "0"
CUDA_DEVICE = f"{DEVICE}:{DEVICE_ID}" if DEVICE_ID else DEVICE

class Data(BaseModel):
   url: str

globalVaribles = {}

# en
# res = model.generate(
#     input=f"H:\Downloads\\yueyu.wav",
#     cache={},
#     language="auto",  # "zh", "en", "yue", "ja", "ko", "nospeech"
#     use_itn=True,
#     batch_size_s=60,
#     merge_vad=True,  #
#     merge_length_s=15,
# )
# text = rich_transcription_postprocess(res[0]["text"])
# print(text)


def torch_gc():
    if torch.cuda.is_available():
        with torch.cuda.device(CUDA_DEVICE):
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()

@asynccontextmanager
async def lifespan(app: FastAPI):
    model_dir = "iic/SenseVoiceSmall"

    globalVaribles["model"] = AutoModel(
        model=model_dir,
        trust_remote_code=True,
        remote_code="./model.py",    
        vad_model="fsmn-vad",
        vad_kwargs={"max_single_segment_time": 30000},
        # device="cuda:0",
        device="cpu",
    )

    globalVaribles["lre_pipeline"] = pipeline(
        task='speech-language-recognition',
        model='damo/speech_campplus_five_lre_16k',
        model_revision='v1.0.1',
        device='cpu'
    )
    yield
    torch_gc()

app = FastAPI(lifespan=lifespan)

@app.get('/')
async def index():
  return 'audio2text'

@app.post('/getTextByAudio')
async def getTextByAudio(data: Data):
  res = globalVaribles["model"].generate(
      input=data.url,
      cache={},
      language="auto",  # "zh", "en", "yue", "ja", "ko", "nospeech"
      use_itn=True,
      batch_size_s=60,
      merge_vad=True,  #
      merge_length_s=15,
  )
  text = rich_transcription_postprocess(res[0]["text"])
  result = globalVaribles["lre_pipeline"](data.url)
  print(text)
  print(result)


  return { "text": text, "spk": result["text"] }

if __name__ == '__main__':
    uvicorn.run("audio2text:app", host="127.0.0.1", port=8002, reload=True)

