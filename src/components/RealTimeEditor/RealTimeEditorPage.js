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

  // 각 페이지 섹션에 대한 ref를 저장할 객체 (스크롤용)
  const pageSectionRefs = useRef({});

  // Get image URLs and result data from navigation state
  const {
    imageUrls = [],
    jobId,
    resultJson = null,
    pdfUrl: receivedPdfUrl = null,
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

  // Parse result_json when component mounts
  useEffect(() => {
    if (resultJson) {
      const parsedData = parseRealTimeResponse(resultJson, {
        summaryData: {},
        voiceData: {},
      });
      setVoiceData(parsedData.voiceData);
    }
  }, [resultJson]);

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
      setLoadingMessage("후처리 중...");

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
        setLoadingMessage("저장 완료되었습니다!");
        await refreshHistory();

        setTimeout(() => {
          setShowLoading(false);
          navigate("/");
        }, 3000);
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
        <h1 className="page-title">실시간 변환 결과</h1>
        <div className="action-buttons">
          <button className="convert-btn" onClick={() => navigate("/")}>
            홈으로
          </button>
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
                totalImages={imageUrls.length}
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
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
