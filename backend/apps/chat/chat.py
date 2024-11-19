import os
from fastapi import APIRouter, Depends, UploadFile, Form, File, Body
from pydantic import BaseModel
from apps.login import login
import time
import string
import random
from requests import exceptions 

import requests
import json

router = APIRouter(
    prefix="/chat",
    # dependencies=[Depends(login.get_current_active_user)],
    tags=["chat"]
)

@router.post('/getTextReply/')
async def getTextReply(text: str = Body(), history: list = Body()):
    print(text)
    print(history)
    
    # try:
    #     getTextByTextUrl = "http://127.0.0.1:8001/getTextReply"

    #     getTextByTextData = json.dumps({
    #         "text": text,
    #         "history": history
    #     })


    #     getTextByTextRes = requests.post(getTextByTextUrl, data=getTextByTextData)
    # except exceptions.Timeout as e:
    #     print('请求超时：'+ str(e.message))
    # except exceptions.HTTPError as e:
    #     print('http请求错误:'+ str(e.message))
    # else:

    getTextByTextUrl = "http://127.0.0.1:8001/getTextReply"

    getTextByTextData = json.dumps({
        "text": text,
        "history": history
    })

    getTextByTextRes = requests.post(getTextByTextUrl, data=getTextByTextData)
    # getTextByTextRes.status_code
    getTextByTextResult = getTextByTextRes.json()
    print(getTextByTextResult)

    return getTextByTextResult

@router.post('/getAudioTranslation')
async def getAudioTranslation(file: UploadFile = File()):
    fn = file.filename
    filename = str(int(time.time())) + '_' + ''.join(random.sample(string.ascii_letters + string.digits, 8)) + '.wav'
    save_path = f'E:\\projects\\ai-chat\\fileServer\\static\\'
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