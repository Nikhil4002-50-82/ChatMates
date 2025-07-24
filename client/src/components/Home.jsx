import React, { useState, useRef, useEffect } from "react";
import Header from "./Header";
import ChatMessage from "./ChatMessage";
import UserList from "./UserList";

import { FaUserTie } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { BsMicFill } from "react-icons/bs";
import { IoIosSend } from "react-icons/io";
import { RiMenuSearchFill } from "react-icons/ri";
import { GiLouvrePyramid } from "react-icons/gi";

const Home = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const minWidth = 250;
  const maxWidth = 400;
  const isDragging = useRef(false);

  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);

  const users = [
    { id: 1, name: "John Doe", lastMessage: "Hey, how's it going?" },
    { id: 2, name: "Jane Smith", lastMessage: "Let's meet tomorrow!" },
    { id: 3, name: "Alex Johnson", lastMessage: "See you at the event!" },
    { id: 4, name: "John Doe", lastMessage: "Hey, how's it going?" },
    { id: 5, name: "Jane Smith", lastMessage: "Let's meet tomorrow!" },
    { id: 6, name: "Alex Johnson", lastMessage: "See you at the event!" },
    { id: 7, name: "John Doe", lastMessage: "Hey, how's it going?" },
    { id: 8, name: "Jane Smith", lastMessage: "Let's meet tomorrow!" },
    { id: 9, name: "Alex Johnson", lastMessage: "See you at the event!" },
    { id: 10, name: "John Doe", lastMessage: "Hey, how's it going?" },
    { id: 12, name: "Jane Smith", lastMessage: "Let's meet tomorrow!" },
    { id: 13, name: "Alex Johnson", lastMessage: "See you at the event!" },
  ];

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      const newWidth = e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        (!menuButtonRef.current ||
          !menuButtonRef.current.contains(event.target))
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <div
      className="bg-[#f0f2f5] min-h-screen"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Header />
      <div className="w-full h-[calc(100vh-80px)] flex flex-col sm:flex-row">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`bg-white border-r border-[#e0e0e0] fixed sm:static top-0 left-0 h-full sm:h-auto transition-transform duration-300 ease-in-out z-50 ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full sm:translate-x-0"
          }`}
          style={{
            width: `${sidebarWidth}px`,
            minWidth: "250px",
            maxWidth: "400px",
          }}
        >
          <div className="bg-white border-b border-[#e0e0e0] px-4 sm:px-6 py-3 sm:py-4 flex items-center">
            <FaUserTie className="text-2xl sm:text-3xl mr-2" />
            <p className="text-xl sm:text-2xl">Nikhil R Nambiar</p>
          </div>
          <div className="border-b border-[#e0e0e0] px-3 py-2">
            <input
              type="text"
              className="w-full bg-[#f0f2f5] border border-[#ddd] focus:outline-none px-3 py-2 text-base sm:text-xl rounded-lg"
              placeholder="Search for people..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="h-[calc(100vh-140px)] sm:h-[75%]">
            <div className="overflow-y-auto scrollbar-hide h-full">
              {searchQuery ? (
                <div className="flex items-center px-3 sm:px-5 py-3 cursor-pointer hover:bg-[#f5f5f5]">
                  <FaUserTie className="text-3xl sm:text-4xl mr-3 sm:mr-4" />
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg">New User</h3>
                    <p className="text-xs sm:text-sm text-[#666]">Online</p>
                  </div>
                  <button className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-[#0066cc]">
                    Start Chat
                  </button>
                </div>
              ) : (
                <UserList users={users} />
              )}
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="hidden sm:block w-1 bg-[#e0e0e0] cursor-col-resize hover:bg-blue-600 transition-colors"
          onMouseDown={handleMouseDown}
        ></div>

        {/* Chat Area */}
        <div className="flex flex-col flex-1">
          <div className="bg-white border-b border-[#e0e0e0] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                ref={menuButtonRef}
                className="sm:hidden mr-2 text-2xl"
                onClick={toggleSidebar}
              >
                <RiMenuSearchFill className="text-4xl mr-1" />
              </button>
              <FaUserTie className="text-2xl sm:text-3xl mr-2" />
              <p className="text-xl sm:text-2xl">Abhilash</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <IoCall className="text-2xl sm:text-3xl cursor-pointer" />
            </div>
          </div>
          {/* <div className="flex-1 p-3 sm:p-5 overflow-y-auto scrollbar-hide bg-[#f0f2f5]">
            <ChatMessage
              message="Hey, how's it going?"
              isSender={false}
              time="10:30 AM"
            />
            <ChatMessage
              message=""
              isSender={true}
              time="10:31 AM"
              isAudio={true}
            />
            <ChatMessage
              message="Pretty good, thanks! How about you?"
              isSender={true}
              time="10:32 AM"
            />
            <ChatMessage
              message=""
              isSender={false}
              time="10:33 AM"
              isAudio={true}
            />
            <ChatMessage
              message="Doing great! Want to grab coffee later?"
              isSender={false}
              time="10:35 AM"
            />
            <ChatMessage
              message="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit tenetur quidem quos iure consectetur sunt molestiae quam illo, voluptatum, cum in beatae quae. Ipsam cum magni quibusdam aperiam enim sapiente?"
              isSender={true}
              time="10:50 AM"
            />
            <ChatMessage
              message="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit tenetur quidem quos iure consectetur sunt molestiae quam illo, voluptatum, cum in beatae quae. Ipsam cum magni quibusdam aperiam enim sapiente?"
              isSender={true}
              time="11:50 AM"
            />
          </div>
          <div className="bg-white border-t border-[#e0e0e0] p-3 sm:p-5 flex items-center">
            <input
              type="text"
              className="flex-1 bg-[#f0f2f5] border border-[#ddd] focus:outline-none px-3 py-2 text-sm sm:text-base rounded-2xl"
              placeholder="Type a message..."
            />
            <button
              className={
                isRecording
                  ? "text-red-600 text-lg sm:text-xl ml-2 animate-pulse"
                  : "text-lg sm:text-xl ml-2"
              }
              onClick={toggleRecording}
            >
              <BsMicFill />
            </button>
            <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-2xl ml-2 hover:bg-[#0066cc] flex items-center justify-center">
              <IoIosSend className="text-xl sm:text-2xl" />
            </button>
          </div> */}
          {/* Chat Content Area */}
          <div className="flex h-[84vh] md:h-[77vh] flex-col bg-[#f0f2f5]">
            {/* Scrollable Messages */}
            <div className=" overflow-y-auto scrollbar-hide px-3 sm:px-5 py-3 sm:py-5">
              <ChatMessage
                message="Hey, how's it going?"
                isSender={false}
                time="10:30 AM"
              />
              <ChatMessage
                message=""
                isSender={true}
                time="10:31 AM"
                isAudio={true}
              />
              <ChatMessage
                message="Pretty good, thanks! How about you?"
                isSender={true}
                time="10:32 AM"
              />
              <ChatMessage
                message=""
                isSender={false}
                time="10:33 AM"
                isAudio={true}
              />
              <ChatMessage
                message="Doing great! Want to grab coffee later?"
                isSender={false}
                time="10:35 AM"
              />
              <ChatMessage
                message="Lorem ipsum dolor sit amet..."
                isSender={true}
                time="10:50 AM"
              />
              <ChatMessage
                message="Another long message..."
                isSender={true}
                time="11:50 AM"
              />
              <ChatMessage
                message="Doing great! Want to grab coffee later?"
                isSender={false}
                time="10:35 AM"
              />
              <ChatMessage
                message="Lorem ipsum dolor sit amet..."
                isSender={true}
                time="10:50 AM"
              />
              <ChatMessage
                message="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae, inventore asperiores harum amet esse deserunt quam culpa! Placeat maiores aperiam modi error nisi atque ea. Placeat vel iste molestiae aspernatur!"
                isSender={true}
                time="11:50 AM"
              />
              <ChatMessage
                message="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae, inventore asperiores harum amet esse deserunt quam culpa! Placeat maiores aperiam modi error nisi atque ea. Placeat vel iste molestiae aspernatur!"
                isSender={false}
                time="11:51 AM"
              />
            </div>

            {/* Fixed Input Bar */}
            <div className="bg-white border-t border-[#e0e0e0] p-3 sm:p-5 flex items-center bottom-0">
              <input
                type="text"
                className="flex-1 bg-[#f0f2f5] border border-[#ddd] focus:outline-none px-3 py-2 text-sm sm:text-base rounded-2xl"
                placeholder="Type a message..."
              />
              <button
                className={
                  isRecording
                    ? "text-red-600 text-lg sm:text-xl ml-2 animate-pulse"
                    : "text-lg sm:text-xl ml-2"
                }
                onClick={toggleRecording}
              >
                <BsMicFill />
              </button>
              <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-2xl ml-2 hover:bg-[#0066cc] flex items-center justify-center">
                <IoIosSend className="text-xl sm:text-2xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
