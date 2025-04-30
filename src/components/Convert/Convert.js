import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/TestPage.css";
import FileUploadSection from "./FileUploadSection";
import SummarySection from "./SummarySection";

function Convert() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("ai");
  const [highlightColor, setHighlightColor] = useState("red");

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
    setIsLoading(true);
    setError("");

    try {
      if (process.env.REACT_APP_API_URL === "mock") {
        if (files.length === 0) {
          navigate("/test", { state: { pdfFile: "/sample3.pdf" } });
        } else {
          navigate("/test", { state: { pdfFile: files[0] } });
        }
      } else {
        if (files.length === 0) {
          window.alert("파일을 업로드해주세요.");
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        const fileToUpload = files[0];
        formData.append("file", fileToUpload);

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/lecture/upload-lecture-file`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          window.alert("파일이 성공적으로 업로드되었습니다.");
          navigate("/test", { state: { pdfFile: fileToUpload } });
        }
      }
    } catch (error) {
      console.error("업로드 실패:", error);
      window.alert("파일 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h2 className="page-title">강의록 변환</h2>
      </div>

      {error && <div className="text-red-500 mx-[5%] my-[0.5rem]">{error}</div>}

      <div className="main-content mx-[25px]">
        <div className="slide-container">
          <div className="slide-header"></div>
          <FileUploadSection
            files={files}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            handleDelete={handleDelete}
            handleConvert={handleConvert}
            isLoading={isLoading}
          />
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
