# 📄 PDF RAG Assistant

An AI-powered PDF Question Answering system built using FastAPI, React, MongoDB, Qdrant, LangChain, HuggingFace Embeddings, and Google's Gemini model.

Users can upload PDF documents, ask questions about their content, and receive intelligent, context-aware answers powered by Retrieval-Augmented Generation (RAG).

---

## 🚀 Features

### 📄 PDF Upload & Processing

* Upload one or multiple PDF files
* Automatic document parsing
* Text chunking using LangChain
* Embedding generation using Sentence Transformers

### 🔍 Retrieval-Augmented Generation (RAG)

* Semantic search with Qdrant Vector Database
* Relevant document retrieval
* Context-aware AI responses

### 🤖 Gemini AI Integration

* Powered by Google Gemini
* Intelligent reasoning over document content
* Summarization and explanation capabilities
* Resume and assignment analysis support

### 🔐 Google Authentication

* Secure Google OAuth Login
* JWT-based authentication
* Protected chat sessions

### 💬 Chat History

* Persistent conversations stored in MongoDB
* Multiple chat sessions
* Automatic chat title generation

### 🎨 Modern UI

* React + Vite frontend
* Tailwind CSS styling
* Responsive chat interface
* Markdown rendering support

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios
* React Markdown

### Backend

* FastAPI
* Python
* LangChain
* Google Gemini API
* HuggingFace Embeddings

### Database & Storage

* MongoDB
* Qdrant Vector Database

### Authentication

* Google OAuth
* JWT Tokens

---

## 📂 Project Structure

```bash
Pdf chatbot (mini rag)/
│
├── Backend/
│   ├── main.py
│   ├── auth_routes.py
│   ├── auth.py
│   ├── security.py
│   ├── config.py
│   ├── dependencies.py
│   │
│   ├── queues/
│   │   ├── worker.py
│   │   └── __init__.py
│   │
│   ├── client/
│   │   └── rq_client.py
│   │
│   └── __init__.py
│
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
├── docker-compose.yml
└── README.md
└── .gitignore
```

---

## ⚙️ Environment Variables

Create a `.env` file in the backend directory.

```env
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
MONGO_URI=your_mongodb_connection_string
```

---

## 🐳 Running MongoDB with Docker

```bash
docker-compose up -d
```

---

## 🔧 Backend Setup

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

Windows:

```bash
.\.venv\Scripts\activate
```

Linux / Mac:

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Start Backend Server

```bash
uvicorn Backend.main:app --reload
```

Backend will run on:

```bash
http://localhost:8000
```

---

## 🎨 Frontend Setup

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## 📖 Usage

### Step 1

Login using Google Authentication.

### Step 2

Create a new chat session.

### Step 3

Upload one or more PDF documents.

### Step 4

Ask questions about the uploaded PDFs.

### Step 5

Receive AI-generated answers grounded in document content.

---

## 💡 Example Questions

* Summarize this document.
* Explain chapter 3 in simple terms.
* What are the key findings of this research paper?
* Solve all questions from this assignment.
* Analyze this resume for Machine Learning jobs.
* What skills are missing in this CV?

---

## 🔒 Security

Sensitive credentials are stored using environment variables.

The following files are excluded from Git tracking:

* `.env`
* `node_modules`
* `venv`
* `uploads`

---

## 📈 Future Improvements

* Multi-user document isolation
* Streaming AI responses
* Document management dashboard
* PDF deletion support
* OCR support for scanned PDFs
* Role-based access control
* Cloud deployment

---

## 👨‍💻 Author

Developed as a full-stack AI application using modern RAG architecture and Google Gemini.

If you found this project useful, consider giving it a ⭐ on GitHub.
