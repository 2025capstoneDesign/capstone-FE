import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/TestPage.css";
import ImageGridPanel from "./ImageGridPanel";
import DescriptionPanel from "./DescriptionPanel";
import EditorPdfViewer from "./EditorPdfViewer";
import AudioPanel from "./AudioPanel";
import { parseRealTimeResponse } from "../RealTimePage/realTimeDataParser";
import { useHistory } from "../../context/HistoryContext";
import { useAuth } from "../../context/AuthContext";
import { showError } from "../../utils/errorHandler";
import progress3 from "../../assets/images/progress_3.png";

export default function RealTimeEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshHistory } = useHistory();
  const { getAuthHeader } = useAuth();
  const [selectedImageIndices, setSelectedImageIndices] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" 또는 "pageview"
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("후처리 중...");

  // PDF viewer states
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfUrl, setPdfUrl] = useState("");
  const [highlightColor, setHighlightColor] = useState("blue");

  // Voice data states
  const [voiceData, setVoiceData] = useState({});
  const [resultData, setResultData] = useState(null);

  // 각 페이지 섹션에 대한 ref를 저장할 객체 (스크롤용)
  const pageSectionRefs = useRef({});

  // Get image URLs and result data from navigation state
  const {
    imageUrls = [],
    jobId,
    resultJson = null,
    pdfUrl: receivedPdfUrl = null,
    sleepPages = [],
  } = location.state || {};

  // Redirect to home if no image URLs
  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      navigate("/");
    }
  }, [imageUrls, navigate]);

  // Component mount시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize selectedImageIndices with sleepPages from previous page
  useEffect(() => {
    if (sleepPages && sleepPages.length > 0) {
      setSelectedImageIndices(sleepPages);
    }
  }, [sleepPages]);

  // Parse result_json when component mounts
  useEffect(() => {
    if (resultJson) {
      const parsedData = parseRealTimeResponse(resultJson, {
        summaryData: {},
        voiceData: {},
      });
      setVoiceData(parsedData.voiceData);
      setResultData(resultJson);
    }
  }, [resultJson]);

  // Handle data updates from AudioPanel
  const handleDataUpdate = (newResultData) => {
    const parsedData = parseRealTimeResponse(newResultData, {
      summaryData: {},
      voiceData: {},
    });
    setVoiceData(parsedData.voiceData);
    setResultData(newResultData);
  };

  // Set PDF URL - use received PDF URL if available, otherwise generate from jobId
  useEffect(() => {
    if (receivedPdfUrl) {
      setPdfUrl(receivedPdfUrl);
    } else if (jobId) {
      const API_URL = process.env.REACT_APP_API_URL;
      setPdfUrl(`${API_URL}/file/${jobId}/original.pdf`);
    }
  }, [receivedPdfUrl, jobId]);

  const handleImageClick = (index) => {
    setSelectedImageIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleCompleteSelection = async () => {
    try {
      setShowLoading(true);
      setLoadingMessage("필기 생성 중...");

      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/api/realTime/post-process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          jobId,
          sleepSlides: selectedImageIndices.map((index) => index + 1),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLoadingMessage("후처리 완료되었습니다!");
        await refreshHistory();

        setTimeout(() => {
          setShowLoading(false);
          navigate("/test", {
            state: {
              pdfFile: pdfUrl,
              result: result.result || resultData,
              isFromRealTime: true,
              processedSlides: result.processed_slides || selectedImageIndices,
              message: result.message || "Post-processing completed successfully"
            }
          });
        }, 2000);
      } else {
        throw new Error("후처리 요청 실패");
      }
    } catch (error) {
      console.error("Post-process error:", error);
      showError("후처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowLoading(false);
    }
  };

  // PDF navigation functions
  const goPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const onDocumentLoadSuccess = (pdf) => {
    setNumPages(pdf.numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
  };

  // 졸음 토글 함수 (PDF 페이지 기준, 0-based index로 변환)
  const handleSleepToggle = (imageIndex) => {
    setSelectedImageIndices((prev) => {
      if (prev.includes(imageIndex)) {
        return prev.filter((i) => i !== imageIndex);
      } else {
        return [...prev, imageIndex];
      }
    });
  };

  return (
    <div className="app-wrapper">
      {/* Loading Modal */}
      {showLoading && (
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
            <h1 className="text-2xl font-semibold">실시간 변환 결과</h1>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src={progress3}
              alt="진행 상태"
              className="w-[800px] object-contain"
            />
          </div>
          <div className="w-[300px] flex justify-end gap-2">
            <button
              className="download-btn whitespace-nowrap"
              onClick={handleCompleteSelection}
            >
              저장하기
            </button>
            <button
              className="convert-btn whitespace-nowrap"
              onClick={() => navigate("/")}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
      <div className="main-content">
        {activeTab === "overview" ? (
          <>
            <ImageGridPanel
              imageUrls={imageUrls}
              selectedImageIndices={selectedImageIndices}
              onImageClick={handleImageClick}
            />
            <div className="summary-container">
              <div className="tab-container content-tabs">
                <div className="tabs">
                  <button
                    className={`tab ${
                      activeTab === "overview" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    전체보기
                  </button>
                  <button
                    className={`tab ${
                      activeTab === "pageview" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("pageview")}
                  >
                    페이지 보기
                  </button>
                </div>
              </div>
              <DescriptionPanel
                selectedImageIndices={selectedImageIndices}
                onCompleteSelection={handleCompleteSelection}
              />
            </div>
          </>
        ) : (
          <>
            {pdfUrl && (
              <EditorPdfViewer
                pdfUrl={pdfUrl}
                pageNumber={pageNumber}
                numPages={numPages}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                onDocumentLoadError={onDocumentLoadError}
                goPrevPage={goPrevPage}
                goNextPage={goNextPage}
                selectedImageIndices={selectedImageIndices}
                onSleepToggle={handleSleepToggle}
              />
            )}
            <div className="summary-container">
              <div className="tab-container content-tabs">
                <div className="tabs">
                  <button
                    className={`tab ${
                      activeTab === "overview" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    전체보기
                  </button>
                  <button
                    className={`tab ${
                      activeTab === "pageview" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("pageview")}
                  >
                    페이지 보기
                  </button>
                </div>

                <div className="color-selector visible">
                  <button
                    className={`color-btn red ${
                      highlightColor === "red" ? "selected" : ""
                    }`}
                    onClick={() => setHighlightColor("red")}
                    aria-label="빨강색 강조"
                  />
                  <button
                    className={`color-btn blue ${
                      highlightColor === "blue" ? "selected" : ""
                    }`}
                    onClick={() => setHighlightColor("blue")}
                    aria-label="파랑색 강조"
                  />
                  <button
                    className={`color-btn green ${
                      highlightColor === "green" ? "selected" : ""
                    }`}
                    onClick={() => setHighlightColor("green")}
                    aria-label="초록색 강조"
                  />
                </div>
              </div>

              <AudioPanel
                pageNumber={pageNumber}
                voiceData={voiceData}
                highlightColor={highlightColor}
                numPages={numPages}
                pageSectionRefs={pageSectionRefs}
                setHighlightColor={setHighlightColor}
                onDataUpdate={handleDataUpdate}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
