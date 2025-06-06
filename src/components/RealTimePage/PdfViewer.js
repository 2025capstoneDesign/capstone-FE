import { Document, Page } from "react-pdf";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

export default function PdfViewer({
  pdfUrl,
  pageNumber,
  numPages,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  goPrevPage,
  goNextPage,
  isRealTimeActive = false,
  isRecording = false,
  startRecording = null,
  stopRecording = null,
  showGuidanceModal = false,
  recordingTime = "00:00",
  isPaused = false,
  sleepPages = [],
  onSleepToggle = null,
}) {
  // Document 컴포넌트는 파일 경로와 blob URL을 모두 올바르게 처리하므로,
  // 여기서 특별한 변환 작업이 필요X
  // pdfUrl을 file prop에 직접 전달

  // 로딩 상태를 추적하여 필요한 경우 로딩 표시
  const [isLoading, setIsLoading] = useState(false);

  // 현재 페이지가 졸음 표시되었는지 확인
  const isCurrentPageSelected = sleepPages.includes(pageNumber - 1);

  // PDF URL이 변경될 때 로딩 상태를 초기화
  useEffect(() => {
    setIsLoading(true);
  }, [pdfUrl]);

  // 성공적인 로딩 처리
  const handleLoadSuccess = (pdf) => {
    setIsLoading(false);
    if (onDocumentLoadSuccess) {
      onDocumentLoadSuccess(pdf);
    }
  };

  // 로딩 오류 처리
  const handleLoadError = (error) => {
    setIsLoading(false);
    console.error("Error loading PDF:", error);
    if (onDocumentLoadError) {
      onDocumentLoadError(error);
    } else {
      toast.error("PDF 로딩 중 오류가 발생했습니다", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="slide-container">
      <div className="slide-header">
        <div className="recording-controls" style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div
            className={`audio-icon ${
              isRealTimeActive && showGuidanceModal ? 'pulsate' : ''
            } ${
              isRecording ? 'recording' : ''
            }`}
            onClick={() => {
              if (isRealTimeActive && !isRecording && startRecording) {
                startRecording();
              } else if (isRealTimeActive && isRecording && stopRecording) {
                stopRecording(); // 이제 일시정지/재개 토글 역할
              } else if (!isRealTimeActive) {
                toast.info("실시간 변환을 먼저 시작해주세요.", {
                  position: "top-center",
                  autoClose: 1500,
                });
              }
            }}
            style={{
              cursor: isRealTimeActive ? 'pointer' : 'default',
              opacity: isRealTimeActive ? 1 : 0.6
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z"
                stroke={isRecording ? "#ff4444" : "#5CBFBC"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={isRecording ? "#ff4444" : "none"}
              />
              <path
                d="M4.35 9.65V11.35C4.35 15.57 7.78 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.65"
                stroke={isRecording ? "#ff4444" : "#5CBFBC"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.61 6.56C11.519 6.19051 12.5098 6.1885 13.42 6.56C14.18 6.87 14.794 7.44448 15.13 8.17C15.2577 8.45726 15.3312 8.76303 15.348 9.074C15.3648 9.38498 15.3244 9.6964 15.229 9.994C15.1335 10.2916 14.9846 10.5696 14.7891 10.8143C14.5937 11.059 14.3549 11.2667 14.085 11.426C13.816 11.5844 13.5194 11.692 13.212 11.743C12.9046 11.794 12.5917 11.7878 12.287 11.725"
                stroke={isRecording ? "#ff4444" : "#5CBFBC"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19V22"
                stroke={isRecording ? "#ff4444" : "#5CBFBC"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          {isRecording && (
            <div className="recording-info" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-start',
              fontSize: '12px',
              color: '#333'
            }}>
              <div style={{ color: isPaused ? '#ff8c00' : '#ff4444', fontWeight: 'bold', marginBottom: '2px' }}>
                {isPaused ? '⏸️ 일시정지' : '🔴 녹음 중..'}
              </div>
              <div style={{ color: '#666' }}>
                전체: {recordingTime}
              </div>
            </div>
          )}

          {/* 졸음 이모티콘 버튼 */}
          <button
            onClick={() => onSleepToggle && onSleepToggle(pageNumber - 1)}
            style={{
              backgroundColor: isCurrentPageSelected ? "#ff6b6b" : "#f1f3f4",
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              if (!isCurrentPageSelected) {
                e.target.style.backgroundColor = "#e8eaed";
              }
            }}
            onMouseLeave={(e) => {
              if (!isCurrentPageSelected) {
                e.target.style.backgroundColor = "#f1f3f4";
              }
            }}
            title={isCurrentPageSelected ? "졸음 표시 취소" : "졸음 표시"}
          >
            😴
            <span
              style={{
                fontSize: "12px",
                color: isCurrentPageSelected ? "white" : "#666",
                fontWeight: isCurrentPageSelected ? "600" : "normal",
              }}
            >
              {isCurrentPageSelected ? "선택됨" : "졸음"}
            </span>
          </button>
        </div>
      </div>

      <div className="pdf-viewer">
        <Document
          file={pdfUrl}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={isLoading ? "PDF 로딩 중..." : ""}
          className="pdf-document"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={window.innerWidth * 0.6}
          />
        </Document>

        <div className="nav-area left" onClick={goPrevPage}>
          <div className="nav-arrow-icon">&#10094;</div>
        </div>
        <div className="nav-area right" onClick={goNextPage}>
          <div className="nav-arrow-icon">&#10095;</div>
        </div>

        <div className="page-info">
          {pageNumber} / {numPages}
        </div>
      </div>
    </div>
  );
}
