// 새로운 스트리밍 방식의 실시간 상태 관리자
// WebSocket 기반 실시간 음성 인식 시스템

import { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { StreamingSTT } from "./streamingSTT";

export const useRealTimeState = (initialData, initialJobId) => {
  // 상태 변수들
  const [isRealTimeActive, setIsRealTimeActive] = useState(!!initialJobId);
  const [showGuidanceModal, setShowGuidanceModal] = useState(!!initialJobId);
  const [realTimePdfData, setRealTimePdfData] = useState(initialData);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // 슬라이드별 음성 인식 결과 저장
  const [voiceMap, setVoiceMap] = useState({});
  const [currentSlide, setCurrentSlide] = useState(1);

  // 스트리밍 STT 인스턴스
  const streamingSTTRef = useRef(null);

  // 스트리밍 STT 초기화
  if (!streamingSTTRef.current) {
    streamingSTTRef.current = new StreamingSTT();

    // 콜백 설정
    streamingSTTRef.current.setCallbacks({
      onTranscriptUpdate: (data) => {
        console.log('음성 인식 결과 업데이트:', data);
        
        // 백엔드에서 전체 슬라이드 데이터를 받아서 처리
        if (data) {
          // realTimeDataParser를 사용해서 기존 데이터와 병합
          setRealTimePdfData((prevData) => {
            const { parseRealTimeResponse } = require('./realTimeDataParser');
            return parseRealTimeResponse(data, prevData);
          });
          
          // 슬라이드별 음성 인식 결과만 별도로 추출 (UI 표시용)
          const slideKeys = Object.keys(data).filter(key => key.startsWith('slide'));
          const newVoiceMap = {};
          slideKeys.forEach(slideKey => {
            const slideNumber = slideKey.replace('slide', '');
            const segments = data[slideKey].Segments || {};
            const segmentTexts = Object.values(segments).map(segment => segment.text).join(' ');
            if (segmentTexts.trim()) {
              newVoiceMap[slideNumber] = segmentTexts;
            }
          });
          
          setVoiceMap(prev => ({ ...prev, ...newVoiceMap }));
        }
      },
      onError: (message) => {
        console.error("스트리밍 STT 오류:", message);
        toast.error(message, {
          position: "top-center",
          autoClose: 3000,
        });
      },
      onConnectionChange: (connected) => {
        setIsConnected(connected);
        if (connected) {
          toast.success("음성 인식 서버에 연결되었습니다.", {
            position: "top-center",
            autoClose: 2000,
          });
        } else {
          toast.warning("음성 인식 서버 연결이 끊어졌습니다.", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      },
    });
  }

  // 실시간 세션 시작
  const handleStartRealTime = useCallback(async () => {
    try {
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
  }, []);

  // 녹음 시작
  const startRecording = useCallback(async (slideNumber = 1, jobId = null) => {
    try {
      const stt = streamingSTTRef.current;
      if (!stt) return false;

      // 현재 슬라이드 설정
      setCurrentSlide(slideNumber);
      stt.setCurrentSlide(slideNumber);

      // 스트리밍 시작 (jobId와 함께)
      const success = await stt.startStreaming(jobId);

      if (success) {
        setIsRecording(true);
        setShowGuidanceModal(false);

        toast.info("음성 인식이 시작되었습니다.", {
          position: "top-center",
          autoClose: 1500,
        });
      }

      return success;
    } catch (error) {
      console.error("녹음 시작 실패:", error);
      toast.error("음성 인식을 시작할 수 없습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
      return false;
    }
  }, []);

  // 녹음 중지
  const handlePauseRecording = useCallback(async () => {
    try {
      const stt = streamingSTTRef.current;
      if (!stt) return;

      await stt.stopStreaming();

      // 상태 초기화
      setIsRecording(false);
      setIsRealTimeActive(false);
      setIsConnected(false);
      setCurrentSlide(1);

      toast.success("음성 인식이 종료되었습니다.", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("녹음 중지 중 오류:", error);
      toast.error("음성 인식 종료 중 오류가 발생했습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, []);

  // 슬라이드 전환 처리
  const handleSlideTransition = useCallback((newSlideNumber) => {
    const stt = streamingSTTRef.current;
    if (!stt || !stt.isStreamingActive()) return;

    // 새 슬라이드 번호로 업데이트
    setCurrentSlide(newSlideNumber);
    stt.setCurrentSlide(newSlideNumber);

    console.log(`슬라이드 전환: ${newSlideNumber}`);
  }, []);

  // 특정 슬라이드의 음성 인식 결과 가져오기
  const getTranscriptForSlide = useCallback(
    (slideNumber) => {
      return voiceMap[slideNumber] || "";
    },
    [voiceMap]
  );

  // 현재 슬라이드의 음성 인식 결과 가져오기
  const getCurrentTranscript = useCallback(() => {
    return voiceMap[currentSlide] || "";
  }, [voiceMap, currentSlide]);

  // 모든 슬라이드의 음성 인식 결과 초기화
  const clearAllTranscripts = useCallback(() => {
    setVoiceMap({});
  }, []);

  // 컴포넌트 언마운트 시 정리
  const cleanup = useCallback(() => {
    const stt = streamingSTTRef.current;
    if (stt) {
      stt.cleanup();
    }
  }, []);

  return {
    // 상태
    isRealTimeActive,
    isRecording,
    isConnected,
    showGuidanceModal,
    realTimePdfData,
    currentSlide,
    voiceMap,

    // 기존 호환성을 위한 더미 값들
    recordingTime: "00:00.000",
    currentSegmentTime: "00:00.000",
    isUploading: false,
    queueLength: 0,
    isProcessingQueue: false,

    // 액션
    handleStartRealTime,
    startRecording,
    handlePauseRecording,
    handleSlideTransition,
    setShowGuidanceModal,

    // 음성 인식 관련 액션
    getTranscriptForSlide,
    getCurrentTranscript,
    clearAllTranscripts,
    cleanup,
  };
};
