//src/context/LoadingContext.js

import React, { createContext, useState, useContext, useEffect } from "react";
import useBlobUrlManager from "../hooks/useBlobUrlManager";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0); // 0: 강의 듣는 중, 1: 요약 정리 중, 2: 필기 생성 중
  const [convertedData, setConvertedData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  
  // Use the centralized BlobUrlManager hook
  const { 
    createBlobUrl, 
    revokeBlobUrl, 
    revokeAllBlobUrls, 
    getOriginalFile, 
    blobUrlMap 
  } = useBlobUrlManager();

  // Reset progress when loading starts
  useEffect(() => {
    if (loading) {
      setProgress(0);
      setCurrentStage(0);
    }
  }, [loading]);

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
    // If we had previous blob URL for a PDF, revoke it
    if (pdfFile && typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) {
      revokeBlobUrl(pdfFile);
    }
    
    setLoading(true);
    setUploadedFiles(files);
    
    // If pdf is a File object, create a Blob URL using our hook
    if (pdf instanceof File) {
      const blobUrl = createBlobUrl(pdf);
      setPdfFile(blobUrl);
    } else {
      // If it's already a string (like "/sample3.pdf"), keep it as is
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
        startLoading,
        stopLoading,
        setProgress,
        getOriginalPdfFile: getOriginalFile,
        revokePdfBlob: revokeBlobUrl,
        revokeAllBlobs: revokeAllBlobUrls,
        blobUrlMap
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}