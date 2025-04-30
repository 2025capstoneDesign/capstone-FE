import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pdf_icon from "../../assets/images/pdf.png";
import "../../css/TestPage.css";
import ReactMarkdown from "react-markdown";
import { dummyData } from "../../data/dummyData";
import { parseData } from "../TestPage/DataParser";
import PdfList from "./PdfList";
import Manual from "./Manual";
import { useLoading } from "../../context/LoadingContext";

// 더미 데이터
const initialHistoryData = [
  {
    id: 1,
    title: "sample3.pdf",
    date: "2024-03-20",
    size: "2.5MB",
    pdfFile: "/sample3.pdf",
    data: dummyData,
  },
];

export default function History() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("date"); // "date" or "title"
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [historyData, setHistoryData] = useState(initialHistoryData);
  const { loading, progress, convertedData, pdfFile, uploadedFiles } =
    useLoading();

  // Update history data when a new conversion is completed
  useEffect(() => {
    if (convertedData && pdfFile && progress === 100 && !loading) {
      // Create a new history item
      const newItem = {
        id: Date.now(), // Use timestamp as a unique ID
        title:
          typeof pdfFile === "string" ? pdfFile.split("/").pop() : pdfFile.name,
        date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        size:
          typeof pdfFile === "string" ? "2.5MB" : formatFileSize(pdfFile.size),
        pdfFile: pdfFile,
        data: convertedData,
      };

      // Add to history
      setHistoryData((prev) => [newItem, ...prev]);
    }
  }, [convertedData, pdfFile, progress, loading]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleViewPdf = (pdf) => {
    setSelectedPdf(pdf);

    // PDF 데이터를 미리 파싱하여 전달
    const parsedData =
      typeof pdf.data === "object" ? pdf.data : parseData(pdf.data);

    navigate("/test", {
      state: {
        pdfFile: pdf.pdfFile,
        pdfData: parsedData, // 이미 파싱된 데이터 전달
      },
    });
  };

  const handleDownload = (pdf) => {
    // 다운로드 로직 구현
    console.log("Downloading:", pdf.title);
  };

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
