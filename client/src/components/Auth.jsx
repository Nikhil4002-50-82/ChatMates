import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import { GiChatBubble } from "react-icons/gi";
import { LoggedInContext, userDataContext } from "../context/LoginContext";

import Loader from "./Loader";

const Auth = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [loading, setLoading] = useState(false);
  const { setLoggedIn } = useContext(LoggedInContext);
  const { setUserData } = useContext(userDataContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/login`,
          { email, password },
          { withCredentials: true }
        );
        console.log("Login successful:", response.data);
        toast(response?.data?.message, {
          type: "success",
        });

        // Fetch user profile to ensure userData is populated
        const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
          withCredentials: true,
        });
        if (profileResponse.data && profileResponse.data.name) {
          setLoggedIn(true);
          setUserData(profileResponse.data);
          navigate("/");
        } else {
          throw new Error("Invalid user data");
        }
      } catch (error) {
        console.error(
          "Login failed:",
          error.response?.data?.message || error.message
        );
        toast(error.response?.data?.message || "Login failed.", {
          type: "error",
        });
        setLoggedIn(false);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/registerUser`,
          { email, password, name, phoneno: phoneNo },
          { withCredentials: true }
        );
        console.log(
          "Signup successful:",
          response.data?.message || "User registered"
        );
        setIsLogin(true);
        toast("Signup successful! Please log in.", {
          type: "success",
        });
      } catch (error) {
        console.error(
          "Signup failed:",
          error.response?.data?.message || error.message
        );
        toast(error.response?.data?.message || "Signup failed.", {
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-custom1 p-4 sm:p-6">
      <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] sm:hover:shadow-2xl">
        <div className="flex justify-center mb-8 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-xl sm:text-2xl font-medium rounded-full transition-all duration-200 ${
              isLogin
                ? "bg-custom1 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-xl sm:text-2xl font-medium rounded-full transition-all duration-200 ${
              !isLogin
                ? "bg-custom1 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Sign Up
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 transition duration-200 text-lg sm:text-xl"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 transition duration-200 text-lg sm:text-xl"
                onChange={(e) => setPhoneNo(e.target.value)}
                value={phoneNo}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 transition duration-200 text-lg sm:text-xl"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 transition duration-200 text-lg sm:text-xl"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
          <button
            type="submit"
            className="bg-custom1 text-white py-3 rounded-lg transition duration-200 font-semibold text-xl sm:text-2xl"
            disabled={loading}
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <div className="text-center text-lg text-gray-500 mt-6 flex items-center justify-center">
          <p className="mr-2">Welcome to </p>
          <span className="font-semibold text-custom1">ChatMates</span>
          <GiChatBubble className="ml-1 text-custom1" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
