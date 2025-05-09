import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Main/Home";
import Convert from "./components/Convert/Convert";
import TestPage from "./components/TestPage/TestPage";
import History from "./components/History/History";
import Setting from "./components/Setting/Setting";
import Header from "./components/Header";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { LoadingProvider } from "./context/LoadingContext";
import { HistoryProvider } from "./context/HistoryContext";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <LoadingProvider>
      <HistoryProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-white">
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <main className="flex-1 flex flex-col">
              <div className="flex-1 w-full mx-auto">
                <Routes>
                  <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
                  <Route path="/convert" element={<Convert />} />
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/setting" element={<Setting />} />
                  <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                  <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
                </Routes>
              </div>
            </main>
            {/* <Footer /> */}
          </div>
        </Router>
      </HistoryProvider>
    </LoadingProvider>
  );
}

export default App;
