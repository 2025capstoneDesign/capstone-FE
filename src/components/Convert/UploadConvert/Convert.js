//src/components/Convert/UploadConvert/Convert.js
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/TestPage.css";
import FileUploadSection from "./FileUploadSection";
import LoadingSection from "./LoadingSection";
import SummarySection from "./SummarySection";
import { useLoading } from "../../../context/LoadingContext";
import { useHistory } from "../../../context/HistoryContext";
import { useAuth } from "../../../context/AuthContext";
import { showError } from "../../../utils/errorHandler";

function Convert() {
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

  //히스토리 관련 함수
  const { refreshHistory } = useHistory();
  const { isAuthenticated } = useAuth();


  // 로딩이 완료되었는지 확인하고 결과 페이지로 이동
  useEffect(() => {
    if (loading === false && convertedData !== null) {
      // jobId 추출: convertedData.jobId, pdfFile.jobId 등에서 우선적으로 찾기
      let jobId = null;
      if (convertedData && convertedData.jobId) jobId = convertedData.jobId;
      else if (pdfFile && pdfFile.jobId) jobId = pdfFile.jobId;
      else if (convertedData && convertedData.id) jobId = convertedData.id;
      else if (pdfFile && pdfFile.id) jobId = pdfFile.id;
      // 필요시 추가 필드도 확인

      navigate("/test", {
        state: {
          pdfFile: pdfFile,
          pdfData: convertedData,
          jobId: jobId,
        },
      });

      refreshHistory();
      setConvertedData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, convertedData, navigate, pdfFile]);

  // History 관련 코드는 HistoryContext로 이동되었습니다.

  // Display error if processing failed
  useEffect(() => {
    if (processingError) {
      setError(processingError);
    }
  }, [processingError]);

  //파일 업로드 함수
  const handleFileUpload = async (event) => {
    // 업로드된 파일 배열 생성
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

  //변환 버튼 클릭 함수
  const handleConvert = async () => {
    setError("");

    try {
      if (files.length === 0) {
        showError("파일을 업로드해주세요.");
        return;
      }

      // 파일 타입 분류
      let audioFile = null;
      let docFile = null;

      for (const file of files) {
        const extension = file.name.split(".").pop().toLowerCase();
        if (["mp3", "wav"].includes(extension)) {
          audioFile = file;
        } else if (
          ["ppt", "pptx", "pdf", "doc", "docx"].includes(extension)
        ) {
          docFile = file;
        }
      }

      if (!docFile) {
        showError("문서 파일(PDF, PPT, DOC)을 업로드해주세요.");
        setError("문서 파일(PDF, PPT, DOC)을 업로드해주세요.");
        return;
      }

      // 로딩 시작 (LoadingContext에서 API 호출 처리)
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
        <h2 className="page-title">강의록 변환</h2>
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
          {loading ? (
            <LoadingSection />
          ) : (
            <FileUploadSection
              files={files}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
              handleDelete={handleDelete}
              handleConvert={handleConvert}
              isLoading={loading}
            />
          )}
        </div>

        <SummarySection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
        />
      </div>
    </div>
  );
}

export default Convert;