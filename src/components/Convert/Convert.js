//src/components/Convert/Convert.js

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/TestPage.css";
import FileUploadSection from "./FileUploadSection";
import LoadingSection from "./LoadingSection";
import SummarySection from "./SummarySection";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";
import useBlobUrlManager from "../../hooks/useBlobUrlManager";

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
  } = useLoading();

  //히스토리 결과 추가 함수
  const { addToHistory } = useHistory();
  //Blob URL 생성 함수
  const { createBlobUrl } = useBlobUrlManager();

  // 로딩이 완료되었는지 확인하고 결과 페이지로 이동
  useEffect(() => {
    if (loading === false && convertedData) {
      let pdfBlobUrl = pdfFile;
      let fileTitle;
      let fileSize;

      // pdfFile이 File 객체인 경우 Blob URL로 변환
      if (pdfFile instanceof File) {
        pdfBlobUrl = createBlobUrl(pdfFile);
        fileTitle = pdfFile.name;
        fileSize = pdfFile.size;
      } else {
        // pdfFile이 이미 문자열(Blob URL 또는 정적 경로)인 경우
        fileTitle =
          typeof pdfFile === "string"
            ? pdfFile.split("/").pop()
            : "Unnamed File";
        fileSize = typeof pdfFile === "string" ? "2.5MB" : "Unknown";
      }

      // 히스토리에 결과 추가
      addToHistory(fileTitle, pdfBlobUrl, convertedData, fileSize);
      console.log("Convert - 변환 완료 후 히스토리에 추가:", {
        title: fileTitle,
        pdfFile: pdfBlobUrl,
        convertedData,
        size: fileSize,
      });

      // 테스트 페이지로 이동
      navigate("/test", {
        state: {
          pdfFile: pdfBlobUrl,
          pdfData: convertedData,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, convertedData, navigate, pdfFile]);

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
      if (process.env.REACT_APP_API_URL === "mock") {
        // 모크 모드일 때는 sample3.pdf 파일 사용
        const pdfFileObj = "/sample3.pdf";

        if (files.length === 0) {
          // 파일 없을 경우 샘플 PDF만 사용
          startLoading([], pdfFileObj);
        } else {
          // 파일 있을 경우 업로드된 파일 사용
          startLoading(files, files[0]);
        }
      } else {
        // 실제 API 사용 모드
        if (files.length === 0) {
          window.alert("파일을 업로드해주세요.");
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
          setError("문서 파일(PDF, PPT, DOC)을 업로드해주세요.");
          return;
        }

        // 로딩 시작 (LoadingContext에서 API 호출 처리)
        startLoading(files, docFile);
      }
    } catch (error) {
      console.error("변환 실패:", error);
      window.alert("파일 변환에 실패했습니다. 다시 시도해주세요.");
      stopLoading(null);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h2 className="page-title">강의록 변환</h2>
        <div className="action-buttons">
          <button className="convert-btn" onClick={() => navigate("/")}>
            홈으로
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mx-[5%] my-[0.5rem]">{error}</div>}

      <div className="main-content mx-[25px]">
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
