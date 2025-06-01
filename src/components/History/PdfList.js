//src/components/History/PdfList.js

import { useState, useMemo } from "react";
import pdf_icon from "../../assets/images/pdf.png";
import mp3_icon from "../../assets/images/mp3.png";
import wav_icon from "../../assets/images/wav.png";
import ppt_icon from "../../assets/images/ppt.png";
import word_icon from "../../assets/images/docx.png";
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { PiDownloadSimpleBold } from "react-icons/pi";
import { TbSettings } from "react-icons/tb";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지당 표시할 항목 수

  // 정렬된 데이터 계산
  const sortedData = useMemo(() => {
    if (!sortedHistory) return [];
    
    return [...sortedHistory].sort((a, b) => {
      if (sortOrder === "date") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        // 제목순 정렬 (파일명 기준)
        return (a.filename || "").localeCompare(b.filename || "");
      }
    });
  }, [sortedHistory, sortOrder]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedData.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedItems([]); // 페이지 변경 시 선택 항목 초기화
  };

  // 페이지네이션 버튼 생성
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5; // 한 번에 보여줄 페이지 버튼 수

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 이전 페이지 버튼
    buttons.push(
      <button
        key="prev"
        className={`flex items-center gap-1 px-3 py-1 transition-colors
          ${currentPage === 1 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700'}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <div className="flex items-center">
          <MdNavigateBefore className="text-xl mt-0.5" />
          <span className="ml-1">Prev</span>
        </div>
      </button>
    );

    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // 다음 페이지 버튼
    buttons.push(
      <button
        key="next"
        className={`flex items-center gap-1 px-3 py-1 transition-colors
          ${currentPage === totalPages 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 '}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <div className="flex items-center">
          <span className="mr-1">Next</span>
          <MdNavigateNext className="text-xl mt-0.5" />
        </div>
      </button>
    );

    return buttons;
  };

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

  const handleCheckboxChange = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setSelectedItems([]);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    setSelectedItems([]);
  };

  const handleDeleteClick = () => {
    // TODO: 삭제 로직 구현
    console.log('Selected items to delete:', selectedItems);
    setIsEditMode(false);
    setSelectedItems([]);
  };

  return (
    <div className="slide-container">
      <div className="slide-header">
        <div className="sort-options">
          <button
            className={`sort-btn ${sortOrder === "date" ? "active" : ""}`}
            onClick={() => {
              setSortOrder("date");
              setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
            }}
          >
            날짜순
          </button>
          <button
            className={`sort-btn ${sortOrder === "title" ? "active" : ""}`}
            onClick={() => {
              setSortOrder("title");
              setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
            }}
          >
            제목순
          </button>
        </div>
        <div className="edit-options">
          {!isEditMode ? (
            <button className="" onClick={handleEditClick}>
              <TbSettings className="text-3xl text-gray-600 hover:text-black"/>
            </button>
          ) : (
            <div className="flex gap-2">
              <button className="cancel-btn" onClick={handleCancelClick}>
                취소
              </button>
              <button 
                className="delete-btn" 
                onClick={handleDeleteClick}
                disabled={selectedItems.length === 0}
              >
                삭제
              </button>
            </div>
          )}
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
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-4 rounded-lg bg-white border border-gray-200 shadow-sm mb-3 transition-all"
          >
            {isEditMode && (
              <input
                type="checkbox"
                className="w-5 h-5 mr-4"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleCheckboxChange(item.id)}
              />
            )}
            <img
              src={getFileIcon(item.filename || item.pdfFile)}
              alt="파일 아이콘"
              className="w-10 h-10 mr-4"
            />
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium text-gray-800">
                {item.filename}
              </div>
              <div className="text-sm text-gray-500">
                변환일: {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
            {!isEditMode && (
              <div className="flex gap-2">
                <button className="view-btn" onClick={() => handleViewPdf(item)}>
                  열람하기
                </button>
                <button
                  className=""
                  onClick={() => handleDownload(item)}
                >
                  <PiDownloadSimpleBold className="text-2xl ml-4 mr-2 text-gray-600 hover:text-black"/>
                </button>
              </div>
            )}
          </div>
        ))}

        {!loading && sortedHistory.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            아직 변환된 파일이 없습니다.
          </div>
        )}

        {/* 페이지네이션 */}
        {sortedHistory.length > 0 && (
          <div className="pagination-container">
            {renderPaginationButtons()}
          </div>
        )}
      </div>
    </div>
  );
}
