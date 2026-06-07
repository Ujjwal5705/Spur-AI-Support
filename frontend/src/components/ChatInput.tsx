import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: Props) {
  const [message, setMessage] = useState("");

  const send = () => {
    if (!message.trim() || loading) return;
    onSend(message);
    setMessage("");
  };

  return (
    <div className="chat-input-wrapper">
      <input
        className="chat-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        placeholder="Type your message..."
        disabled={loading}
      />
      <button
        className="send-button"
        onClick={send}
        disabled={loading || !message.trim()}
        aria-label="Send message"
      >
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  );
}
