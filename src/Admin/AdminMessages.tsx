import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faUser } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import { getConversations, getMessages, getUserById, markMessagesAsRead, type Message, type Conversation } from "../services/messageService";
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

    // Mark messages as read when opening conversation
    markMessagesAsRead(selectedUserId).catch(err => console.error("Error marking messages as read:", err));

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

      // Also mark as read if it's currently open
      markMessagesAsRead(selectedUserId).catch(err => console.error("Error marking incoming message as read:", err));
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
      <div className="admin-messages-container msg-fade-in">
        <div className="admin-messages-page">
          {/* Left: Sidebar (Conversations) */}
          <aside className="admin-messages-sidebar">
            <div className="admin-messages-sidebar-header">
              <h2 className="admin-messages-sidebar-title">
                <FontAwesomeIcon icon={faComments} />
                <span>Customer Support</span>
              </h2>
              <p className="admin-messages-sidebar-subtitle">Manage customer inquiries</p>
            </div>
            
            <div className="admin-messages-conversation-list msg-scrollbar">
              {error && !selectedUserId && <div className="admin-messages-error">{error}</div>}
              
              {loadingConversations ? (
                <div className="admin-messages-loading">
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <p>Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="admin-messages-empty-state msg-fade-in">
                  <p>No customer messages yet. When customers contact you, they will appear here.</p>
                </div>
              ) : (
                conversations.map((c, index) => {
                  const preview = c.lastMessage?.content
                    ? c.lastMessage.content.slice(0, 50) + (c.lastMessage.content.length > 50 ? "…" : "")
                    : "No messages yet";
                  const time = c.lastMessage?.createdAt
                    ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "";
                  const isFromUser = c.lastMessage?.senderId !== ADMIN_ID;
                  const isSelected = selectedUserId === c.userId;
                  
                  return (
                    <button
                      key={c.userId}
                      type="button"
                      className={`admin-messages-conversation-card ${isSelected ? "active" : ""} ${isFromUser && !isSelected ? "has-new-message" : ""} msg-slide-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => setSelectedUserId(c.userId)}
                    >
                      <div className="admin-messages-card-avatar">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                      <div className="admin-messages-card-body">
                        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="admin-messages-card-name">{c.userName || `User #${c.userId}`}</span>
                          {time && <span className="admin-messages-card-time">{time}</span>}
                        </div>
                        {c.userEmail && <span className="admin-messages-card-email">{c.userEmail}</span>}
                        <p className="admin-messages-card-preview">{preview}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right: Chat Main Area */}
          <main className="admin-messages-main">
            {!selectedUserId ? (
              <div className="admin-messages-placeholder msg-fade-in">
                <div className="admin-messages-placeholder-icon">
                  <FontAwesomeIcon icon={faComments} />
                </div>
                <h1 className="admin-messages-placeholder-title">Support Dashboard</h1>
                <p className="admin-messages-placeholder-desc">
                  Choose a customer from the sidebar to view their message history and reply.
                </p>
              </div>
            ) : (
              <div className="admin-messages-box msg-fade-in">
                <div className="admin-messages-box-header">
                  <div className="user-info">
                    <h2>{getUserName(selectedUserId)}</h2>
                    {getUserEmail(selectedUserId) && (
                      <span className="admin-messages-user-email">{getUserEmail(selectedUserId)}</span>
                    )}
                  </div>
                  <div className="header-actions">
                    <span className="status-badge">Active Session</span>
                  </div>
                </div>

                <div className="admin-messages-chat-messages msg-scrollbar">
                  {error && <div className="admin-messages-error">{error}</div>}
                  {loadingMessages && <div className="admin-messages-loading">Loading message history...</div>}
                  
                  {!loadingMessages && messages.length === 0 && (
                    <div className="admin-messages-empty">
                      <p>Start the conversation with {getUserName(selectedUserId)}</p>
                    </div>
                  )}

                  {messages.map((m, index) => (
                    <div
                      key={m._id}
                      className={`admin-messages-bubble ${m.senderId === ADMIN_ID ? "me" : "them"} msg-fade-in`}
                      style={{ animationDelay: `${index * 0.02}s` }}
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
                    placeholder={`Reply to ${getUserName(selectedUserId)}...`}
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
                    Send Reply
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
