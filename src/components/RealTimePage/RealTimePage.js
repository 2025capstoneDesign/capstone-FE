import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PdfViewer from "./PdfViewer";
import SummaryPanel from "../TestPage/SummaryPanel";
import { useLoading } from "../../context/LoadingContext";
import { useHistory } from "../../context/HistoryContext";
import { useAuth } from "../../context/AuthContext";
import { processService } from "../../api/processService";
import { parseRealTimeResponse } from "../Convert/RealTimeConvert/realTimeDataParser";

export default function RealTimePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { convertedData, pdfFile: contextPdfFile } = useLoading();
  const { historyData } = useHistory();

  // Always prioritize location state (from history) if it exists
  // Otherwise use the context data (from conversion)
  const { pdfFile, pdfData, jobId: initialJobId, isRealTimeMode } = location.state
    ? location.state
    : convertedData && contextPdfFile
    ? {
        pdfFile: contextPdfFile,
        pdfData: convertedData,
        jobId: null,
        isRealTimeMode: false,
      }
    : {
        pdfFile: historyData[0]?.pdfFile || "/sample3.pdf",
        pdfData: historyData[0]?.result || { summaryData: {}, voiceData: {} },
        jobId: null,
        isRealTimeMode: false,
      };

  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("ai"); // "ai" or "voice"
  const [highlightColor, setHighlightColor] = useState("red");

  // Real-time recording states
  const [isRealTimeActive, setIsRealTimeActive] = useState(isRealTimeMode);
  const [isRecording, setIsRecording] = useState(false);
  const [jobId, setJobId] = useState(initialJobId);
  const [showGuidanceModal, setShowGuidanceModal] = useState(isRealTimeMode);
  const [isUploading, setIsUploading] = useState(false);
  const [realTimePdfData, setRealTimePdfData] = useState(pdfData);
  const [recordingTime, setRecordingTime] = useState("00:00.000");
  const [currentSegmentTime, setCurrentSegmentTime] = useState("00:00.000");
  
  // Recording refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);
  const segmentStartTimeRef = useRef(null);
  const currentSlideRef = useRef(pageNumber);
  const slideMetaRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // 각 페이지 섹션에 대한 ref를 저장할 객체
  const pageSectionRefs = useRef({});

  // Format time from milliseconds to MM:SS.sss
  const formatRecordingTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  // Update recording timer
  useEffect(() => {
    if (isRecording && recordingStartTimeRef.current) {
      timerIntervalRef.current = setInterval(() => {
        const now = new Date();
        const totalElapsed = now - recordingStartTimeRef.current;
        const segmentElapsed = now - segmentStartTimeRef.current;
        setRecordingTime(formatRecordingTime(totalElapsed));
        setCurrentSegmentTime(formatRecordingTime(segmentElapsed));
      }, 10);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Use pdfFile directly (already a Blob URL or path)
  const pdfUrl = pdfFile;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError(error) {
    console.error("Error loading PDF:", error);
    toast.error("PDF 로딩 중 오류가 발생했습니다", {
      position: "top-center",
      autoClose: 3000,
    });
  }

  const goToPage = (next) => {
    const newPage = Math.min(Math.max(1, pageNumber + next), numPages || 1);
    if (newPage !== pageNumber) {
      // Handle slide transition during recording
      if (isRecording && isRealTimeActive) {
        handleSlideTransition(newPage);
      }
      setPageNumber(newPage);
      currentSlideRef.current = newPage;
    }
  };

  const goPrevPage = () => {
    goToPage(-1);
  };

  const goNextPage = () => {
    goToPage(1);
  };

  const handleConvertClick = () => {
    navigate("/real-time-convert");
  };

  // Real-time conversion handlers
  const handleStartRealTime = async () => {
    try {
      // If we don't have a jobId, start a new real-time session
      if (!jobId) {
        const response = await processService.startRealTime();
        setJobId(response.jobId);
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
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      const now = new Date();
      recordingStartTimeRef.current = now;
      segmentStartTimeRef.current = now;
      
      // Initialize slide meta with current slide
      slideMetaRef.current = [{
        slide_id: currentSlideRef.current,
        start_time: "00:00.000",
        end_time: null
      }];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime("00:00.000");
      setCurrentSegmentTime("00:00.000");
      setShowGuidanceModal(false);
      
      toast.info("녹음이 시작되었습니다.", {
        position: "top-center",
        autoClose: 1500,
      });
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("마이크 접근에 실패했습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const endTime = new Date();
          resolve({ audioBlob, endTime });
        };
        
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      } else {
        resolve({ audioBlob: null, endTime: new Date() });
      }
    });
  };

  const handleSlideTransition = async (newSlideNumber) => {
    if (!isRecording || !segmentStartTimeRef.current || isUploading) {
      return;
    }

    const now = new Date();
    const segmentDuration = (now - segmentStartTimeRef.current) / 1000;
    
    // Update current slide end time in meta
    const currentSegmentElapsed = now - segmentStartTimeRef.current;
    const endTimeFormatted = formatRecordingTime(currentSegmentElapsed);
    
    if (slideMetaRef.current.length > 0) {
      slideMetaRef.current[slideMetaRef.current.length - 1].end_time = endTimeFormatted;
    }
    
    // Add new slide to meta
    slideMetaRef.current.push({
      slide_id: newSlideNumber,
      start_time: formatRecordingTime(currentSegmentElapsed),
      end_time: null
    });
    
    // Check if total duration since last API call is >= 10 seconds
    if (segmentDuration >= 10) {
      await processCurrentSegment();
      // Reset for new segment after API call
      restartSegmentRecording();
    }
    
    console.log('Slide transition recorded:', slideMetaRef.current);
  };

  const processCurrentSegment = async () => {
    if (!mediaRecorderRef.current || isUploading) return;
    
    try {
      setIsUploading(true);
      
      // Stop current recording temporarily to get audio data
      const { audioBlob } = await stopRecordingForSegment();
      
      if (audioBlob) {
        const metaJson = [...slideMetaRef.current];
        
        try {
          const response = await processService.processRealTimeSegment(jobId, audioBlob, metaJson);
          
          // Update PDF data with new response
          setRealTimePdfData(prevData => parseRealTimeResponse(response, prevData));
          
          toast.success(`세그먼트 처리 완료 (${metaJson.length}개 슬라이드)`, {
            position: "top-center",
            autoClose: 2000,
          });
        } catch (error) {
          console.error("Failed to process audio segment:", error);
          toast.error("음성 처리에 실패했습니다.", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Error processing segment:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const stopRecordingForSegment = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          resolve({ audioBlob });
        };
        
        mediaRecorderRef.current.stop();
      } else {
        resolve({ audioBlob: null });
      }
    });
  };

  const restartSegmentRecording = async () => {
    if (!isRecording) return;
    
    try {
      // Get new media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      segmentStartTimeRef.current = new Date();
      
      // Reset slide meta for new segment, starting from 00:00.000
      slideMetaRef.current = [{
        slide_id: currentSlideRef.current,
        start_time: "00:00.000",
        end_time: null
      }];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setCurrentSegmentTime("00:00.000");
      
    } catch (error) {
      console.error("Failed to restart recording:", error);
    }
  };

  const handlePauseRecording = async () => {
    if (!isRecording) return;

    try {
      // Process final segment if there's enough duration
      const now = new Date();
      const segmentDuration = (now - segmentStartTimeRef.current) / 1000;
      
      if (segmentDuration >= 10) {
        // Update final slide end time
        const currentSegmentElapsed = now - segmentStartTimeRef.current;
        const endTimeFormatted = formatRecordingTime(currentSegmentElapsed);
        
        if (slideMetaRef.current.length > 0) {
          slideMetaRef.current[slideMetaRef.current.length - 1].end_time = endTimeFormatted;
        }
        
        await processCurrentSegment();
      }
      
      // Stop recording completely
      await stopRecording();
      
      // Clean up
      setIsRecording(false);
      setIsRealTimeActive(false);
      setJobId(null);
      setRecordingTime("00:00.000");
      setCurrentSegmentTime("00:00.000");
      slideMetaRef.current = [];
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      toast.success("실시간 변환이 종료되었습니다.", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error pausing recording:", error);
    }
  };

  const handleDownload = () => {
    if (pdfUrl && typeof pdfUrl === "string") {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h1 className="page-title">실시간 강의</h1>
        <div className="action-buttons">
          {!isRealTimeActive ? (
            <button className="convert-btn" onClick={handleStartRealTime}>
              실시간 변환 시작
            </button>
          ) : (
            <button className="convert-btn" onClick={handlePauseRecording} disabled={isUploading}>
              {isUploading ? "처리 중..." : "실시간 변환 종료"}
            </button>
          )}
          <button className="convert-btn" onClick={handleConvertClick}>
            다시 변환하기
          </button>
          <button className="download-btn" onClick={handleDownload}>
            다운로드
          </button>
        </div>
      </div>
      <div className="main-content">
        <ToastContainer />
        
        {/* Recording Guidance Modal */}
        {showGuidanceModal && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              textAlign: 'center',
              maxWidth: '400px',
              margin: '20px'
            }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>실시간 변환 가이드</h3>
              <p style={{ marginBottom: '25px', lineHeight: '1.5' }}>
                마이크 버튼을 누르면 녹음이 시작됩니다.<br/>
                슬라이드를 넘기거나 종료 버튼을 누르면 음성이 처리됩니다.
              </p>
              <button 
                onClick={() => setShowGuidanceModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#5CBFBC',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}
        
        <PdfViewer
          pdfUrl={pdfUrl}
          pageNumber={pageNumber}
          numPages={numPages}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onDocumentLoadError={onDocumentLoadError}
          goPrevPage={goPrevPage}
          goNextPage={goNextPage}
          isRealTimeActive={isRealTimeActive}
          isRecording={isRecording}
          startRecording={startRecording}
          showGuidanceModal={showGuidanceModal}
          recordingTime={recordingTime}
          currentSegmentTime={currentSegmentTime}
        />
        <SummaryPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          numPages={numPages}
          summaryData={realTimePdfData?.summaryData || {}}
          voiceData={realTimePdfData?.voiceData || {}}
          pageSectionRefs={pageSectionRefs}
        />
      </div>
    </div>
  );
}
