class Linear16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isActive = false;
    this.buffer = [];
    this.bufferSize = 100000; // 예: 3초
    this.overlapSize = 5000; // 예: 0.5초 (16kHz 기준)
    this.previousTail = []; // 오버랩용 이전 tail 저장

    this.port.onmessage = (event) => {
      if (event.data.command === "start") {
        this.isActive = true;
        this.buffer = [];
        this.previousTail = [];
      } else if (event.data.command === "stop") {
        this.isActive = false;
        if (this.buffer.length > 0) {
          const chunk = new Int16Array([...this.previousTail, ...this.buffer]);
          this.port.postMessage(chunk.buffer);
          this.buffer = [];
        }
      } else if (event.data.command === "flush") {
        // 현재 버퍼를 강제로 전송 (페이지 변경 시)
        if (this.buffer.length > 0) {
          const chunk = new Int16Array([...this.previousTail, ...this.buffer]);
          this.port.postMessage({
            buffer: chunk.buffer,
            targetSlide: event.data.targetSlide,
          });

          // 오버랩용 tail 저장
          this.previousTail = this.buffer.slice(-this.overlapSize);
          this.buffer = [];
        }
      }
    };
  }

  process(inputs) {
    if (!this.isActive) return true;

    const input = inputs[0];
    if (input.length > 0) {
      const inputChannel = input[0];
      for (let i = 0; i < inputChannel.length; i++) {
        const sample = Math.max(-1, Math.min(1, inputChannel[i]));
        this.buffer.push(sample < 0 ? sample * 0x8000 : sample * 0x7fff);
      }

      if (this.buffer.length >= this.bufferSize) {
        // 오버랩 붙여서 전송
        const chunk = new Int16Array([...this.previousTail, ...this.buffer]);
        this.port.postMessage(chunk.buffer);

        // 오버랩용 tail 저장
        this.previousTail = this.buffer.slice(-this.overlapSize);
        this.buffer = [];
      }
    }

    return true;
  }
}

registerProcessor("linear16-processor", Linear16Processor);
