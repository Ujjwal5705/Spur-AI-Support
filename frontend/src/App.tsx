import { useEffect, useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import { api } from "./services/api";
import type { Message } from "./types/chat";
import "./styles/chat.css";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const MAX_MESSAGE_LENGTH = 2000;

  useEffect(() => {
    const existing = sessionStorage.getItem("sessionId");

    if (existing) {
      setSessionId(existing);

      api.get(`/chat/history/${existing}`).then((res) => {
        const history = res.data.map((m: any) => ({
          sender: m.sender,
          content: m.content,
        }));

        setMessages(history);
      });
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (text.trim().length === 0) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", content: "Message cannot be empty." },
      ]);
      return;
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          content: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).`,
        },
      ]);
      return;
    }

    setLoading(true);

    const userMessage = {
      sender: "user" as const,
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await api.post("/chat/message", {
        message: text,
        sessionId,
      });

      const newSession = res.data.sessionId;

      setSessionId(newSession);
      sessionStorage.setItem("sessionId", newSession);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          content: res.data.reply,
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Sorry, something went wrong.";
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          content: errorMessage,
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-app">
      <div className="chat-card">
        <div className="chat-header">
          <div className="chat-header-icon">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h1 className="chat-header-title">Spur AI Support</h1>
            <p className="chat-header-subtitle">Always here to help</p>
          </div>
        </div>

        <ChatWindow messages={messages} loading={loading} />

        <div className="chat-input-area">
          <ChatInput onSend={sendMessage} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
