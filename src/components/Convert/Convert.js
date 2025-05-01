//src/components/Convert/Convert.js

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/TestPage.css";
import FileUploadSection from "./FileUploadSection";
import LoadingSection from "./LoadingSection";
import SummarySection from "./SummarySection";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";
import { parseData } from "../TestPage/DataParser";

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
    progress,
    pdfFile,
    convertedData,
  } = useLoading();

  const { addToHistory } = useHistory();
  const hasAddedToHistory = useRef(false);

  // Check if loading is complete (100%) and navigate to result page
  useEffect(() => {
    if (
      loading === false &&
      progress === 100 &&
      convertedData &&
      !hasAddedToHistory.current
    ) {
      hasAddedToHistory.current = true;
      // Add to history before navigating
      const title =
        typeof pdfFile === "string" ? pdfFile.split("/").pop() : pdfFile.name;
      const size = typeof pdfFile === "string" ? "2.5MB" : pdfFile.size;
      addToHistory(title, pdfFile, convertedData, size);
      console.log("Convert - 변환 완료 후 히스토리에 추가:", {
        title,
        pdfFile,
        convertedData,
        size,
      });

      // 테스트 페이지로 이동
      navigate("/test", {
        state: {
          pdfFile: pdfFile,
          pdfData: convertedData,
        },
      });
    }
  }, [loading, progress, convertedData, navigate, pdfFile, addToHistory]);

  // Simulate a fetch call for the mock API
  const fetchMockData = async () => {
    return new Promise((resolve) => {
      // Simulate a delay for the loading process (20 seconds)
      setTimeout(() => {
        // Get dummy data
        import("../../data/dummyData").then((module) => {
          const { dummyData } = module;
          const parsedData = parseData(dummyData);
          resolve(parsedData);
        });
      }, 20000);
    });
  };

  // Process real API request
  const processFiles = async (audioFile, docFile) => {
    const formData = new FormData();

    if (audioFile) {
      formData.append("audio_file", audioFile);
    }

    if (docFile) {
      formData.append("doc_file", docFile);
    }

    // Always add skip_transcription = true
    formData.append("skip_transcription", "true");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/process-lecture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        // Parse the response data and get only the Concise Summary Notes
        const data = response.data;
        const parsedData = parseData(data);
        return parsedData;
      }
    } catch (error) {
      console.error("API 요청 실패:", error);
      throw error;
    }
  };

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
      if (process.env.REACT_APP_API_URL === "mock") {
        if (files.length === 0) {
          // Start loading with sample3.pdf
          const pdfFileObj = "/sample3.pdf";
          startLoading([], pdfFileObj);

          // Fetch mock data
          const result = await fetchMockData();

          // Stop loading with the result
          stopLoading(result);
        } else {
          // Start loading with the first file
          const pdfFileObj = files[0];
          startLoading(files, pdfFileObj);

          // Fetch mock data
          const result = await fetchMockData();

          // Stop loading with the result
          stopLoading(result);
        }
      } else {
        if (files.length === 0) {
          window.alert("파일을 업로드해주세요.");
          return;
        }

        // Categorize files by type
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

        // Start loading with the files
        startLoading(files, docFile || files[0]);

        // Process files with the API
        try {
          const result = await processFiles(audioFile, docFile);
          stopLoading(result);
        } catch (error) {
          console.error("변환 실패:", error);
          window.alert("파일 변환에 실패했습니다. 다시 시도해주세요.");
          stopLoading(null);
        }
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
