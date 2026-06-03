import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  "136845754972-jvo48a988fpjkgbcgeqe4b6sbngro7nm.apps.googleusercontent.com";

const API_BASE = "http://localhost:8000";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
  setError(data.detail || "Login failed");
  return;
}

localStorage.setItem("access_token", data.access_token);
localStorage.setItem("user_id", data.user_id);
localStorage.setItem("email", data.email);
localStorage.setItem("name", data.name || "");

console.log("Logged User ID:", data.user_id);

const chatId = crypto.randomUUID();
navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>WELCOME TO 👋</h1>
          <h2 style={styles.title}>PDF RAG Assistant</h2>
          <p style={styles.subtitle}>
            Sign in to continue your AI-powered document experience
          </p>

          <div style={{ marginTop: "20px" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed")}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b, #0ea5e9)",
    backgroundSize: "400% 400%",
    animation: "gradientMove 10s ease infinite",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "380px",
    padding: "35px 30px",
    borderRadius: "20px",
    background: "rgba(90, 40, 40, 0.1)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    textAlign: "center",
    color: "white",
  },

  title: {
    marginBottom: "10px",
    fontSize: "26px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  subtitle: {
    fontSize: "14px",
    opacity: 0.8,
  },

  error: {
    color: "#ff4d4d",
    marginTop: "15px",
    fontSize: "14px",
  },
};
