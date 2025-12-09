import requests

url = "https://openapivts.koreainvestment.com:29443/oauth2/Approval"
body = {
    "grant_type": "client_credentials",
    "appkey": "PSlxrPo3nO2aqiNVzp8PohuPPIIMNm4uDUKR",
    "secretkey": "gOxHUA7obiyKuBi3GFV49GR4bnuXD0aJO6fbhKW4Sqhp0yTuH5uerWvUl2sDRSRRKr7v9kvdzI431y2UCc7HYRUlD+TVGirQ+/FYQQ8r/CCugYbwbwzRHcgi8ptB7t7KN1ETu2PqsWTQT9bze/2nyl7jHJuaxvcIWSqnYufCMRvDwmn/6RY="
}
headers = {"Content-Type": "application/json; utf-8"}

resp = requests.post(url, json=body, headers=headers)
approval_key = resp.json().get("approval_key")
print("approval_key:", approval_key)
