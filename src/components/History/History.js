//src/components/History/History.js

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/TestPage.css";
import { parseData } from "../TestPage/DataParser";
import PdfList from "./PdfList";
import Manual from "./Manual";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";
import { useAuth } from "../../context/AuthContext";
import { showError } from "../../utils/errorHandler";

export default function History() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("date"); // "date" or "title"
  const [selectedPdf, setSelectedPdf] = useState(null);
  const { historyData, downloadPdf, deleteHistoryItem, loading: historyLoading, error: historyError, refreshHistory } = useHistory();
  const { loading: processingLoading, progress, uploadedFiles } = useLoading();
  const { isAuthenticated } = useAuth();
  
  // Combined loading state
  const loading = processingLoading || historyLoading;
  
  // Loading modal state
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("파일을 불러오는 중...");

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
    async (item) => {
      try {
        console.log("열람하기 클릭 item:", item); // 디버깅용 전체 출력
        setSelectedPdf(item);
        setShowLoadingModal(true);
        setLoadingMessage("파일을 불러오는 중...");
        
        // 항상 히스토리 새로고침
        await refreshHistory();
        
        // If file doesn't exist yet, download it
        let fileData = item.file;
        if (!fileData && !item.pdfFile) {
          fileData = await downloadPdf(item);
          if (!fileData) {
            showError("파일을 불러오는데 실패했습니다.");
            setShowLoadingModal(false);
            return;
          }
        }
        
        // Create URL for blob if needed
        let pdfUrl;
        if (item.pdfFile) {
          pdfUrl = item.pdfFile;
        } else if (typeof fileData === "string") {
          pdfUrl = fileData;
        } else {
          pdfUrl = URL.createObjectURL(fileData);
        }
        
        // Make sure we have parsed result data
        const parsedData = typeof item.result === "object" && item.result?.summaryData
          ? item.result
          : parseData(item.result);
        
        setShowLoadingModal(false);
        
        // jobId 추출 로직 보강
        let jobId;
        
        // 1순위: job_id 필드 사용 (API에서 받은 실제 jobId)
        if (item.job_id) {
          jobId = item.job_id;
        }
        // 2순위: id 필드 사용 (단, sample PDF의 -1은 제외)
        else if (item.id && item.id !== -1) {
          jobId = item.id;
        }
        // 3순위: 기타 필드들
        else {
          jobId = item.jobId || item.historyId || item._id || null;
        }
        
        console.log("히스토리 아이템 정보:", {
          id: item.id,
          job_id: item.job_id,
          jobId: item.jobId,
          filename: item.filename,
          selectedJobId: jobId
        });
        
        navigate("/test", {
          state: {
            pdfFile: pdfUrl,
            pdfData: parsedData,
            jobId: jobId,
          },
        });
      } catch (error) {
        console.error("Error viewing PDF:", error);
        showError("파일을 보는데 오류가 발생했습니다.");
        setShowLoadingModal(false);
      }
    },
    [navigate, downloadPdf, refreshHistory]
  );

  const handleDownload = useCallback(async (item) => {
    try {
      setShowLoadingModal(true);
      setLoadingMessage("파일을 다운로드하는 중...");
      
      // If file doesn't exist yet, download it
      let fileData = item.file;
      if (!fileData && !item.pdfFile) {
        fileData = await downloadPdf(item);
        if (!fileData) {
          showError("파일을 다운로드하는데 실패했습니다.");
          setShowLoadingModal(false);
          return;
        }
      }
      
      const link = document.createElement("a");
      
      if (item.pdfFile) {
        // If item has a static path
        const isStaticPath = item.pdfFile.startsWith("/") && !item.pdfFile.startsWith("blob:");
        link.href = isStaticPath ? window.location.origin + item.pdfFile : item.pdfFile;
      } else if (typeof fileData === "string") {
        // Static path like "/sample3.pdf"
        const isStaticPath = fileData.startsWith("/") && !fileData.startsWith("blob:");
        link.href = isStaticPath ? window.location.origin + fileData : fileData;
      } else {
        // Blob data
        link.href = URL.createObjectURL(fileData);
      }
      
      // Set download filename
      link.download = item.filename || "document.pdf";
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      if (link.href.startsWith("blob:")) {
        URL.revokeObjectURL(link.href);
      }
      
      setShowLoadingModal(false);
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showError("파일 다운로드 중 오류가 발생했습니다.");
      setShowLoadingModal(false);
    }
  }, [downloadPdf]);

  const handleDelete = useCallback(async (item) => {
    try {
      setShowLoadingModal(true);
      setLoadingMessage("파일을 삭제하는 중...");
      
      const success = await deleteHistoryItem(item);
      if (!success) {
        showError("파일을 삭제하는데 실패했습니다.");
      }
      
      setShowLoadingModal(false);
      
    } catch (error) {
      console.error("Error deleting file:", error);
      showError("파일 삭제 중 오류가 발생했습니다.");
      setShowLoadingModal(false);
    }
  }, [deleteHistoryItem]);

  const sortedHistory = [...historyData].sort((a, b) => {
    if (sortOrder === "date") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else {
      return a.filename.localeCompare(b.filename);
    }
  });

  return (
    <div className="app-wrapper history-page">
      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center">
            <img 
              src="/loading_listen.gif" 
              alt="로딩 중" 
              className="w-[200px] h-[200px] object-contain mb-4"
            />
            <p className="text-gray-700 text-lg font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}
      
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
          handleDelete={handleDelete}
          loading={loading}
          progress={progress}
          uploadedFiles={uploadedFiles}
        />
        <Manual />
      </div>
      
      {historyError && (
        <div className="text-red-500 text-center mt-4">
          {historyError}
        </div>
      )}
    </div>
  );
}