import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResultPage from "./pages/ResultPage";
import TestPage from "./pages/TestPage";

function App() {
  // public 폴더 내의 PDF 파일 경로 수정ublic 폴더 기준 경로

  return (
    <BrowserRouter>
      <div className="APP">
        <Routes>
          <Route exact path="/" element={<MainPage />} />
          <Route exact path="/login" element={<LoginPage />} />
          <Route exact path="/result" element={<ResultPage />} />
          <Route exact path="/test" element={<TestPage />} />
        </Routes>
      </div>
    </BrowserRouter>
    // <TestPageForApp pdfFile={pdfFile} />
  );
}

export default App;
