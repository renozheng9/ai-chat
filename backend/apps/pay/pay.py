import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from apps.login import login
import time
import string
import random
from requests import exceptions 

import json
import stripe

import uuid
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

stripe.api_key = 'sk_test_51KFuYNH6PcbFpUnVbj51FwgOBVRac5YBC931O65c1pOvwTUhVmbZZ9Ypatr7GYu1bk18Qamplj81FCT23ZRrH8aJ006g4NwTfZ'

key = b"1DF621423C0C40EF"
iv = "1234567890123456"

router = APIRouter(
    prefix="/pay",
    # dependencies=[Depends(login.get_current_active_user)],
    tags=["pay"]
)

class CreatePaymentData(BaseModel):
    amount: int
    currency: str

class UpdatePaymentData(BaseModel):
    amount: int
    currency: str
    client: str

class My_AES_CBC():
    def __init__(self, key, iv):
        # 密钥必须为8位
        self.key = key
        self.mode = AES.MODE_CBC
        self.cryptor = AES.new(self.key, self.mode, iv)

    def encrypt(self, plain_text):
        encrypted_text = self.cryptor.encrypt(pad(plain_text.encode('utf-8'), AES.block_size))
        return encrypted_text

    def decrypt(self, encrypted_text):
        plain_text = self.cryptor.decrypt(encrypted_text)
        plain_text = unpad(plain_text, AES.block_size).decode()
        return plain_text


# e = My_AES_CBC(key, iv='1234567890123456'.encode('utf-8')).encrypt("0123456789ABCDEF中国")
# d = My_AES_CBC(key, iv='1234567890123456'.encode('utf-8')).decrypt(e)
# print(e, d, key)
# print(base64.b64encode(e).decode('utf-8'))
# print(My_AES_CBC(key, iv='1234567890123456'.encode('utf-8')).decrypt(base64.b64decode(b"UCIKLfDnlRS0XLWgK3yfLStL4ltCZITlv2fVO0ijDXU=")))

@router.post('/createPayment')
async def createPayment(data: CreatePaymentData):
    try:
        if (
            data.currency != 'usd' and
            data.currency != 'hkd' and
            data.currency != 'cny'
        ):
            raise HTTPException(status_code=400, detail="params is invalid")
        
        if (data.amount < 400 or data.amount > 99999900):
            raise HTTPException(status_code=400, detail="params is invalid")

        paymentMethods = ["card"] if data.currency == 'usd' else ["card", "alipay", "wechat_pay"]

        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=data.amount,
            currency=data.currency,
            # In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            # automatic_payment_methods={
            #     'enabled': True,
            # },
            payment_method_types=paymentMethods
        )
        print(intent)
        return {
            'clientSecret': intent['client_secret'],
            'clientId': base64.b64encode(My_AES_CBC(key, iv=iv.encode('utf-8')).encrypt(intent["id"])).decode('utf-8')
            # [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
            # 'dpmCheckerLink': 'https://dashboard.stripe.com/settings/payment_methods/review?transaction_id={}'.format(intent['id']),
        }
    except Exception as e:
        return JSONResponse(
            status_code=403,
            content={"message": "create payment failed", "detail": str(e)},
        )
    
@router.post('/updatePayment')
async def updatePayment(data: UpdatePaymentData):
    try:
        if (
            data.currency != 'usd' and
            data.currency != 'hkd' and
            data.currency != 'cny'
        ):
            raise HTTPException(status_code=400, detail="params is invalid")
        
        if (data.amount < 400 or data.amount > 99999900):
            raise HTTPException(status_code=400, detail="params is invalid")

        clientId = My_AES_CBC(key, iv=iv.encode('utf-8')).decrypt(base64.b64decode(data.client))

        paymentMethods = ["card"] if data.currency == 'usd' else ["card", "alipay", "wechat_pay"]
        print(clientId)
        print(stripe.PaymentIntent.retrieve(clientId))

        stripe.PaymentIntent.modify(
          clientId,
          amount=data.amount,
          currency=data.currency,
          payment_method_types=paymentMethods
        )

        # paymentMethods = ["card"] if data.currency == 'usd' else ["card", "alipay", "wechat_pay"]
        # # Create a PaymentIntent with the order amount and currency
        # intent = stripe.PaymentIntent.create(
        #     amount=data.amount,
        #     currency=data.currency,
        #     # In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        #     # automatic_payment_methods={
        #     #     'enabled': True,
        #     # },
        #     payment_method_types=paymentMethods
        # )
        # print(intent)
        return {
            'success': 'true',
        }
    except Exception as e:
        return JSONResponse(
            status_code=403,
            content={"message": "create payment failed", "detail": str(e)},
        )