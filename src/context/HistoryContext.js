import React, { createContext, useState, useContext, useEffect } from "react";
import { dummyData } from "../data/dummyData";
import { parseData } from "../components/TestPage/DataParser";

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  // Initialize with dummy data
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

  const parsedDummyData = parseData(dummyData);
  initialHistoryData[0].data = parsedDummyData;

  const [historyData, setHistoryData] = useState(initialHistoryData);

  // Add new items to history
  const addToHistory = (title, pdfFile, data, size = "2.5MB") => {
    const newItem = {
      id: Date.now(),
      title: typeof title === "string" ? title : pdfFile.name,
      date: new Date().toISOString().split("T")[0],
      size: typeof size === "string" ? size : formatFileSize(size),
      pdfFile: pdfFile,
      data: data,
    };

    setHistoryData((prev) => [newItem, ...prev]);
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
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}
