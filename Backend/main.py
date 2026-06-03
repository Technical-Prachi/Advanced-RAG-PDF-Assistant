from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os, traceback

from queues.worker import process_query, process_pdf
from auth_routes import router as auth_router

import os

load_dotenv()

app = FastAPI()
app.include_router(auth_router)

mongo_client = MongoClient(
    os.getenv("MONGO_URI")
)

db = mongo_client["pdf_rag"]
chats_collection = db["chats"]

os.makedirs("uploads", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {"status": "Server running 🚀"}


# ---------------- PDF ----------------
@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    filepath = f"uploads/{file.filename}"

    with open(filepath, "wb") as f:
        f.write(await file.read())

    process_pdf(filepath)

    return {"message": "PDF uploaded"}


# ---------------- CHAT ----------------
@app.post("/chat")
async def chat(
    message: str = Form(...),
    chat_id: str = Form(...),
    user_id: str = Form(...)
): 
    print("MESSAGE =", message)
    print("CHAT_ID =", chat_id)
    print("USER_ID =", user_id)
    try:
        result = process_query(message)

        chats_collection.update_one(
    {"chat_id": chat_id, "user_id": user_id},
    {
        "$set": {
            "user_id": user_id
        },
        "$setOnInsert": {
            "title": message[:60]  # first user message becomes chat title
        },
        "$push": {
            "messages": {
                "$each": [
                    {"role": "user", "content": message},
                    {"role": "assistant", "content": result}
                ]
            }
        }
    },
    upsert=True
)

        return {"reply": result}

    except Exception as e:
        print(e)
        traceback.print_exc()
        return {"reply": "Error occurred"}


# ---------------- GET CHATS ----------------
@app.get("/chats")
def get_chats(user_id: str = Query(...)):
    return list(
        chats_collection.find(
            {"user_id": user_id},
            {"_id": 0, "chat_id": 1, "title": 1}
        ).sort("_id", -1)
    )


# ---------------- GET CHAT ----------------
@app.get("/chat/{chat_id}")
def get_chat(chat_id: str, user_id: str = Query(...)):
    chat = chats_collection.find_one(
        {"chat_id": chat_id, "user_id": user_id},
        {"_id": 0}
    )

    return chat or {"messages": []}