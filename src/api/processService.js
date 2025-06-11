import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Helper function to sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const processService = {
  // Start real-time conversion process
  startRealTime: async (pdfFile = null) => {
    try {
      const formData = new FormData();

      // Add PDF file if provided
      if (pdfFile) {
        formData.append("doc_file", pdfFile);
      }

      const headers = { "Content-Type": "multipart/form-data" };

      // Get auth token from localStorage if it exists
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_URL}/api/realTime/start-realtime`,
        pdfFile ? formData : {},
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error starting real-time process:", error);
      throw error;
    }
  },

  // Process real-time audio segment  (지금 안씀)
  processRealTimeSegment: async (jobId, audioBlob, metaJson) => {
    try {
      const formData = new FormData();
      formData.append("audio_file", audioBlob);
      formData.append("meta_json", JSON.stringify(metaJson));

      const headers = { "Content-Type": "multipart/form-data" };

      // Get auth token from localStorage if it exists
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_URL}/api/realTime/real-time-process/${jobId}`,
        formData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error processing real-time segment:", error);
      throw error;
    }
  },

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

      formData.append(
        "skip_transcription",
        files.audio?.name === "os_demo.wav" ? "true" : "false"
      );

      // Add authorization header for authenticated requests
      const headers = { "Content-Type": "multipart/form-data" };

      // Get auth token from localStorage if it exists
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

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
      // Get auth token from localStorage if it exists
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_URL}/api/process2/process-status-v2/${jobId}`,
        { headers }
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
      // Get auth token from localStorage if it exists
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_URL}/api/process2/process-result-v2/${jobId}`,
        { headers }
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
