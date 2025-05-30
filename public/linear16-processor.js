// AudioWorkletProcessor for converting audio to 16-bit PCM
class Linear16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isActive = false;
    
    // Listen for messages from main thread
    this.port.onmessage = (event) => {
      if (event.data.command === 'start') {
        this.isActive = true;
      } else if (event.data.command === 'stop') {
        this.isActive = false;
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
      
      // Convert Float32 to Int16
      const int16Array = new Int16Array(inputChannel.length);
      for (let i = 0; i < inputChannel.length; i++) {
        // Convert from [-1, 1] to [-32768, 32767]
        const sample = Math.max(-1, Math.min(1, inputChannel[i]));
        int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
      
      // Send Int16 data to main thread
      this.port.postMessage(int16Array.buffer);
    }
    
    return true;
  }
}

registerProcessor('linear16-processor', Linear16Processor);