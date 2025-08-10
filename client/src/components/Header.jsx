import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { GiChatBubble } from "react-icons/gi";

import { LoggedInContext, userDataContext } from "../context/LoginContext";

import axios from "axios";
import Loader from "./Loader";

const Header = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { loggedIn, setLoggedIn } = useContext(LoggedInContext);
  const { setUserData } = useContext(userDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
      setLoggedIn(false);
      setUserData(null);
      toast("Logged out successfully.", {
        type: "success",
      });
    } catch (error) {
      console.error("Logout failed:", error.message);
      setLoggedIn(false);
      setUserData(null);
      navigate("/auth");
    } finally {
      setLoading(false);
      navigate("/auth");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full h-[8dvh] lg:h-[12dvh] flex items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-3 md:py-4 bg-custom1">
      <div className="flex items-center">
        <span>
          <GiChatBubble className="text-white text-3xl sm:text-4xl md:text-5xl" />
        </span>
        <h1 className="text-white font-thin text-4xl lg:text-5xl ml-1 sm:ml-2 ">
          ChatMates
        </h1>
      </div>
      <button
        className="text-custom1 bg-white text-xl sm:text-2xl md:text-3xl px-3 sm:px-4 md:px-5 py-1 rounded-lg font-light  transition-colors duration-200"
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
