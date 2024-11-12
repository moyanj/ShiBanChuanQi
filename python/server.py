from fastapi import FastAPI, Response
from typing import Union
from pydantic import BaseModel
import asyncpg
import aiohttp
import hmac
import json
import time

app = FastAPI()


class UploadData(BaseModel):
    user: str
    pwd: str
    data: dict
    gt: dict


async def get_conn() -> asyncpg.Connection:
    for i in range(3):
        try:
            db:asyncpg.Connection = await asyncpg.connect(
                host="154.37.213.180",
                port=5432,
                user="sbcq_saves",
                password="wZNKC855yyZ8ZmQ6",
                database="sbcq_saves",
            )

            create_table_query = """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                "username" VARCHAR(255) NOT NULL UNIQUE,
                pwd VARCHAR(255) NOT NULL,
                save_data TEXT,
                save_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
            await db.execute(create_table_query)
            return db

        except:
            print("DB connection lost!!! ")
            time.sleep(0.25)

async def check(info):
    print("c")
    if info is None:
        return False
    
    sign_token = hmac.new(b"c29a9ecaf69025e936034b1bb03e0f8d", info["lot_number"].encode(), digestmod='SHA256').hexdigest()
    info["sign_token"] = sign_token
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post("https://gcaptcha4.geetest.com/validate?captcha_id=6acf3658d1b41039662abc436d70e412", info, timeout=1) as res:
                assert res.status_code == 200
                gt_msg = json.loads(res.text)
                
    except Exception as e:
        gt_msg = {'result': 'success', 'reason': 'request geetest api fail'}
        
    print("d")
    if gt_msg['result'] == 'success':
         return True
    else:
        return False
    
@app.post("/save/upload")
async def upload_save(data: UploadData, response: Response):
    
    check_result = await check(data.gt)
    if not check_result:
        response.status_code = 403
        return {"error": "error"}
    
    if data.user is None or data.pwd is None:
        response.status_code = 400
        return {"error": "user or pwd is None"}
    
    db = await get_conn()
    result = await db.fetchrow("SELECT * FROM users WHERE username=%s", (data.user,))
    
    if result is None or result.pwd != data.pwd:
        response.status_code = 401
        return {"error": "user or pwd is wrong"}
    return {"msg": "ok"}, 200
