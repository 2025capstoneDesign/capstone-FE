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
  const { loading, convertedData, pdfFile: contextPdfFile, cleanupBlobUrls: cleanupLoadingBlobUrls } = useLoading();
  const { historyData, revokeBlobUrl } = useHistory();
  const createdBlobUrlsRef = useRef([]);

  // Always prioritize location state (from history) if it exists
  // Otherwise use the context data (from conversion)
  // If neither exists, use the first item from history (dummy data)
  const { pdfFile, pdfData } = location.state
    ? location.state
    : convertedData && contextPdfFile
    ? {
        pdfFile: contextPdfFile,
        pdfData: convertedData,
      }
    : {
        pdfFile: historyData[0].pdfFile,
        pdfData: historyData[0].data,
      };

  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Cleanup function for any locally created blob URLs
  const cleanupLocalBlobUrls = useCallback(() => {
    createdBlobUrlsRef.current.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    createdBlobUrlsRef.current = [];
  }, []);

  // Cleanup all blob URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupLocalBlobUrls();
    };
  }, [cleanupLocalBlobUrls]);

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

  // We don't need to create a new blob URL here, we should already have it
  // If pdfFile is already a blob URL or a string path, use it directly
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

  // Handle navigation away from this component
  const handlePageLeave = useCallback(() => {
    // Don't revoke blob URLs from history items - those need to persist
    // Only clean up locally created ones if any
    cleanupLocalBlobUrls();
  }, [cleanupLocalBlobUrls]);

  const handleConvertClick = useCallback(() => {
    handlePageLeave();
    navigate("/convert");
  }, [handlePageLeave, navigate]);

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h1 className="page-title">PDF 변환 결과</h1>
        <div className="action-buttons">
          <button className="convert-btn" onClick={handleConvertClick}>
            다시 변환하기
          </button>
          <button className="download-btn">다운로드</button>
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
          summaryData={summaryData}
          voiceData={voiceData}
          pageSectionRefs={pageSectionRefs}
        />
      </div>
    </div>
  );
}
