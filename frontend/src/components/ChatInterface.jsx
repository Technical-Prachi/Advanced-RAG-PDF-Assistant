import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function ChatInterface() {
  const navigate = useNavigate();
  const { chatId } = useParams();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! Upload a PDF and ask questions about it.",
    },
  ]);

  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  // ======================
  // SAFE USER ID
  // ======================
  const getUserId = () => {
  const id = localStorage.getItem("user_id");

  console.log("USER ID =", id);

  if (!id || id === "null" || id === "undefined")
    return null;

  return id;
};

  // ======================
  // AUTH HEADER
  // ======================
  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
  });

  // ======================
  // FETCH CHATS
  // ======================
  const fetchChats = async () => {
    const user_id = getUserId();
    if (!user_id) return;

    try {
      const res = await axios.get(`${API_BASE}/chats`, {
        params: { user_id },
        ...getAuthHeader(),
      });

      setChatHistory(res.data || []);
    } catch (err) {
      console.error("Fetch Chats Error:", err);
    }
  };
  

  // ======================
  // LOAD CHAT
  // ======================
  const loadChat = async (id) => {
    const user_id = getUserId();
    if (!user_id || !id) return;

    try {
      const res = await axios.get(`${API_BASE}/chat/${id}`, {
        params: { user_id },
        ...getAuthHeader(),
      });

      setMessages(
        res.data?.messages?.length
          ? res.data.messages
          : [
              {
                role: "assistant",
                content: "👋 Hi! Upload a PDF and ask questions about it.",
              },
            ]
      );
    } catch (err) {
      console.error("Load Chat Error:", err);
    }
  };

  // ======================
  // INIT
  // ======================
  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId) loadChat(chatId);
    setInput("");
    setFiles([]);
  }, [chatId]);

  // ======================
  // AUTO SCROLL
  // ======================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ======================
  // NEW CHAT
  // ======================
  const createNewChat = () => {
    navigate(`/chat/${crypto.randomUUID()}`);
  };

  // ======================
  // SEND MESSAGE
  // ======================
  const sendMessage = async () => {
    const user_id = getUserId();
    console.log("SEND MESSAGE USER_ID =", user_id);

    if (!user_id) {
      alert("Login required: user_id missing");
      return;
    }

    if (!input.trim() && files.length === 0) return;

    setLoading(true);

    try {
      // ---------------- PDF UPLOAD ----------------
      if (files.length > 0) {
        for (const file of files) {
          const form = new FormData();
          form.append("file", file);
          form.append("user_id", user_id);

          await axios.post(`${API_BASE}/upload-pdf`, form, getAuthHeader());

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `📄 ${file.name} uploaded successfully`,
            },
          ]);
        }
      }

      // ---------------- CHAT ----------------
      if (input.trim()) {
        const userInput = input;

        setMessages((prev) => [
          ...prev,
          { role: "user", content: userInput },
        ]);

        const form = new FormData();
        form.append("message", userInput);
        form.append("chat_id", chatId || crypto.randomUUID());
        form.append("user_id", user_id);

        const res = await axios.post(
          `${API_BASE}/chat`,
          form,
          getAuthHeader()
        );

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.reply },
        ]);

        fetchChats();
      }

      setInput("");
      setFiles([]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err?.response?.data?.reply ||
            "❌ Backend Error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white">

      {/* SIDEBAR */}
      <div className="w-64 border-r border-gray-800 p-4 hidden md:block overflow-y-auto">

        <h1 className="text-xl font-bold mb-4">
          📄 PDF RAG Assistant
        </h1>

        <button
          onClick={createNewChat}
          className="w-full bg-gray-800 hover:bg-gray-700 p-2 rounded-lg"
        >
          + New Chat
        </button>

        <div className="mt-4 space-y-2">
          {chatHistory.map((chat) => (
            <button
              key={chat.chat_id}
              onClick={() => navigate(`/chat/${chat.chat_id}`)}
              className={`w-full text-left p-2 rounded ${
                chat.chat_id === chatId
                  ? "bg-blue-600"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              {chat.title}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex flex-col flex-1">

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-3xl px-4 py-3 rounded-2xl ${
                m.role === "user"
                  ? "bg-blue-600 ml-auto"
                  : "bg-gray-800 mr-auto"
              }`}
            >
              <ReactMarkdown>
                {String(m.content || "")}
              </ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              🤔 Thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-gray-800 flex gap-2">

          <input
            hidden
            type="file"
            ref={fileRef}
            accept=".pdf"
            multiple
            onChange={(e) =>
              setFiles(Array.from(e.target.files || []))
            }
          />

          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 bg-gray-800 rounded-lg"
          >
            📎
          </button>

          <input
            className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your PDF..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-5 bg-blue-600 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}