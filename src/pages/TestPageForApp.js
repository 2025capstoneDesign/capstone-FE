import { Link } from "react-router-dom";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import { summaryData } from "../data/summaryData";
import "../styles/TestScreen.css";

export default function TestPage({ pdfFile }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

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
      <div className="pdf-container">
        <div className="pdf-viewer">
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
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
