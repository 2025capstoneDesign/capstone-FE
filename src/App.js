import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResultPage from "./pages/ResultPage";
import TestPage from "./pages/TestPage";
import SignupPage from "./pages/SignupPage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  return (
    <BrowserRouter>
      <div className="APP">
        <Routes>
          <Route exact path="/" element={<MainPage />} />
          <Route exact path="/login" element={<LoginPage />} />
          <Route exact path="/signup" element={<SignupPage />} />
          <Route exact path="/result" element={<ResultPage />} />
          <Route exact path="/test" element={<TestPage />} />
          <Route exact path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
