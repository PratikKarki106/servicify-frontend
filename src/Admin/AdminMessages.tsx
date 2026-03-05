import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faUser } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import { getConversations, getMessages, getUserById, type Message, type Conversation } from "../services/messageService";
import { websocketService } from "../services/websocketService";
import "./AdminMessages.css";

const ADMIN_ID = "admin";
const ADMIN_NAME = "Admin Support";

// Extend the Conversation type to include user name
interface ExtendedConversation extends Conversation {
  userName?: string;
  userEmail?: string;
}

const AdminMessages: React.FC = () => {
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userCache, setUserCache] = useState<Record<string, string>>({});

  // Load conversations and user names
  useEffect(() => {
    let mounted = true;
    setError(null);
    const load = async () => {
      try {
        const res = await getConversations();
        console.log('📬 Conversations response:', res); // Debug log
        if (mounted && res.success) {
          // Process conversations - backend now returns userName and userEmail
          const processedConversations = (res.conversations || []).map(conv => ({
            ...conv,
            userName: conv.userName || `User #${conv.userId}`,
            userEmail: conv.userEmail || undefined
          }));
          console.log('📋 Processed conversations:', processedConversations); // Debug log

          setConversations(processedConversations);
          // Cache user names
          const cache: Record<string, string> = {};
          processedConversations.forEach(conv => {
            cache[conv.userId] = conv.userName || `User #${conv.userId}`;
          });
          setUserCache(cache);
        }
      } catch (e: unknown) {
        if (mounted) setError((e as Error)?.message || "Failed to load conversations");
      } finally {
        if (mounted) setLoadingConversations(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Removed auto-select - user manually selects conversation

  useEffect(() => {
    console.log("Connecting to websocket for admin");
    websocketService.connectForAdmin();
    return () => {
      console.log("Disconnecting websocket");
      websocketService.offNewMessage();
    };
  }, []);

  useEffect(() => {
    // Reset messages when changing selection
    setMessages([]);

    if (!selectedUserId) {
      return;
    }

    console.log("Loading messages for user:", selectedUserId); // Debug log

    let mounted = true;
    setLoadingMessages(true);
    setError(null);

    // Load messages for the selected user
    getMessages(selectedUserId)
      .then((res) => {
        console.log("Messages response:", res); // Debug log
        if (mounted && res.success) {
          setMessages(res.messages || []);
        } else {
          console.log("Failed to load messages:", res); // Debug log
        }
      })
      .catch((e) => {
        console.error("Error loading messages:", e); // Debug log
        if (mounted) setError((e as Error)?.message || "Failed to load messages");
      })
      .finally(() => {
        if (mounted) setLoadingMessages(false);
      });

    // Set up WebSocket listener for new messages
    const onNew = (msg: { _id: string; senderId: string; senderRole: string; receiverId: string; content: string; createdAt?: string }) => {
      const isForThisChat =
        (msg.senderId === selectedUserId && msg.receiverId === ADMIN_ID) ||
        (msg.receiverId === selectedUserId && msg.senderId === ADMIN_ID);
      if (!isForThisChat) return;
      
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        const newMsg: Message = {
          _id: msg._id,
          senderId: msg.senderId,
          senderRole: msg.senderRole as "user" | "admin",
          receiverId: msg.receiverId,
          receiverRole: msg.receiverId === ADMIN_ID ? "admin" : "user",
          content: msg.content,
          createdAt: msg.createdAt || new Date().toISOString(),
        };
        return [...prev, newMsg];
      });
    };
    
    websocketService.onNewMessage(onNew);
    
    // Clean up WebSocket listener when component unmounts or selectedUserId changes
    return () => {
      console.log("Cleaning up for user:", selectedUserId); // Debug log
      mounted = false;
      websocketService.offNewMessage();
    };
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || sending || !selectedUserId) return;
    setSending(true);
    setInput("");
    try {
      websocketService.sendChatMessage(ADMIN_ID, "admin", selectedUserId, text);
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

  // Helper function to get user name
  const getUserName = (userId: string) => {
    const conv = conversations.find(c => c.userId === userId);
    return conv?.userName || `User #${userId}`;
  };

  // Helper function to get user email
  const getUserEmail = (userId: string) => {
    const conv = conversations.find(c => c.userId === userId);
    return conv?.userEmail || null;
  };

  return (
    <>
      <Sidebar />
      <div className="admin-main-container admin-messages-container">
        <div className="admin-messages-page">
          {/* Left: conversation overview (20%) - Shows users who messaged admin */}
          <aside className="admin-messages-sidebar">
            <div className="admin-messages-sidebar-header">
              <h2 className="admin-messages-sidebar-title">
                <FontAwesomeIcon icon={faComments} />
                <span>Messages</span>
              </h2>
              <p className="admin-messages-sidebar-subtitle">Select a conversation to start chatting</p>
            </div>
            {error && !selectedUserId && <div className="admin-messages-error">{error}</div>}
            {loadingConversations ? (
              <div className="admin-messages-loading">Loading conversations…</div>
            ) : conversations.length === 0 ? (
              <div className="admin-messages-empty-state">No customer messages yet. When customers contact you, they will appear here.</div>
            ) : (
              <div className="admin-messages-conversation-list">
                {conversations.map((c) => {
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
                  const isFromUser = c.lastMessage?.senderId !== ADMIN_ID;
                  const isSelected = selectedUserId === c.userId;
                  
                  return (
                    <button
                      key={c.userId}
                      type="button"
                      className={`admin-messages-conversation-card ${isSelected ? "active" : ""} ${isFromUser && !isSelected ? "has-new-message" : ""}`}
                      onClick={() => {
                        console.log("Clicked on user:", c.userId);
                        setSelectedUserId(c.userId);
                      }}
                    >
                      <div className="admin-messages-card-avatar">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                      <div className="admin-messages-card-body">
                        <div className="admin-messages-card-header">
                          <span className="admin-messages-card-name">{c.userName || `User #${c.userId}`}</span>
                        </div>
                        {c.userEmail && <span className="admin-messages-card-email">{c.userEmail}</span>}
                        <p className="admin-messages-card-preview">{preview}</p>
                        {time && <span className="admin-messages-card-time">{time}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>
          {/* Right: message box (80%) - Shows conversation with selected user */}
          <main className="admin-messages-main">
            {!selectedUserId ? (
              <div className="admin-messages-placeholder">
                <div className="admin-messages-placeholder-icon">
                  <FontAwesomeIcon icon={faComments} />
                </div>
                <p className="admin-messages-placeholder-title">Select a conversation</p>
                <p className="admin-messages-placeholder-desc">Choose a customer from the left to view and send messages.</p>
              </div>
            ) : (
              <div className="admin-messages-box">
                <div className="admin-messages-box-header">
                  <h2>{getUserName(selectedUserId)}</h2>
                  {getUserEmail(selectedUserId) && (
                    <span className="admin-messages-user-email">{getUserEmail(selectedUserId)}</span>
                  )}
                </div>
                {error && <div className="admin-messages-error">{error}</div>}
                <div className="admin-messages-chat-messages">
                  {loadingMessages && <div className="admin-messages-loading">Loading messages…</div>}
                  {!loadingMessages && messages.length === 0 && (
                    <div className="admin-messages-empty">No messages yet.</div>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m._id}
                      className={`admin-messages-bubble ${m.senderId === ADMIN_ID ? "me" : "them"}`}
                    >
                      <div className="admin-messages-bubble-content">{m.content}</div>
                      <div className="admin-messages-bubble-time">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="admin-messages-chat-input-wrap">
                  <textarea
                    className="admin-messages-chat-input"
                    placeholder="Type your message to customer…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={sending}
                  />
                  <button
                    type="button"
                    className="admin-messages-chat-send"
                    onClick={handleSend}
                    disabled={sending || !input.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminMessages;
