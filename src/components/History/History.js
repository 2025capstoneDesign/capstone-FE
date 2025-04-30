import { useState } from "react";
import { useNavigate } from "react-router-dom";
import pdf_icon from "../../assets/images/pdf.png";
import "../../css/TestPage.css";
import ReactMarkdown from "react-markdown";
import { dummyData } from "../../data/dummyData";
import { parseData } from "../TestPage/DataParser";
import PdfList from "./PdfList";
import Manual from "./Manual";

// 더미 데이터
const historyData = [
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

  const handleViewPdf = (pdf) => {
    setSelectedPdf(pdf);

    // PDF 데이터를 미리 파싱하여 전달
    const parsedData = parseData(pdf.data);

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
        />
        <Manual />
      </div>
    </div>
  );
}
