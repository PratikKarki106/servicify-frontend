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
    <div className="user-messages-page msg-fade-in">
      {/* Left: conversation overview (Sidebar) */}
      <aside className="user-messages-sidebar">
        <div className="user-messages-sidebar-header">
          <h2 className="user-messages-sidebar-title">
            <FontAwesomeIcon icon={faComments} />
            <span>Chat</span>
          </h2>
          <p className="user-messages-sidebar-subtitle">Your messages and support tickets</p>
        </div>

        <div className="user-messages-sidebar-content msg-scrollbar">
          {error && <div className="user-messages-error">{error}</div>}
          
          {loading ? (
            <div className="user-messages-loading">
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
              <p>Fetching messages...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="user-messages-empty-state msg-fade-in">
              <div className="empty-state-visual">
                <FontAwesomeIcon icon={faHeadset} className="user-messages-empty-icon" />
              </div>
              <h3>Start a conversation</h3>
              <p>Need help? Our team is ready to assist you with your vehicle services.</p>
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
              {conversations.map((c, index) => {
                const name = c.userId === ADMIN_ID ? SUPPORT_NAME : `User #${c.userId}`;
                const preview = c.lastMessage?.content
                  ? c.lastMessage.content.slice(0, 50) + (c.lastMessage.content.length > 50 ? "…" : "")
                  : "No messages yet";
                const time = c.lastMessage?.createdAt
                  ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : "";
                
                return (
                  <button
                    key={c.userId}
                    type="button"
                    className={`user-messages-conversation-card ${selectedConversation === c.userId ? "active" : ""} msg-slide-in`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => setSelectedConversation(c.userId)}
                  >
                    <div className="user-messages-card-avatar">
                      {c.userId === ADMIN_ID ? <FontAwesomeIcon icon={faHeadset} /> : <div className="avatar-letter">{name.charAt(0)}</div>}
                    </div>
                    <div className="user-messages-card-body">
                      <div className="card-header-row">
                        <span className="user-messages-card-name">{name}</span>
                        {time && <span className="user-messages-card-time">{time}</span>}
                      </div>
                      <p className="user-messages-card-preview">{preview}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Right: message box (Main Area) */}
      <main className="user-messages-main">
        {!selectedConversation ? (
          <div className="user-messages-placeholder msg-fade-in">
            <div className="placeholder-content">
              <FontAwesomeIcon icon={faComments} className="user-messages-placeholder-icon" />
              <h1 className="user-messages-placeholder-title">Your Inbox</h1>
              <p className="user-messages-placeholder-desc">
                Select a message from the sidebar to view your conversation or start a new support request.
              </p>
              <button 
                className="user-messages-start-chat-btn"
                onClick={() => setSelectedConversation(ADMIN_ID)}
                style={{ marginTop: '30px' }}
              >
                Send a New Message
              </button>
            </div>
          </div>
        ) : (
          <div className="user-messages-box">
            <div className="user-messages-box-header">
              <div className="header-info">
                <h2>{selectedConversation === ADMIN_ID ? SUPPORT_NAME : `User #${selectedConversation}`}</h2>
                <span className="status-indicator online">Online</span>
              </div>
              <div className="header-actions">
                {/* Placeholder for future actions like 'End Chat' or 'Attach' */}
              </div>
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
