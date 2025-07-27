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
