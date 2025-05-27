import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PdfViewer from "../TestPage/PdfViewer";
import SummaryPanel from "../TestPage/SummaryPanel";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";
import { useAuth } from "../../context/AuthContext";

export default function RealTimePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { convertedData, pdfFile: contextPdfFile } = useLoading();
  const { historyData } = useHistory();

  // Always prioritize location state (from history) if it exists
  // Otherwise use the context data (from conversion)
  const { pdfFile, pdfData } = location.state
    ? location.state
    : convertedData && contextPdfFile
    ? {
        pdfFile: contextPdfFile,
        pdfData: convertedData,
      }
    : {
        pdfFile: historyData[0].pdfFile || "/sample3.pdf",
        pdfData: historyData[0].result,
      };

  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("ai"); // "ai" or "voice"
  const [highlightColor, setHighlightColor] = useState("red");

  // 각 페이지 섹션에 대한 ref를 저장할 객체
  const pageSectionRefs = useRef({});

  // Use pdfFile directly (already a Blob URL or path)
  const pdfUrl = pdfFile;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError(error) {
    console.error("Error loading PDF:", error);
    toast.error("PDF 로딩 중 오류가 발생했습니다", {
      position: "top-center",
      autoClose: 3000,
    });
  }

  const goToPage = (next) => {
    const newPage = Math.min(Math.max(1, pageNumber + next), numPages || 1);
    if (newPage !== pageNumber) {
      setPageNumber(newPage);
    }
  };

  const goPrevPage = () => {
    goToPage(-1);
  };

  const goNextPage = () => {
    goToPage(1);
  };

  const handleConvertClick = () => {
    navigate("/real-time-convert");
  };

  const handleDownload = () => {
    if (pdfUrl && typeof pdfUrl === "string") {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h1 className="page-title">실시간 강의</h1>
        <div className="action-buttons">
          <button className="convert-btn" onClick={handleConvertClick}>
            다시 변환하기
          </button>
          <button className="download-btn" onClick={handleDownload}>
            다운로드
          </button>
        </div>
      </div>
      <div className="main-content">
        <ToastContainer />
        <PdfViewer
          pdfUrl={pdfUrl}
          pageNumber={pageNumber}
          numPages={numPages}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onDocumentLoadError={onDocumentLoadError}
          goPrevPage={goPrevPage}
          goNextPage={goNextPage}
        />
        <SummaryPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          numPages={numPages}
          summaryData={pdfData?.summaryData || {}}
          voiceData={pdfData?.voiceData || {}}
          pageSectionRefs={pageSectionRefs}
        />
      </div>
    </div>
  );
}
