from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .security import create_access_token
from .auth import verify_google_token

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    id_token: str


@router.post("/api/auth/google-login")
def google_login(data: GoogleLoginRequest):

    user_data = verify_google_token(data.id_token)

    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    token = create_access_token({
        "user_id": user_data["google_id"],
        "email": user_data["email"]
    })

    return {
    "access_token": token,
    "token_type": "bearer",
    "user_id": user_data["google_id"],
    "email": user_data["email"]
}