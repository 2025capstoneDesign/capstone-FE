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
  // 방금 변환이 완료되었는지 추적하는 state
  const [conversionJustCompleted, setConversionJustCompleted] = useState(false);
  // 이 컴포넌트에서 변환 결과를 처리했는지 추적하는 ref
  const processedConversion = useRef(false);
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

  // Convert 컴포넌트가 마운트될 때 상태 처리
  useEffect(() => {
    // Debug logs
    console.log("Convert 컴포넌트 마운트됨");
    console.log("현재 convertedData 상태:", convertedData);
    console.log("현재 loading 상태:", loading);
    console.log("processedConversion:", processedConversion.current);

    // 로딩 중이 아닐 때만 상태 초기화 (변환이 끝난 후에만)
    if (!loading) {
      console.log("로딩 중 아님, 상태 초기화 진행");

      // 강제로 convertedData 초기화
      setConvertedData(null);

      // 매우 중요: 의도적으로 true로 설정하여 navigation을 방지
      setConversionJustCompleted(true);
      // 이미 처리되었음을 표시
      processedConversion.current = true;

      console.log("상태 완전히 초기화 완료, 자동 탐색 방지됨");
    } else {
      console.log("로딩 중, 상태 초기화 건너뜀");
    }

    // 컴포넌트 언마운트 시 정리 함수
    return () => {
      console.log("Convert 컴포넌트 언마운트, 상태 정리");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 로딩이 완료되었는지 확인하고 결과 페이지로 이동
  useEffect(() => {
    console.log("navigation effect 실행됨");
    console.log(
      "loading:",
      loading,
      "convertedData:",
      convertedData ? "있음" : "없음"
    );
    console.log("conversionJustCompleted:", conversionJustCompleted);
    console.log("processedConversion:", processedConversion.current);

    // 모든 조건을 엄격하게 검증:
    // 1. 로딩이 완료됨
    // 2. 변환 데이터가 있음
    // 3. 이미 처리된 상태가 아님 (conversionJustCompleted가 false)
    // 4. 이 컴포넌트에서 이미 처리하지 않았음 (processedConversion.current가 false)
    if (
      loading === false &&
      convertedData &&
      !conversionJustCompleted &&
      !processedConversion.current
    ) {
      console.log("navigation 조건 충족, 테스트 페이지로 이동");

      // 이미 처리했음을 표시
      setConversionJustCompleted(true);
      processedConversion.current = true;

      // 테스트 페이지로 이동
      let pdfBlobUrl = pdfFile;

      // 히스토리에 결과를 직접 추가하지 않고 navigate만 수행
      // 히스토리 저장 로직은 별도 함수로 분리하여 수행
      navigate("/test", {
        state: {
          pdfFile: pdfBlobUrl,
          pdfData: convertedData,
        },
      });

      // 히스토리 새로고침 호출
      refreshHistory();
    } else {
      console.log("navigation 조건 미충족, 이동하지 않음");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, convertedData, navigate, pdfFile, conversionJustCompleted]);

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

    // 변환 상태 추적 변수 리셋
    setConversionJustCompleted(false);
    // 변환 처리 상태 초기화
    processedConversion.current = false;
    // 이전 변환 결과 초기화 (다음 변환을 준비)
    setConvertedData(null);
    console.log("handleConvert: 모든 상태 완전히 리셋됨");

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