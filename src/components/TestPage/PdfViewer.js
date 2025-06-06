import { Document, Page } from "react-pdf";
import { toast } from "react-toastify";
import { useEffect, useState, useCallback } from "react";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PdfViewer({
  pdfUrl,
  pageNumber,
  numPages,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  goPrevPage,
  goNextPage,
  goToSpecificPage,
  pdfData,
  jobId,
  activeTab,
  setActiveTab,
  highlightColor,
  setHighlightColor,
  setPageNumber,
  summaryData,
  voiceData,
  pageSectionRefs,
  searchKeyword,
  setSearchKeyword,
}) {
  // Document 컴포넌트는 파일 경로와 blob URL을 모두 올바르게 처리하므로,
  // 여기서 특별한 변환 작업이 필요X
  // pdfUrl을 file prop에 직접 전달

  // 로딩 상태를 추적하여 필요한 경우 로딩 표시
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [matchingPages, setMatchingPages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // PDF URL이 변경될 때 로딩 상태를 초기화
  useEffect(() => {
    setIsLoading(true);
    setMatchingPages([]);
  }, [pdfUrl]);

  // 키워드 검색 함수 (API 호출 없이 voiceData 사용)
  const searchKeywordLocations = useCallback((keyword) => {
    if (!keyword.trim() || !pdfData || !pdfData.voiceData) {
      setMatchingPages([]);
      return;
    }
    setIsSearching(true);
    const { voiceData } = pdfData;
    const matched = [];
    console.log('voiceData:', voiceData);
    Object.entries(voiceData).forEach(([pageNum, segments]) => {
      const hasKeyword = segments.some(seg => seg.text && seg.text.toLowerCase().includes(keyword.toLowerCase()));
      console.log(`슬라이드 ${pageNum}에 키워드 "${keyword}" 포함 여부:`, hasKeyword);
      if (hasKeyword) {
        matched.push(Number(pageNum));
      }
    });
    setMatchingPages(matched);
    setIsSearching(false);
    console.log('matchingPages:', matched);
  }, [pdfData]);

  // 검색어 변경 시 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchKeyword.trim()) {
        searchKeywordLocations(searchKeyword);
      } else {
        setMatchingPages([]);
      }
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timer);
  }, [searchKeyword, searchKeywordLocations]);

  useEffect(() => {
    console.log('matchingPages:', matchingPages);
    console.log('voiceData:', pdfData?.voiceData);
  }, [matchingPages, pdfData]);

  // 성공적인 로딩 처리
  const handleLoadSuccess = (pdf) => {
    setIsLoading(false);
    if (onDocumentLoadSuccess) {
      onDocumentLoadSuccess(pdf);
    }
  };

  // 로딩 오류 처리
  const handleLoadError = (error) => {
    setIsLoading(false);
    console.error("Error loading PDF:", error);
    if (onDocumentLoadError) {
      onDocumentLoadError(error);
    } else {
      toast.error("PDF 로딩 중 오류가 발생했습니다", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  // 페이지 이동 처리
  const handlePageSelect = (pageNum) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      goToSpecificPage(pageNum);
    }
    setShowDropdown(false);
  };

  // 툴팁 위치 계산 함수
  const positionTooltip = (event) => {
    const tooltip = event.currentTarget.querySelector(".reason-tooltip");
    if (!tooltip) return;
    const segmentRect = event.currentTarget.getBoundingClientRect();
    tooltip.style.left = `${segmentRect.left - 270}px`;
    tooltip.style.top = `${segmentRect.top + 5}px`;
  };

  // 세그먼트 더블클릭 시 해당 페이지로 이동
  const handleSegmentDoubleClick = (segment) => {
    if (segment.isImportant && segment.linkedConcept && segment.pageNumber) {
      toast.info(`'${segment.linkedConcept}' 개념으로 이동하였습니다`, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setPageNumber(segment.pageNumber);
      // 스크롤 이동 등 추가 동작 필요시 여기에 작성
    }
  };

  // 키워드 하이라이트 함수 (음성 원본에서만 사용)
  const highlightKeyword = (text, keyword) => {
    if (!keyword || !text) return text;
  
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="text-green-600 font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  

  // 음성 원본 전체 렌더링 함수
  const renderAllVoiceContent = (keyword) => {
    if (!voiceData || Object.keys(voiceData).length === 0) {
      return <p className="no-content">음성 원본이 없습니다.</p>;
    }
    // 페이지 번호 순서대로 정렬
    const sortedPages = Object.keys(voiceData)
      .map(Number)
      .sort((a, b) => a - b);
    const allPages = numPages
      ? Array.from({ length: numPages }, (_, i) => i + 1)
      : sortedPages;
    return allPages.map((pageNum) => {
      const pageSegments = voiceData[pageNum] || [];
      return (
        <div
          key={`page-section-${pageNum}`}
          className={`voice-page-section ${
            pageNumber === pageNum
              ? `active-page-section ${highlightColor}`
              : ""
          }`}
          ref={(el) => (pageSectionRefs.current[pageNum] = el)}
        >
          <div className="page-section-header">
            <h3>페이지 {pageNum}</h3>
          </div>
          <div className="segment-container">
            {pageSegments.length > 0 ? (
              pageSegments.map((segment) => {
                const hasLink =
                  segment.isImportant &&
                  segment.linkedConcept &&
                  segment.pageNumber;
                return (
                  <span
                    key={segment.id}
                    className={`segment-text ${
                      segment.isImportant
                        ? `important ${highlightColor} ${
                            hasLink ? "linkable" : ""
                          }`
                        : ""
                    }`}
                    onMouseEnter={
                      segment.isImportant ? positionTooltip : undefined
                    }
                    onDoubleClick={() =>
                      hasLink && handleSegmentDoubleClick(segment)
                    }
                  >
                    {highlightKeyword(segment.text, keyword)}{" "}
                    {segment.isImportant && (
                      <span className="reason-tooltip">
                        {segment.reason}
                        {hasLink && (
                          <span className="link-notice">
                            더블클릭 시 "{segment.linkedConcept}" 개념으로 이동
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                );
              })
            ) : (
              <p className="no-page-content">
                이 페이지에 대한 음성 원본이 없습니다.
              </p>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="slide-container">
      <div className="slide-header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px", width: "100%" }}>
          <div
            className="audio-icon"
            onClick={() =>
              toast.info("음성 기능이 활성화 되었습니다.", {
                position: "top-center",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              })
            }
          >
            {/* <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            > */}
              {/* <path
                d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z"
                stroke="#5CBFBC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.35 9.65V11.35C4.35 15.57 7.78 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.65"
                stroke="#5CBFBC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.61 6.56C11.519 6.19051 12.5098 6.1885 13.42 6.56C14.18 6.87 14.794 7.44448 15.13 8.17C15.2577 8.45726 15.3312 8.76303 15.348 9.074C15.3648 9.38498 15.3244 9.6964 15.229 9.994C15.1335 10.2916 14.9846 10.5696 14.7891 10.8143C14.5937 11.059 14.3549 11.2667 14.085 11.426C13.816 11.5844 13.5194 11.692 13.212 11.743C12.9046 11.794 12.5917 11.7878 12.287 11.725"
                stroke="#5CBFBC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19V22"
                stroke="#5CBFBC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg> */}
          </div>

          {/* 검색 영역 */}
          <div style={{ position: "relative", marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="키워드로 슬라이드 검색..."
                style={{
                  padding: "8px 12px",
                  paddingRight: "40px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  width: "200px",
                  fontSize: "14px",
                  outline: "none",
                }}
                disabled={isSearching}
              />
              <IoSearch
                style={{
                  position: "absolute",
                  right: "12px",
                  color: isSearching ? "#94a3b8" : "#64748b",
                  fontSize: "18px",
                }}
              />
            </div>

            {/* 드롭다운 버튼 */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                marginLeft: "8px",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
                opacity: isSearching ? 0.7 : 1,
              }}
              disabled={isSearching}
            >
              <span style={{ fontSize: "14px", color: "#64748b" }}>
                {isSearching 
                  ? "검색 중..." 
                  : searchKeyword 
                    ? matchingPages.length > 0
                      ? `${matchingPages.length}개 슬라이드`
                      : "검색 결과 없음"
                    : "전체 슬라이드"}
              </span>
              <IoIosArrowDown style={{ color: "#64748b" }} />
            </button>

            {/* 드롭다운 메뉴 */}
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  marginTop: "4px",
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  zIndex: 50,
                  maxHeight: "300px",
                  overflowY: "auto",
                  width: "200px",
                }}
              >
                {isSearching ? (
                  <div style={{ padding: "12px", textAlign: "center", color: "#64748b" }}>
                    검색 중...
                  </div>
                ) : searchKeyword ? (
                  matchingPages.length > 0 ? (
                    matchingPages.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageSelect(pageNum)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          textAlign: "left",
                          border: "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "#1e293b",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                          },
                        }}
                      >
                        슬라이드 {pageNum}
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: "12px", textAlign: "center", color: "#64748b" }}>
                      검색 결과가 없습니다
                    </div>
                  )
                ) : (
                  Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageSelect(pageNum)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        textAlign: "left",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#1e293b",
                        "&:hover": {
                          backgroundColor: "#f1f5f9",
                        },
                      }}
                    >
                      슬라이드 {pageNum}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pdf-viewer">
        <Document
          file={pdfUrl}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={isLoading ? "PDF 로딩 중..." : ""}
          className="pdf-document"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={window.innerWidth * 0.6}
          />
        </Document>

        <div className="nav-area left" onClick={goPrevPage}>
          <div className="nav-arrow-icon">&#10094;</div>
        </div>
        <div className="nav-area right" onClick={goNextPage}>
          <div className="nav-arrow-icon">&#10095;</div>
        </div>

        <div className="page-info">
          {pageNumber} / {numPages}
        </div>
      </div>
    </div>
  );
}
