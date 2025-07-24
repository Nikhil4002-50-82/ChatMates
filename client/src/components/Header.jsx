import React from "react";
import { GiChatBubble } from "react-icons/gi";

const Header = () => {
  return (
    <div className="w-full flex items-center px-6 py-5 bg-blue-500">
      <div className="flex items-center">
        <span>
          <GiChatBubble className="text-white font-semibold text-4xl" />
        </span>
        <h1 className="text-white font-semibold text-5xl">My-Chat</h1>
      </div>
    </div>
  );
};

export default Header;
