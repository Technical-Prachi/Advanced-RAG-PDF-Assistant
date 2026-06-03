from google.oauth2 import id_token
from google.auth.transport import requests
from config import settings

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        return {
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "google_id": idinfo["sub"]
        }

    except Exception as e:
        print("Google auth error:", e)
        return None