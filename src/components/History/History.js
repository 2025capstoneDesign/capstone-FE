//

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/TestPage.css";
import { parseData } from "../TestPage/DataParser";
import PdfList from "./PdfList";
import Manual from "./Manual";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";

export default function History() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("date"); // "date" or "title"
  const [selectedPdf, setSelectedPdf] = useState(null);
  const { historyData } = useHistory();
  const { loading, progress, uploadedFiles } = useLoading();

  useEffect(() => {
    console.log("History data updated:", historyData);
  }, [historyData]);

  const handleViewPdf = (pdf) => {
    setSelectedPdf(pdf);

    // PDF 데이터를 미리 파싱하여 전달
    const parsedData =
      typeof pdf.data === "object" && pdf.data?.summaryData
        ? pdf.data
        : parseData(pdf.data);

    // Even if we are loading something else, we can still view files from history
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
