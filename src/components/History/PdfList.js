//src/components/History/PdfList.js

import pdf_icon from "../../assets/images/pdf.png";
import mp3_icon from "../../assets/images/mp3.png";
import wav_icon from "../../assets/images/wav.png";
import ppt_icon from "../../assets/images/ppt.png";
import word_icon from "../../assets/images/docx.png";

export default function PdfList({
  sortedHistory,
  sortOrder,
  setSortOrder,
  handleViewPdf,
  handleDownload,
  loading,
  progress,
  uploadedFiles,
}) {
  // Helper function to get file icon
  const getFileIcon = (fileName) => {
    if (!fileName) return pdf_icon;
    const extension = (typeof fileName === "string" ? fileName : fileName.name)
      .split(".")
      .pop()
      .toLowerCase();

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
        return pdf_icon;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Show progress stages
  const getProgressStage = (progress) => {
    if (progress < 30) return "강의 듣는 중...";
    if (progress < 60) return "요약 정리 중...";
    return "필기 생성 중...";
  };

  return (
    <div className="slide-container">
      <div className="slide-header">
        <div className="sort-options">
          <button
            className={`sort-btn ${sortOrder === "date" ? "active" : ""}`}
            onClick={() => setSortOrder("date")}
          >
            날짜순
          </button>
          <button
            className={`sort-btn ${sortOrder === "title" ? "active" : ""}`}
            onClick={() => setSortOrder("title")}
          >
            제목순
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Loading file in progress */}
        {loading && uploadedFiles && uploadedFiles.length > 0 && (
          <div className="flex flex-col p-4 rounded-lg bg-white border border-gray-200 shadow-sm mb-3 transition-all">
            {uploadedFiles
              .filter((file) => {
                const extension = (typeof file === "string" ? file : file.name)
                  .split(".")
                  .pop()
                  .toLowerCase();
                return ["pdf", "ppt", "pptx", "doc", "docx"].includes(
                  extension
                );
              })
              .slice(0, 1)
              .map((file, index) => (
                <div
                  key={`loading-${index}`}
                  className="flex items-center mb-2"
                >
                  <img
                    src={getFileIcon(file)}
                    alt="파일 아이콘"
                    className="w-10 h-10 mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-medium text-gray-800">
                      {file.name}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {getProgressStage(progress)} | 크기:{" "}
                      {formatFileSize(file.size)}
                    </div>
                    <div className="max-w-[200px] bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#5B7F7C] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Converted files */}
        {sortedHistory.map((pdf) => (
          <div
            key={pdf.id}
            className="flex items-center p-4 rounded-lg bg-white border border-gray-200 shadow-sm mb-3 transition-all"
          >
            <img
              src={getFileIcon(pdf.pdfFile)}
              alt="파일 아이콘"
              className="w-10 h-10 mr-4"
            />
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium text-gray-800">
                {pdf.title}
              </div>
              <div className="text-sm text-gray-500">
                변환일: {pdf.date} | 크기: {pdf.size}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="view-btn" onClick={() => handleViewPdf(pdf)}>
                열람하기
              </button>
              <button
                className="download-btn"
                onClick={() => handleDownload(pdf)}
              >
                다운로드
              </button>
            </div>
          </div>
        ))}

        {!loading && sortedHistory.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            아직 변환된 파일이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
