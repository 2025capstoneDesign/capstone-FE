// 오디오 녹음 및 세그먼트 관리를 위한 녹음 관리자
//관심사 분리를 위해 RealTimePage.js에서 추출됨

export class RecordingManager {
  constructor() {
    // 녹음 시간 상수 (밀리초 단위)
    this.AUTO_FETCH_THRESHOLD = 30000; // 30초
    this.MIN_SEGMENT_DURATION = 5000; // 5초

    this.mediaRecorderRef = null;
    this.audioChunksRef = [];
    this.recordingStartTimeRef = null;
    this.segmentStartTimeRef = null;
    this.currentSlideRef = 1;
    this.slideMetaRef = [];
    this.timerIntervalRef = null;
    this.autoFetchTriggeredRef = false;
    this.isRecording = false;
    this.isUploading = false;

    // 콜백 함수들
    this.onTimeUpdate = null;
    this.onAutoFetch = null;
    this.onError = null;
  }

  // 포맷 변환 (밀리초 -> MM:SS.sss)
  formatRecordingTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  }

  // 콜백 함수 설정
  setCallbacks({ onTimeUpdate, onAutoFetch, onError }) {
    this.onTimeUpdate = onTimeUpdate;
    this.onAutoFetch = onAutoFetch;
    this.onError = onError;
  }

  // 녹음 시작
  async startRecording(currentSlide = 1) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorderRef = mediaRecorder;
      this.audioChunksRef = [];
      const now = new Date();
      this.recordingStartTimeRef = now;
      this.segmentStartTimeRef = now;
      this.currentSlideRef = currentSlide;
      this.isRecording = true;

      // 현재 슬라이드 메타 초기화
      this.slideMetaRef = [
        {
          slide_id: this.currentSlideRef,
          start_time: "00:00.000",
          end_time: null,
        },
      ];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunksRef.push(event.data);
        }
      };

      mediaRecorder.start();
      this.startTimer();

      console.log("Recording started successfully");
      return true;
    } catch (error) {
      console.error("Failed to start recording:", error);
      if (this.onError) {
        this.onError("마이크 접근에 실패했습니다.");
      }
      return false;
    }
  }

  // 녹음 타이머 시작
  startTimer() {
    if (this.timerIntervalRef) {
      clearInterval(this.timerIntervalRef);
    }

    this.autoFetchTriggeredRef = false;
    this.timerIntervalRef = setInterval(() => {
      if (!this.isRecording || !this.recordingStartTimeRef) return;

      const now = new Date();
      const totalElapsed = now - this.recordingStartTimeRef;
      const segmentElapsed = now - this.segmentStartTimeRef;

      const totalTime = this.formatRecordingTime(totalElapsed);
      const segmentTime = this.formatRecordingTime(segmentElapsed);

      if (this.onTimeUpdate) {
        this.onTimeUpdate(totalTime, segmentTime);
      }

      // 30초 후 자동 fetch
      if (
        segmentElapsed >= this.AUTO_FETCH_THRESHOLD &&
        !this.isUploading &&
        !this.autoFetchTriggeredRef
      ) {
        this.autoFetchTriggeredRef = true;
        if (this.onAutoFetch) {
          this.onAutoFetch();
        }
      }
    }, 10);
  }

  // 타이머 중지
  stopTimer() {
    if (this.timerIntervalRef) {
      clearInterval(this.timerIntervalRef);
      this.timerIntervalRef = null;
    }
  }

  // 슬라이드 전환 처리
  handleSlideTransition(newSlideNumber) {
    if (!this.isRecording || !this.segmentStartTimeRef) {
      return { shouldProcess: false };
    }

    const now = new Date();
    const segmentDuration = now - this.segmentStartTimeRef;
    const currentSegmentElapsed = now - this.segmentStartTimeRef;
    const endTimeFormatted = this.formatRecordingTime(currentSegmentElapsed);

    // 끝 시간 업데이트
    if (this.slideMetaRef.length > 0) {
      this.slideMetaRef[this.slideMetaRef.length - 1].end_time =
        endTimeFormatted;
    }

    // 새 슬라이드 추가
    this.slideMetaRef.push({
      slide_id: newSlideNumber,
      start_time: this.formatRecordingTime(currentSegmentElapsed),
      end_time: null,
    });

    this.currentSlideRef = newSlideNumber;

    // 처리 여부 반환 (5초 이상)
    return {
      shouldProcess: segmentDuration >= this.MIN_SEGMENT_DURATION,
      segmentDuration: segmentDuration / 1000, // Convert to seconds for display
      metaJson: this.slideMetaRef.filter((slide) => slide.end_time !== null),
    };
  }

  // 현재 세그먼트 처리 준비
  async prepareSegmentForProcessing() {
    if (!this.mediaRecorderRef || !this.isRecording) {
      return { audioBlob: null, metaJson: [] };
    }

    // 끝 시간 업데이트
    const now = new Date();
    const currentSegmentElapsed = now - this.segmentStartTimeRef;
    const endTimeFormatted = this.formatRecordingTime(currentSegmentElapsed);

    if (this.slideMetaRef.length > 0) {
      this.slideMetaRef[this.slideMetaRef.length - 1].end_time =
        endTimeFormatted;
    }

    // 오디오 블롭 가져오기
    const audioBlob = await this.stopRecordingForSegment();

    // 완료된 슬라이드 가져오기 (end_time이 있는 것들)
    const metaJson = this.slideMetaRef.filter(
      (slide) => slide.end_time !== null
    );

    return { audioBlob, metaJson };
  }

  // 세그먼트 처리를 위해 일시적으로 녹음 중지
  stopRecordingForSegment() {
    return new Promise((resolve) => {
      if (
        this.mediaRecorderRef &&
        this.mediaRecorderRef.state === "recording"
      ) {
        this.mediaRecorderRef.onstop = () => {
          const audioBlob = new Blob(this.audioChunksRef, {
            type: "audio/wav",
          });
          resolve(audioBlob);
        };

        this.mediaRecorderRef.stop();
      } else {
        resolve(null);
      }
    });
  }

  // 세그먼트 처리 후 녹음 재시작
  async restartRecording() {
    if (!this.isRecording) return false;

    try {
      // 새 미디어 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorderRef = mediaRecorder;
      this.audioChunksRef = [];
      this.segmentStartTimeRef = new Date();

      // 새 세그먼트를 위해 슬라이드 메타 초기화, 00:00.000부터 시작
      this.slideMetaRef = [
        {
          slide_id: this.currentSlideRef,
          start_time: "00:00.000",
          end_time: null,
        },
      ];

      // 자동 fetch 트리거 초기화
      this.autoFetchTriggeredRef = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunksRef.push(event.data);
        }
      };

      mediaRecorder.start();

      // 세그먼트 시간 표시 업데이트
      if (this.onTimeUpdate) {
        this.onTimeUpdate(
          this.formatRecordingTime(new Date() - this.recordingStartTimeRef),
          "00:00.000"
        );
      }

      console.log("Recording restarted successfully");
      return true;
    } catch (error) {
      console.error("Failed to restart recording:", error);
      if (this.onError) {
        this.onError("녹음 재시작에 실패했습니다.");
      }
      return false;
    }
  }

  // 녹음 완전 중지
  async stopRecording() {
    return new Promise((resolve) => {
      this.isRecording = false;
      this.stopTimer();

      if (
        this.mediaRecorderRef &&
        this.mediaRecorderRef.state === "recording"
      ) {
        this.mediaRecorderRef.onstop = () => {
          const audioBlob = new Blob(this.audioChunksRef, {
            type: "audio/wav",
          });

          // 모든 트랙 중지
          if (this.mediaRecorderRef.stream) {
            this.mediaRecorderRef.stream
              .getTracks()
              .forEach((track) => track.stop());
          }

          resolve({ audioBlob, endTime: new Date() });
        };

        this.mediaRecorderRef.stop();
      } else {
        resolve({ audioBlob: null, endTime: new Date() });
      }
    });
  }

  // 업로드 상태 설정
  setUploading(isUploading) {
    this.isUploading = isUploading;
  }

  // 현재 녹음 상태 가져오기
  getState() {
    return {
      isRecording: this.isRecording,
      isUploading: this.isUploading,
      currentSlide: this.currentSlideRef,
      slideMetaLength: this.slideMetaRef.length,
    };
  }

  // 리소스 정리
  cleanup() {
    this.stopTimer();
    if (this.mediaRecorderRef && this.mediaRecorderRef.stream) {
      this.mediaRecorderRef.stream.getTracks().forEach((track) => track.stop());
    }
    this.isRecording = false;
    this.slideMetaRef = [];
    this.audioChunksRef = [];
  }
}
