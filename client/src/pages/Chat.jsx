import { useState, useEffect, useRef, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import socket from "../services/socketService";
import API_BASE_URL from "../config/api";
import { Send, MessageSquare } from "lucide-react";
import "./Chat.css";

export default function Chat() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRoomId = searchParams.get("room");
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE_URL}/api/chat/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setLoadingRooms(false);
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setLoadingRooms(false);
      });
  }, [token]);

  useEffect(() => {
    if (!token || !activeRoomId) return;

    setRooms((prevRooms) =>
      prevRooms.map((r) =>
        r._id === activeRoomId ? { ...r, unreadCount: 0 } : r
      )
    );

    setLoadingMessages(true);
    fetch(`${API_BASE_URL}/api/chat/rooms/${activeRoomId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        setLoadingMessages(false);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setLoadingMessages(false);
      });

    fetch(`${API_BASE_URL}/api/chat/rooms/${activeRoomId}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        window.dispatchEvent(new CustomEvent("unread_count_change"));
      })
      .catch((err) => console.error("Error marking messages as read:", err));

    socket.connect();
    socket.emit("join_room", activeRoomId);

    const handleReceiveMessage = (message) => {
      // Append if message belongs to active room
      if (message.chatRoom === activeRoomId) {
        setMessages((prev) => [...prev, message]);

        fetch(`${API_BASE_URL}/api/chat/rooms/${activeRoomId}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(() => {
            window.dispatchEvent(new CustomEvent("unread_count_change"));
          })
          .catch((err) => console.error("Error marking incoming message as read:", err));
      } else {
        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            r._id === message.chatRoom
              ? { ...r, unreadCount: (r.unreadCount || 0) + 1 }
              : r
          )
        );
        window.dispatchEvent(new CustomEvent("unread_count_change"));
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.disconnect();
    };
  }, [activeRoomId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoomId || !user) return;

    const messageData = {
      chatRoomId: activeRoomId,
      senderId: user._id || user.id,
      text: newMessage.trim(),
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  const getOtherParticipant = (room) => {
    if (!user || !room.participants) return null;
    const currentUserId = user._id || user.id;
    return room.participants.find((p) => p._id !== currentUserId);
  };

  return (
    <>
      <Navbar />
      <div className="chatPage">
        <div className="chatContainer">
          <div className="chatSidebar">
            <div className="sidebarHeader">
              <h2>Messages</h2>
            </div>
            <div className="roomsList">
              {loadingRooms ? (
                <div className="chatLoader">Loading chats...</div>
              ) : rooms.length === 0 ? (
                <div className="noRooms">
                  <MessageSquare className="noRoomsIcon" />
                  <p>No active conversations</p>
                </div>
              ) : (
                rooms.map((room) => {
                  const other = getOtherParticipant(room);
                  if (!other) return null;
                  const isActive = room._id === activeRoomId;

                  return (
                    <div
                      key={room._id}
                      className={`roomItem ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setSearchParams({ room: room._id });
                        setRooms((prevRooms) =>
                          prevRooms.map((r) =>
                            r._id === room._id ? { ...r, unreadCount: 0 } : r
                          )
                        );
                        window.dispatchEvent(new CustomEvent("unread_count_change"));
                      }}
                    >
                      <div className="roomAvatar">
                        {other.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="roomDetails">
                        <span className="roomName">{other.name}</span>
                        <span className="roomEmail">{other.email}</span>
                      </div>
                      {room.unreadCount > 0 && !isActive && (
                        <div className="roomUnreadBadge">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="chatWorkspace">
            {activeRoomId ? (
              <>
                <div className="workspaceHeader">
                  {rooms.map((room) => {
                    if (room._id !== activeRoomId) return null;
                    const other = getOtherParticipant(room);
                    if (!other) return null;
                    return (
                      <div key={room._id} className="activeRoomInfo">
                        <div className="roomAvatar">
                          {other.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3>{other.name}</h3>
                          <p>{other.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="messagesBox">
                  {loadingMessages ? (
                    <div className="chatLoader">Loading messages...</div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const isOwn = (msg.sender?._id || msg.sender) === (user?._id || user?.id);
                        return (
                          <div
                            key={msg._id}
                            className={`messageWrapper ${isOwn ? "own" : "other"}`}
                          >
                            {!isOwn && (
                              <div className="messageAvatar">
                                {msg.sender?.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="messageBubble">
                              <p className="messageText">{msg.text}</p>
                              <span className="messageTime">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="messageInputForm">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="sendBtn" disabled={!newMessage.trim()}>
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div className="emptyWorkspace">
                <MessageSquare size={64} className="emptyIcon" />
                <h2>Your Conversations</h2>
                <p>Select a contact from the sidebar to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
