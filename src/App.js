import React from "react";
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
import { AuthProvider } from "./context/AuthContext";


function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <HistoryProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-white">
              <Header />
              <main className="flex-1 flex flex-col">
                <div className="flex-1 w-full mx-auto">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/convert" element={<Convert />} />
                    <Route path="/test" element={<TestPage />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/setting" element={<Setting />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Routes>
                </div>
              </main>
              {/* <Footer /> */}
            </div>
          </Router>
        </HistoryProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
