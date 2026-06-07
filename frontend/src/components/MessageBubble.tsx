import type { Message } from "../types/chat";

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.sender === "user";
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message-row ${isUser ? "user" : ""}`}>
      <div className={`message-avatar ${isUser ? "user" : "ai"}`}>
        {isUser ? "U" : "AI"}
      </div>
      <div className="message-bubble">
        <div className={`message-content ${isUser ? "user" : "ai"}`}>
          {message.content}
        </div>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}