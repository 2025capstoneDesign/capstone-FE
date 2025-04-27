import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import word_icon from "../../assets/images/docx.png";
import pdf_icon from "../../assets/images/pdf.png";
import ppt_icon from "../../assets/images/ppt.png";
import mp3_icon from "../../assets/images/mp3.png";
import wav_icon from "../../assets/images/wav.png";
import "../../css/Convert2.css";

function Convert2() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return null;
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return pdf_icon;
      case "doc":
      case "docx":
        return word_icon;
      case "ppt":
      case "pptx":
        return ppt_icon;
      case "mp3":
        return mp3_icon;
      case "wav":
        return wav_icon;
      default:
        return null;
    }
  };

  const simulateFileUpload = useCallback((file) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(resolve, 300);
        }
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: progress,
        }));
      }, 100);
    });
  }, []);

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    if (uploadedFiles.length === 0) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    for (const file of uploadedFiles) {
      if (files.some((existingFile) => existingFile.name === file.name)) {
        continue;
      }

      setFiles((prevFiles) => [
        ...prevFiles,
        {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadComplete: false,
        },
      ]);

      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 0,
      }));

      await simulateFileUpload(file);

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.name === file.name ? { ...f, uploadComplete: true } : f
        )
      );
    }
  };

  const handleDelete = useCallback((fileToDelete) => {
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileToDelete.name)
    );
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileToDelete.name];
      return newProgress;
    });
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: event.dataTransfer.files } });
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleConvert = () => {
    navigate("/test", { state: { pdfFile: "/sample3.pdf" } });
  };

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h1 className="page-title">강의록 변환</h1>
        <div className="action-buttons">
          <button className="convert-btn" onClick={handleConvert}>
            변환하기
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="upload-container">
          <div className="upload-header"></div>

          <div
            className="upload-area"
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept=".doc,.docx,.pdf,.ppt,.pptx,.mp3,.wav"
            />
            <div className="upload-box"></div>
          </div>
        </div>

        <div className="file-list-container">
          <div className="file-list-header">
            <h3 className="file-list-title">업로드된 파일</h3>
          </div>

          <div className="file-list">
            {files.map((file) => (
              <div key={file.name} className="file-item">
                <img
                  src={getFileIcon(file.name)}
                  alt="파일 아이콘"
                  className="file-icon"
                />
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                </div>
                <div className="file-actions">
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Convert2;
