import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MessageCircle, Send, User, Circle } from 'lucide-react';

const ChatSystem = () => {
  const { currentUser, getUsersByRole, getUserById } = useAuth();
  const { addMessage, getMessagesBetweenUsers } = useData();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');

  const employees = getUsersByRole('employee').filter(emp => emp.createdBy === currentUser.id);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat) return;

    addMessage({
      senderId: currentUser.id,
      receiverId: selectedChat.id,
      content: messageText,
      type: 'text'
    });

    setMessageText('');
  };

  const messages = selectedChat ? getMessagesBetweenUsers(currentUser.id, selectedChat.id) : [];

  return (
    <div className="bg-white rounded-lg shadow h-96 flex">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Employees</h3>
        </div>
        <div className="overflow-y-auto h-80">
          {employees.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2" />
              <p>No employees to chat with</p>
            </div>
          ) : (
            employees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => setSelectedChat(employee)}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                  selectedChat?.id === employee.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={employee.profilePicture}
                    alt={employee.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="flex items-center space-x-1">
                      <Circle
                        className={`w-2 h-2 ${
                          employee.isOnline ? 'text-green-500 fill-current' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-xs text-gray-500">
                        {employee.isOnline ? 'Online' : 'Offline'}
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
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.senderId === currentUser.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser.id ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
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
              <p>Select an employee to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;