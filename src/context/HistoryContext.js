//src/context/HistoryContext.js

import React, { createContext, useState, useContext } from "react";
import { dummyData } from "../data/dummyData";
import { parseData } from "../components/TestPage/DataParser";
import useBlobUrlManager from "../hooks/useBlobUrlManager";

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  // Initialize with dummy data
  const initialHistoryData = [
    {
      id: 1,
      title: "sample3.pdf",
      date: "2024-03-20",
      size: "2.5MB",
      pdfFile: "/sample3.pdf", // Static path is fine as is
      data: dummyData,
    },
  ];

  const parsedDummyData = parseData(dummyData);
  initialHistoryData[0].data = parsedDummyData;

  const [historyData, setHistoryData] = useState(initialHistoryData);

  // Use the centralized BlobUrlManager hook
  const {
    createBlobUrl,
    revokeBlobUrl,
    revokeAllBlobUrls,
    getOriginalFile,
    blobUrlMap,
  } = useBlobUrlManager();

  // Add new items to history
  const addToHistory = (title, pdfFileOrUrl, data, size = "2.5MB") => {
    console.log("HistoryContext - addToHistory 호출됨:", {
      title,
      pdfFileOrUrl,
      data,
      size,
    });
    console.log("HistoryContext - 데이터 타입:", {
      titleType: typeof title,
      pdfFileType: typeof pdfFileOrUrl,
      dataType: typeof data,
      sizeType: typeof size,
    });

    if (!pdfFileOrUrl || !data) {
      console.error("HistoryContext - 히스토리 추가 실패: 필수 데이터 누락", {
        title,
        pdfFileOrUrl,
        data,
        size,
      });
      return;
    }

    try {
      let pdfBlobUrl = pdfFileOrUrl;
      let fileTitle = title;

      // If pdfFileOrUrl is a File object, create a blob URL using our hook
      if (pdfFileOrUrl instanceof File) {
        console.log("HistoryContext - File 객체 감지, Blob URL 생성 시작");
        pdfBlobUrl = createBlobUrl(pdfFileOrUrl);
        fileTitle = pdfFileOrUrl.name;
        console.log("HistoryContext - Blob URL 생성 완료:", pdfBlobUrl);
      }

      const newItem = {
        id: Date.now(),
        title: typeof fileTitle === "string" ? fileTitle : "Unnamed File",
        date: new Date().toISOString().split("T")[0],
        size: typeof size === "string" ? size : formatFileSize(size),
        pdfFile: pdfBlobUrl,
        data: data,
      };

      console.log("HistoryContext - 새 히스토리 아이템 생성:", newItem);

      // 안전하게 상태 업데이트
      setHistoryData((prev) => {
        if (!Array.isArray(prev)) {
          console.warn(
            "HistoryContext - 이전 히스토리가 배열이 아님, 초기화합니다"
          );
          return [newItem];
        }

        console.log("HistoryContext - 이전 히스토리:", prev);
        const newHistory = [newItem, ...prev];
        console.log("HistoryContext - 새 히스토리:", newHistory);
        return newHistory;
      });

      console.log("HistoryContext - 히스토리 추가 완료");
    } catch (error) {
      console.error("HistoryContext - 히스토리 추가 중 오류 발생:", error);
    }
  };

  // Format file size in a readable format
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <HistoryContext.Provider
      value={{
        historyData,
        setHistoryData,
        addToHistory,
        getOriginalFile, // Expose these functions from the hook
        revokeBlobUrl,
        revokeAllBlobUrls,
        blobUrlMap,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}
