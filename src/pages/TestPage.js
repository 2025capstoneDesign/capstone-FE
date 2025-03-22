import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import { summaryData } from "../data/summaryData";
import "../styles/TestScreen.css";

export default function TestPage() {
  const location = useLocation();
  const { pdfFile } = location.state || { pdfFile: "/sample.pdf" };

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // File 객체인 경우 URL 생성, 문자열인 경우 그대로 사용
  const pdfUrl =
    pdfFile instanceof File ? URL.createObjectURL(pdfFile) : pdfFile;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  return (
    <div className="container">
      <div className="header">
        <Link to="/" className="back-button">
          ← 돌아가기
        </Link>
      </div>

      <div className="pdf-container">
        <div className="pdf-viewer">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading="PDF 로딩중..."
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              scale={1.0}
              width={undefined}
            />
          </Document>
          <div className="page-controls">
            <button
              type="button"
              disabled={pageNumber <= 1}
              onClick={previousPage}
              className="page-button"
            >
              이전
            </button>
            <p className="page-info">
              페이지 {pageNumber} / {numPages}
            </p>
            <button
              type="button"
              disabled={pageNumber >= numPages}
              onClick={nextPage}
              className="page-button"
            >
              다음
            </button>
          </div>
        </div>
        <div className="summary-section">
          <h3>페이지 요약</h3>
          <div className="summary-content">
            {summaryData[pageNumber] || "해당 페이지의 요약 내용이 없습니다."}
          </div>
        </div>
      </div>
    </div>
  );
}
