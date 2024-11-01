import requests
url = 'http://127.0.0.1:5000/download'
data = {
    "user": "2",
    "pwd": "223",
    "data":"ssss"
}

response = requests.get(url, params=data)
print(response.json())
