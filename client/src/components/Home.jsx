import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import socket from "../socket";
import ChatMessage from "./ChatMessage";
import UserList from "./UserList";
import Header from ".//Header";
import Auth from "./Auth";
import Loader from "./Loader";
import Spinner from "./Spinner";

import { FaUserTie } from "react-icons/fa";
import { IoCall, IoCloudUploadSharp  } from "react-icons/io5";
import { BsMicFill } from "react-icons/bs";
import { IoIosSend } from "react-icons/io";
import { RiMenuSearchFill } from "react-icons/ri";
import { MdAdminPanelSettings } from "react-icons/md";

import { LoggedInContext, userDataContext } from "../context/LoginContext";

const Home = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { loggedIn, setLoggedIn } = useContext(LoggedInContext);
  const { userData, setUserData } = useContext(userDataContext);

  const [messages, setMessages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // instead of single file
  const [messageText, setMessageText] = useState("");
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const minWidth = 250;
  const maxWidth = 400;
  const isDragging = useRef(false);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => {
    if (!loadingChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [loadingChat]);

  const handleSelectChat = async (user) => {
    setLoadingChat(true);
    setSelectedUser(user);
    setActiveChatId(user.chatid);
    try {
      const res = await axios.get(`${API_BASE_URL}/messages/${user.chatid}`, {
        withCredentials: true,
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    } finally {
      toggleSidebar();
      setLoadingChat(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/searchUsers?q=${value}&userid=${userData.userid}`,
        {
          withCredentials: true,
        }
      );
      const allResults = response.data;
      const existingIds = new Set(chatUsers.map((u) => u.userid));
      const filteredResults = allResults.filter(
        (user) => !existingIds.has(user.userid)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleStartChat = async (otherUserId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/startChat`,
        {
          user1: userData.userid,
          user2: otherUserId,
        },
        {
          withCredentials: true,
        }
      );
      const { chatid } = response.data;
      const alreadyPresent = chatUsers.some((u) => u.userid === otherUserId);
      let userToSelect;
      if (!alreadyPresent) {
        const res = await axios.get(`${API_BASE_URL}/getUser/${otherUserId}`, {
          withCredentials: true,
        });
        const newUser = { ...res.data, chatid };
        setChatUsers((prev) => [...prev, newUser]);
        userToSelect = newUser;
      } else {
        userToSelect = chatUsers.find((u) => u.userid === otherUserId);
        if (!userToSelect.chatid) userToSelect.chatid = chatid;
      }
      setSearchQuery("");
      toggleSidebar();
      setSearchResults([]);
      setActiveChatId(chatid);
      setSelectedUser(userToSelect);
    } catch (err) {
      console.error("Error starting chat:", err);
    }
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

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/chattedUsers/${userData.userid}`,
          {
            withCredentials: true,
          }
        );
        const data = response.data;
        setChatUsers(data);
      } catch (err) {
        console.error("Error fetching chat users:", err);
      }
    };
    if (userData?.userid) {
      fetchChatUsers();
    }
  }, [userData]);

  const sendMessage = async () => {
    if (!activeChatId) return;
    if (selectedFiles.length > 0) {
      try {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("chatid", activeChatId);
          formData.append("mediatype", file.type);
          const res = await axios.post(`${API_BASE_URL}/uploadFile`, formData, {
            withCredentials: true,
          });
          toast.success(`Uploaded ${file.name}!`);
        }
      } catch (error) {
        toast.error("One or more file uploads failed");
      }
      setSelectedFiles([]);
      setMessageText("");
      return;
    }
    if (!messageText.trim()) return;
    const newMsg = {
      message: messageText,
      chatid: activeChatId,
      senderid: userData.userid,
    };
    socket.emit("send_message", newMsg);
    setMessageText("");
  };

  useEffect(() => {
    socket.off("receive_message");
    socket.on("receive_message", (msg) => {
      if (msg.chatid === activeChatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      socket.off("receive_message");
    };
  }, [activeChatId]);
  useEffect(() => {
    if (userData?.userid) {
      socket.emit("user-connected", userData.userid);
    }
  }, [userData]);

  if (loggedIn === null) {
    return <Loader />;
  }

  if (!loggedIn) {
    return <Auth />;
  }

  if (!userData || !userData.name) {
    return <Loader />;
  }

  return (
    <div
      className="bg-[#f0f2f5] h-[100dvh] "
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Header />
      <div className="w-full h-[calc(100dvh-80px)] flex flex-col sm:flex-row">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`bg-white border-r border-[#e0e0e0] fixed sm:static  left-0 h-full sm:h-auto transition-transform duration-300 ease-in-out z-50 ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full sm:translate-x-0"
          }`}
          style={{
            width: `${sidebarWidth}px`,
            minWidth: "300px",
            maxWidth: "600px",
          }}
        >
          <div className="flex items-center justify-between bg-white border-b border-[#e0e0e0] px-4 sm:px-6 py-4">
            <div className=" flex items-center">
              <FaUserTie className="text-4xl mr-2" />
              <h2 className="text-xl sm:text-2xl">{userData.name}</h2>
            </div>
            <div><MdAdminPanelSettings className="text-4xl"/></div>
          </div>
          <div className="border-b border-[#e0e0e0] px-3 py-2">
            <input
              type="text"
              className="w-full bg-[#f0f2f5] border border-[#ddd] focus:outline-none px-3 py-2 text-xl sm:text-2xl rounded-lg"
              placeholder="Search for people..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="h-[calc(100dvh-140px)] sm:h-[75%]">
            <div className="overflow-y-auto scrollbar-hide h-full">
              {searchQuery ? (
                searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user.userid}
                      className="flex items-center px-3 sm:px-5 py-3 cursor-pointer hover:bg-[#f5f5f5]"
                    >
                      <FaUserTie className="text-4xl mr-3 sm:mr-4" />
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg">{user.name}</h3>
                        <p className="text-xs sm:text-sm text-[#666]">
                          Not in chat
                        </p>
                      </div>
                      <button
                        className="bg-custom1 w-24 h-10 font-semibold text-white px-1 sm:px-2 py-1 sm:py-2 rounded-lg text-md sm:text-lg flex items-center justify-center"
                        onClick={() => handleStartChat(user.userid)}
                      >
                        <p>Start Chat</p>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="px-5 py-3 text-gray-500">No users found</p>
                )
              ) : (
                <UserList
                  users={chatUsers}
                  selectedUser={selectedUser}
                  onSelect={handleSelectChat}
                />
              )}
            </div>
          </div>
        </div>
        {/* Resize Handle */}
        <div
          className="hidden sm:block w-1 bg-[#e0e0e0] cursor-col-resize hover:bg-custom1 transition-colors"
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
              <FaUserTie className="text-4xl mr-2" />
              <h2 className="text-xl sm:text-2xl">
                {selectedUser ? selectedUser.name : "Select a chat"}
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <IoCall className="text-2xl sm:text-3xl cursor-pointer" />
            </div>
          </div>
          {/* Chat Content Area */}
          <div className="flex h-[84dvh] md:h-[77dvh] flex-col bg-[#f0f2f5]">
            {/* Scrollable Messages */}
            {loadingChat ? (
              <Spinner />
            ) : (
              <div className=" overflow-y-auto min-h-[93%] md:min-h-[82%] scrollbar-hide px-3 sm:px-5 py-3 sm:py-5">
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.messageid}
                    message={msg.message}
                    isSender={msg.senderid === userData.userid}
                    time={formatTime(msg.timestamp)}
                    type={msg.mediatype}
                    url={msg.mediaurl}
                  />
                ))}
                <div ref={messagesEndRef}></div>
                <div className="h-16 sm:hidden" />
              </div>
            )}
            {/* Fixed Input Bar */}
            {selectedFiles.length > 0 && (
              <div className="text-gray-500 ml-2 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={file.name + index}
                    className="flex items-center bg-gray-200 rounded p-1 px-2 text-sm"
                  >
                    <span>{file.name}</span>
                    <button
                      onClick={() => {
                        setSelectedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      className="ml-2 text-custom1 font-bold text-2xl"
                      type="button"
                      aria-label={`Remove file ${file.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className="bg-white border-t border-[#e0e0e0] p-3 sm:p-5 flex items-center 
             sm:relative fixed bottom-0 left-0 right-0 z-50"
            >
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  setSelectedFiles(files ? Array.from(files) : []);
                }}
              />

              <label htmlFor="fileUpload" className="cursor-pointer">
                <IoCloudUploadSharp className="text-custom1 text-3xl sm:text-4xl mr-2 sm:mr-3" />
              </label>

              <input
                type="text"
                className="flex-1 bg-[#f0f2f5] border border-[#ddd] focus:outline-none px-3 py-2 text-xl sm:text-2xl rounded-lg"
                placeholder="Send a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button
                className={
                  isRecording
                    ? "text-custom1 text-lg sm:text-xl ml-2 animate-pulse"
                    : "text-lg sm:text-xl ml-2"
                }
                onClick={toggleRecording}
              >
                <BsMicFill />
              </button>
              <button
                className="bg-custom1 text-white px-3 sm:px-4 py-2 rounded-2xl ml-2 flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
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
