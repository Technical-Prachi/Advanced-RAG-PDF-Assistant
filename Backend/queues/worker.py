from dotenv import load_dotenv
import os

from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

from langchain_qdrant import QdrantVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

from google import genai

load_dotenv()

# =========================
# GEMINI LLM (for answering)
# =========================
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# =========================
# EMBEDDINGS (STABLE FIX)
# =========================
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# =========================
# QDRANT
# =========================
client_qdrant = QdrantClient(url="http://localhost:6333")

COLLECTION_NAME = "learning_rag_3"


def create_collection():
    """
    Creates collection if not exists
    """

    existing = [
        c.name for c in client_qdrant.get_collections().collections
    ]

    if COLLECTION_NAME not in existing:
        client_qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE
            )
        )
        print("✅ Collection created")


def reset_collection():
    """
    Deletes old vectors and creates fresh collection.
    Called every time a new PDF is uploaded.
    """

    existing = [
        c.name for c in client_qdrant.get_collections().collections
    ]

    if COLLECTION_NAME in existing:
        client_qdrant.delete_collection(COLLECTION_NAME)
        print("🗑️ Old collection deleted")

    client_qdrant.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=384,
            distance=Distance.COSINE
        )
    )

    print("✅ Fresh collection created")


create_collection()

vector_db = QdrantVectorStore(
    client=client_qdrant,
    collection_name=COLLECTION_NAME,
    embedding=embedding_model,
)

# =========================
# PDF PROCESSING
# =========================
def process_pdf(filepath: str):

    global vector_db

    # IMPORTANT:
    # remove old PDF vectors before inserting new PDF
    reset_collection()

    # reconnect vector store after recreation
    vector_db = QdrantVectorStore(
        client=client_qdrant,
        collection_name=COLLECTION_NAME,
        embedding=embedding_model,
    )

    loader = PyPDFLoader(filepath)
    docs = loader.load()

    print("TOTAL PAGES:", len(docs))

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(docs)

    print("TOTAL CHUNKS:", len(chunks))

    vector_db.add_documents(chunks)

    info = client_qdrant.get_collection(COLLECTION_NAME)

    print("TOTAL VECTORS:", info.points_count)

    return True
# =========================
# QUERY PROCESSING (RAG)
# =========================
def process_query(query: str):
    print("🔎 Searching:", query)

    search_results = vector_db.similarity_search_with_score(
        query=query,
        k=10
    )
    print("RESULTS FOUND:", len(search_results))
    context = "\n\n".join([
        f"""
Page Content:
{doc.page_content}

Page Number: {doc.metadata.get('page_label')}
File: {doc.metadata.get('source')}
"""
        for doc, score in search_results
    ])

    SYSTEM_PROMPT = f"""
You are an advanced AI PDF Assistant capable of understanding, analyzing, reasoning, and explaining information from documents.

## Core Rules

### 1. Grounding Rule

Always use the provided document context as your primary source of truth.

### 2. Intelligent Reasoning

You are allowed to analyze, infer, compare, evaluate, summarize, and explain information that is derived from the document.

Do NOT simply search for exact sentences.

Use reasoning whenever appropriate.

Examples:

* If a resume is provided and the user asks:

  * "Is this resume good for Machine Learning jobs?"
  * Analyze projects, skills, education, internships and provide an evaluation.

* If a quiz PDF is provided and the user asks:

  * "Solve all questions"
  * Solve them using your knowledge and reasoning.
  * Do not refuse simply because answers are not explicitly written in the document.

* If lecture notes are provided:

  * Explain concepts in simple language.
  * Add examples.
  * Teach like a tutor.

### 3. Strict Hallucination Prevention

Never invent facts that claim to come from the document.

Use the following distinction:

✅ "The document states..."

✅ "Based on the information in the document..."

✅ "From the skills listed in the resume, it appears..."

❌ Never claim the document says something it does not.

### 4. When Information Is Missing

If the answer requires information that is neither present nor inferable from the document, reply:

"The information is not present in the document, and it cannot be reasonably inferred from the available content."

### 5. Resume Analysis Mode

When a resume is provided:

You may evaluate:

* ATS friendliness
* Skill relevance
* Job readiness
* Missing skills
* Resume structure
* Industry fit
* Strengths
* Weaknesses
* Improvement suggestions

Provide practical feedback.

### 6. Quiz / Assignment Mode

When a PDF contains:

* Questions
* Exercises
* Assignments
* MCQs
* Problems

and the user asks for answers:

You MUST solve them step-by-step using reasoning.

Do not refuse merely because solutions are not written in the document.

### 7. Educational Mode

For requests like:

* Explain
* Teach
* Summarize
* Describe
* Tell me about
* Tricks
* Tips
* Notes
* Revision

Provide a teacher-like explanation.

Use:

* Simple language
* Examples
* Analogies
* Important points
* Exam tips

### 8. Comparative Analysis

You may compare document content against general industry standards.

Examples:

* Resume vs ML industry expectations
* Research paper strengths
* Business proposal review
* CV review
* Project assessment

Clearly distinguish:

"Document Content" vs "General Recommendation"

### 9. Formatting Rules

Always use beautiful Markdown.

Use:

# Headings

## Subheadings

* Bullet points
* Numbered lists
* Tables when useful

Add relevant emojis.

Maintain proper spacing between sections.

### 10. Page References

Whenever information comes directly from the document:

Mention page numbers at the end.

Format:

📄 Pages: 3, 5

If multiple pages:

📄 Sources: Pages 2, 4, 7

### 11. Confidence Labels

When giving analysis:

🟢 High Confidence → Clearly supported by document.

🟡 Medium Confidence → Reasonable inference.

🔵 General Recommendation → Based on external knowledge and industry best practices.

### Context

{context}

"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"""
{SYSTEM_PROMPT}

Question:
{query}
""",
    config={
        "temperature": 0.4
    }

    )

    return response.text