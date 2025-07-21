import React from "react";

const Message = ({ message, isOwn }) => {
  return (
    <div className="w-full px-2 sm:px-4 py-1">
      {/* Sender message - Right side */}
      {isOwn && (
        <div className="flex justify-end">
          <div className="flex flex-col max-w-[80%] sm:max-w-sm lg:max-w-md xl:max-w-lg relative bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md shadow-lg">
            <div className="px-3 sm:px-4 py-2 sm:py-3">
              <span className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                {message.content}
              </span>
            </div>
            
            <div className="px-3 sm:px-4 pb-2 sm:pb-3 flex items-end justify-between">
              <span className="text-xs font-medium text-blue-100">
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
              
              <div className="flex items-center ml-1 sm:ml-2">
                {message.read ? (
                  <div className="flex items-center space-x-0.5 sm:space-x-1">
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-green-400 rounded-full"></div>
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-green-400 rounded-full"></div>
                    <span className="text-[10px] sm:text-xs text-green-300 font-medium ml-0.5 sm:ml-1">Read</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-0.5 sm:space-x-1">
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-300 rounded-full"></div>
                    <span className="text-[10px] sm:text-xs text-gray-300 font-medium ml-0.5 sm:ml-1">Sent</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Message tail/pointer */}
            <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 transform rotate-45 translate-x-0.5 sm:translate-x-1 translate-y-0.5 sm:translate-y-1 bg-blue-600"></div>
          </div>
        </div>
      )}
      
      {/* Receiver message - Left side */}
      {!isOwn && (
        <div className="flex justify-start">
          <div className="flex flex-col max-w-[80%] sm:max-w-sm lg:max-w-md xl:max-w-lg relative bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-2xl rounded-bl-md shadow-lg border border-gray-600">
            <div className="px-3 sm:px-4 py-2 sm:py-3">
              <span className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                {message.content}
              </span>
            </div>
            
            <div className="px-3 sm:px-4 pb-2 sm:pb-3 flex items-end justify-start">
              <span className="text-xs font-medium text-gray-300">
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
            
            {/* Message tail/pointer */}
            <div className="absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 transform rotate-45 -translate-x-0.5 sm:-translate-x-1 translate-y-0.5 sm:translate-y-1 bg-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;