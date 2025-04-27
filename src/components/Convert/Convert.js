import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import word_icon from "../../assets/images/docx.png";
import pdf_icon from "../../assets/images/pdf.png";
import ppt_icon from "../../assets/images/ppt.png";
import mp3_icon from "../../assets/images/mp3.png";
import wav_icon from "../../assets/images/wav.png";
import upload_icon from "../../assets/images/upload_image.png";

function Convert() {
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
    if (!fileName) return upload_icon;
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
        return upload_icon;
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

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    for (const file of uploadedFiles) {
      // 이미 존재하는 파일은 건너뛰기
      if (files.some((existingFile) => existingFile.name === file.name)) {
        continue;
      }

      // 먼저 파일을 목록에 추가
      setFiles((prevFiles) => [
        ...prevFiles,
        {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadComplete: false,
        },
      ]);

      // 초기 진행률 설정
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 0,
      }));

      // 업로드 시뮬레이션
      await simulateFileUpload(file);

      // 업로드 완료 후 상태 업데이트
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
    // TestPage로 이동
    navigate("/test", { state: { pdfFile: "/sample3.pdf" } });
  };

  return (
    <div className="min-w-[1280px] mx-16 m-auto py-12">
      <div className="mb-8">
        <h1 className="text-5xl font-bold mx-4">강의록 변환</h1>
      </div>

      <div className="flex gap-8 flex-1 min-h-[900px]">
        {/* 왼쪽 파일 업로드 섹션 */}
        <div className="flex-1 border-4 border-gray-100 rounded-xl p-16 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-medium">
              강의록과 음성을 업로드하여 요약된 필기 내용을 확인해보세요
            </h2>
            <button
              className="bg-[#5B7F7C] text-white px-8 py-3 rounded-full font-[350] text-xl hover:bg-[#455E5C] transition-colors"
              onClick={handleConvert}
            >
              변환하기
            </button>
          </div>

          <div className="flex gap-8 flex-1">
            {/* 왼쪽 업로드 영역 */}
            <div className="flex-1 flex flex-col h-[450px]">
              {/* 파일 업로드 영역 */}
              <div
                className="flex-1 bg-[#F9F7F7] border-4 border-[#DEE5E5] rounded-xl p-8 text-center cursor-pointer hover:border-[#5B7F7C] transition-colors flex flex-col items-center justify-center"
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
                <div className="mb-4">
                  <img src={upload_icon} alt="업로드" className="w-56 h-36" />
                </div>
                <p className="text-gray-500 text-bold-md text-lg">
                  <span className="text-[#5B7F7C]">클릭</span>하여 파일을
                  업로드하세요
                </p>
              </div>

              {/* 파일 형식 아이콘들 */}
              <div className="grid grid-flow-col grid-cols-5 gap-4 my-12">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img
                      src={word_icon}
                      alt="Word"
                      className="w-12 h-12 object-contain"
                    />
                    <span>Word</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img
                      src={pdf_icon}
                      alt="PDF"
                      className="w-12 h-12 object-contain"
                    />
                    <span>PDF</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img
                      src={ppt_icon}
                      alt="PPT"
                      className="w-12 h-12 object-contain"
                    />
                    <span>PPT</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img
                      src={wav_icon}
                      alt="WAV"
                      className="w-12 h-12 object-contain"
                    />
                    <span>WAV</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img
                      src={mp3_icon}
                      alt="MP3"
                      className="w-12 h-12 object-contain"
                    />
                    <span>MP3</span>
                  </div>
                </div>

                {/* <div className="flex gap-36">
                  <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img src={word_icon} alt="Word" className="w-12 h-12 object-contain" />
                    <span>Word</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img src={wav_icon} alt="WAV" className="w-12 h-12 object-contain" />
                    <span>WAV</span>
                  </div>
                </div>

                <div className="flex gap-36">
                  <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img src={pdf_icon} alt="PDF" className="w-12 h-12 object-contain" />
                    <span>PDF</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img src={mp3_icon} alt="MP3" className="w-12 h-12 object-contain" />
                    <span>MP3</span>
                  </div>
                </div>

                <div className="flex">
                <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg p-4">
                    <img src={ppt_icon} alt="PPT" className="w-12 h-12 object-contain" />
                    <span>PPT</span>
                  </div>
                </div> */}
              </div>
            </div>

            {/* 오른쪽 업로드된 파일 목록 */}
            <div className="w-[600px] bg-white border-4 border-[#DEE5E5] rounded-xl p-4 overflow-y-auto">
              {files.map((file) => (
                <div key={file.name} className="mb-4">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-4 p-4">
                      <div className="w-8 h-8">
                        <img
                          src={getFileIcon(file.name)}
                          alt="파일 아이콘"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium truncate">
                              {file.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                          <button
                            className="text-gray-400 hover:text-gray-800 transition-colors"
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
                        {/* 프로그레스 바 */}
                        <div className="mt-2">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#5B7F7C] transition-all duration-300 ease-out"
                              style={{
                                width: `${uploadProgress[file.name] || 0}%`,
                                transition: "width 0.3s ease-out",
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1 text-right">
                            {uploadProgress[file.name] || 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 요약 섹션 */}
        <div className="w-[500px] bg-white rounded-xl p-6 border-4 border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">SUMMARY</h3>
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Convert;
