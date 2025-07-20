import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MessageCircle, Send, User, Circle } from 'lucide-react';
import Message from './Message';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

const ChatSystem = ({ chatRole = "hr", initialTarget = null, onClose }) => {
  const { currentUser, getUsersByRole } = useAuth();
  const { addMessage, getMessagesBetweenUsers, loadMessages, markMessageRead } = useData();
  const [selectedChat, setSelectedChat] = useState(initialTarget);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  // Determine who to chat with
  let chatTargets = [];
  if (chatRole === "admin") {
    chatTargets = getUsersByRole('hr').filter(hr => hr.createdBy === currentUser._id);
  } else if (chatRole === "hr") {
    const admins = getUsersByRole('admin');
    const employees = getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id);
    chatTargets = [...admins, ...employees];
  } else if (chatRole === "employee") {
    chatTargets = getUsersByRole('hr').filter(hr => hr._id === currentUser.createdBy);
  }

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat) return;

    addMessage({
      senderId: currentUser._id,
      receiverId: selectedChat._id,
      content: messageText,
      type: 'text'
    });

    socket.emit("send_message", {
      to: selectedChat._id,
      from: currentUser._id,
      content: messageText,
    });

    setMessageText('');
  };

  // Get messages between users
  const messages = selectedChat ? getMessagesBetweenUsers(currentUser._id, selectedChat._id) : [];

  // Mark unread messages as read
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      messages.forEach((msg) => {
        if (!msg.read && msg.receiverId === currentUser._id) {
          markMessageRead(msg._id);
        }
      });
    }
  }, [selectedChat, messages]);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat._id);
    }
  }, [selectedChat]);

  // Join room
  useEffect(() => {
    if (currentUser) {
      socket.emit("join_room", currentUser._id);
    }
  }, [currentUser]);

  // Listen for messages
  useEffect(() => {
    socket.on("receive_message", () => {
      if (selectedChat?._id) {
        loadMessages(selectedChat._id);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedChat]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="bg-white rounded-lg shadow h-96 flex relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
      )}
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {chatRole === "admin" ? "HR Members" : "Employees"}
          </h3>
        </div>
        <div className="overflow-y-auto h-80">
          {chatTargets.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2" />
              <p>No {chatRole === "admin" ? "HR members" : "employees"} to chat with</p>
            </div>
          ) : (
            chatTargets.map((target) => (
              <button
                key={target._id}
                onClick={() => setSelectedChat(target)}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                  selectedChat?._id === target._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={target.profilePicture}
                    alt={target.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{target.name}</div>
                    <div className="flex items-center space-x-1">
                      <Circle
                        className={`w-2 h-2 ${
                          target.isOnline ? 'text-green-500 fill-current' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-xs text-gray-500">
                        {target.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedChat.profilePicture}
                  alt={selectedChat.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="font-medium text-gray-900">{selectedChat.name}</div>
                  <div className="flex items-center space-x-1">
                    <Circle
                      className={`w-2 h-2 ${
                        selectedChat.isOnline ? 'text-green-500 fill-current' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-xs text-gray-500">
                      {selectedChat.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <Message
                      key={message._id}
                      message={message}
                      isOwn={message.senderId === currentUser._id}
                    />
                  ))}
                  <div ref={messagesEndRef}></div>
                </>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Select a user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;
