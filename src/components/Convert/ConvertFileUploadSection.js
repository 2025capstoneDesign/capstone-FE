import React, { useCallback } from "react";
import word_icon from "../../assets/images/docx.png";
import pdf_icon from "../../assets/images/pdf.png";
import ppt_icon from "../../assets/images/ppt.png";
import mp3_icon from "../../assets/images/mp3.png";
import wav_icon from "../../assets/images/wav.png";
import upload_icon from "../../assets/images/upload_image.png";

/**
 * 변환 페이지 좌측 파일 업로드 영역 (공통)
 *
 * 기존 UploadConvert/FileUploadSection.js 와
 * RealTimeConvert/RealTimeFileUploadSection.js 의 쌍둥이 파일을 통합.
 * 차이점(문구, accept, 지원 형식 목록, 버튼 동작)은 VARIANTS로 분리.
 *
 * mode: "upload" (강의록+음성 변환) | "realtime" (실시간 변환)
 */
const VARIANTS = {
  upload: {
    title: "강의록과 음성을 업로드하여 요약된 필기 내용을 확인해보세요",
    dragTargetLabel: "파일",
    multiple: true,
    accept: ".doc,.docx,.pdf,.ppt,.pptx,.mp3,.wav, .m4a",
    gridColsClass: "grid-cols-2",
    headers: ["강의록", "음성"],
    fileTypes: [
      { icon: pdf_icon, label: "PDF" },
      { icon: wav_icon, label: "WAV" },
      { icon: ppt_icon, label: "PPT" },
      { icon: mp3_icon, label: "MP3" },
      { icon: word_icon, label: "Word" },
    ],
    buttonComment: "변환하기 버튼",
    buttonClassName:
      "bg-[#5B7F7C] text-white font-semibold py-2 px-4 rounded-lg my-5",
    buttonLabel: "변환하기",
    disableWhenEmpty: false,
  },
  realtime: {
    title: "강의록을 업로드하여 실시간 강의를 시작해보세요",
    dragTargetLabel: "강의록",
    multiple: false,
    accept: ".doc,.docx,.pdf,.ppt,.pptx",
    gridColsClass: "grid-cols-1",
    headers: ["지원하는 파일 형식"],
    fileTypes: [
      { icon: pdf_icon, label: "PDF" },
      { icon: ppt_icon, label: "PPT" },
      { icon: word_icon, label: "Word" },
    ],
    buttonComment: "실시간 변환 버튼",
    buttonClassName:
      "bg-[#5B7F7C] text-white font-semibold py-2 px-4 rounded-lg",
    buttonLabel: "실시간 강의 변환",
    disableWhenEmpty: true,
  },
};

function ConvertFileUploadSection({
  mode = "upload",
  files,
  fileInputRef,
  handleFileUpload,
  handleDelete,
  handleConvert,
  isLoading,
}) {
  const variant = VARIANTS[mode];

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
          {variant.title}
        </h2>
        <div
          onClick={handleUploadClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={variant.multiple}
            className="hidden"
            onChange={handleFileUpload}
            accept={variant.accept}
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
              하여 {variant.dragTargetLabel}을 업로드 하세요
            </p>
          </div>
        </div>

        {/* 파일 형식 아이콘들 */}
        <div className="py-[1.5rem] w-full lg:w-[75%] mx-auto">
          <div className={`grid ${variant.gridColsClass} gap-4`}>
            {variant.headers.map((header) => (
              <span
                key={header}
                className="text-[1.1rem] text-[#455E5C] font-semibold border-b-4 border-[#DEE5E5] px-[1rem] py-[0.25rem]"
              >
                {header}
              </span>
            ))}

            {variant.fileTypes.map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-row items-center gap-2 border-3 border-gray-200 rounded-lg px-[1rem]"
              >
                <img
                  src={icon}
                  alt={label}
                  className="w-[2.5rem] h-[2.5rem] object-fit"
                />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 변환 버튼 */}
        <div className="flex justify-end mb-4 relative -top-14">
          <button
            className={variant.buttonClassName}
            onClick={handleConvert}
            disabled={
              isLoading || (variant.disableWhenEmpty && files.length === 0)
            }
          >
            {isLoading ? "변환 중..." : variant.buttonLabel}
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

export default ConvertFileUploadSection;
