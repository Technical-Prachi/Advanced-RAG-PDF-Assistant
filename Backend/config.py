import os
from dotenv import load_dotenv

load_dotenv()

class settings:
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = "HS256"
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")    