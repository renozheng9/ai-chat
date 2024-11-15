import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount('/static', StaticFiles(directory="static"), name="static")

if __name__ == '__main__':
    uvicorn.run("main:app", host="127.0.0.1", port=8005, reload=True)