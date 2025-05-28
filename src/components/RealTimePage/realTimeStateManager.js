/**
 * State Manager for Real-Time Page
 * Centralizes state management and API interactions
 */

import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { RecordingManager } from './recordingManager';
import { apiQueue } from './apiQueue';
import { parseRealTimeResponse } from './realTimeDataParser';
import { processService } from '../../api/processService';

export const useRealTimeState = (initialData, initialJobId) => {
  // State variables
  const [isRealTimeActive, setIsRealTimeActive] = useState(!!initialJobId);
  const [jobId, setJobId] = useState(initialJobId);
  const [showGuidanceModal, setShowGuidanceModal] = useState(!!initialJobId);
  const [realTimePdfData, setRealTimePdfData] = useState(initialData);
  const [recordingTime, setRecordingTime] = useState("00:00.000");
  const [currentSegmentTime, setCurrentSegmentTime] = useState("00:00.000");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Recording manager instance
  const recordingManagerRef = useRef(null);

  // Initialize recording manager
  if (!recordingManagerRef.current) {
    recordingManagerRef.current = new RecordingManager();
    
    // Set up callbacks
    recordingManagerRef.current.setCallbacks({
      onTimeUpdate: (totalTime, segmentTime) => {
        setRecordingTime(totalTime);
        setCurrentSegmentTime(segmentTime);
      },
      onAutoFetch: () => {
        handleAutoSegmentFetch();
      },
      onError: (message) => {
        toast.error(message, {
          position: "top-center",
          autoClose: 3000,
        });
      }
    });

    // Set up API queue completion handler
    apiQueue.setGlobalCompletionHandler((response, requestData, error) => {
      if (error) {
        console.error("API request failed:", error);
        toast.error("음성 처리에 실패했습니다.", {
          position: "top-center",
          autoClose: 3000,
        });
      } else if (response) {
        // Update PDF data with response
        setRealTimePdfData((prevData) =>
          parseRealTimeResponse(response, prevData)
        );
        
        const slideCount = requestData.metaJson?.length || 0;
        toast.success(`세그먼트 처리 완료 (${slideCount}개 슬라이드)`, {
          position: "top-center",
          autoClose: 2000,
        });
      }
      
      // API 완료 시에는 별도 액션 불필요 (이미 녹음이 재시작됨)
      restartRecordingAfterAPI();
    });
  }

  // Auto segment fetch handler (30초 간격)
  const handleAutoSegmentFetch = useCallback(async () => {
    const manager = recordingManagerRef.current;
    if (!manager || !manager.getState().isRecording || isUploading) {
      return;
    }

    try {
      setIsUploading(true);
      manager.setUploading(true);

      const { audioBlob, metaJson } = await manager.prepareSegmentForProcessing();

      if (audioBlob && metaJson.length > 0) {
        // Add to queue instead of direct API call
        apiQueue.enqueue({
          jobId,
          audioBlob,
          metaJson
        });
        
        console.log("Auto segment queued for processing");
        
        // 요청을 큐에 추가한 즉시 녹음 재시작
        await restartRecordingImmediately();
      }
    } catch (error) {
      console.error("Error in auto segment fetch:", error);
      setIsUploading(false);
      manager.setUploading(false);
    }
  }, [jobId, isUploading]);

  // 즉시 녹음 재시작 (요청 큐에 추가한 직후)
  const restartRecordingImmediately = useCallback(async () => {
    const manager = recordingManagerRef.current;
    if (!manager || !manager.getState().isRecording) {
      return;
    }

    try {
      await manager.restartRecording();
      console.log("Recording restarted immediately after queueing");
      
      // UI 상태 즉시 업데이트
      setIsUploading(false);
      manager.setUploading(false);
    } catch (error) {
      console.error("Failed to restart recording immediately:", error);
      setIsUploading(false);
      manager.setUploading(false);
    }
  }, []);

  // API 완료 후 처리 (이제는 UI 업데이트만)
  const restartRecordingAfterAPI = useCallback(async () => {
    // API 완료 시에는 별도 액션 불필요 (이미 녹음이 재시작됨)
    console.log("API request completed - no action needed (recording already restarted)");
  }, []);

  // Handle slide transitions
  const handleSlideTransition = useCallback(async (newSlideNumber) => {
    const manager = recordingManagerRef.current;
    if (!manager || !manager.getState().isRecording || isUploading) {
      return;
    }

    const result = manager.handleSlideTransition(newSlideNumber);
    
    // If slide transition warrants processing (5+ seconds)
    if (result.shouldProcess) {
      try {
        setIsUploading(true);
        manager.setUploading(true);

        const { audioBlob, metaJson } = await manager.prepareSegmentForProcessing();

        if (audioBlob && metaJson.length > 0) {
          // Add to queue
          apiQueue.enqueue({
            jobId,
            audioBlob,
            metaJson
          });
          
          console.log("Slide transition segment queued for processing");
          
          // 요청을 큐에 추가한 즉시 녹음 재시작
          await restartRecordingImmediately();
        }
      } catch (error) {
        console.error("Error in slide transition:", error);
        setIsUploading(false);
        manager.setUploading(false);
      }
    }
  }, [jobId, isUploading, restartRecordingImmediately]);

  // Start real-time session
  const handleStartRealTime = useCallback(async () => {
    try {
      let currentJobId = jobId;
      
      // Create new job if needed
      if (!currentJobId) {
        const response = await processService.startRealTime();
        currentJobId = response.jobId;
        setJobId(currentJobId);
      }

      setIsRealTimeActive(true);
      setShowGuidanceModal(true);
      
      toast.success("실시간 변환이 시작되었습니다!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Failed to start real-time conversion:", error);
      toast.error("실시간 변환 시작에 실패했습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [jobId]);

  // Start recording
  const startRecording = useCallback(async (currentSlide = 1) => {
    const manager = recordingManagerRef.current;
    if (!manager) return;

    const success = await manager.startRecording(currentSlide);
    if (success) {
      setIsRecording(true);
      setRecordingTime("00:00.000");
      setCurrentSegmentTime("00:00.000");
      setShowGuidanceModal(false);

      toast.info("녹음이 시작되었습니다.", {
        position: "top-center",
        autoClose: 1500,
      });
    }
  }, []);

  // Stop recording completely
  const handlePauseRecording = useCallback(async () => {
    const manager = recordingManagerRef.current;
    if (!manager || !manager.getState().isRecording) return;

    try {
      // Process final segment if long enough
      const now = new Date();
      const segmentDuration = (now - manager.segmentStartTimeRef) / 1000;

      if (segmentDuration >= 5) { // 5초 이상인 경우
        setIsUploading(true);
        manager.setUploading(true);

        const { audioBlob, metaJson } = await manager.prepareSegmentForProcessing();

        if (audioBlob && metaJson.length > 0) {
          apiQueue.enqueue({
            jobId,
            audioBlob,
            metaJson
          });
        }
      }

      // Stop recording
      await manager.stopRecording();
      
      // Clear any pending API requests
      const clearedCount = apiQueue.clear();
      console.log(`Cleared ${clearedCount} pending API requests`);

      // Reset state
      setIsRecording(false);
      setIsRealTimeActive(false);
      setJobId(null);
      setRecordingTime("00:00.000");
      setCurrentSegmentTime("00:00.000");
      setIsUploading(false);

      toast.success("실시간 변환이 종료되었습니다.", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      toast.error("녹음 종료 중 오류가 발생했습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [jobId]);

  return {
    // State
    isRealTimeActive,
    isRecording,
    isUploading,
    jobId,
    showGuidanceModal,
    realTimePdfData,
    recordingTime,
    currentSegmentTime,
    
    // Actions
    handleStartRealTime,
    startRecording,
    handlePauseRecording,
    handleSlideTransition,
    setShowGuidanceModal,
    
    // Queue info
    queueLength: apiQueue.getQueueLength(),
    isProcessingQueue: apiQueue.isCurrentlyProcessing()
  };
};