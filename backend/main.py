import uvicorn

from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
from conf import config
from apps.chat import chat
from apps.login import login

app = FastAPI()

app.mount('/static', StaticFiles(directory="static"), name="static")

# app = FastAPI(current_user = Annotated[login.User, Depends(login.get_current_active_user)])

# CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=config.ALLOWED_METHODS,
    allow_headers=config.ALLOWED_HEADERS,
)

app.include_router(login.router)
app.include_router(chat.router)

if __name__ == '__main__':
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# def get_application():
#     application = FastAPI()

#     # # CORS 中间件配置
#     # application.add_middleware(
#     #     CORSMiddleware,
#     #     allow_origins=config.ALLOWED_HOSTS,
#     #     allow_credentials=True,
#     #     allow_methods=config.ALLOWED_METHODS,
#     #     allow_headers=config.ALLOWED_HEADERS,
#     # )

#     application.include_router(router)

# app = get_application()

# app = FastAPI()

# @app.get("/")
# def read_root():
#     return {"Hello": "World"}

# if __name__ == "__main__":
#     uvicorn.run(app, **{'host': '0.0.0.0', 'port': 8000, 'log_level': 'info'})

# @app.get("/")
# def read_root():
#     return {"Hello": "World"}