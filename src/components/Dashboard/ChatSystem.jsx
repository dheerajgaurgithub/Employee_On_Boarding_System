import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MessageCircle, Send, User, Circle } from 'lucide-react';
import Message from './Message';
import io from 'socket.io-client';

const socket = io("https://employee-on-boarding-system.onrender.com/");

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
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl h-96 flex relative border border-slate-200 overflow-hidden">
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-full transition-all duration-200 hover:scale-110 shadow-md"
        >
          ×
        </button>
      )}
      
      {/* Chat List */}
      <div className="w-1/3 border-r border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="p-5 border-b border-slate-300 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h3 className="text-lg font-bold text-white flex items-center">
            <div className="w-2 h-6 bg-white rounded-full mr-3 opacity-80"></div>
            {chatRole === "admin" ? "HR Members" : "Employees"}
          </h3>
        </div>
        <div className="overflow-y-auto h-80 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {chatTargets.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <div className="p-4 bg-slate-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-medium">No {chatRole === "admin" ? "HR members" : "employees"} to chat with</p>
            </div>
          ) : (
            chatTargets.map((target) => (
              <button
                key={target._id}
                onClick={() => setSelectedChat(target)}
                className={`w-full p-4 text-left hover:bg-blue-50 border-b border-slate-200 transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                  selectedChat?._id === target._id ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-md' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={target.profilePicture}
                      alt={target.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      target.isOnline ? 'bg-green-400' : 'bg-slate-400'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{target.name}</div>
                    <div className="flex items-center space-x-2">
                      <Circle
                        className={`w-2 h-2 ${
                          target.isOnline ? 'text-green-500 fill-current' : 'text-slate-400'
                        }`}
                      />
                      <span className={`text-xs font-medium ${
                        target.isOnline ? 'text-green-600' : 'text-slate-500'
                      }`}>
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
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={selectedChat.profilePicture}
                    alt={selectedChat.name}
                    className="w-12 h-12 rounded-full border-3 border-blue-200 shadow-md"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    selectedChat.isOnline ? 'bg-green-400' : 'bg-slate-400'
                  }`}></div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-lg">{selectedChat.name}</div>
                  <div className="flex items-center space-x-2">
                    <Circle
                      className={`w-2 h-2 ${
                        selectedChat.isOnline ? 'text-green-500 fill-current' : 'text-slate-400'
                      }`}
                    />
                    <span className={`text-sm font-medium ${
                      selectedChat.isOnline ? 'text-green-600' : 'text-slate-500'
                    }`}>
                      {selectedChat.isOnline ? 'Online now' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/30 to-blue-50/30 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-md">
                    <MessageCircle className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium text-slate-600">No messages yet</p>
                  <p className="text-sm text-slate-500 mt-1">Start the conversation!</p>
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
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-gradient-to-r from-white to-slate-50">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md placeholder-slate-400"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center">
              <div className="p-6 bg-slate-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <MessageCircle className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Chat?</h3>
              <p className="text-slate-500 text-lg">Select a user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;
