// AudioWorkletProcessor for converting audio to 16-bit PCM
class Linear16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isActive = false;
    this.buffer = [];
    this.bufferSize = 100000; // 약 64ms 분량 (16kHz 기준)

    // Listen for messages from main thread
    this.port.onmessage = (event) => {
      if (event.data.command === "start") {
        this.isActive = true;
        this.buffer = []; // 시작 시 버퍼 초기화
      } else if (event.data.command === "stop") {
        this.isActive = false;
        // 남은 버퍼 데이터 전송
        if (this.buffer.length > 0) {
          const chunk = new Int16Array(this.buffer);
          this.port.postMessage(chunk.buffer);
          this.buffer = [];
        }
      }
    };
  }

  process(inputs, outputs, parameters) {
    if (!this.isActive) {
      return true;
    }

    const input = inputs[0];
    if (input && input.length > 0) {
      const inputChannel = input[0];

      // 버퍼에 누적
      for (let i = 0; i < inputChannel.length; i++) {
        // Convert from [-1, 1] to [-32768, 32767]
        const sample = Math.max(-1, Math.min(1, inputChannel[i]));
        this.buffer.push(sample < 0 ? sample * 0x8000 : sample * 0x7fff);
      }

      // 버퍼가 충분히 찼을 때만 전송
      if (this.buffer.length >= this.bufferSize) {
        const chunk = new Int16Array(this.buffer);
        this.port.postMessage(chunk.buffer);
        this.buffer = [];
      }
    }

    return true;
  }
}

registerProcessor("linear16-processor", Linear16Processor);
