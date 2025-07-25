import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import { LoggedInContext } from "./context/LoginContext";
import Auth from "./components/Auth";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <div className="font-custom">
      <LoggedInContext.Provider value={{ loggedIn, setLoggedIn }}>
        <Header />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}>
              <Route path="/auth" element={<Auth />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LoggedInContext.Provider>
    </div>
  );
};

export default App;
