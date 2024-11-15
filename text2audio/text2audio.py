from cosyvoice.cli.cosyvoice import CosyVoice
import torchaudio
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
import random
import string
import time
import torch
from contextlib import asynccontextmanager

DEVICE = "cuda"
DEVICE_ID = "0"
CUDA_DEVICE = f"{DEVICE}:{DEVICE_ID}" if DEVICE_ID else DEVICE

class Data(BaseModel):
    text: str
    spk: str

globalVaribles = {}

def torch_gc():
    if torch.cuda.is_available():
        with torch.cuda.device(CUDA_DEVICE):
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()

@asynccontextmanager
async def lifespan(app: FastAPI):
    globalVaribles["cosyvoice"] = CosyVoice('pretrained_models/CosyVoice-300M-SFT', load_jit=True, load_onnx=False, fp16=True)
    yield
    torch_gc()

app = FastAPI(lifespan=lifespan)

@app.get('/')
def index():
  return 'text2audio'

@app.post('/getAudioByText')
def getAudioByText(data: Data):
    print(data)
    save_path = 'E:\\projects\\ai-chat\\fileServer\\static\\'
    filename = str(int(time.time())) + '_' + ''.join(random.sample(string.ascii_letters + string.digits, 8)) + '.wav'
    # sft usage
    print(globalVaribles['cosyvoice'].list_avaliable_spks())
    # change stream=True for chunk stream inference
    for i, j in enumerate(globalVaribles['cosyvoice'].inference_sft(data.text, data.spk, stream=False)):
        torchaudio.save(save_path + filename, j['tts_speech'], 22050)

    return filename

if __name__ == '__main__':
    uvicorn.run("text2audio:app", host="127.0.0.1", port=8003, reload=True)
