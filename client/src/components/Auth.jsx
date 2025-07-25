import React, { useState } from "react";
import { GiChatBubble } from "react-icons/gi";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Logging in...");
    } else {
      console.log("Signing up...");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen md:min-h-[87vh] bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6">
      <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] sm:hover:shadow-2xl">
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-8 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-xl sm:text-2xl font-medium rounded-full transition-all duration-200 ${
              isLogin
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-xl sm:text-2xl font-medium rounded-full transition-all duration-200 ${
              !isLogin
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg sm:text-xl"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg sm:text-xl"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg sm:text-xl"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-xl sm:text-2xl"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-lg text-gray-500 mt-6 flex items-center justify-center">
          <p className="mr-2">Welcome to{" "}</p>
          <span className="font-semibold text-blue-600">
             My-Chat
          </span>
          <GiChatBubble className="ml-1 text-blue-600"/>
        </div>
      </div>
    </div>
  );
};

export default Auth;
