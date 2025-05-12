//src/context/LoadingContext.js

import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import useBlobUrlManager from "../hooks/useBlobUrlManager";
import processService from "../api/processService";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0); // 0: 강의 듣는 중, 1: 요약 정리 중, 2: 필기 생성 중
  const [statusMessage, setStatusMessage] = useState("");
  const [convertedData, setConvertedData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [processingError, setProcessingError] = useState(null);
  
  // Flag to continue processing even when navigating away
  const isProcessing = useRef(false);
  
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
      setStatusMessage("");
      setProcessingError(null);
    }
  }, [loading]);

  // Update the current stage based on progress
  useEffect(() => {
    if (!loading) return;

    // Update stages based on progress
    if (progress < 30) {
      setCurrentStage(0); // Listening stage
    } else if (progress < 60) {
      setCurrentStage(1); // Summarizing stage
    } else {
      setCurrentStage(2); // Writing stage
    }
  }, [loading, progress]);

  // Continue processing when component is mounted if a job is in progress
  useEffect(() => {
    if (jobId && isProcessing.current) {
      continueProcessing();
    }
    
    return () => {
      // Component is unmounting but processing should continue
      if (loading) {
        isProcessing.current = true;
      }
    };
  }, []);

  const startLoading = async (files, pdf) => {
    // If we had previous blob URL for a PDF, revoke it
    if (pdfFile && typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) {
      revokeBlobUrl(pdfFile);
    }
    
    setLoading(true);
    setUploadedFiles(files);
    isProcessing.current = true;
    
    // If pdf is a File object, create a Blob URL using our hook
    if (pdf instanceof File) {
      const blobUrl = createBlobUrl(pdf);
      setPdfFile(blobUrl);
    } else {
      // If it's already a string (like "/sample3.pdf"), keep it as is
      setPdfFile(pdf);
    }

    try {
      // Start the process with uploaded files
      const { job_id } = await processService.startProcess({
        document: files.find(file => file.type.includes("pdf") || file.type.includes("presentation")),
        audio: files.find(file => file.type.includes("audio"))
      });
      
      setJobId(job_id);
      
      // Begin polling for status
      continueProcessing(job_id);
    } catch (error) {
      console.error("Error starting process:", error);
      setProcessingError("Failed to start the conversion process. Please try again.");
      stopLoading();
    }
  };

  const continueProcessing = async (jId = null) => {
    const currentJobId = jId || jobId;
    
    if (!currentJobId) {
      console.error("No job ID available for processing");
      return;
    }
    
    try {
      // Start the polling loop
      let currentProgress = 0;
      
      while (currentProgress < 100 && isProcessing.current) {
        try {
          const statusData = await processService.checkProcessStatus(currentJobId);
          currentProgress = statusData.progress;
          
          setProgress(currentProgress);
          setStatusMessage(statusData.message || "");
          
          if (currentProgress === 100) {
            // Process is complete, fetch result
            const resultData = await processService.getProcessResult(currentJobId);
            stopLoading(resultData.result);
            break;
          }
          
          // Wait 1 second before next poll
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error("Error checking process status:", error);
          // Continue polling despite errors - the service handles retries
        }
      }
    } catch (error) {
      console.error("Error in process flow:", error);
      setProcessingError("An error occurred during the conversion process. Please try again.");
      stopLoading();
    }
  };

  const stopLoading = (data = null) => {
    setProgress(100);
    setLoading(false);
    isProcessing.current = false;
    
    if (data) {
      setConvertedData(data);
    }
  };

  const cancelProcessing = () => {
    isProcessing.current = false;
    setLoading(false);
    setJobId(null);
    setProgress(0);
    setStatusMessage("");
  };

  return (
    <LoadingContext.Provider
      value={{
        loading,
        progress,
        currentStage,
        statusMessage,
        convertedData,
        uploadedFiles,
        pdfFile,
        jobId,
        processingError,
        startLoading,
        stopLoading,
        cancelProcessing,
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