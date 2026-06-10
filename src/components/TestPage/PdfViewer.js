import { useEffect, useState, useCallback } from "react";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import PdfViewerFrame from "../common/PdfViewerFrame";

/**
 * 변환 결과 페이지용 PDF 뷰어.
 * PDF 표시 골격은 common/PdfViewerFrame을 사용하고,
 * 헤더의 키워드 검색 + 슬라이드 이동 드롭다운만 이 파일에서 정의한다.
 *
 * (리팩토링 노트: 기존 파일에 있던 renderAllVoiceContent, highlightKeyword 등
 *  ~150줄은 렌더에서 호출되지 않는 데드코드였다 — SummaryPanel로 이전된 잔재.
 *  함께 제거했고 렌더 결과는 동일하다.)
 */
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
  searchKeyword,
  setSearchKeyword,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [matchingPages, setMatchingPages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // PDF URL이 변경될 때 검색 결과 초기화
  useEffect(() => {
    setMatchingPages([]);
  }, [pdfUrl]);

  // 키워드 검색 함수 (API 호출 없이 voiceData 사용)
  const searchKeywordLocations = useCallback(
    (keyword) => {
      if (!keyword.trim() || !pdfData || !pdfData.voiceData) {
        setMatchingPages([]);
        return;
      }
      setIsSearching(true);
      const { voiceData } = pdfData;
      const matched = [];
      Object.entries(voiceData).forEach(([pageNum, segments]) => {
        const hasKeyword = segments.some(
          (seg) =>
            seg.text && seg.text.toLowerCase().includes(keyword.toLowerCase())
        );
        if (hasKeyword) {
          matched.push(Number(pageNum));
        }
      });
      setMatchingPages(matched);
      setIsSearching(false);
    },
    [pdfData]
  );

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

  // 페이지 이동 처리
  const handlePageSelect = (pageNum) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      goToSpecificPage(pageNum);
    }
    setShowDropdown(false);
  };

  const pageButtonStyle = {
    width: "100%",
    padding: "8px 12px",
    textAlign: "left",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    color: "#1e293b",
  };

  const headerContent = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        width: "100%",
      }}
    >
      <div className="audio-icon" />

      {/* 검색 영역 */}
      <div
        style={{
          position: "relative",
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
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
              <div
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                검색 중...
              </div>
            ) : searchKeyword ? (
              matchingPages.length > 0 ? (
                matchingPages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageSelect(pageNum)}
                    style={pageButtonStyle}
                  >
                    슬라이드 {pageNum}
                  </button>
                ))
              ) : (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  검색 결과가 없습니다
                </div>
              )
            ) : (
              Array.from({ length: numPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageSelect(pageNum)}
                    style={pageButtonStyle}
                  >
                    슬라이드 {pageNum}
                  </button>
                )
              )
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PdfViewerFrame
      pdfUrl={pdfUrl}
      pageNumber={pageNumber}
      numPages={numPages}
      onDocumentLoadSuccess={onDocumentLoadSuccess}
      onDocumentLoadError={onDocumentLoadError}
      goPrevPage={goPrevPage}
      goNextPage={goNextPage}
      headerContent={headerContent}
    />
  );
}
