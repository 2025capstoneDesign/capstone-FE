import axios from "axios";
import { dummyData } from "../data/dummyData";

const API_URL = process.env.REACT_APP_API_URL;
const MOCK_MODE = API_URL === "mock";

// Helper function to sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const processService = {
  // Start the conversion process
  startProcess: async (files) => {
    if (MOCK_MODE) {
      // Mock implementation
      await sleep(1000);
      return { job_id: "mock-job-id" };
    }

    try {
      const formData = new FormData();

      if (files.audio) {
        formData.append("audio_file", files.audio);
      }

      if (files.document) {
        formData.append("ppt_file", files.document);
      }

      formData.append("skip_transcription", "true");

      const response = await axios.post(
        `${API_URL}/api/process/start-process`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error starting process:", error);
      throw error;
    }
  },

  // Check the status of a process
  checkProcessStatus: async (jobId, retryCount = 0) => {
    if (MOCK_MODE) {
      // Mock implementation with progressive updates
      await sleep(1000);

      // Calculate mock progress based on number of calls
      const mockProgress = Math.min(100, 10 + retryCount * 10);
      const totalSlides = 12;
      const completedSlides = Math.floor((mockProgress / 100) * totalSlides);

      return {
        progress: mockProgress,
        message: `${completedSlides}/${totalSlides} 슬라이드 변환 완료`,
      };
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/process/process-status/${jobId}`
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
    if (MOCK_MODE) {
      // Return dummy data for mock mode
      await sleep(1000);
      return {
        progress: 100,
        message: "처리 완료",
        result: dummyData,
      };
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/process/process-result/${jobId}`
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
