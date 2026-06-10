// src/api/processService.js
// 업로드(배치) 변환 관련 API.
// 실시간 관련 함수는 realtimeApi.js로 이동했고,
// 미사용이던 processRealTimeSegment는 제거했다.

import axios from "axios";
import { API_URL, getStoredAuthHeader } from "./client";

// Helper function to sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const processService = {
  // Start the conversion process
  startProcess: async (files) => {
    try {
      const formData = new FormData();

      if (files.audio) {
        formData.append("audio_file", files.audio);
      }

      if (files.document) {
        formData.append("doc_file", files.document);
      }

      formData.append("skip_transcription", "false");

      const headers = {
        "Content-Type": "multipart/form-data",
        ...getStoredAuthHeader(),
      };

      const response = await axios.post(
        `${API_URL}/api/process2/start-process-v2`,
        formData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error starting process:", error);
      throw error;
    }
  },

  // Check the status of a process
  checkProcessStatus: async (jobId, retryCount = 0) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/process2/process-status-v2/${jobId}`,
        { headers: getStoredAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking process status:", error);
      // If we've retried less than 3 times, retry after a delay
      if (retryCount < 2) {
        await sleep(1000);
        return processService.checkProcessStatus(jobId, retryCount + 1);
      }
      throw error;
    }
  },

  // Get the result of a completed process
  getProcessResult: async (jobId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/process2/process-result-v2/${jobId}`,
        { headers: getStoredAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting process result:", error);
      throw error;
    }
  },

  // Main function to handle the entire process flow
  handleProcessFlow: async (files, onProgressUpdate) => {
    try {
      // Step 1: Start the process
      const { job_id } = await processService.startProcess(files);

      // Step 2: Poll for status until complete (progress = 100%)
      let progress = 0;
      while (progress < 100) {
        const statusData = await processService.checkProcessStatus(job_id);
        progress = statusData.progress;

        // Call the progress update callback if provided
        if (onProgressUpdate) {
          onProgressUpdate(statusData);
        }

        // Wait 1 second before next poll if not complete
        if (progress < 100) {
          await sleep(1000);
        }
      }

      // Step 3: Get the final result
      const result = await processService.getProcessResult(job_id);
      return result;
    } catch (error) {
      console.error("Process flow error:", error);
      throw error;
    }
  },
};

export default processService;
