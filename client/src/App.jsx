import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Bounce, ToastContainer } from "react-toastify";

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
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          withCredentials: true,
        });
        if (response.data && response.data.name) {
          setLoggedIn(true);
          setUserData(response.data);
        } else {
          throw new Error("Invalid user data");
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          try {
            const refreshResponse = await axios.get(
              `${API_BASE_URL}/refreshToken`,
              { withCredentials: true }
            );
            if (refreshResponse.status === 200) {
              const retryResponse = await axios.get(`${API_BASE_URL}/profile`, {
                withCredentials: true,
              });
              if (retryResponse.data && retryResponse.data.name) {
                setLoggedIn(true);
                setUserData(retryResponse.data);
              } else {
                throw new Error("Invalid user data after refresh");
              }
            } else {
              setLoggedIn(false);
              setUserData(null);
            }
          } catch (refreshErr) {
            console.log("Refresh failed:", refreshErr.message);
            setLoggedIn(false);
            setUserData(null);
          }
        } else {
          console.log("Non-auth error:", err.message);
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
          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
            transition={Bounce}
          />
        </LoggedInContext.Provider>
      </userDataContext.Provider>
    </div>
  );
};

export default App;
