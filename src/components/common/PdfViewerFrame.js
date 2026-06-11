import { Document, Page } from "react-pdf";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

/**
 * PDF 뷰어 공통 골격 (공통)
 *
 * TestPage/PdfViewer 와 RealTimePage/PdfViewer 에 동일하게 복붙되어 있던
 * 로딩 상태 관리 + Document/Page 렌더 + 좌우 네비게이션 + 페이지 표시를 추출.
 * 헤더 내용(검색, 녹음 컨트롤 등)은 headerContent로 주입받는다.
 * DOM 구조(slide-container > slide-header + pdf-viewer)는 기존과 동일.
 */
export default function PdfViewerFrame({
  pdfUrl,
  pageNumber,
  numPages,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  goPrevPage,
  goNextPage,
  headerContent = null,
}) {
  // Document 컴포넌트는 파일 경로와 blob URL을 모두 올바르게 처리하므로,
  // 여기서 특별한 변환 작업이 필요X. pdfUrl을 file prop에 직접 전달.

  // 로딩 상태를 추적하여 필요한 경우 로딩 표시
  const [isLoading, setIsLoading] = useState(false);

  // 창 크기에 따라 PDF 렌더 폭 갱신 (기존: 마운트 시점 값 고정 → 리사이즈 미반응)
  const [pageWidth, setPageWidth] = useState(window.innerWidth * 0.53);

  useEffect(() => {
    let timer = null;
    const handleResize = () => {
      // 리사이즈 동안 과도한 리렌더 방지 (디바운스)
      clearTimeout(timer);
      timer = setTimeout(() => setPageWidth(window.innerWidth * 0.53), 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  return (
    <div className="slide-container">
      <div className="slide-header">{headerContent}</div>

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
            width={pageWidth}
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
