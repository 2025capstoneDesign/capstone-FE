import React, { useCallback } from "react";
import word_icon from "../../../assets/images/docx.png";
import pdf_icon from "../../../assets/images/pdf.png";
import ppt_icon from "../../../assets/images/ppt.png";
import mp3_icon from "../../../assets/images/mp3.png";
import wav_icon from "../../../assets/images/wav.png";
import upload_icon from "../../../assets/images/upload_image.png";

function FileUploadSection({
  files,
  fileInputRef,
  handleFileUpload,
  handleDelete,
  handleConvert,
  isLoading,
}) {
  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        handleFileUpload({ target: { files: event.dataTransfer.files } });
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
      case "m4a":
        return mp3_icon;
      case "wav":
        return wav_icon;
      default:
        return upload_icon;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100%-3.5rem)]">
      {/* 왼쪽 업로드 영역 */}
      <div className="flex-1 p-[5%] flex flex-col">
        <h2 className="text-[1.4rem] font-semibold my-[3vh] text-center">
          강의록과 음성을 업로드하여 요약된 필기 내용을 확인해보세요
        </h2>
        <div
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
            accept=".doc,.docx,.pdf,.ppt,.pptx,.mp3,.wav, .m4a"
          />
          <div className="w-full lg:w-[70%] h-[22vh] mx-auto border-4 border-[#DEE5E5] rounded-xl flex flex-col justify-center items-center cursor-pointer hover:border-[#5B7F7C] transition-colors bg-[#F9F7F7]">
            <div className="mb-[0.8rem]">
              <img
                src={upload_icon}
                alt="업로드"
                className="w-[7rem] h-[5rem]"
              />
            </div>
            <p className="text-gray-500 text-[1.2rem] pt-[0.6rem] text-center px-[1rem]">
              <span className="text-[#5B7F7C] font-semibold">드래그</span>
              하거나 <span className="text-[#5B7F7C] font-semibold">클릭</span>
              하여 파일을 업로드 하세요
            </p>
          </div>
        </div>

        {/* 파일 형식 아이콘들 */}
        <div className="py-[1.5rem] w-full lg:w-[75%] mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <span className="text-[1.1rem] text-[#455E5C] font-semibold border-b-4 border-[#DEE5E5] px-[1rem] py-[0.25rem]">
              강의록
            </span>
            <span className="text-[1.1rem] text-[#455E5C] font-semibold border-b-4 border-[#DEE5E5] px-[1rem] py-[0.25rem]">
              음성
            </span>

            <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-[1rem]">
              <img
                src={pdf_icon}
                alt="PDF"
                className="w-[2.5rem] h-[2.5rem] object-fit"
              />
              <span className="text-sm">PDF</span>
            </div>
            <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-[1rem]">
              <img
                src={wav_icon}
                alt="WAV"
                className="w-[2.5rem] h-[2.5rem] object-fit"
              />
              <span className="text-sm">WAV</span>
            </div>

            <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-[1rem]">
              <img
                src={ppt_icon}
                alt="PPT"
                className="w-[2.5rem] h-[2.5rem] object-fit"
              />
              <span className="text-sm">PPT</span>
            </div>
            <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-[1rem]">
              <img
                src={mp3_icon}
                alt="MP3"
                className="w-[2.5rem] h-[2.5rem] object-fit"
              />
              <span className="text-sm">MP3</span>
            </div>

            <div className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-[1rem]">
              <img
                src={word_icon}
                alt="Word"
                className="w-[2.5rem] h-[2.5rem] object-fit"
              />
              <span className="text-sm">Word</span>
            </div>
          </div>
        </div>

        {/* 변환하기 버튼 */}
        <div className="flex justify-end mb-4 relative -top-14">
          <button
            className="bg-[#5B7F7C] text-white font-semibold py-2 px-4 rounded-lg my-5"
            onClick={handleConvert}
            disabled={isLoading}
          >
            {isLoading ? "변환 중..." : "변환하기"}
          </button>
        </div>
      </div>

      {/* 오른쪽 업로드된 파일 목록 */}
      <div className="w-full lg:w-[33%] p-[1rem] border-t lg:border-t-0 lg:border-l border-gray-200">
        {files.length === 0 ? (
          <div className="text-center text-[1.2rem] text-gray-500 my-[3rem]">
            아직 업로드된 파일이 없습니다
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.name}
              className="flex items-center p-[1rem] rounded-lg bg-white border border-gray-200 shadow-sm mb-[0.5rem] transition-colors"
            >
              <img
                src={getFileIcon(file.name)}
                alt="파일 아이콘"
                className="w-[2rem] h-[2rem] mr-[1rem]"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[1rem] font-medium text-gray-800 truncate">
                  {file.name}
                </div>
                <div className="text-[0.9rem] text-gray-500">
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
  );
}

export default FileUploadSection;
