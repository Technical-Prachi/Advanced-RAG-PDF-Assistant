import { Routes, Route, Navigate } from "react-router-dom";
import ChatInterface from "./components/ChatInterface";
import Login from "./components/login/Login";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* default route → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* login page */}
      <Route path="/login" element={<Login />} />

      {/* protected chat */}
      <Route
        path="/chat/:chatId"
        element={
          <ProtectedRoute>
            <ChatInterface />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}