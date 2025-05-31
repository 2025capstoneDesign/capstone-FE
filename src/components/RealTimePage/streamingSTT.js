// 새로운 스트리밍 STT 시스템
// WebSocket + AudioWorklet 기반 실시간 음성 인식

export class StreamingSTT {
  constructor() {
    this.webSocket = null;
    this.audioContext = null;
    this.processor = null;
    this.microphone = null;
    this.isActive = false;
    this.isPaused = false;
    this.currentSlide = 1;
    
    // 콜백 함수들
    this.onTranscriptUpdate = null;
    this.onError = null;
    this.onConnectionChange = null;
  }

  // 콜백 함수 설정
  setCallbacks({ onTranscriptUpdate, onError, onConnectionChange }) {
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onError = onError;
    this.onConnectionChange = onConnectionChange;
  }

  // 슬라이드 번호 업데이트
  setCurrentSlide(slideNumber) {
    this.currentSlide = slideNumber;
    console.log(`슬라이드 번호 변경: ${slideNumber}`);
  }

  // WebSocket 연결 설정
  setupWebSocket(jobId = null) {
    return new Promise((resolve, reject) => {
      try {
        // WebSocket 서버 주소
        const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8001';
        this.webSocket = new WebSocket(wsUrl);

        this.webSocket.onopen = () => {
          console.log('WebSocket 연결됨');
          
          // 초기 연결 시 jobId 전송 (있는 경우)
          if (jobId) {
            this.webSocket.send(JSON.stringify({
              "jobId": jobId
            }));
            console.log('JobId 전송됨:', jobId);
          }
          
          if (this.onConnectionChange) {
            this.onConnectionChange(true);
          }
          resolve();
        };

        this.webSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('서버로부터 받은 데이터:', data);
            
            // 슬라이드별 음성 인식 결과 처리
            if (this.onTranscriptUpdate) {
              this.onTranscriptUpdate(data);
            }
            
            if (data.error && this.onError) {
              this.onError(`서버 오류: ${data.error}`);
            }
          } catch (error) {
            console.error('WebSocket 메시지 파싱 오류:', error);
          }
        };

        this.webSocket.onerror = (error) => {
          console.error('WebSocket 오류:', error);
          if (this.onError) {
            this.onError('WebSocket 연결 오류가 발생했습니다.');
          }
          reject(error);
        };

        this.webSocket.onclose = () => {
          console.log('WebSocket 연결 종료됨');
          if (this.onConnectionChange) {
            this.onConnectionChange(false);
          }
        };

      } catch (error) {
        console.error('WebSocket 설정 오류:', error);
        reject(error);
      }
    });
  }

  // AudioWorklet 및 마이크 설정
  async setupAudio() {
    try {
      // AudioContext 생성
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      // AudioWorklet 모듈 로드
      await this.audioContext.audioWorklet.addModule('/linear16-processor.js');

      // 마이크 스트림 가져오기
      this.microphone = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const source = this.audioContext.createMediaStreamSource(this.microphone);
      
      // AudioWorkletProcessor 생성
      this.processor = new AudioWorkletNode(this.audioContext, 'linear16-processor');
      
      // 오디오 데이터 처리
      this.processor.port.onmessage = (event) => {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN && !this.isPaused) {
          // Int16Array를 base64로 인코딩
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(event.data)));
          
          // 슬라이드 번호와 함께 전송
          this.webSocket.send(JSON.stringify({
            slide: this.currentSlide,
            audio: base64Audio
          }));
        }
      };

      // 오디오 그래프 연결
      source.connect(this.processor);
      
      console.log('오디오 설정 완료');
      return true;
    } catch (error) {
      console.error('오디오 설정 오류:', error);
      if (this.onError) {
        this.onError('마이크 접근에 실패했습니다.');
      }
      return false;
    }
  }

  // 스트리밍 STT 시작
  async startStreaming(jobId = null) {
    try {
      if (this.isActive) {
        console.log('이미 스트리밍 중입니다.');
        return true;
      }

      // WebSocket 연결 (jobId와 함께)
      await this.setupWebSocket(jobId);
      
      // 오디오 설정
      const audioSetup = await this.setupAudio();
      if (!audioSetup) {
        return false;
      }

      // AudioContext resume (사용자 제스처 후 필요)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // 프로세서 시작
      this.processor.port.postMessage({ command: 'start' });
      
      this.isActive = true;
      console.log('스트리밍 STT 시작됨');
      return true;
    } catch (error) {
      console.error('스트리밍 STT 시작 오류:', error);
      if (this.onError) {
        this.onError('음성 인식을 시작할 수 없습니다.');
      }
      return false;
    }
  }

  // 녹음 일시정지 (연결 유지)
  pauseRecording() {
    if (this.isActive && !this.isPaused) {
      this.isPaused = true;
      console.log('음성 전송 일시정지됨');
      return true;
    }
    return false;
  }

  // 녹음 재개
  resumeRecording() {
    if (this.isActive && this.isPaused) {
      this.isPaused = false;
      console.log('음성 전송 재개됨');
      return true;
    }
    return false;
  }

  // 일시정지 상태 확인
  isPausedState() {
    return this.isPaused;
  }

  // 스트리밍 STT 중지
  async stopStreaming() {
    try {
      this.isActive = false;
      this.isPaused = false;

      // 프로세서 중지
      if (this.processor) {
        this.processor.port.postMessage({ command: 'stop' });
        this.processor.disconnect();
        this.processor = null;
      }

      // 마이크 스트림 중지
      if (this.microphone) {
        this.microphone.getTracks().forEach(track => track.stop());
        this.microphone = null;
      }

      // AudioContext 종료
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }

      // WebSocket 연결 종료
      if (this.webSocket) {
        this.webSocket.close();
        this.webSocket = null;
      }

      console.log('스트리밍 STT 중지됨');
    } catch (error) {
      console.error('스트리밍 STT 중지 오류:', error);
    }
  }

  // 연결 상태 확인
  isConnected() {
    return this.webSocket && this.webSocket.readyState === WebSocket.OPEN;
  }

  // 활성 상태 확인
  isStreamingActive() {
    return this.isActive;
  }

  // 리소스 정리
  cleanup() {
    this.stopStreaming();
  }
}