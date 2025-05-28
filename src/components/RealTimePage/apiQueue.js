/**
 * FIFO Queue for managing API requests in real-time recording
 * Ensures sequential processing of audio segments
 */

class ApiRequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.onRequestComplete = null;
  }

  /**
   * Adds a request to the queue
   * @param {Object} requestData - Request data containing audioBlob, metaJson, jobId
   * @param {Function} onComplete - Callback for when this specific request completes
   */
  enqueue(requestData, onComplete = null) {
    const request = {
      id: Date.now() + Math.random(), // Unique identifier
      data: requestData,
      onComplete,
      timestamp: new Date()
    };
    
    this.queue.push(request);
    console.log(`API Queue: Added request ${request.id}, queue length: ${this.queue.length}`);
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processNext();
    }
    
    return request.id;
  }

  /**
   * Processes the next request in the queue
   */
  async processNext() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const request = this.queue.shift(); // FIFO - remove from front
    
    console.log(`API Queue: Processing request ${request.id}`);
    
    try {
      // Import processService here to avoid circular dependency
      const { processService } = await import('../../api/processService');
      
      const response = await processService.processRealTimeSegment(
        request.data.jobId,
        request.data.audioBlob,
        request.data.metaJson
      );

      // Call the global completion handler if set
      if (this.onRequestComplete) {
        this.onRequestComplete(response, request.data);
      }

      // Call the specific request completion handler
      if (request.onComplete) {
        request.onComplete(response, null);
      }

      console.log(`API Queue: Request ${request.id} completed successfully`);
      
    } catch (error) {
      console.error(`API Queue: Request ${request.id} failed:`, error);
      
      // Call completion handlers with error
      if (this.onRequestComplete) {
        this.onRequestComplete(null, request.data, error);
      }
      
      if (request.onComplete) {
        request.onComplete(null, error);
      }
    }

    // Process next request
    setTimeout(() => this.processNext(), 100); // Small delay between requests
  }

  /**
   * Sets a global completion handler for all requests
   * @param {Function} handler - Function to call when any request completes
   */
  setGlobalCompletionHandler(handler) {
    this.onRequestComplete = handler;
  }

  /**
   * Gets the current queue length
   * @returns {number} Number of pending requests
   */
  getQueueLength() {
    return this.queue.length;
  }

  /**
   * Checks if the queue is currently processing
   * @returns {boolean} True if processing
   */
  isCurrentlyProcessing() {
    return this.isProcessing;
  }

  /**
   * Clears all pending requests (useful when stopping recording)
   */
  clear() {
    const clearedCount = this.queue.length;
    this.queue = [];
    console.log(`API Queue: Cleared ${clearedCount} pending requests`);
    return clearedCount;
  }
}

// Export singleton instance
export const apiQueue = new ApiRequestQueue();