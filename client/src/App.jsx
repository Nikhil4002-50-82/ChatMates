import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import { LoggedInContext, userDataContext } from "./context/LoginContext";
import Auth from "./components/Auth";
import axios from "axios";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking cookies before profile request:", document.cookie); // Debug
        const response = await axios.get("http://localhost:3000/profile", {
          withCredentials: true,
        });
        console.log("Profile response:", response.data); // Debug
        setLoggedIn(true);
        setUserData(response.data);
      } catch (err) {
        console.log("Profile error:", {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
        }); // Debug
        if (err.response?.status === 401 || err.response?.status === 403) {
          try {
            console.log("Attempting to refresh token..."); // Debug
            const refreshResponse = await axios.get(
              "http://localhost:3000/refreshToken",
              { withCredentials: true }
            );
            console.log("Refresh response:", refreshResponse.data); // Debug
            const retryResponse = await axios.get(
              "http://localhost:3000/profile",
              { withCredentials: true }
            );
            console.log("Retry profile response:", retryResponse.data); // Debug
            setLoggedIn(true);
            setUserData(retryResponse.data);
          } catch (refreshErr) {
            console.log("Token refresh failed:", {
              status: refreshErr.response?.status,
              message: refreshErr.response?.data?.message || refreshErr.message,
            }); // Debug
            setLoggedIn(false);
            setUserData(null);
          }
        } else {
          console.log("User not logged in:", {
            status: err.response?.status,
            message: err.response?.data?.message || err.message,
          }); // Debug
          setLoggedIn(false);
          setUserData(null);
        }
      }
    };
    checkSession();
  }, []);

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