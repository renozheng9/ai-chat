from fastapi import APIRouter, Depends
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModel
from apps.login import login

class GetReplyParams(BaseModel):
    text: str

router = APIRouter(
    prefix="/chat",
    # dependencies=[Depends(login.get_current_active_user)],
    tags=["chat"]
)

# tokenizer = AutoTokenizer.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True)
# model = AutoModel.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True).half().cuda()
# model = model.eval()

@router.post('/getReply/')
async def getReply(data: GetReplyParams):
    print(data.text)
    
    # response, history = model.chat(tokenizer, data.text, history=[])
    # print(response)
    # print(history)

    return "hello"