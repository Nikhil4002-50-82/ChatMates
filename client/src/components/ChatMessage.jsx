import React from "react";
import { FaPlay } from "react-icons/fa";

const ChatMessage = ({ message, isSender, time, isAudio }) => {
  return (
    <div
      className={`max-w-[60%] mb-3 p-3 rounded-2xl relative flex flex-col h-auto ${
        isSender
          ? "bg-blue-600 text-white ml-auto rounded-br-[5px]"
          : "bg-white rounded-bl-[5px]"
      }`}
    >
      {isAudio ? (
        <div className="flex items-center mb-3">
          <button className="text-xl mr-2"><FaPlay /></button>
          <div className="flex-1 h-1 bg-[#ccc] rounded-full overflow-hidden">
            <div
              className={`w-1/2 h-full ${
                isSender ? "bg-white" : "bg-blue-600"
              }`}
            ></div>
          </div>
          <small
            className={`text-xl ml-2 ${
              isSender ? "text-[#e0e0e0]" : "text-[#666]"
            }`}
          >
            0:20
          </small>
        </div>
      ) : (
        <p className="text-xl mb-3">{message}</p>
      )}
      <small
        className={`text-lg absolute bottom-1 right-2 ${
          isSender ? "text-[#e0e0e0]" : "text-[#aaa]"
        }`}
      >
        {time}
      </small>
    </div>
  );
};

export default ChatMessage;
