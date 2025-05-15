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

  // 로컬 블랍 URL 관리를 위한 훅
  const { revokeAllBlobUrls } = useBlobUrlManager();

  // 컴포넌트 언마운트 시 로컬 블랍 URL 정리
  useEffect(() => {
    return () => {
      revokeAllBlobUrls();
    };
  }, [revokeAllBlobUrls]);

  useEffect(() => {
    console.log("History.js - 히스토리 데이터 업데이트됨:", historyData);

    // historyData가 변경되면 화면을 새로 렌더링하고 있는지 확인
    if (historyData && Array.isArray(historyData)) {
      // 정상적으로 업데이트됨
      console.log(
        `History.js - 총 ${historyData.length}개의 히스토리 항목 로드됨`
      );
    } else {
      console.error("History.js - 히스토리 데이터 형식이 잘못됨:", historyData);
    }
  }, [historyData]);

  const handleViewPdf = useCallback(
    (pdf) => {
      setSelectedPdf(pdf);

      // PDF 데이터를 미리 파싱하여 전달
      const parsedData =
        typeof pdf.data === "object" && pdf.data?.summaryData
          ? pdf.data
          : parseData(pdf.data);

      // pdf.pdfFile이 문자열인지 확인
      // 문자열이 아니면 (예: 뭔가 파일 객체가 여기에 왔다면) 오류 로그 출력
      if (!(typeof pdf.pdfFile === "string")) {
        console.error("History - pdfFile is not a string URL:", pdf.pdfFile);
        return; // 계속 진행하지 않음
      }

      // 다른 것을 로드하고 있더라도 히스토리에서 파일을 볼 수 있음
      navigate("/test", {
        state: {
          pdfFile: pdf.pdfFile, // 블랍 URL 또는 정적 경로 사용
          pdfData: parsedData, // 이미 파싱된 데이터 전달
        },
      });
    },
    [navigate]
  );

  const handleDownload = useCallback((pdf) => {
    const link = document.createElement("a");

    // 블랍 URL 또는 정적 경로이면 직접 다운로드 가능
    if (pdf.pdfFile && typeof pdf.pdfFile === "string") {
      // 블랍 URL이면 직접 다운로드 가능
      // 정적 경로(예: "/sample3.pdf")는 기본 URL을 추가해야 함
      const isStaticPath =
        pdf.pdfFile.startsWith("/") && !pdf.pdfFile.startsWith("blob:");
      link.href = isStaticPath
        ? window.location.origin + pdf.pdfFile
        : pdf.pdfFile;

      // 다운로드 속성을 PDF 제목으로 설정
      link.download = pdf.title || "document.pdf";

      // 바디에 추가, 클릭, 제거
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Downloading:", pdf.title);
    } else {
      console.error(
        "History - Cannot download: pdfFile is not a string URL or is missing",
        pdf
      );
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
    <div className="app-wrapper history-page">
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
