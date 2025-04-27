import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Main/Home";
import Convert from "./components/Convert/Convert";
import Convert2 from "./components/Convert2/Convert2";
import TestPage from "./components/TestPage/TestPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex my-16 flex-col">
          <div className="flex-1 w-full mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/convert" element={<Convert />} />
              <Route path="/convert2" element={<Convert2 />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
