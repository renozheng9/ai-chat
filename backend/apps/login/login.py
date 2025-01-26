from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, APIRouter, HTTPException, status, Request, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
#from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel

from bson.objectid import ObjectId

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
# ACCESS_TOKEN_EXPIRE_MINUTES = 1

router = APIRouter(
    prefix="",
    tags=["login"]
)

fake_users_db = {
    "john": {
        "username": "john",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$UA5r8.jSbIZkmx1dgJsyNusoShqJRgJrWM9vqcm7cUPGYtXlWvOjS",
        "disabled": False,
    }
}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


class UserInDB(User):
    hashed_password: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload)
        print(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def verify_token(
    request: Request,
    x_token: str = Header()
):
    path: str = request.get('path')
    print(path)
    # print(x_token)
    if (path.startswith('/token')):
        print('123')
        pass


@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return current_user


@router.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return [{"item_id": "Foo", "owner": current_user.username}]

@router.get("/users/test")
async def getPwsHash(
    password: Annotated[str, 123]
):
    print(password)
    return password

@router.get("/users/mongo")
async def getMongo(request: Request):
    collection = request.app.state.db["user"]
    obj = await collection.find_one({"_id": ObjectId("679309b369e8fb7483dbbd33")})
    if obj is None:
        return None
    return {"id": "123", "name": obj["name"]}
# from typing import Optional
# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# from pydantic import BaseModel

# # 模拟数据库
# fake_users_db = {
#     "john": {
#         "username": "john",

#         "full_name": "John Doe",
#         "email": "johndoe@example.com",
#         "hashed_password": "fakehashedsecret",
#         "disabled": False,
#     },
#     "alice": {
#         "username": "alice",
#         "full_name": "Alice Wonderson",
#         "email": "alice@example.com",
#         "hashed_password": "fakehashedsecret2",
#         "disabled": True,
#     },
# }

# router = APIRouter(
#     prefix="",
#     tags=["login"]
# )

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# # 模拟 hash 加密算法
# def fake_hash_password(password: str) -> str:
#     return "fakehashed" + password


# # 返回给客户端的 User Model，不需要包含密码
# class User(BaseModel):
#     username: str
#     email: Optional[str] = None
#     full_name: Optional[str] = None
#     disabled: Optional[bool] = None


# # 继承 User，用于密码验证，所以要包含密码
# class UserInDB(User):
#     hashed_password: str


# # OAuth2 获取 token 的请求路径
# @router.post("/token")
# async def login(form_data: OAuth2PasswordRequestForm = Depends()):
#     # 1、获取客户端传过来的用户名、密码
#     username = form_data.username
#     password = form_data.password
#     print(username)
#     print(password)
#     # 2、模拟从数据库中根据用户名查找对应的用户
#     user_dict = fake_users_db.get(username)
#     if not user_dict:
#         # 3、若没有找到用户则返回错误码
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="用户名或密码不正确")

#     # 4、找到用户
#     user = UserInDB(**user_dict)
#     # 5、将传进来的密码模拟 hash 加密
#     hashed_password = fake_hash_password(password)
#     # 6、如果 hash 后的密码和数据库中存储的密码不相等，则返回错误码
#     if not hashed_password == user.hashed_password:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="用户名或密码不正确")

#     # 7、用户名、密码验证通过后，返回一个 JSON
#     return {"access_token": user.username, "token_type": "bearer"}


# # 模拟从数据库中根据用户名查找用户
# def get_user(db, username: str):
#     if username in db:
#         user_dict = db[username]
#         return UserInDB(**user_dict)


# # 模拟验证 token，验证通过则返回对应的用户信息
# def fake_decode_token(token):
#     user = get_user(fake_users_db, token)
#     return user


# # 根据当前用户的 token 获取用户，token 已失效则返回错误码
# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     user = fake_decode_token(token)
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid authentication credentials",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     return user


# # 判断用户是否活跃，活跃则返回，不活跃则返回错误码
# async def get_current_active_user(user: User = Depends(get_current_user)):
#     if user.disabled:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User")
#     return user


# # 获取当前用户信息
# @router.get("/user/me")
# async def read_user(user: User = Depends(get_current_active_user)):
#     return user


# # 正常的请求
# @router.get("/items/")
# async def read_items(token: str = Depends(oauth2_scheme), name: str = ''):
#     print(token)
#     print(name)
    
#     return {"token": token}

# @router.get("/test/")
# async def read_items(name: str = ''):
#     print(name)
    
#     return name