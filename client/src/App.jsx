import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Auth from "./components/Auth";
import Loader from "./components/Loader";
import { LoggedInContext, userDataContext } from "./context/LoginContext";
import axios from "axios";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking cookies before profile request:", document.cookie);
        const response = await axios.get("https://my-chat-b2i2.onrender.com/profile", {
          withCredentials: true,
        });
        console.log("Profile response:", response.data);
        setLoggedIn(true);
        setUserData(response.data);
      } catch (err) {
        console.log("Profile error:", {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
        });
        if (err.response?.status === 401 || err.response?.status === 403) {
          try {
            console.log("Attempting to refresh token...");
            const refreshResponse = await axios.get(
              "https://my-chat-b2i2.onrender.com/refreshToken",
              { withCredentials: true }
            );
            console.log("Refresh response:", refreshResponse.data);
            const retryResponse = await axios.get(
              "https://my-chat-b2i2.onrender.com/profile",
              { withCredentials: true }
            );
            console.log("Retry profile response:", retryResponse.data);
            setLoggedIn(true);
            setUserData(retryResponse.data);
          } catch (refreshErr) {
            console.log("Token refresh failed:", {
              status: refreshErr.response?.status,
              message: refreshErr.response?.data?.message || refreshErr.message,
            });
            setLoggedIn(false);
            setUserData(null);
          }
        } else {
          console.log("User not logged in:", {
            status: err.response?.status,
            message: err.response?.data?.message || err.message,
          });
          setLoggedIn(false);
          setUserData(null);
        }
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="font-custom">
      <userDataContext.Provider value={{ userData, setUserData }}>
        <LoggedInContext.Provider value={{ loggedIn, setLoggedIn }}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </BrowserRouter>
        </LoggedInContext.Provider>
      </userDataContext.Provider>
    </div>
  );
};

export default App;
