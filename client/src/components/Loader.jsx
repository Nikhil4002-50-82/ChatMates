import React from "react";
import { GiChatBubble } from "react-icons/gi";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-custom1 relative overflow-hidden font-custom">
      {/* Background Pulse Effect */}
      <div className="absolute inset-0 bg-custom1 opacity-30 animate-background-pulse"></div>
      <div className="relative w-24 h-24 sm:w-32 sm:h-32">
        {/* Orbiting Chat Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <GiChatBubble className="text-white text-4xl sm:text-5xl animate-orbit scale-100" />
        </div>
        {/* Spinning Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <h1 className="mt-6 text-white text-3xl md:text-5xl font-semibold animate-pulse">
        ChatMates
      </h1>
      <p className="mt-2 text-white text-xl opacity-75">
        Connecting you to your conversations...
      </p>
    </div>
  );
};

export default Loader;
