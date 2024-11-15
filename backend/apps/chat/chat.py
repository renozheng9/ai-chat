import os
from fastapi import APIRouter, Depends, UploadFile, Form, File, Body
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModel
from apps.login import login
import time
import string
import random

import requests
import json

router = APIRouter(
    prefix="/chat",
    # dependencies=[Depends(login.get_current_active_user)],
    tags=["chat"]
)

# tokenizer = AutoTokenizer.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True)
# model = AutoModel.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True).quantize(8).half().cuda()

# # model = AutoModel.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True).half().cuda()
# # model = AutoModel.from_pretrained("THUDM/chatglm-6b-int4",trust_remote_code=True).float()
# model = model.eval()

@router.post('/getTextReply/')
async def getTextReply(text: str = Body(), history: list = Body()):
    print(text)
    print(history)
    
    getTextByTextUrl = "http://127.0.0.1:8001/getTextReply"

    getTextByTextData = json.dumps({
        "text": text,
        "history": history
    })

    getTextByTextRes = requests.post(getTextByTextUrl, data=getTextByTextData)

    getTextByTextResult = getTextByTextRes.json()
    print(getTextByTextResult)

    # return "http://127.0.0.1:8000/static/audio.mp3"
    return getTextByTextResult

# @router.post('/getAudioReply')
# async def getAudioReply(file: UploadFile = File(), data: str = Form()):
#     # print(file.filename)
#     # print(json.loads(data)["history"])
#     history = json.loads(data)["history"]
#     print(history)
#     # return '123'

#     fn = file.filename
#     filename = str(int(time.time())) + '_' + ''.join(random.sample(string.ascii_letters + string.digits, 8)) + '.wav'
#     save_path = f'E:\\projects\\test\\fileServer\\static\\'
#     # if not os.path.exists(save_path):
#     #     os.mkdir(save_path)
#     print(filename)
#     save_file = os.path.join(save_path, filename)
#     f = open(save_file, 'wb')
#     data = await file.read()
#     f.write(data)
#     f.close()

#     getTextByAudioUrl = "http://127.0.0.1:8002/getTextByAudio"

#     getTextByAudioData = json.dumps({
#         # "url": "http://127.0.0.1:8000/static/" + filename
#         "url": "http://127.0.0.1:8005/static/" + filename
#     })

#     getTextByAudioRes = requests.post(getTextByAudioUrl, data=getTextByAudioData)

#     getTextByAudioResult = getTextByAudioRes.json()
#     print(getTextByAudioResult)

#     getTextByTextUrl = "http://127.0.0.1:8001/getTextReply"

#     getTextByTextData = json.dumps({
#         # "text": getTextByAudioResult["text"],
#         "history": history,
#         "text": "你好"
#     })

#     getTextByTextRes = requests.post(getTextByTextUrl, data=getTextByTextData)

#     getTextByTextResult = getTextByTextRes.json()
#     print(getTextByTextResult)

#     getAudioByTextUrl = "http://127.0.0.1:8004/getAudioByText"

#     getAudioByTextData = json.dumps({
#         "text": getTextByTextResult["text"],
#         "spk": "粤语女" if getTextByAudioResult["spk"] == "Cantonese" else "中文女"
#     })

#     getAudioByTextRes = requests.post(getAudioByTextUrl, data=getAudioByTextData)

#     getAudioByTextResult = getAudioByTextRes.json()
#     print(getAudioByTextResult)

#     return 'http://127.0.0.1:8005/static/' + getAudioByTextResult
#     # return "success"

@router.post('/getAudioTranslation')
async def getAudioTranslation(file: UploadFile = File()):
    fn = file.filename
    filename = str(int(time.time())) + '_' + ''.join(random.sample(string.ascii_letters + string.digits, 8)) + '.wav'
    save_path = f'E:\\projects\\test\\fileServer\\static\\'
    # if not os.path.exists(save_path):
    #     os.mkdir(save_path)
    print(filename)
    save_file = os.path.join(save_path, filename)
    f = open(save_file, 'wb')
    data = await file.read()
    f.write(data)
    f.close()

    getTextByAudioUrl = "http://127.0.0.1:8002/getTextByAudio"

    getTextByAudioData = json.dumps({
        # "url": "http://127.0.0.1:8000/static/" + filename
        "url": "http://127.0.0.1:8005/static/" + filename
    })

    getTextByAudioRes = requests.post(getTextByAudioUrl, data=getTextByAudioData)

    getTextByAudioResult = getTextByAudioRes.json()
    print(getTextByAudioResult)

    return getTextByAudioResult

@router.post('/getAudioReply')
async def getAudioReply(text: str = Body(), spk: str = Body(), history: list = Body()):
    getTextByTextUrl = "http://127.0.0.1:8001/getTextReply"

    getTextByTextData = json.dumps({
        # "text": getTextByAudioResult["text"],
        "history": history,
        "text": text
    })

    getTextByTextRes = requests.post(getTextByTextUrl, data=getTextByTextData)

    getTextByTextResult = getTextByTextRes.json()
    print(getTextByTextResult)

    getAudioByTextUrl = "http://127.0.0.1:8003/getAudioByText"

    tempSpk = "中文女"

    if spk == "Cantonese":
        tempSpk = "粤语女"

    getAudioByTextData = json.dumps({
        "text": getTextByTextResult["text"],
        "spk": tempSpk
    })

    getAudioByTextRes = requests.post(getAudioByTextUrl, data=getAudioByTextData)

    getAudioByTextResult = getAudioByTextRes.json()
    print(getAudioByTextResult)

    return { "url": 'http://127.0.0.1:8005/static/' + getAudioByTextResult, "text": getTextByTextResult["text"] }
    # return "success"

class SentimentParams(BaseModel):
    history: list

@router.post('/getSentiment')
async def getSentiment(data: SentimentParams):
    getSentimentUrl = "http://127.0.0.1:8004/getSentiment"

    getSentimentData = json.dumps({
        "history": data.history,
    })

    getSentimentRes = requests.post(getSentimentUrl, data=getSentimentData)

    getSentimentResult = getSentimentRes.json()
    print(getSentimentResult)

    return getSentimentResult