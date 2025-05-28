// 실시간 페이지를 위한 상태 관리자
// 상태 관리와 API 상호작용을 중앙화

import { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { RecordingManager } from "./recordingManager";
import { apiQueue } from "./apiQueue";
import { parseRealTimeResponse } from "./realTimeDataParser";
import { processService } from "../../api/processService";

export const useRealTimeState = (initialData, initialJobId) => {
  // 상태 변수들
  const [isRealTimeActive, setIsRealTimeActive] = useState(!!initialJobId);
  const [jobId, setJobId] = useState(initialJobId);
  const [showGuidanceModal, setShowGuidanceModal] = useState(!!initialJobId);
  const [realTimePdfData, setRealTimePdfData] = useState(initialData);
  const [recordingTime, setRecordingTime] = useState("00:00.000");
  const [currentSegmentTime, setCurrentSegmentTime] = useState("00:00.000");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 녹음 관리자 인스턴스
  const recordingManagerRef = useRef(null);

  // 녹음 관리자 초기화
  if (!recordingManagerRef.current) {
    recordingManagerRef.current = new RecordingManager();

    // 콜백 설정
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
      },
    });

    // API 큐 완료 핸들러 설정
    apiQueue.setGlobalCompletionHandler((response, requestData, error) => {
      if (error) {
        console.error("API 요청 실패:", error);
        toast.error("음성 처리에 실패했습니다.", {
          position: "top-center",
          autoClose: 3000,
        });
      } else if (response) {
        // 응답으로 PDF 데이터 업데이트
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

  // 즉시 녹음 재시작 (요청 큐에 추가한 직후)
  const restartRecordingImmediately = useCallback(async () => {
    const manager = recordingManagerRef.current;
    if (!manager || !manager.getState().isRecording) {
      return;
    }

    try {
      await manager.restartRecording();
      console.log("큐 추가 후 즉시 녹음 재시작됨");

      // UI 상태 즉시 업데이트
      setIsUploading(false);
      manager.setUploading(false);
    } catch (error) {
      console.error("즉시 녹음 재시작 실패:", error);
      setIsUploading(false);
      manager.setUploading(false);
    }
  }, []);

  // 자동 세그먼트 가져오기 핸들러 (30초 간격)
  const handleAutoSegmentFetch = useCallback(async () => {
    const manager = recordingManagerRef.current;
    if (!manager || !manager.getState().isRecording || isUploading) {
      return;
    }

    try {
      setIsUploading(true);
      manager.setUploading(true);

      const { audioBlob, metaJson } =
        await manager.prepareSegmentForProcessing();

      if (audioBlob && metaJson.length > 0) {
        // 직접 API 호출 대신 큐에 추가
        apiQueue.enqueue({
          jobId,
          audioBlob,
          metaJson,
        });

        console.log("자동 세그먼트가 처리 대기열에 추가됨");

        // 요청을 큐에 추가한 즉시 녹음 재시작
        await restartRecordingImmediately();
      }
    } catch (error) {
      console.error("자동 세그먼트 가져오기 오류:", error);
      setIsUploading(false);
      manager.setUploading(false);
    }
  }, [jobId, isUploading, restartRecordingImmediately]);

  // API 완료 후 처리 (이제는 UI 업데이트만)
  const restartRecordingAfterAPI = useCallback(async () => {
    // API 완료 시에는 별도 액션 불필요 (이미 녹음이 재시작됨)
    console.log("API 요청 완료 - 추가 액션 불필요 (이미 녹음이 재시작됨)");
  }, []);

  // 슬라이드 전환 처리
  const handleSlideTransition = useCallback(
    async (newSlideNumber) => {
      const manager = recordingManagerRef.current;
      if (!manager || !manager.getState().isRecording || isUploading) {
        return;
      }

      const result = manager.handleSlideTransition(newSlideNumber);

      // 슬라이드 전환이 처리가 필요한 경우 (5초 이상)
      if (result.shouldProcess) {
        try {
          setIsUploading(true);
          manager.setUploading(true);

          const { audioBlob, metaJson } =
            await manager.prepareSegmentForProcessing();

          if (audioBlob && metaJson.length > 0) {
            // 큐에 추가
            apiQueue.enqueue({
              jobId,
              audioBlob,
              metaJson,
            });

            console.log("슬라이드 전환 세그먼트가 처리 대기열에 추가됨");

            // 요청을 큐에 추가한 즉시 녹음 재시작
            await restartRecordingImmediately();
          }
        } catch (error) {
          console.error("슬라이드 전환 중 오류:", error);
          setIsUploading(false);
          manager.setUploading(false);
        }
      }
    },
    [jobId, isUploading, restartRecordingImmediately]
  );

  // 실시간 세션 시작
  const handleStartRealTime = useCallback(async () => {
    try {
      let currentJobId = jobId;

      // 필요한 경우 새 작업 생성
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
      console.error("실시간 변환 시작 실패:", error);
      toast.error("실시간 변환 시작에 실패했습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [jobId]);

  // 녹음 시작
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

  // 녹음 완전 중지
  const handlePauseRecording = useCallback(async () => {
    const manager = recordingManagerRef.current;
    if (!manager || !manager.getState().isRecording) return;

    try {
      // 충분히 긴 경우 마지막 세그먼트 처리
      const now = new Date();
      const segmentDuration = (now - manager.segmentStartTimeRef) / 1000;

      if (segmentDuration >= 5) {
        // 5초 이상인 경우
        setIsUploading(true);
        manager.setUploading(true);

        const { audioBlob, metaJson } =
          await manager.prepareSegmentForProcessing();

        if (audioBlob && metaJson.length > 0) {
          apiQueue.enqueue({
            jobId,
            audioBlob,
            metaJson,
          });
        }
      }

      // 녹음 중지
      await manager.stopRecording();

      // 대기 중인 API 요청 정리
      const clearedCount = apiQueue.clear();
      console.log(`${clearedCount}개의 대기 중인 API 요청이 정리됨`);

      // 상태 초기화
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
      console.error("녹음 중지 중 오류:", error);
      toast.error("녹음 종료 중 오류가 발생했습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [jobId]);

  return {
    // 상태
    isRealTimeActive,
    isRecording,
    isUploading,
    jobId,
    showGuidanceModal,
    realTimePdfData,
    recordingTime,
    currentSegmentTime,

    // 액션
    handleStartRealTime,
    startRecording,
    handlePauseRecording,
    handleSlideTransition,
    setShowGuidanceModal,

    // 큐 정보
    queueLength: apiQueue.getQueueLength(),
    isProcessingQueue: apiQueue.isCurrentlyProcessing(),
  };
};
