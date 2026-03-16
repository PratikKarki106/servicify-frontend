import React, { useState, useEffect, useRef } from "react";
import { getMessages, type Message } from "../services/messageService";
import { websocketService } from "../services/websocketService";
import "./ChatComponent.css";

const ADMIN_ID = "admin";

interface ChatComponentProps {
  userId: string;
  token?: string;
  showHeader?: boolean;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ userId, showHeader = true }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    setError(null);
    const load = async () => {
      try {
        const res = await getMessages(ADMIN_ID);
        if (mounted && res.success) setMessages(res.messages || []);
      } catch (e: unknown) {
        if (mounted) setError((e as Error)?.message || "Failed to load messages");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const onNew = (msg: { _id: string; senderId: string; senderRole: string; receiverId: string; content: string; createdAt: string }) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg as Message];
      });
    };
    websocketService.onNewMessage(onNew);
    return () => {
      websocketService.offNewMessage();
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !userId) return;
    setSending(true);
    setInput("");
    try {
      websocketService.sendChatMessage(userId, "user", ADMIN_ID, text);
    } catch (e) {
      setError((e as Error)?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="chat-component">
        {showHeader && (
          <div className="chat-header">
            <h2>Messages</h2>
            <span className="chat-partner">Support</span>
          </div>
        )}
        <div className="chat-loading">Loading conversation…</div>
      </div>
    );
  }

  return (
    <div className="chat-component">
      {showHeader && (
        <div className="chat-header">
          <h2>Messages</h2>
          <span className="chat-partner">Support</span>
        </div>
      )}
      {error && <div className="chat-error">{error}</div>}
      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">No messages yet. Start the conversation below.</div>
        )}
        {messages.map((m) => (
          <div
            key={m._id}
            className={`chat-bubble ${m.senderId === userId ? "chat-bubble-me" : "chat-bubble-them"}`}
          >
            <div className="chat-bubble-content">{m.content}</div>
            <div className="chat-bubble-time">
              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-wrap">
        <textarea
          className="chat-input"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={sending}
        />
        <button
          type="button"
          className="chat-send"
          onClick={handleSend}
          disabled={sending || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
