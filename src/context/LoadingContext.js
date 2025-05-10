//src/context/LoadingContext.js

import React, { createContext, useState, useContext, useEffect } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0); // 0: 강의 듣는 중, 1: 요약 정리 중, 2: 필기 생성 중
  const [convertedData, setConvertedData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [originalFiles, setOriginalFiles] = useState({});

  // Reset progress when loading starts
  useEffect(() => {
    if (loading) {
      setProgress(0);
      setCurrentStage(0);
    }
  }, [loading]);

  // Cleanup function for Blob URLs
  const cleanupBlobUrls = () => {
    if (pdfBlobUrl && pdfBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfBlobUrl);
    }
  };

  // Cleanup Blob URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, []);

  // Simulate progress when in loading state
  useEffect(() => {
    if (!loading) return;

    let timer;
    let intervalTime = 790; // Update every 200ms

    const simulateProgress = () => {
      setProgress((prev) => {
        // Calculate next progress value
        let next = prev;

        // First stage: 0-30%
        if (prev < 30) {
          next = Math.min(30, prev + 0.5);
          if (next >= 30) setCurrentStage(1);
        }
        // Second stage: 30-60%
        else if (prev < 60) {
          next = Math.min(60, prev + 0.5);
          if (next >= 60) setCurrentStage(2);
        }
        // Third stage: 60-90%
        else if (prev < 95) {
          next = Math.min(95, prev + 0.5);
        }
        // Stop at 90% and wait for fetch to complete

        return next;
      });
    };

    timer = setInterval(simulateProgress, intervalTime);

    return () => clearInterval(timer);
  }, [loading]);

  const startLoading = (files, pdf) => {
    // Clean up previous Blob URL if it exists
    cleanupBlobUrls();

    setLoading(true);
    setUploadedFiles(files);

    // If pdf is a File object, create a Blob URL
    if (pdf instanceof File) {
      const blobUrl = URL.createObjectURL(pdf);
      setPdfBlobUrl(blobUrl);
      // Store the original file in a map for potential later use
      setOriginalFiles(prev => ({ ...prev, [blobUrl]: pdf }));
      setPdfFile(blobUrl);
    } else {
      // If it's already a string (like "/sample3.pdf"), keep it as is
      setPdfBlobUrl(null);
      setPdfFile(pdf);
    }
  };

  const stopLoading = (data = null) => {
    setProgress(100);
    setLoading(false);
    if (data) {
      setConvertedData(data);
    }
  };

  return (
    <LoadingContext.Provider
      value={{
        loading,
        progress,
        currentStage,
        convertedData,
        uploadedFiles,
        pdfFile,
        pdfBlobUrl,
        originalFiles,
        startLoading,
        stopLoading,
        setProgress,
        cleanupBlobUrls,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
