import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pdf_icon from "../../assets/images/pdf.png";
import "../../css/TestPage.css";
import ReactMarkdown from "react-markdown";

// 더미 데이터
const historyData = [
  {
    id: 1,
    title: "sample3.pdf",
    date: "2024-03-20",
    size: "2.5MB",
    pdfFile: "/sample3.pdf",
  },
  {
    id: 2,
    title: "lecture1.pdf",
    date: "2024-03-19",
    size: "3.1MB",
    pdfFile: "/lecture1.pdf",
  },
  {
    id: 3,
    title: "presentation.pdf",
    date: "2024-03-18",
    size: "1.8MB",
    pdfFile: "/presentation.pdf",
  },
];

export default function History() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("date"); // "date" or "title"
  const [selectedPdf, setSelectedPdf] = useState(null);

  const handleViewPdf = (pdf) => {
    setSelectedPdf(pdf);
    navigate("/test", { state: { pdfFile: pdf.pdfFile } });
  };

  const handleDownload = (pdf) => {
    // 다운로드 로직 구현
    console.log("Downloading:", pdf.title);
  };

  const sortedHistory = [...historyData].sort((a, b) => {
    if (sortOrder === "date") {
      return new Date(b.date) - new Date(a.date);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h1 className="page-title">변환 기록</h1>
        <div className="action-buttons">
          <button className="convert-btn" onClick={() => navigate("/convert")}>
            새로 변환하기
          </button>
        </div>
      </div>
      <div className="main-content">
        {/* 왼쪽 PDF 목록 영역 */}
        <div className="slide-container">
          <div className="slide-header">
            <div className="sort-options">
              <button
                className={`sort-btn ${sortOrder === "date" ? "active" : ""}`}
                onClick={() => setSortOrder("date")}
              >
                날짜순
              </button>
              <button
                className={`sort-btn ${sortOrder === "title" ? "active" : ""}`}
                onClick={() => setSortOrder("title")}
              >
                제목순
              </button>
            </div>
          </div>

          <div className="p-5">
            {sortedHistory.map((pdf) => (
              <div
                key={pdf.id}
                className="flex items-center p-4 rounded-lg bg-white border border-gray-200 shadow-sm mb-3 transition-all hover:shadow-md"
              >
                <img
                  src={pdf_icon}
                  alt="PDF 아이콘"
                  className="w-10 h-10 mr-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-medium text-gray-800">
                    {pdf.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    변환일: {pdf.date} | 크기: {pdf.size}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="view-btn"
                    onClick={() => handleViewPdf(pdf)}
                  >
                    열람하기
                  </button>
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(pdf)}
                  >
                    다운로드
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 사용설명서 영역 */}
        <div className="summary-container">
          <div className="tab-container content-tabs">
            <h2 className="manual-title">사용설명서</h2>
          </div>

          <div className="content-container">
            <div className="manual-content">
              <ReactMarkdown>
                {`
# PDF 변환 기록 사용설명서

## 주요 기능

### 1. PDF 열람하기
- '열람하기' 버튼을 클릭하여 변환된 PDF를 열람할 수 있습니다.
- 열람 시 AI 필기와 음성 원본을 함께 확인할 수 있습니다.

### 2. PDF 다운로드
- '다운로드' 버튼을 클릭하여 변환된 PDF를 다운로드할 수 있습니다.

### 3. 정렬 기능
- 상단의 정렬 버튼을 통해 PDF 목록을 날짜순 또는 제목순으로 정렬할 수 있습니다.
  - 날짜순: 최신 변환 파일이 상단에 표시됩니다.
  - 제목순: 파일명의 알파벳 순서대로 정렬됩니다.

### 4. 새로 변환하기
- 상단의 '새로 변환하기' 버튼을 클릭하여 새로운 PDF를 변환할 수 있습니다.
                `}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
