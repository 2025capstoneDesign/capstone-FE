//src/context/LoadingContext.js

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import processService from "../api/processService";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0); // 0: 강의 듣는 중, 1: 요약 정리 중, 2: 필기 생성 중
  const [statusMessage, setStatusMessage] = useState("");
  const [convertedData, setConvertedData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [processingError, setProcessingError] = useState(null);

  // 강의 변환 중인지 확인하는 플래그
  const isProcessing = useRef(false);

  // 로딩이 시작될 때 진행 상태 초기화
  useEffect(() => {
    if (loading) {
      setProgress(0);
      setCurrentStage(0);
      setStatusMessage("");
      setProcessingError(null);
    }
  }, [loading]);

  // 진행 상태에 따라 현재 단계 업데이트
  useEffect(() => {
    if (!loading) return;

    // 진행 상태에 따라 현재 단계 업데이트
    if (progress < 30) {
      setCurrentStage(0); // Listening stage
    } else if (progress < 60) {
      setCurrentStage(1); // Summarizing stage
    } else {
      setCurrentStage(2); // Writing stage
    }
  }, [loading, progress]);

  // 컴포넌트가 마운트될 때 작업이 진행 중인 경우 계속 처리
  useEffect(() => {
    if (jobId && isProcessing.current) {
      continueProcessing();
    }

    return () => {
      // 컴포넌트가 언마운트될 때 로딩 상태가 유지되면 계속 처리
      if (loading) {
        isProcessing.current = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLoading = async (files, pdf) => {
    console.log("LoadingContext - startLoading 호출됨");
    console.log("이전 convertedData:", convertedData ? "있음" : "없음");

    // 변환 결과를 초기화하여 Convert 페이지로 돌아갈 때 다시 탐지하지 않도록 함
    setConvertedData(null);
    console.log("LoadingContext - convertedData 초기화됨");
    setLoading(true);
    setUploadedFiles(files);
    isProcessing.current = true;

    // If it's a string (like "/sample3.pdf"), keep it as is
    setPdfFile(pdf);

    try {
      // 업로드된 파일로 강의 변환 시작
      const { job_id } = await processService.startProcess({
        document: files.find(
          (file) =>
            file.type.includes("pdf") || file.type.includes("presentation")
        ),
        audio: files.find((file) => file.type.includes("audio")),
      });

      setJobId(job_id);

      // 진행 상태 확인을 위한 폴링 시작
      continueProcessing(job_id);
    } catch (error) {
      console.error("Error starting process:", error);
      setProcessingError(
        "Failed to start the conversion process. Please try again."
      );
      stopLoading();
    }
  };

  const continueProcessing = async (jId = null) => {
    const currentJobId = jId || jobId;

    if (!currentJobId) {
      console.error("No job ID available for processing");
      return;
    }

    try {
      // 진행 상태 확인을 위한 폴링 시작
      let currentProgress = 0;

      while (currentProgress < 100 && isProcessing.current) {
        try {
          const statusData = await processService.checkProcessStatus(
            currentJobId
          );
          currentProgress = statusData.progress;

          setProgress(currentProgress);
          setStatusMessage(statusData.message || "");

          if (currentProgress === 100) {
            // 강의 변환 완료, 결과 데이터 가져오기
            const resultData = await processService.getProcessResult(
              currentJobId
            );
            console.log("LoadingContext - API 응답 결과:", resultData);

            // API가 직접 객체를 반환하는 경우 (result 필드 없이)
            if (
              resultData &&
              typeof resultData === "object" &&
              (resultData.slide1 || Object.keys(resultData).length > 0)
            ) {
              console.log(
                "LoadingContext - 변환 결과 데이터 수신 성공 (직접 객체)"
              );
              stopLoading(resultData);
            }
            // API가 result 필드 안에 데이터를 반환하는 경우
            else if (resultData && resultData.result) {
              console.log(
                "LoadingContext - 변환 결과 데이터 수신 성공 (result 필드)"
              );
              stopLoading(resultData.result);
            }
            // 데이터가 없거나 예상치 못한 형식인 경우
            else {
              console.error(
                "LoadingContext - 변환 결과 데이터 형식 오류:",
                resultData
              );
              setProcessingError(
                "변환 결과 데이터를 받지 못했습니다. 다시 시도해주세요."
              );
              stopLoading();
            }
            break;
          }

          // 다음 폴링 전 1초 대기
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error("Error checking process status:", error);
          // 3번까지 재시도 후 계속 오류 발생시 처리 중단
          if (error.response && error.response.status === 404) {
            console.error(
              "LoadingContext - 작업을 찾을 수 없음:",
              currentJobId
            );
            setProcessingError(
              "변환 작업을 찾을 수 없습니다. 다시 시도해주세요."
            );
            stopLoading();
            break;
          }
          // 오류가 발생하더라도 계속 폴링 시도 - 서비스가 재시도를 처리함
        }
      }
    } catch (error) {
      console.error("LoadingContext - 처리 흐름 오류:", error);
      setProcessingError(
        "변환 과정에서 오류가 발생했습니다. 다시 시도해주세요."
      );
      stopLoading();
    }
  };

  const stopLoading = (data = null) => {
    console.log("LoadingContext - stopLoading 호출됨");
    console.log("데이터 존재 여부:", data ? "있음" : "없음");

    setProgress(100);
    setLoading(false);
    isProcessing.current = false;

    if (data) {
      console.log("LoadingContext - convertedData 설정됨");
      setConvertedData(data);
    } else {
      console.log("LoadingContext - convertedData 설정 안됨 (null)");
    }
  };

  const cancelProcessing = () => {
    isProcessing.current = false;
    setLoading(false);
    setJobId(null);
    setProgress(0);
    setStatusMessage("");
  };

  // 상태를 완전히 초기화하는 함수 추가
  const resetAllState = () => {
    console.log("LoadingContext - 모든 상태 초기화");
    setLoading(false);
    setProgress(0);
    setCurrentStage(0);
    setStatusMessage("");
    setConvertedData(null);
    setUploadedFiles([]);
    setPdfFile(null);
    setJobId(null);
    setProcessingError(null);
    isProcessing.current = false;
  };

  return (
    <LoadingContext.Provider
      value={{
        loading,
        progress,
        currentStage,
        statusMessage,
        convertedData,
        setConvertedData,
        uploadedFiles,
        pdfFile,
        jobId,
        processingError,
        startLoading,
        stopLoading,
        cancelProcessing,
        resetAllState,
        setProgress,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
