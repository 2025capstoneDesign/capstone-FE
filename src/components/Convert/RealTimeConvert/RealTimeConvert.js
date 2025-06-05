import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/TestPage.css";
import RealTimeFileUploadSection from "./RealTimeFileUploadSection";
import RealTimeSummarySection from "./RealTimeSummarySection";
import { useLoading } from "../../../context/LoadingContext";
import { useHistory } from "../../../context/HistoryContext";
import { showError } from "../../../utils/errorHandler";
import PdfViewer from "../../RealTimePage/PdfViewer";
import axios from "axios";
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
  const [loadingMessage, setLoadingMessage] = useState("실시간 변환을 시작하는 중...");

  const API_URL = process.env.REACT_APP_API_URL;

  // Modal state
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");

  // Modal messages
  const PROCESSING_MESSAGES = {
    STOPPING: "실시간 변환을 종료하는 중...",
    GENERATING: "슬라이드 이미지를 생성하는 중...",
  };

  // 실시간 변환은 로그인 없이 사용 가능 (백엔드 완성 전 테스트용)
  // useEffect(() => {
  //   const token = localStorage.getItem("accessToken");
  //   if (!token) {
  //     navigate("/login");
  //   }
  // }, [navigate]);

  // 실시간 변환 요청
  const startRealTime = async (pdfFile = null) => {
    try {
      const formData = new FormData();

      if (pdfFile) {
        formData.append("doc_file", pdfFile);
      }

      const headers = { "Content-Type": "multipart/form-data" };

      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_URL}/api/realTime/start-realtime`,
        pdfFile ? formData : {},
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error starting real-time process:", error);
      throw error;
    }
  };

  // 실시간 변환 종료 요청
  const stopRealTime = async (jobId) => {
    try {
      const headers = {};

      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_URL}/api/realTime/stop-realtime?jobId=${jobId}`,
        {},
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error stopping real-time process:", error);
      throw error;
    }
  };

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
        const response = await startRealTime(docFile);

        if (response.jobId) {
          setShowLoading(false);
          // 실시간 페이지로 이동
          navigate("/real-time-page", {
            state: {
              pdfFile: URL.createObjectURL(docFile),
              pdfData: {
                summaryData: {},
                voiceData: {},
              },
              jobId: response.jobId,
              isRealTimeMode: true,
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
      
      {/* Processing Modal */}
      {showProcessingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center">
            <img 
              src="/loading_listen.gif" 
              alt="처리 중" 
              className="w-[200px] h-[200px] object-contain mb-4"
            />
            <p className="text-gray-700 text-lg font-medium">{processingMessage}</p>
          </div>
        </div>
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
              className="w-[800px] object-contain"
            />
          </div>
          <div className="w-[300px] flex justify-end">
            <button className="convert-btn whitespace-nowrap" onClick={() => navigate("/")}>
              홈으로
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 mx-[5%] my-[0.5rem]">{error}</div>}

      <div className="main-content">
        <div className="slide-container">
          <div className="slide-header"></div>
          {files.length > 0 &&
            files.find((file) => file.name.toLowerCase().endsWith(".pdf")) && (
              <PdfViewer
                pdfUrl={URL.createObjectURL(
                  files.find((file) => file.name.toLowerCase().endsWith(".pdf"))
                )}
                pageNumber={pageNumber}
                numPages={numPages}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                onDocumentLoadError={onDocumentLoadError}
                goPrevPage={goPrevPage}
                goNextPage={goNextPage}
              />
            )}
          <RealTimeFileUploadSection
            files={files}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            handleDelete={handleDelete}
            handleConvert={handleConvert}
            isLoading={false}
          />
        </div>

        <RealTimeSummarySection
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
