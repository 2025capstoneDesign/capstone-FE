// /src/components/TestPage/TestPage.js
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { dummyData } from "../../data/dummyData";
import { parseData } from "./DataParser";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PdfViewer from "./PdfViewer";
import SummaryPanel from "./SummaryPanel";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";

export default function TestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { convertedData, pdfFile: contextPdfFile } = useLoading();
  const { historyData } = useHistory();

  // Always prioritize location state (from history or real-time) if it exists
  // Otherwise use the context data (from conversion)
  // If neither exists, use the first item from history (dummy data)
  const {
    pdfFile,
    pdfData,
    jobId,
    isFromRealTime = false,
    message = null,
  } = location.state
    ? {
        pdfFile: location.state.pdfFile,
        pdfData: location.state.result || location.state.pdfData,
        jobId: location.state.jobId || null,
        isFromRealTime: location.state.isFromRealTime || false,
        message: location.state.message || null,
      }
    : convertedData && contextPdfFile
    ? {
        pdfFile: contextPdfFile,
        pdfData: convertedData,
        jobId: null,
        isFromRealTime: false,
        message: null,
      }
    : {
        pdfFile: historyData[0]?.pdfFile || "/sample3.pdf",
        pdfData: historyData[0]?.result,
        jobId: historyData[0]?.id || null,
        isFromRealTime: false,
        message: null,
      };

  console.log("TestPage - 현재 상태:", {
    locationState: location.state,
    convertedData: convertedData ? true : false,
    contextPdfFile: contextPdfFile ? true : false,
    historyData: historyData[0]
      ? {
          id: historyData[0].id,
          pdfFile: historyData[0].pdfFile,
        }
      : null,
    selectedJobId: jobId,
  });

  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 전달받은 pdfData가 이미 파싱된 데이터인지 확인하고, 아니면 파싱
  const { summaryData, voiceData } =
    typeof pdfData === "object" && pdfData?.summaryData && pdfData?.voiceData
      ? pdfData // 이미 파싱된 데이터
      : parseData(pdfData || dummyData); // 파싱 필요

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

  const goToPage = useCallback(
    (next) => {
      const newPage = Math.min(Math.max(1, pageNumber + next), numPages || 1);
      if (newPage !== pageNumber) {
        setPageNumber(newPage);
      }
    },
    [pageNumber, numPages]
  );

  const goPrevPage = useCallback(() => {
    goToPage(-1);
  }, [goToPage]);

  const goNextPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  // 특정 페이지로 이동하는 함수 추가
  const goToSpecificPage = useCallback(
    (pageNum) => {
      if (pageNum >= 1 && pageNum <= numPages) {
        setPageNumber(pageNum);
      }
    },
    [numPages]
  );

  // Handle navigation away from this component - don't revoke context-managed blob URLs
  const handleConvertClick = useCallback(() => {
    navigate("/convert");
  }, [navigate]);

  // Add download functionality using the blob URL
  const handleDownload = useCallback(() => {
    if (pdfUrl && typeof pdfUrl === "string") {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [pdfUrl]);

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h1 className="page-title">PDF 변환 결과</h1>
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
          goToSpecificPage={goToSpecificPage}
          pdfData={{ summaryData, voiceData }}
          jobId={jobId}
        />
        <SummaryPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          numPages={numPages}
          summaryData={summaryData}
          voiceData={voiceData}
          pageSectionRefs={pageSectionRefs}
        />
      </div>
    </div>
  );
}
