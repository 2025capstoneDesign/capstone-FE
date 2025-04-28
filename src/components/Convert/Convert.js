import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import word_icon from "../../assets/images/docx.png";
import pdf_icon from "../../assets/images/pdf.png";
import ppt_icon from "../../assets/images/ppt.png";
import mp3_icon from "../../assets/images/mp3.png";
import wav_icon from "../../assets/images/wav.png";
import upload_icon from "../../assets/images/upload_image.png";
import axios from "axios";

function Convert() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("ai"); // "ai" or "voice"

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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    for (const file of uploadedFiles) {
      if (files.some((existingFile) => existingFile.name === file.name)) {
        continue;
      }

      setFiles((prevFiles) => [
        ...prevFiles,
        file, // 실제 File 객체를 저장
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

  const handleConvert = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (process.env.REACT_APP_API_URL === "mock") {
        // mock 모드일 경우
        if (files.length === 0) {
          // 파일이 없을 경우 sample3.pdf 사용
          navigate("/test", { state: { pdfFile: "/sample3.pdf" } });
        } else {
          // 파일이 있을 경우 업로드된 파일 사용
          navigate("/test", { state: { pdfFile: files[0] } });
        }
      } else {
        // 실제 API 호출 시에는 파일 업로드 필수
        if (files.length === 0) {
          window.alert("파일을 업로드해주세요.");
          setIsLoading(false);
          return;
        }

        // 실제 API 호출 - 첫 번째 파일만 업로드
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

        // 200 응답이면 성공으로 간주
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
    <div className="flex flex-col min-h-screen w-full mt-[70px]">
      <div className="flex justify-between items-center px-5">
        <h2 className="text-[42px] font-semibold text-center mx-12 my-4">강의록 변환</h2>
      </div>

      {error && (
        <div className="text-red-500 mx-5 my-2">
          {error}
        </div>
      )}

      <div className="flex flex-1 px-12 gap-6">
        {/* 왼쪽 업로드 영역 */}
        <div className="flex-[3] relative bg-white rounded-xl overflow-hidden h-[950px] shadow-md">
          <div className="flex items-center p-4 bg-[#fffaec] border-b border-gray-200 h-14">
          </div>

          <div className="flex h-[calc(100%-3.5rem)]">
            {/* 왼쪽 업로드 영역 */}
            <div className="flex-1 p-10 flex flex-col">
              <h2 className="text-2xl font-semibold my-12">강의록과 음성을 업로드하여 요약된 필기 내용을 확인해보세요</h2>
              <div
                // className="flex-1"
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
                <div className="w-3/4 h-[360px] mx-auto border-4 border-[#DEE5E5] rounded-xl flex flex-col justify-center items-center cursor-pointer hover:border-[#5B7F7C] transition-colors bg-[#F9F7F7]">
                  <div className="mb-4">
                    <img src={upload_icon} alt="업로드" className="w-56 h-36" />
                  </div>
                  <p className="text-gray-500 text-xl pt-8">
                  강의록 파일을 이곳에 <span className="text-[#5B7F7C] font-semibold">드래그</span>하거나 <span className="text-[#5B7F7C] font-semibold">클릭</span>하여 업로드하세요
                  </p>
                </div>
              </div>

              {/* 파일 형식 아이콘들 */}
              <div className="py-6 w-3/4 mx-auto">
      
                <div className="grid grid-cols-2 gap-4 ">
                  {/* <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg"> */}
                    <span className="text-lg text-[#455E5C] font-semibold border-b-4 border-[#DEE5E5] px-4 py-1">강의록</span>
                  {/* </div> */}
                  {/* <div className="flex flex-col items-center gap-2 border-3 border-gray-200 rounded-lg"> */}
                    <span className="text-lg text-[#455E5C] font-semibold border-b-4 border-[#DEE5E5] px-4 py-1">음성</span>
                  {/* </div> */}

                  <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-4">
                    <img src={word_icon} alt="Word" className="w-10 h-10 object-fit" />
                    <span className="text-sm">Word</span>
                  </div>
                  <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-4">
                    <img src={wav_icon} alt="WAV" className="w-10 h-10 object-fit" />
                    <span className="text-sm">WAV</span>
                  </div>

                  <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-4">
                    <img src={ppt_icon} alt="PPT" className="w-10 h-10 object-fit" />
                    <span className="text-sm">PPT</span>
                  </div>
                  <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-4">
                    <img src={mp3_icon} alt="MP3" className="w-10 h-10 object-fit" />
                    <span className="text-sm">MP3</span>
                  </div>

                  <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-4">
                    <img src={pdf_icon} alt="PDF" className="w-10 h-10 object-fit" />
                    <span className="text-sm">PDF</span>
                  </div>
                </div>
              </div>

              {/* 변환하기 버튼 */}
              <div className="flex justify-end mt-auto">
                <button
                  className="bg-[#5B7F7C] text-white px-8 py-3 rounded-full text-xl hover:bg-[#455E5C] transition-colors disabled:opacity-50"
                  onClick={handleConvert}
                  disabled={isLoading}
                >
                  {isLoading ? "변환 중..." : "변환하기"}
                </button>
              </div>
            </div>

            {/* 오른쪽 업로드된 파일 목록 */}
            <div className="w-[550px] p-5 border-l border-gray-200">
              {files.length === 0 ? (
                <div className="text-center text-xl text-gray-500 my-12">
                  아직 업로드된 파일이 없습니다
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.name} className="flex items-center p-4 rounded-lg bg-white border border-gray-200 shadow-sm mb-2 transition-colors">
                    <img
                      src={getFileIcon(file.name)}
                      alt="파일 아이콘"
                      className="w-8 h-8 mr-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-medium text-gray-800 truncate">
                        {file.name}
                      </div>
                      <div className="text-md text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                      {uploadProgress[file.name] < 100 && (
                        <div className="mt-1">
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#5B7F7C] transition-all duration-200"
                              style={{ width: `${uploadProgress[file.name]}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file);
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 요약 섹션 */}
        <div className="w-[550px] bg-white rounded-xl shadow-md flex flex-col h-[950px]">
          <div className="tab-container content-tabs">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "ai" ? "active" : ""}`}
                onClick={() => setActiveTab("ai")}
              >
                <p className="text-lg">AI 필기</p>
              </button>
              <button
                className={`tab ${activeTab === "voice" ? "active" : ""}`}
                onClick={() => setActiveTab("voice")}
              >
                <p className="text-lg">음성 원본</p>
              </button>
            </div>
          </div>

          <div className="content-container">
            {activeTab === "ai" ? (
              <div className="ai-content p-6">
                <p className="text-lg text-gray-500">파일을 업로드하고 변환을 시작하면 AI가 작성한 필기를 확인할 수 있습니다.</p>
              </div>
            ) : (
              <div className="voice-content p-6">
                <p className="text-lg text-gray-500">파일을 업로드하고 변환을 시작하면 음성 원본을 확인할 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Convert;
