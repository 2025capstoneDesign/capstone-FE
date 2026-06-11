import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/TestPage.css";
import ConvertFileUploadSection from "../ConvertFileUploadSection";
import ConvertSummarySection from "../ConvertSummarySection";
import { useLoading } from "../../../context/LoadingContext";
import { useHistory } from "../../../context/HistoryContext";
import { showError } from "../../../utils/errorHandler";
import LoadingModal from "../../common/LoadingModal";
import PdfViewer from "../../RealTimePage/PdfViewer";
import { realtimeApi } from "../../../api/realtimeApi";
import progress1 from "../../../assets/images/progress_1.png";

function RealTimeConvert() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("ai");
  const [highlightColor, setHighlightColor] = useState("red");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] =
    useState("실시간 변환을 시작하는 중...");

  // Modal state
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");

  // Modal messages
  const PROCESSING_MESSAGES = {
    STOPPING: "녹음을 종료하는 중...",
    GENERATING: "녹음을 종료하는 중...",
  };

  // 실시간 변환은 로그인 없이 사용 가능 (백엔드 완성 전 테스트용)
  // useEffect(() => {
  //   const token = localStorage.getItem("accessToken");
  //   if (!token) {
  //     navigate("/login");
  //   }
  // }, [navigate]);

  // 실시간 변환 결과 처리
  const { loading, pdfFile, convertedData, processingError, setConvertedData } =
    useLoading();

  const { refreshHistory } = useHistory();

  useEffect(() => {
    if (loading === false && convertedData !== null) {
      navigate("/real-time-page", {
        state: {
          pdfFile: pdfFile,
          pdfData: convertedData,
        },
      });

      refreshHistory();
      setConvertedData(null);
    }
  }, [
    loading,
    convertedData,
    navigate,
    pdfFile,
    refreshHistory,
    setConvertedData,
  ]);

  useEffect(() => {
    if (processingError) {
      setError(processingError);
    }
  }, [processingError]);

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    if (uploadedFiles.length === 0) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };

  const handleDelete = useCallback((fileToDelete) => {
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileToDelete.name)
    );
  }, []);

  // 업로드된 PDF 미리보기 URL (기존: 매 렌더마다 createObjectURL → 메모리 누수 + PDF 재로딩)
  const previewPdfFile = useMemo(
    () => files.find((file) => file.name.toLowerCase().endsWith(".pdf")) || null,
    [files]
  );
  const previewPdfUrl = useMemo(
    () => (previewPdfFile ? URL.createObjectURL(previewPdfFile) : null),
    [previewPdfFile]
  );
  useEffect(() => {
    return () => {
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    };
  }, [previewPdfUrl]);

  const handleConvert = async () => {
    setError("");

    try {
      if (files.length === 0) {
        showError("파일을 업로드해주세요.");
        return;
      }

      let docFile = null;

      for (const file of files) {
        const extension = file.name.split(".").pop().toLowerCase();
        if (["ppt", "pptx", "pdf", "doc", "docx"].includes(extension)) {
          docFile = file;
        }
      }

      if (!docFile) {
        showError("문서 파일(PDF, PPT, DOC)을 업로드해주세요.");
        setError("문서 파일(PDF, PPT, DOC)을 업로드해주세요.");
        return;
      }

      try {
        setShowLoading(true);
        setLoadingMessage("실시간 변환을 시작하는 중...");

        // pdf 파일 업로드 후 실시간 변환 시작
        const response = await realtimeApi.startRealTime(docFile);

        // v1 응답은 snake_case job_id (구버전 jobId도 호환 처리)
        const jobId = response.job_id || response.jobId;

        if (jobId) {
          setShowLoading(false);
          // 실시간 페이지로 이동
          navigate("/real-time-page", {
            state: {
              pdfFile: URL.createObjectURL(docFile),
              pdfData: {
                summaryData: {},
                voiceData: {},
              },
              jobId: jobId,
              isRealTimeMode: true,
              showTutorial: true,
            },
          });
        } else {
          throw new Error("JobId not received from server");
        }
      } catch (apiError) {
        console.error("API 요청 실패:", apiError);
        showError("실시간 변환 시작에 실패했습니다. 다시 시도해주세요.");
        setError("실시간 변환 시작에 실패했습니다.");
        setShowLoading(false);
      }
    } catch (error) {
      console.error("변환 실패:", error);
      showError("파일 변환에 실패했습니다. 다시 시도해주세요.");
      setShowLoading(false);
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError(error) {
    console.error("Error loading PDF:", error);
    showError("PDF 로딩 중 오류가 발생했습니다");
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

  return (
    <div className="app-wrapper convert-page">
      {/* Loading Modal */}
      {showLoading && <LoadingModal message={loadingMessage} />}

      {/* Processing Modal */}
      {showProcessingModal && (
        <LoadingModal message={processingMessage} alt="처리 중" />
      )}

      <div className="sub-header">
        <div className="flex items-center w-full">
          <div className="w-[200px] flex items-center">
            <h1 className="text-2xl font-semibold">실시간 변환</h1>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src={progress1}
              alt="진행 상태"
              className="w-full max-w-[800px] object-contain hidden md:block"
            />
          </div>
          <div className="w-[300px] flex justify-end">
            <button
              className="convert-btn whitespace-nowrap"
              onClick={() => navigate("/")}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 mx-[5%] my-[0.5rem]">{error}</div>}

      <div className="main-content">
        <div className="slide-container">
          {/* PdfViewer는 자체 헤더를 가지므로, 미리보기 상태에서는 바깥 헤더를 그리지 않음 (이중 헤더 방지) */}
          {!previewPdfFile && <div className="slide-header"></div>}
          {previewPdfFile ? (
            /* PDF 업로드 후: 미리보기 + 하단 액션 바 (기존: 뷰어와 업로드 영역이 겹쳐 잘림) */
            <>
              <PdfViewer
                pdfUrl={previewPdfUrl}
                pageNumber={pageNumber}
                numPages={numPages}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                onDocumentLoadError={onDocumentLoadError}
                goPrevPage={goPrevPage}
                goNextPage={goNextPage}
              />
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-gray-700 truncate">
                    {previewPdfFile.name}
                  </span>
                  <button
                    className="text-sm text-gray-400 hover:text-gray-700 shrink-0 underline"
                    onClick={() => handleDelete(previewPdfFile)}
                  >
                    파일 제거
                  </button>
                </div>
                <button
                  className="bg-[#5B7F7C] text-white font-semibold py-2 px-4 rounded-lg shrink-0"
                  onClick={handleConvert}
                >
                  실시간 강의 변환
                </button>
              </div>
            </>
          ) : (
            <ConvertFileUploadSection
              mode="realtime"
              files={files}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
              handleDelete={handleDelete}
              handleConvert={handleConvert}
              isLoading={false}
            />
          )}
        </div>

        <ConvertSummarySection
          mode="realtime"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
        />
      </div>
    </div>
  );
}

export default RealTimeConvert;
