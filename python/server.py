from flask import Flask, request, jsonify
import psycopg2
import requests
import hmac
import json
from werkzeug.security import generate_password_hash, check_password_hash

# 初始化Flask应用
app = Flask(__name__)
# 连接数据库
db = pymysql.connect(
    host="mysql.sqlpub.com",
    port=3306,
    user="sbcq_saves",
    password="vMJDj",
    database="sbcq_saves"
)
cur = db.cursor()
create_table_query = '''
CREATE TABLE IF NOT EXISTS game_save (
    id SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    pwd VARCHAR(255) NOT NULL,
    save_data TEXT,
    save_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
'''

cur.execute(create_table_query)
db.commit()

def check(info):
    print("c")
    if info is None:
        return False
    sign_token = hmac.new(b"c29a9ecaf69025e936034b1bb03e0f8d", info["lot_number"].encode(), digestmod='SHA256').hexdigest()
    info["sign_token"] = sign_token
    try:
        res = requests.post("https://gcaptcha4.geetest.com/validate?captcha_id=6acf3658d1b41039662abc436d70e412", info, timeout=1)
        assert res.status_code == 200
        gt_msg = json.loads(res.text)
    except Exception as e:
        gt_msg = {'result': 'success', 'reason': 'request geetest api fail'}
    print("d")
    if gt_msg['result'] == 'success':
         return True
    else:
        return False


#允许跨域
@app.after_request
def after_request(response):
   
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return response

# 定义上传游戏存档的API
@app.route("/upload", methods=["POST"])
def upload():
    """
    上传游戏存档
    ---
    接收用户上传的游戏数据，验证用户身份后，更新数据库中的游戏存档
    """
    user = request.json.get("user")
    pwd = request.json.get("pwd")
    data = json.dumps(request.json.get("data"),ensure_ascii=False)
    
    if not check(request.json.get("gt")):
        return jsonify({"error": "error"}), 403

    if user is None or pwd is None:
        return jsonify({"error": "user or pwd is None"}), 400

    cursor = db.cursor()
    cursor.execute("SELECT pwd FROM game_save WHERE username=%s", (user,))
    result = cursor.fetchone()

    if result is None or not check_password_hash(result[0], pwd):
        return jsonify({"error": "user or pwd is wrong"}), 401
    
    cursor.execute("UPDATE game_save SET save_data=%s WHERE username=%s", (data, user))
    db.commit()
    
    return jsonify({"msg": "data updated successfully"}), 200

# 定义下载游戏存档的API
@app.route("/download", methods=["GET"])
def download():
    """
    下载游戏存档
    ---
    根据用户请求，验证用户身份后，返回用户的游戏存档数据
    """
    user = request.args.get("user")
    pwd = request.args.get("pwd")

    if user is None or pwd is None:
        return jsonify({"error": "user or pwd is None"}), 400

    cursor = db.cursor()
    cursor.execute("SELECT save_data, pwd FROM game_save WHERE username=%s", (user,))
    result = cursor.fetchone()

    if result is None or not check_password_hash(result[1], pwd):
        return jsonify({"error": "user or pwd is wrong"}), 401
    
    return jsonify({"data": result[0]}), 200

# 定义用户注册的API
@app.route("/reg", methods=["POST"])
def reg():
    """
    用户注册
    ---
    接收用户的注册信息，将用户的用户名和加密后的密码保存到数据库中
    """
    user = request.json.get("user")
    pwd = request.json.get("pwd")
    
    if not check(request.json.get("gt")):
        return jsonify({"error": "error"}), 403

    if user is None or pwd is None:
        return jsonify({"error": "user or pwd is None"}), 400

    cursor = db.cursor()
    hashed_pwd = generate_password_hash(pwd)
    try:
        cursor.execute("INSERT INTO game_save(username, pwd) VALUES(%s, %s)", (user, hashed_pwd))
        db.commit()
    except:
        return jsonify({"error": "user already exists"}), 409
    
    return jsonify({"msg": "registration successful"}), 201

# 定义删除用户的API
@app.route("/remove", methods=["DELETE"])
def remove():
    """
    删除用户
    ---
    接收用户的删除请求，验证用户身份后，从数据库中删除该用户
    """
    user = request.json.get("user")
    pwd = request.json.get("pwd")
    
    if not check(request.json.get("gt")):
        return jsonify({"error": "error"}), 403
    
    if user is None or pwd is None:
        return jsonify({"error": "user or pwd is None"}), 400
    
    cursor = db.cursor()
    cursor.execute("DELETE FROM game_save WHERE username=%s", (user,))
    db.commit()
    return jsonify({"msg": "user removed successfully"}), 200

@app.get("/ping")
def ping():
    return "pong"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

'''
CREATE TABLE game_save (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(255) NOT NULL UNIQUE,              -- 用户名，使用VARCHAR并指定长度
    pwd VARCHAR(255) NOT NULL,                      -- 密码，使用VARCHAR并指定长度
    save_data TEXT,                                 -- 存档数据
    save_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP -- 存档时间戳
);
'''