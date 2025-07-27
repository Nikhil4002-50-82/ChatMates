import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

import Home from "./components/Home";
import Auth from "./components/Auth";
import Loader from "./components/Loader";

import { LoggedInContext, userDataContext } from "./context/LoginContext";

const App = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [loggedIn, setLoggedIn] = useState(null); // Initialize as null to indicate "unknown" state
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log(
          "Checking cookies before profile request:",
          document.cookie
        );
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          withCredentials: true,
        });
        console.log("Profile response:", response.data);
        if (response.data && response.data.name) {
          // Ensure userData has required fields
          setLoggedIn(true);
          setUserData(response.data);
        } else {
          throw new Error("Invalid user data");
        }
      } catch (err) {
        console.log("Profile error:", {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
        });
        if (err.response?.status === 401 || err.response?.status === 403) {
          try {
            console.log("Attempting to refresh token...");
            const refreshResponse = await axios.get(
              `${API_BASE_URL}/refreshToken`,
              { withCredentials: true }
            );
            console.log("Refresh response:", refreshResponse.data);
            const retryResponse = await axios.get(`${API_BASE_URL}/profile`, {
              withCredentials: true,
            });
            console.log("Retry profile response:", retryResponse.data);
            if (retryResponse.data && retryResponse.data.name) {
              setLoggedIn(true);
              setUserData(retryResponse.data);
            } else {
              throw new Error("Invalid user data after refresh");
            }
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
