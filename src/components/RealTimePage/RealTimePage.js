import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PdfViewer from "./PdfViewer";
import SummaryPanel from "../TestPage/SummaryPanel";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";
import { useRealTimeState } from "./realTimeStateManager";
import progress2 from "../../assets/images/progress_2.png";
import sleep from "../../assets/images/sleep 7.png"

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
    showTutorial = false,
  } = location.state
    ? location.state
    : convertedData && contextPdfFile
    ? {
        pdfFile: contextPdfFile,
        pdfData: convertedData,
        jobId: null,
        isRealTimeMode: false,
        showTutorial: false,
      }
    : {
        pdfFile: historyData[0]?.pdfFile || "/sample3.pdf",
        pdfData: historyData[0]?.result || { summaryData: {}, voiceData: {} },
        jobId: null,
        isRealTimeMode: false,
        showTutorial: false,
      };

  // 실시간 상태 관리
  const {
    isRealTimeActive, // 실시간 모드 활성화 여부
    isRecording, // 녹음 중 여부
    showGuidanceModal, // 가이드 모달 표시 여부
    realTimePdfData, // 실시간 변환 결과 데이터
    recordingTime, // 녹음 시간
    handleStartRealTime, // 실시간 변환 시작 핸들러
    startRecording, // 녹음 시작 핸들러
    handlePauseRecording, // 녹음 일시정지/재개 핸들러
    handleStopRecording, // 녹음 완전 종료 핸들러
    isPaused, // 일시정지 상태
    handleSlideTransition, // 슬라이드 전환 핸들러
    setShowGuidanceModal, // 가이드 모달 표시 여부 설정
    voiceMap, // 음성 인식 결과 맵
    showLoadingModal, // 로딩 모달 표시 여부
    loadingMessage, // 로딩 메시지
  } = useRealTimeState(pdfData, initialJobId);

  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // showTutorial 플래그가 true이면 자동으로 튜토리얼 시작
  useEffect(() => {
    if (showTutorial) {
      setShowGuidanceModal(true);
      setTutorialStep(1);
    }
  }, [showTutorial, setShowGuidanceModal]);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("voice"); // "ai" or "voice"
  const [highlightColor, setHighlightColor] = useState("red");
  const [sleepPages, setSleepPages] = useState([]); // 졸음 표시된 페이지들
  const [tutorialStep, setTutorialStep] = useState(0); // 0: 비활성, 1: 음성버튼, 2: 졸음버튼

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

  // 졸음 버튼 토글 핸들러
  const handleSleepToggle = (pageIndex) => {
    setSleepPages((prev) => {
      if (prev.includes(pageIndex)) {
        return prev.filter((p) => p !== pageIndex);
      } else {
        return [...prev, pageIndex];
      }
    });
  };

  // 튜토리얼 단계 진행
  const handleTutorialNext = () => {
    if (tutorialStep === 1) {
      setTutorialStep(2);
    } else if (tutorialStep === 2) {
      setTutorialStep(0);
      setShowGuidanceModal(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center">
            <img
              src="/loading_listen.gif"
              alt="로딩 중"
              className="w-[200px] h-[200px] object-contain mb-4"
            />
            <p className="text-gray-700 text-lg font-medium">
              {loadingMessage}
            </p>
          </div>
        </div>
      )}

      <div className="sub-header">
        <div className="flex items-center w-full">
          <div className="w-[200px] flex items-center">
            <h1 className="text-2xl font-semibold">실시간 강의</h1>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src={progress2}
              alt="진행 상태"
              className="w-[800px] object-contain"
            />
          </div>
          <div className="w-[300px] flex justify-end gap-2">
            {!isRealTimeActive ? (
              <button
                className="convert-btn whitespace-nowrap"
                onClick={() => {
                  handleStartRealTime();
                  setShowGuidanceModal(true);
                  setTutorialStep(1);
                }}
              >
                실시간 변환 시작
              </button>
            ) : (
              <button
                className="convert-btn whitespace-nowrap"
                onClick={() =>
                  handleStopRecording(
                    navigate,
                    initialJobId,
                    pdfUrl,
                    sleepPages
                  )
                }
                style={{ backgroundColor: "#0F0F0F" }}
              >
                실시간 변환 종료
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="main-content">
        <ToastContainer />

        {/* 단계별 튜토리얼 */}
        {showGuidanceModal && tutorialStep > 0 && (
          <>
            {/* 어두운 배경 오버레이 */}
            <div
              className="modal-overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                zIndex: 1000,
              }}
            />

            {/* 음성 버튼 가이드 */}
            {tutorialStep === 1 && (
              <>
                {/* 실제 음성 아이콘을 모달 위에 복제 */}
                <div
                  style={{
                    position: "absolute",
                    top: "217px",
                    left: "5px",
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "3px solid #ff6b6b",
                    zIndex: 1001,
                    animation: "pulse 2s infinite",
                    cursor: "pointer",
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
                      stroke="#5CBFBC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M4.35 9.65V11.35C4.35 15.57 7.78 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.65"
                      stroke="#5CBFBC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.61 6.56C11.519 6.19051 12.5098 6.1885 13.42 6.56C14.18 6.87 14.794 7.44448 15.13 8.17C15.2577 8.45726 15.3312 8.76303 15.348 9.074C15.3648 9.38498 15.3244 9.6964 15.229 9.994C15.1335 10.2916 14.9846 10.5696 14.7891 10.8143C14.5937 11.059 14.3549 11.2667 14.085 11.426C13.816 11.5844 13.5194 11.692 13.212 11.743C12.9046 11.794 12.5917 11.7878 12.287 11.725"
                      stroke="#5CBFBC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 19V22"
                      stroke="#5CBFBC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* 화살표 */}
                <div
                  style={{
                    position: "absolute",
                    top: "225px",
                    left: "80px",
                    zIndex: 1002,
                    animation: "bounce 1s infinite",
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 100 100">
                    <defs>
                      <filter
                        id="shadow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feDropShadow
                          dx="2"
                          dy="2"
                          stdDeviation="3"
                          floodColor="rgba(0,0,0,0.3)"
                        />
                      </filter>
                    </defs>
                    <path
                      d="M20 50 L60 30 L60 40 L80 40 L80 60 L60 60 L60 70 Z"
                      fill="#ff6b6b"
                      filter="url(#shadow)"
                    />
                  </svg>
                </div>

                {/* 설명 박스 */}
                <div
                  style={{
                    position: "absolute",
                    top: "145px",
                    left: "140px",
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "15px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    maxWidth: "300px",
                    border: "2px solid #ff6b6b",
                    zIndex: 1002,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 15px 0",
                      color: "#333",
                      fontSize: "18px",
                    }}
                  >
                    🎤 음성 녹음 시작하기
                  </h3>
                  <p
                    style={{
                      margin: "0 0 20px 0",
                      lineHeight: "1.6",
                      color: "#666",
                    }}
                  >
                    이 버튼을 누르면 음성 녹음이 시작됩니다!
                  </p>
                  <button
                    onClick={handleTutorialNext}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    다음
                  </button>
                </div>
              </>
            )}

            {/* 졸음 버튼 가이드 */}
            {tutorialStep === 2 && (
              <>
                {/* 실제 졸음 버튼을 모달 위에 복제 */}
                <button
                  style={{
                    position: "absolute",
                    top: "227px",
                    left: "70px",
                    backgroundColor: "#f1f3f4",
                    border: "3px solid #ff6b6b",
                    borderRadius: "8px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    zIndex: 1001,
                    animation: "pulse 2s infinite",
                  }}
                >
                  <img
                    src={sleep}
                    alt="졸음버튼"
                    className="object-contain"
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "#f1f3f4",
                      transition: "all 0.3s ease",
                      padding: "2px",
                      borderRadius: "4px",
                      objectFit: "contain"
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      fontWeight: "500",
                      backgroundColor: "#f1f3f4",
                      transition: "all 0.3s ease",
                      padding: "2px 4px",
                      borderRadius: "4px",
                    }}
                  >
                    졸음
                  </span>
                </button>

                {/* 화살표 */}
                <div
                  style={{
                    position: "absolute",
                    top: "225px",
                    left: "167px",
                    zIndex: 1002,
                    animation: "bounce 1s infinite",
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 100 100">
                    <defs>
                      <filter
                        id="shadow2"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feDropShadow
                          dx="2"
                          dy="2"
                          stdDeviation="3"
                          floodColor="rgba(0,0,0,0.3)"
                        />
                      </filter>
                    </defs>
                    <path
                      d="M20 50 L60 30 L60 40 L80 40 L80 60 L60 60 L60 70 Z"
                      fill="#ff6b6b"
                      filter="url(#shadow2)"
                    />
                  </svg>
                </div>

                {/* 설명 박스 */}
                <div
                  style={{
                    position: "absolute",
                    top: "145px",
                    left: "217px",
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "15px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    maxWidth: "300px",
                    border: "2px solid #ff6b6b",
                    zIndex: 1002,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 15px 0",
                      color: "#333",
                      fontSize: "18px",
                    }}
                  >
                    😴 졸음 표시하기
                  </h3>
                  <p
                    style={{
                      margin: "0 0 20px 0",
                      lineHeight: "1.6",
                      color: "#666",
                    }}
                  >
                    졸거나 놓친 슬라이드에서는 졸음 버튼을 누르면 필기요정이
                    알맞는 슬라이드로 이동시켜줍니다!
                  </p>
                  <button
                    onClick={handleTutorialNext}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    확인
                  </button>
                </div>
              </>
            )}
          </>
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
          startRecording={() => startRecording(pageNumber, initialJobId)}
          stopRecording={handlePauseRecording}
          showGuidanceModal={showGuidanceModal}
          recordingTime={recordingTime}
          isPaused={isPaused}
          sleepPages={sleepPages}
          onSleepToggle={handleSleepToggle}
        />
        <SummaryPanel
          voiceData={realTimePdfData?.voiceData || {}}
          pageSectionRefs={pageSectionRefs}
          voiceMap={voiceMap}
          isStreaming={isRecording}
          isRealTime={true}
        />
      </div>
    </div>
  );
}
