//src/context/HistoryContext.js

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
      pdfFile: "/sample3.pdf", // Static path is fine as is
      data: dummyData,
    },
  ];

  const parsedDummyData = parseData(dummyData);
  initialHistoryData[0].data = parsedDummyData;

  const [historyData, setHistoryData] = useState(initialHistoryData);
  const [blobUrlMap, setBlobUrlMap] = useState({}); // Map blobUrl -> original File

  // Cleanup function for all blob URLs
  const cleanupBlobUrls = () => {
    Object.keys(blobUrlMap).forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setBlobUrlMap({});
  };

  // Cleanup all blob URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, []);

  // Add new items to history
  const addToHistory = (title, pdfFileOrUrl, data, size = "2.5MB") => {
    console.log("Adding to history:", { title, pdfFileOrUrl, data, size });

    let pdfBlobUrl = pdfFileOrUrl;
    let fileTitle = title;

    // If pdfFileOrUrl is a File object, create a blob URL
    if (pdfFileOrUrl instanceof File) {
      pdfBlobUrl = URL.createObjectURL(pdfFileOrUrl);
      fileTitle = pdfFileOrUrl.name;

      // Store mapping between blob URL and original file
      setBlobUrlMap(prev => ({
        ...prev,
        [pdfBlobUrl]: pdfFileOrUrl
      }));
    }

    const newItem = {
      id: Date.now(),
      title: typeof fileTitle === "string" ? fileTitle : "Unnamed File",
      date: new Date().toISOString().split("T")[0],
      size: typeof size === "string" ? size : formatFileSize(size),
      pdfFile: pdfBlobUrl, // Store the blob URL or path string
      data: data,
    };

    setHistoryData((prev) => {
      console.log("Previous history:", prev);
      const newHistory = [newItem, ...prev];
      console.log("New history:", newHistory);
      return newHistory;
    });
  };

  // Get the original File object from a blob URL if it exists
  const getOriginalFile = (blobUrl) => {
    return blobUrlMap[blobUrl] || null;
  };

  // Clean up a specific blob URL
  const revokeBlobUrl = (blobUrl) => {
    if (blobUrl && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrlMap(prev => {
        const newMap = { ...prev };
        delete newMap[blobUrl];
        return newMap;
      });
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
        blobUrlMap,
        getOriginalFile,
        revokeBlobUrl,
        cleanupBlobUrls
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}
