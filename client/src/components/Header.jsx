import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GiChatBubble } from "react-icons/gi";
import { LoggedInContext, userDataContext } from "../context/LoginContext";
import axios from "axios";
import Loader from "./Loader";

const Header = () => {
  const { loggedIn, setLoggedIn } = useContext(LoggedInContext);
  const { setUserData } = useContext(userDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post("https://my-chat-b2i2.onrender.com/logout", {}, { withCredentials: true });
      setLoggedIn(false);
      setUserData(null);
      alert("Logged out successfully.")
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error.message);
      setLoggedIn(false);
      setUserData(null);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 bg-blue-600">
      <div className="flex items-center">
        <span>
          <GiChatBubble className="text-white text-3xl sm:text-4xl md:text-5xl" />
        </span>
        <h1 className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl ml-1 sm:ml-2 md:ml-3 lg:ml-4">
          My-Chat
        </h1>
      </div>
      <button
        className="text-blue-600 bg-white text-xl sm:text-2xl md:text-3xl px-3 sm:px-4 md:px-5 py-1 rounded-lg font-semibold hover:text-white hover:bg-red-600 transition-colors duration-200"
        onClick={(e) => {
          e.preventDefault();
          logout();
        }}
        disabled={loading}
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
