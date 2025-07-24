import React from "react";
import { GiChatBubble } from "react-icons/gi";

const Header = () => {
  return (
    <div className="w-full flex items-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-blue-500">
      <div className="flex items-center">
        <span>
          <GiChatBubble className="text-white font-semibold text-5xl" />
        </span>
        <h1 className="text-white font-semibold text-5xl ml-2 sm:ml-3 md:ml-4">My-Chat</h1>
      </div>
    </div>
  );
};

export default Header;