import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/TestPage.css";
import RealTimeFileUploadSection from "./RealTimeFileUploadSection";
import RealTimeSummarySection from "./RealTimeSummarySection";
import { useLoading } from "../../../context/LoadingContext";
import { useHistory } from "../../../context/HistoryContext";
import { showError } from "../../../utils/errorHandler";
import PdfViewer from "../../TestPage/PdfViewer";
import axios from "axios";

function RealTimeConvert() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("ai");
  const [highlightColor, setHighlightColor] = useState("red");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

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
        // pdf 파일 업로드 후 실시간 변환 시작
        const response = await startRealTime(docFile);

        if (response.jobId) {
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
      }
    } catch (error) {
      console.error("변환 실패:", error);
      showError("파일 변환에 실패했습니다. 다시 시도해주세요.");
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
      <div className="sub-header">
        <h2 className="page-title">실시간 변환</h2>
        <div className="action-buttons">
          <button className="convert-btn" onClick={() => navigate("/")}>
            홈으로
          </button>
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
