import { Document, Page } from "react-pdf";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

export default function EditorPdfViewer({
  pdfUrl,
  pageNumber,
  numPages,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  goPrevPage,
  goNextPage,
  selectedImageIndices,
  onSleepToggle,
}) {
  const [isLoading, setIsLoading] = useState(false);

  // PDF URL이 변경될 때 로딩 상태를 초기화
  useEffect(() => {
    setIsLoading(true);
  }, [pdfUrl]);

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

  // 현재 페이지가 선택되었는지 확인 (1-based index를 0-based로 변환)
  const isCurrentPageSelected = selectedImageIndices.includes(pageNumber - 1);

  return (
    <div className="slide-container">
      <div className="slide-header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h3
            style={{
              margin: 0,
              color: "#333",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            PDF 뷰어
          </h3>

          {/* 졸음 이모티콘 버튼 */}
          <button
            onClick={() => onSleepToggle && onSleepToggle(pageNumber - 1)}
            style={{
              backgroundColor: isCurrentPageSelected ? "#ff6b6b" : "#f1f3f4",
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              if (!isCurrentPageSelected) {
                e.target.style.backgroundColor = "#e8eaed";
              }
            }}
            onMouseLeave={(e) => {
              if (!isCurrentPageSelected) {
                e.target.style.backgroundColor = "#f1f3f4";
              }
            }}
            title={isCurrentPageSelected ? "졸음 표시 취소" : "졸음 표시"}
          >
            😴
            <span
              style={{
                fontSize: "12px",
                color: isCurrentPageSelected ? "white" : "#666",
                fontWeight: isCurrentPageSelected ? "600" : "normal",
              }}
            >
              {isCurrentPageSelected ? "선택됨" : "졸음"}
            </span>
          </button>
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
            width={window.innerWidth * 0.53}
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
