import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faHeadset } from "@fortawesome/free-solid-svg-icons";
import { getConversations, type Conversation } from "../services/messageService";
import ChatComponent from "../components/ChatComponent";
import "./UserMessagesPage.css";

const ADMIN_ID = "admin";
const SUPPORT_NAME = "Servicify Support";

interface UserMessagesPageProps {
  userId: string;
}

const UserMessagesPage: React.FC<UserMessagesPageProps> = ({ userId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setError(null);
    getConversations()
      .then((res) => {
        if (mounted && res.success) setConversations(res.conversations || []);
      })
      .catch((e) => {
        if (mounted) setError((e as Error)?.message || "Failed to load conversations");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Messenger layout: left 20% conversation list, right 80% message box
  return (
    <div className="user-messages-page">
      {/* Left: conversation overview (20%) */}
      <aside className="user-messages-sidebar">
        <div className="user-messages-sidebar-header">
          <h2 className="user-messages-sidebar-title">
            <FontAwesomeIcon icon={faComments} />
            <span>Messages</span>
          </h2>
          <p className="user-messages-sidebar-subtitle">Click a conversation to open it</p>
        </div>
        {error && <div className="user-messages-error">{error}</div>}
        {loading ? (
          <div className="user-messages-loading">Loading…</div>
        ) : conversations.length === 0 ? (
          <div className="user-messages-empty-state">
            <FontAwesomeIcon icon={faHeadset} className="user-messages-empty-icon" />
            <p>No conversations yet.</p>
            <button
              type="button"
              className="user-messages-start-chat-btn"
              onClick={() => setSelectedConversation(ADMIN_ID)}
            >
              Chat with {SUPPORT_NAME}
            </button>
          </div>
        ) : (
          <div className="user-messages-conversation-list">
            {conversations.map((c) => {
              const name = c.userId === ADMIN_ID ? SUPPORT_NAME : `User #${c.userId}`;
              const preview = c.lastMessage?.content
                ? c.lastMessage.content.slice(0, 50) + (c.lastMessage.content.length > 50 ? "…" : "")
                : "No messages yet";
              const time = c.lastMessage?.createdAt
                ? new Date(c.lastMessage.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";
              return (
                <button
                  key={c.userId}
                  type="button"
                  className={`user-messages-conversation-card ${selectedConversation === c.userId ? "active" : ""}`}
                  onClick={() => setSelectedConversation(c.userId)}
                >
                  <div className="user-messages-card-avatar">
                    <FontAwesomeIcon icon={faHeadset} />
                  </div>
                  <div className="user-messages-card-body">
                    <span className="user-messages-card-name">{name}</span>
                    <p className="user-messages-card-preview">{preview}</p>
                    {time && <span className="user-messages-card-time">{time}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Right: message box (80%) */}
      <main className="user-messages-main">
        {!selectedConversation ? (
          <div className="user-messages-placeholder">
            <FontAwesomeIcon icon={faHeadset} className="user-messages-placeholder-icon" />
            <p className="user-messages-placeholder-title">Select a conversation</p>
            <p className="user-messages-placeholder-desc">Choose one from the left to view and send messages.</p>
          </div>
        ) : (
          <div className="user-messages-box">
            <div className="user-messages-box-header">
              <h2>{selectedConversation === ADMIN_ID ? SUPPORT_NAME : `User #${selectedConversation}`}</h2>
            </div>
            <div className="user-messages-box-content">
              <ChatComponent userId={userId} showHeader={false} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserMessagesPage;
