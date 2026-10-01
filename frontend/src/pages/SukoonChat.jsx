import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import "./SukoonChat.css";

function SukoonChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // --------------------------------------------------
  // Initial load
  // --------------------------------------------------

  useEffect(() => {
    loadConversations();
  }, []);

  // --------------------------------------------------
  // Scroll to latest message
  // --------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  // --------------------------------------------------
  // Load conversation list
  // --------------------------------------------------

  const loadConversations = async () => {
    try {
      setLoadingHistory(true);

      const response = await apiFetch("/api/chat/conversations");

      if (!response || !response.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await response.json();

      const conversationList = data.conversations || [];

      setConversations(conversationList);

      // Open most recent conversation
      if (conversationList.length > 0) {
        const latestConversation = conversationList[0];

        setConversationId(latestConversation._id);

        await loadChatHistory(latestConversation._id);
      } else {
        setConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Conversation loading error:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // --------------------------------------------------
  // Load one conversation
  // --------------------------------------------------

  const loadChatHistory = async (selectedConversationId) => {
    try {
      setLoadingHistory(true);

      const response = await apiFetch(
        `/api/chat?conversationId=${selectedConversationId}`,
      );

      if (!response || !response.ok) {
        throw new Error("Failed to load chat history");
      }

      const data = await response.json();

      setMessages(data.messages || []);
    } catch (error) {
      console.error("Chat history error:", error);

      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // --------------------------------------------------
  // Select a conversation
  // --------------------------------------------------

  const selectConversation = async (selectedConversationId) => {
    if (selectedConversationId === conversationId || sending) {
      return;
    }

    setConversationId(selectedConversationId);

    await loadChatHistory(selectedConversationId);
  };

  // --------------------------------------------------
  // Start a new conversation
  // --------------------------------------------------

  const startNewConversation = () => {
    if (sending) {
      return;
    }

    setConversationId(null);
    setMessages([]);
    setInput("");
  };

  // --------------------------------------------------
  // Send message
  // --------------------------------------------------

  const sendMessage = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    const userMessage = {
      role: "user",
      message: trimmedMessage,
    };

    setMessages((previous) => [...previous, userMessage]);

    setInput("");
    setSending(true);

    try {
      const requestBody = {
        message: trimmedMessage,
      };

      if (conversationId) {
        requestBody.conversationId = conversationId;
      }

      const response = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (!response || !response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Backend creates a conversation when
      // conversationId was not provided.
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          message: data.reply,
        },
      ]);

      // Refresh conversation list so the new
      // conversation/title appears immediately.
      await refreshConversations();
    } catch (error) {
      console.error("Chat message error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          message:
            "I'm having a little trouble responding right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // --------------------------------------------------
  // Refresh conversation list
  // --------------------------------------------------

  const refreshConversations = async () => {
    try {
      const response = await apiFetch("/api/chat/conversations");

      if (!response || !response.ok) {
        return;
      }

      const data = await response.json();

      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Conversation refresh error:", error);
    }
  };

  // --------------------------------------------------
  // Enter key
  // --------------------------------------------------

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // --------------------------------------------------
  // Format conversation title
  // --------------------------------------------------

  const getConversationTitle = (conversation) => {
    if (conversation.title && conversation.title !== "New conversation") {
      return conversation.title;
    }

    return "New conversation";
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="sukoon-chat-page">
      <div className="sukoon-chat-layout">
        {/* ================= SIDEBAR ================= */}

        <aside className="sukoon-chat-sidebar">
          <div className="sukoon-sidebar-header">
            <div className="sukoon-sidebar-brand">
              <div className="sukoon-sidebar-avatar">🌿</div>

              <div>
                <h2>Sukoon</h2>
                <p>Your conversations</p>
              </div>
            </div>

            <button
              type="button"
              className="sukoon-new-chat-button"
              onClick={startNewConversation}
              disabled={sending}
            >
              <span>＋</span>
              New chat
            </button>
          </div>

          <div className="sukoon-conversation-list">
            {conversations.length === 0 ? (
              <div className="sukoon-no-conversations">
                <span>🌱</span>
                <p>Your conversations will appear here.</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  type="button"
                  className={`sukoon-conversation-item ${
                    conversation._id === conversationId ? "active" : ""
                  }`}
                  onClick={() => selectConversation(conversation._id)}
                  disabled={sending}
                >
                  <span className="sukoon-conversation-icon">💬</span>

                  <span className="sukoon-conversation-title">
                    {getConversationTitle(conversation)}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ================= CHAT ================= */}

        <section className="sukoon-chat-container">
          {/* Header */}

          <header className="sukoon-chat-header">
            <div className="sukoon-chat-avatar">🌿</div>

            <div>
              <h1>Sukoon</h1>
              <p>Your space to talk, reflect and breathe.</p>
            </div>
          </header>

          {/* Messages */}

          <main className="sukoon-chat-messages">
            {loadingHistory ? (
              <div className="sukoon-chat-loading">
                <span>🌿</span>
                <p>Preparing your space...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="sukoon-chat-welcome">
                <div className="sukoon-welcome-icon">🌿</div>

                <h2>Hi, I'm Sukoon.</h2>

                <p>
                  This is a quiet space where you can talk about whatever is on
                  your mind.
                </p>

                <p>
                  You don't have to have the right words. Just start wherever
                  feels comfortable.
                </p>
              </div>
            ) : (
              messages.map((item, index) => (
                <div
                  key={`${item.createdAt || "message"}-${index}`}
                  className={`sukoon-message-row ${
                    item.role === "user"
                      ? "sukoon-message-user"
                      : "sukoon-message-assistant"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="sukoon-message-avatar">🌿</div>
                  )}

                  <div className="sukoon-message-bubble">{item.message}</div>
                </div>
              ))
            )}

            {sending && (
              <div className="sukoon-message-row sukoon-message-assistant">
                <div className="sukoon-message-avatar">🌿</div>

                <div className="sukoon-message-bubble sukoon-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Input */}

          <div className="sukoon-chat-input-area">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write what's on your mind..."
              rows={1}
              disabled={sending}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>

          <p className="sukoon-chat-note">
            Sukoon is a wellbeing companion, not a replacement for professional
            care.
          </p>
        </section>
      </div>
    </div>
  );
}

export default SukoonChat;
