import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResultPage from "./pages/ResultPage";
import TestPage from "./pages/TestPage";
import TestPageForApp from "./pages/TestPageForApp";

function App() {
  // public 폴더 내의 PDF 파일 경로 수정
  const pdfFile = "/sample.pdf"; // public 폴더 기준 경로

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
