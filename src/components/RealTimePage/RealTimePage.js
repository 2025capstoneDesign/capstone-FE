import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PdfViewer from "./PdfViewer";
import SummaryPanel from "../TestPage/SummaryPanel";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";
import { useRealTimeState } from "./realTimeStateManager";

export default function RealTimePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { convertedData, pdfFile: contextPdfFile } = useLoading();
  const { historyData } = useHistory();

  // 항상 우선순위는 location state
  // 그렇지 않으면 context data (from conversion)
  const {
    pdfFile,
    pdfData,
    jobId: initialJobId,
  } = location.state
    ? location.state
    : convertedData && contextPdfFile
    ? {
        pdfFile: contextPdfFile,
        pdfData: convertedData,
        jobId: null,
        isRealTimeMode: false,
      }
    : {
        pdfFile: historyData[0]?.pdfFile || "/sample3.pdf",
        pdfData: historyData[0]?.result || { summaryData: {}, voiceData: {} },
        jobId: null,
        isRealTimeMode: false,
      };

  // 실시간 상태 관리
  const {
    isRealTimeActive,
    isRecording,
    isUploading,
    showGuidanceModal,
    realTimePdfData,
    recordingTime,
    currentSegmentTime,
    handleStartRealTime,
    startRecording,
    handlePauseRecording,
    handleSlideTransition,
    setShowGuidanceModal,
    queueLength,
    isProcessingQueue,
  } = useRealTimeState(pdfData, initialJobId);

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
      // 녹음 중 슬라이드 전환 처리
      if (isRecording && isRealTimeActive) {
        handleSlideTransition(newPage);
      }
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
          {!isRealTimeActive ? (
            <button className="convert-btn" onClick={handleStartRealTime}>
              실시간 변환 시작
            </button>
          ) : (
            <button
              className="convert-btn"
              onClick={handlePauseRecording}
              disabled={isUploading}
            >
              {isUploading || isProcessingQueue
                ? `처리 중... ${
                    queueLength > 0 ? `(대기: ${queueLength})` : ""
                  }`
                : "실시간 변환 종료"}
            </button>
          )}
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

        {/* 가이드 모달 */}
        {showGuidanceModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "10px",
                textAlign: "center",
                maxWidth: "400px",
                margin: "20px",
              }}
            >
              <h3 style={{ marginBottom: "20px", color: "#333" }}>
                실시간 변환 가이드
              </h3>
              <p style={{ marginBottom: "25px", lineHeight: "1.5" }}>
                마이크 버튼을 누르면 녹음이 시작됩니다.
                <br />
                슬라이드를 넘기거나 종료 버튼을 누르면 음성이 처리됩니다.
              </p>
              <button
                onClick={() => setShowGuidanceModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#5CBFBC",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}

        <PdfViewer
          pdfUrl={pdfUrl}
          pageNumber={pageNumber}
          numPages={numPages}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onDocumentLoadError={onDocumentLoadError}
          goPrevPage={goPrevPage}
          goNextPage={goNextPage}
          isRealTimeActive={isRealTimeActive}
          isRecording={isRecording}
          startRecording={() => startRecording(pageNumber)}
          stopRecording={handlePauseRecording}
          showGuidanceModal={showGuidanceModal}
          recordingTime={recordingTime}
          currentSegmentTime={currentSegmentTime}
          queueLength={queueLength}
          isProcessingQueue={isProcessingQueue}
        />
        <SummaryPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          numPages={numPages}
          summaryData={realTimePdfData?.summaryData || {}}
          voiceData={realTimePdfData?.voiceData || {}}
          pageSectionRefs={pageSectionRefs}
        />
      </div>
    </div>
  );
}
