import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/TestPage.css";
import RealTimeFileUploadSection from "./RealTimeFileUploadSection";
import RealTimeSummarySection from "./RealTimeSummarySection";
import { useLoading } from "../../../context/LoadingContext";
import { useHistory } from "../../../context/HistoryContext";
import { useAuth } from "../../../context/AuthContext";
import { showError } from "../../../utils/errorHandler";

function RealTimeConvert() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("ai");
  const [highlightColor, setHighlightColor] = useState("red");
  const {
    loading,
    startLoading,
    stopLoading,
    pdfFile,
    convertedData,
    processingError,
    setConvertedData,
  } = useLoading();

  const { refreshHistory } = useHistory();
  const { isAuthenticated } = useAuth();

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
  }, [loading, convertedData, navigate, pdfFile]);

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

      let audioFile = null;
      let docFile = null;

      for (const file of files) {
        const extension = file.name.split(".").pop().toLowerCase();
        if (["mp3", "wav"].includes(extension)) {
          audioFile = file;
        } else if (["ppt", "pptx", "pdf", "doc", "docx"].includes(extension)) {
          docFile = file;
        }
      }

      if (!docFile) {
        showError("문서 파일(PDF, PPT, DOC)을 업로드해주세요.");
        setError("문서 파일(PDF, PPT, DOC)을 업로드해주세요.");
        return;
      }

      startLoading(files, docFile);
    } catch (error) {
      console.error("변환 실패:", error);
      showError("파일 변환에 실패했습니다. 다시 시도해주세요.");
      stopLoading(null);
    }
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
          <RealTimeFileUploadSection
            files={files}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            handleDelete={handleDelete}
            handleConvert={handleConvert}
            isLoading={loading}
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
