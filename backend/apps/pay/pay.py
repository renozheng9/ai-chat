import os
from fastapi import APIRouter, Depends, UploadFile, Form, File, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from apps.login import login
import time
import string
import random
from requests import exceptions 

import json
import stripe

stripe.api_key = 'sk_test_51KFuYNH6PcbFpUnVbj51FwgOBVRac5YBC931O65c1pOvwTUhVmbZZ9Ypatr7GYu1bk18Qamplj81FCT23ZRrH8aJ006g4NwTfZ'

router = APIRouter(
    prefix="/pay",
    # dependencies=[Depends(login.get_current_active_user)],
    tags=["pay"]
)

class Data(BaseModel):
    amount: int
    currency: str

@router.post('/createPayment')
async def createPayment(data: Data):
    try:
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=data.amount,
            currency=data.currency,
            # In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            # automatic_payment_methods={
            #     'enabled': True,
            # },
            payment_method_types=["card", "alipay", "wechat_pay"]
        )
        print(intent)
        return {
            'clientSecret': intent['client_secret'],
            # [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
            # 'dpmCheckerLink': 'https://dashboard.stripe.com/settings/payment_methods/review?transaction_id={}'.format(intent['id']),
        }
    except Exception as e:
        return JSONResponse(
            status_code=403,
            content={"message": "create payment failed", "detail": str(e)},
        )