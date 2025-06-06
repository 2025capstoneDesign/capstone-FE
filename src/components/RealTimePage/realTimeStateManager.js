// 새로운 스트리밍 방식의 실시간 상태 관리자
// WebSocket 기반 실시간 음성 인식 시스템

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { StreamingSTT } from "./streamingSTT";

export const useRealTimeState = (initialData, initialJobId) => {
  // 상태 변수들
  const [isRealTimeActive, setIsRealTimeActive] = useState(!!initialJobId);
  const [showGuidanceModal, setShowGuidanceModal] = useState(!!initialJobId);
  const [realTimePdfData, setRealTimePdfData] = useState(initialData);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00");

  // 로딩 모달 상태
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // 슬라이드별 음성 인식 결과 저장
  const [voiceMap, setVoiceMap] = useState({});
  const [currentSlide, setCurrentSlide] = useState(1);

  // 스트리밍 STT 인스턴스 및 타이머 관련
  const streamingSTTRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // 타이머 시작 함수
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    
    startTimeRef.current = Date.now() - pausedTimeRef.current;
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setRecordingTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
  }, []);

  // 타이머 일시정지 함수
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      pausedTimeRef.current = Date.now() - startTimeRef.current;
    }
  }, []);

  // 타이머 재시작 함수
  const resumeTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  // 타이머 정지 및 리셋 함수
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setRecordingTime("00:00");
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 스트리밍 STT 초기화
  if (!streamingSTTRef.current) {
    streamingSTTRef.current = new StreamingSTT();

    // 콜백 설정
    streamingSTTRef.current.setCallbacks({
      onTranscriptUpdate: (data) => {
        console.log("음성 인식 결과 업데이트:", data);

        // 백엔드에서 전체 슬라이드 데이터를 받아서 처리
        if (data) {
          // realTimeDataParser를 사용해서 기존 데이터와 병합
          setRealTimePdfData((prevData) => {
            const { parseRealTimeResponse } = require("./realTimeDataParser");
            return parseRealTimeResponse(data, prevData);
          });

          // 슬라이드별 음성 인식 결과만 별도로 추출 (UI 표시용)
          const slideKeys = Object.keys(data).filter((key) =>
            key.startsWith("slide")
          );
          const newVoiceMap = {};
          slideKeys.forEach((slideKey) => {
            const slideNumber = slideKey.replace("slide", "");
            const segments = data[slideKey].Segments || {};
            const segmentTexts = Object.values(segments)
              .map((segment) => segment.text)
              .join(" ");
            if (segmentTexts.trim()) {
              newVoiceMap[slideNumber] = segmentTexts;
            }
          });

          setVoiceMap((prev) => ({ ...prev, ...newVoiceMap }));
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
        setIsPaused(false);
        setShowGuidanceModal(false);
        startTimer();

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

  // 녹음 일시정지/재개 토글
  const handlePauseRecording = useCallback(async () => {
    try {
      const stt = streamingSTTRef.current;
      if (!stt) return;

      if (isPaused) {
        // 재개
        const resumed = stt.resumeRecording();
        if (resumed) {
          setIsPaused(false);
          resumeTimer();
          toast.info("음성 인식을 재개합니다.", {
            position: "top-center",
            autoClose: 1500,
          });
        }
      } else {
        // 일시정지
        const paused = stt.pauseRecording();
        if (paused) {
          setIsPaused(true);
          pauseTimer();
          toast.info("음성 인식을 일시정지했습니다.", {
            position: "top-center",
            autoClose: 1500,
          });
        }
      }
    } catch (error) {
      console.error("녹음 일시정지/재개 중 오류:", error);
      toast.error("음성 인식 제어 중 오류가 발생했습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [isPaused, resumeTimer, pauseTimer]);

  // 녹음 완전 종료 및 홈으로 이동
  const handleStopRecording = useCallback(async (navigate = null, jobId = null, pdfUrl = null, sleepPages = []) => {
    try {
      // jobId가 있으면 즉시 로딩 모달 표시
      if (navigate && jobId) {
        setShowLoadingModal(true);
        setLoadingMessage("음성 인식을 종료하는 중...");
      }

      const stt = streamingSTTRef.current;
      if (!stt) return;

      await stt.stopStreaming();

      // 상태 초기화
      setIsRecording(false);
      setIsPaused(false);
      setIsRealTimeActive(false);
      setIsConnected(false);
      setCurrentSlide(1);
      stopTimer();

      toast.success("음성 인식이 종료되었습니다.", {
        position: "top-center",
        autoClose: 1500,
      });

      // jobId가 있으면 stop API 호출하고 RealTimeEditor로 이동
      if (navigate && jobId) {
        setTimeout(async () => {
          try {
            // Import axios dynamically
            const axios = (await import('axios')).default;
            const API_URL = process.env.REACT_APP_API_URL;
            
            const headers = {};
            const token = localStorage.getItem("accessToken");
            if (token) {
              headers["Authorization"] = `Bearer ${token}`;
            }

            // Step 1: Stop API 호출
            setShowLoadingModal(true);
            setLoadingMessage("실시간 변환을 종료하는 중...");

            const response = await axios.post(
              `${API_URL}/api/realTime/stop-realtime?jobId=${jobId}`,
              {},
              { headers }
            );

            const imageUrls = response.data.image_urls || [];
            
            // Step 2: 이미지 프리로딩
            if (imageUrls.length > 0) {
              setLoadingMessage("슬라이드 이미지를 불러오는 중...");

              // 이미지 프리로딩 함수
              const preloadImages = (urls) => {
                return Promise.all(
                  urls.map((url) => {
                    return new Promise((resolve) => {
                      const img = new Image();
                      const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
                      
                      img.onload = () => resolve(url);
                      img.onerror = () => {
                        console.warn(`Failed to load image: ${fullUrl}`);
                        resolve(url); // 실패해도 계속 진행
                      };
                      
                      // 타임아웃 설정 (10초)
                      setTimeout(() => {
                        console.warn(`Image loading timeout: ${fullUrl}`);
                        resolve(url);
                      }, 10000);
                      
                      img.src = fullUrl;
                    });
                  })
                );
              };

              // 모든 이미지 로딩 완료 대기
              await preloadImages(imageUrls);
              
              setLoadingMessage("이미지 로딩이 완료되었습니다!");
              
              // 잠깐 대기 후 페이지 이동
              setTimeout(() => {
                setShowLoadingModal(false);
                navigate("/real-time-editor", {
                  state: {
                    imageUrls: imageUrls,
                    jobId: jobId,
                    resultJson: response.data.result_json || null,
                    pdfUrl: pdfUrl,
                    sleepPages: sleepPages
                  }
                });
              }, 1000);
            } else {
              setLoadingMessage("생성된 이미지가 없습니다.");
              setTimeout(() => {
                setShowLoadingModal(false);
                navigate("/");
              }, 2000);
            }
          } catch (error) {
            console.error("Stop API 호출 실패:", error);
            setLoadingMessage("실시간 변환 종료 중 오류가 발생했습니다.");
            setTimeout(() => {
              setShowLoadingModal(false);
              navigate("/");
            }, 3000);
          }
        }, 1500);
      } else if (navigate) {
        // jobId가 없으면 홈으로 이동
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      console.error("녹음 종료 중 오류:", error);
      toast.error("음성 인식 종료 중 오류가 발생했습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [stopTimer]);

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

    // 타이머 관련
    recordingTime,
    isPaused,

    // 로딩 모달 관련
    showLoadingModal,
    loadingMessage,

    // 액션
    handleStartRealTime,
    startRecording,
    handlePauseRecording,
    handleStopRecording,
    handleSlideTransition,
    setShowGuidanceModal,

    // 음성 인식 관련 액션
    getTranscriptForSlide,
    getCurrentTranscript,
    clearAllTranscripts,
    cleanup,
  };
};
