// 실시간 녹음 중 API 요청을 관리하기 위한 FIFO 큐
// 오디오 세그먼트의 순차적 처리를 보장

class ApiRequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.onRequestComplete = null;
  }

  // 큐에 요청을 추가
  // @param {Object} requestData - audioBlob, metaJson, jobId를 포함한 요청 데이터
  // @param {Function} onComplete - 특정 요청이 완료될 때 호출될 콜백
  enqueue(requestData, onComplete = null) {
    const request = {
      id: Date.now() + Math.random(), // 고유 식별자
      data: requestData,
      onComplete,
      timestamp: new Date(),
    };

    this.queue.push(request);
    console.log(
      `API 큐: 요청 ${request.id} 추가됨, 큐 길이: ${this.queue.length}`
    );

    // 아직 처리 중이 아니라면 처리 시작
    if (!this.isProcessing) {
      this.processNext();
    }

    return request.id;
  }

  // 큐의 다음 요청을 처리
  async processNext() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const request = this.queue.shift(); // FIFO - 앞에서 제거

    console.log(`API 큐: 요청 ${request.id} 처리 중`);

    try {
      // 순환 참조를 피하기 위해 processService를 여기서 임포트
      const { processService } = await import("../../api/processService");

      const response = await processService.processRealTimeSegment(
        request.data.jobId,
        request.data.audioBlob,
        request.data.metaJson
      );

      // 전역 완료 핸들러가 설정되어 있다면 호출
      if (this.onRequestComplete) {
        this.onRequestComplete(response, request.data);
      }

      // 특정 요청의 완료 핸들러 호출
      if (request.onComplete) {
        request.onComplete(response, null);
      }

      console.log(`API 큐: 요청 ${request.id} 성공적으로 완료됨`);
    } catch (error) {
      console.error(`API 큐: 요청 ${request.id} 실패:`, error);

      // 오류와 함께 완료 핸들러 호출
      if (this.onRequestComplete) {
        this.onRequestComplete(null, request.data, error);
      }

      if (request.onComplete) {
        request.onComplete(null, error);
      }
    }

    // 다음 요청 처리
    setTimeout(() => this.processNext(), 100); // 요청 간 작은 지연
  }

  // 모든 요청에 대한 전역 완료 핸들러 설정
  // @param {Function} handler - 요청이 완료될 때 호출될 함수
  setGlobalCompletionHandler(handler) {
    this.onRequestComplete = handler;
  }

  // 현재 큐 길이 반환
  // @returns {number} 대기 중인 요청 수
  getQueueLength() {
    return this.queue.length;
  }

  // 현재 처리 중인지 확인
  // @returns {boolean} 처리 중이면 true
  isCurrentlyProcessing() {
    return this.isProcessing;
  }

  // 모든 대기 중인 요청 제거 (녹음 중지 시 유용)
  clear() {
    const clearedCount = this.queue.length;
    this.queue = [];
    console.log(`API 큐: ${clearedCount}개의 대기 중인 요청 제거됨`);
    return clearedCount;
  }
}

// 싱글톤 인스턴스 내보내기
export const apiQueue = new ApiRequestQueue();
