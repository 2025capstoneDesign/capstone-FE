//src/components/History/History.js

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/TestPage.css";
import { parseData } from "../TestPage/DataParser";
import PdfList from "./PdfList";
import Manual from "./Manual";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";
import useBlobUrlManager from "../../hooks/useBlobUrlManager";

export default function History() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("date"); // "date" or "title"
  const [selectedPdf, setSelectedPdf] = useState(null);
  const { historyData, getOriginalFile } = useHistory();
  const { loading, progress, uploadedFiles } = useLoading();
  
  // Use our BlobUrlManager hook for any local blob URL needs
  const { createBlobUrl, revokeBlobUrl, revokeAllBlobUrls } = useBlobUrlManager();
  
  // Clean up any local blob URLs when component unmounts
  useEffect(() => {
    return () => {
      revokeAllBlobUrls();
    };
  }, [revokeAllBlobUrls]);

  useEffect(() => {
    console.log("History data updated:", historyData);
  }, [historyData]);

  const handleViewPdf = useCallback((pdf) => {
    setSelectedPdf(pdf);

    // PDF 데이터를 미리 파싱하여 전달
    const parsedData =
      typeof pdf.data === "object" && pdf.data?.summaryData
        ? pdf.data
        : parseData(pdf.data);

    // Validate that pdf.pdfFile is a string (either a Blob URL or static path)
    // If it's not a string (e.g., somehow a File object got here), log an error
    if (!(typeof pdf.pdfFile === 'string')) {
      console.error("History - pdfFile is not a string URL:", pdf.pdfFile);
      return; // Don't proceed with navigation
    }

    // Even if we are loading something else, we can still view files from history
    navigate("/test", {
      state: {
        pdfFile: pdf.pdfFile, // Using the Blob URL or static path
        pdfData: parsedData, // 이미 파싱된 데이터 전달
      },
    });
  }, [navigate]);

  const handleDownload = useCallback((pdf) => {
    // Create a temporary anchor element
    const link = document.createElement('a');

    // If it's a blob URL or static path, we can download it directly
    if (pdf.pdfFile && typeof pdf.pdfFile === 'string') {
      // For blob URLs, we can download directly
      // For static paths like "/sample3.pdf", we need to add the base URL
      const isStaticPath = pdf.pdfFile.startsWith('/') && !pdf.pdfFile.startsWith('blob:');
      link.href = isStaticPath
        ? window.location.origin + pdf.pdfFile
        : pdf.pdfFile;

      // Set download attribute to the PDF title
      link.download = pdf.title || 'document.pdf';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Downloading:", pdf.title);
    } else {
      console.error("History - Cannot download: pdfFile is not a string URL or is missing", pdf);
    }
  }, []);

  const sortedHistory = [...historyData].sort((a, b) => {
    if (sortOrder === "date") {
      return new Date(b.date) - new Date(a.date);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h1 className="page-title">변환 기록</h1>
        <div className="action-buttons">
          <button className="convert-btn" onClick={() => navigate("/")}>
            홈으로
          </button>
        </div>
      </div>
      <div className="main-content">
        <PdfList
          sortedHistory={sortedHistory}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          handleViewPdf={handleViewPdf}
          handleDownload={handleDownload}
          loading={loading}
          progress={progress}
          uploadedFiles={uploadedFiles}
        />
        <Manual />
      </div>
    </div>
  );
}