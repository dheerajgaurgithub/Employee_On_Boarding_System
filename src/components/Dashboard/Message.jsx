import React from "react";

const Message = ({ message, isOwn }) => {
  return (
    <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex flex-col max-w-xs rounded-lg shadow-md p-3 mb-2 ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-800 text-white rounded-bl-none"
        }`}
      >
        <span className="text-sm break-words">{message.content}</span>

        <div className="mt-2 flex items-center space-x-2">
          <span className={`text-xs ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
            {message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
          {isOwn && message.read && (
            <span className="text-xs text-green-400 font-semibold">Seen</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
