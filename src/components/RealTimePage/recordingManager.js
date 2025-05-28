/**
 * Recording Manager for handling audio recording and segment management
 * Extracted from RealTimePage.js for better separation of concerns
 */

export class RecordingManager {
  constructor() {
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
    
    // Callbacks
    this.onTimeUpdate = null;
    this.onAutoFetch = null;
    this.onError = null;
  }

  /**
   * Formats time from milliseconds to MM:SS.sss
   */
  formatRecordingTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  }

  /**
   * Sets callback functions
   */
  setCallbacks({ onTimeUpdate, onAutoFetch, onError }) {
    this.onTimeUpdate = onTimeUpdate;
    this.onAutoFetch = onAutoFetch;
    this.onError = onError;
  }

  /**
   * Starts recording audio
   */
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

      // Initialize slide meta for current slide
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

  /**
   * Starts the recording timer
   */
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

      // Auto-fetch after 30 seconds (10초 -> 30초로 수정)
      if (
        segmentElapsed >= 30000 && // 30 seconds
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

  /**
   * Stops timer
   */
  stopTimer() {
    if (this.timerIntervalRef) {
      clearInterval(this.timerIntervalRef);
      this.timerIntervalRef = null;
    }
  }

  /**
   * Handles slide transition
   */
  handleSlideTransition(newSlideNumber) {
    if (!this.isRecording || !this.segmentStartTimeRef) {
      return { shouldProcess: false };
    }

    const now = new Date();
    const segmentDuration = (now - this.segmentStartTimeRef) / 1000;
    const currentSegmentElapsed = now - this.segmentStartTimeRef;
    const endTimeFormatted = this.formatRecordingTime(currentSegmentElapsed);

    // Update end time for current slide
    if (this.slideMetaRef.length > 0) {
      this.slideMetaRef[this.slideMetaRef.length - 1].end_time = endTimeFormatted;
    }

    // Add new slide
    this.slideMetaRef.push({
      slide_id: newSlideNumber,
      start_time: this.formatRecordingTime(currentSegmentElapsed),
      end_time: null,
    });

    this.currentSlideRef = newSlideNumber;

    // Return whether we should process (5+ seconds)
    return {
      shouldProcess: segmentDuration >= 5,
      segmentDuration,
      metaJson: this.slideMetaRef.filter(slide => slide.end_time !== null)
    };
  }

  /**
   * Prepares current segment for processing
   */
  async prepareSegmentForProcessing() {
    if (!this.mediaRecorderRef || !this.isRecording) {
      return { audioBlob: null, metaJson: [] };
    }

    // Update end time for current segment
    const now = new Date();
    const currentSegmentElapsed = now - this.segmentStartTimeRef;
    const endTimeFormatted = this.formatRecordingTime(currentSegmentElapsed);

    if (this.slideMetaRef.length > 0) {
      this.slideMetaRef[this.slideMetaRef.length - 1].end_time = endTimeFormatted;
    }

    // Get audio blob
    const audioBlob = await this.stopRecordingForSegment();
    
    // Get complete slides (those with end_time)
    const metaJson = this.slideMetaRef.filter(slide => slide.end_time !== null);

    return { audioBlob, metaJson };
  }

  /**
   * Stops recording temporarily for segment processing
   */
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

  /**
   * Restarts recording after segment processing
   */
  async restartRecording() {
    if (!this.isRecording) return false;

    try {
      // Get new media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorderRef = mediaRecorder;
      this.audioChunksRef = [];
      this.segmentStartTimeRef = new Date();

      // Reset slide meta for new segment, starting from 00:00.000
      this.slideMetaRef = [
        {
          slide_id: this.currentSlideRef,
          start_time: "00:00.000",
          end_time: null,
        },
      ];

      // Reset auto fetch trigger
      this.autoFetchTriggeredRef = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunksRef.push(event.data);
        }
      };

      mediaRecorder.start();
      
      // Update segment time display
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

  /**
   * Completely stops recording
   */
  async stopRecording() {
    return new Promise((resolve) => {
      this.isRecording = false;
      this.stopTimer();

      if (this.mediaRecorderRef && this.mediaRecorderRef.state === "recording") {
        this.mediaRecorderRef.onstop = () => {
          const audioBlob = new Blob(this.audioChunksRef, {
            type: "audio/wav",
          });
          
          // Stop all tracks
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

  /**
   * Sets uploading state
   */
  setUploading(isUploading) {
    this.isUploading = isUploading;
  }

  /**
   * Gets current recording state
   */
  getState() {
    return {
      isRecording: this.isRecording,
      isUploading: this.isUploading,
      currentSlide: this.currentSlideRef,
      slideMetaLength: this.slideMetaRef.length
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopTimer();
    if (this.mediaRecorderRef && this.mediaRecorderRef.stream) {
      this.mediaRecorderRef.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    this.isRecording = false;
    this.slideMetaRef = [];
    this.audioChunksRef = [];
  }
}