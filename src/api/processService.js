// src/api/processService.js
// 업로드(배치) 변환 관련 API — FastAPI /api/v1 Jobs 스펙.
//
// v1 변경점:
// - 생성: POST /jobs (multipart: audio_file, doc_file, skip_transcription)
// - 상태: GET /jobs/{job_id}/status → { job_id, status, progress, message }
// - 결과: GET /jobs/{job_id}/result

import axios from "axios";
import { API_V1_URL, getStoredAuthHeader } from "./client";

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

      const response = await axios.post(`${API_V1_URL}/jobs`, formData, {
        headers,
      });

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
        `${API_V1_URL}/jobs/${jobId}/status`,
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
        `${API_V1_URL}/jobs/${jobId}/result`,
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
