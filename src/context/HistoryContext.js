//src/context/HistoryContext.js

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { dummyData } from "../data/dummyData";
import { parseData } from "../components/TestPage/DataParser";
import axios from "axios";
import { useAuth } from "./AuthContext";

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  // Initialize with sample data (this will still be available even without API response)
  const initialHistoryData = [
    {
      id: 1,
      filename: "sample3.pdf",
      created_at: "2024-03-20T00:00:00Z",
      result: parseData(dummyData), // Already parsed dummy data
      file: null, // Will be downloaded on demand
      pdfFile: "/sample3.pdf", // Path to static file
    },
  ];

  const [historyData, setHistoryData] = useState(initialHistoryData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken, getAuthHeader, isAuthenticated } = useAuth();

  // Function to fetch history from API
  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/history/my`,
        { headers: { ...getAuthHeader() } }
      );

      console.log("History API response:", response.data);

      // Map the response data to our format
      const mappedHistory = response.data.map((item) => ({
        id: item.id,
        job_id: item.job_id || null, // job_id가 없는 경우 null로 설정
        filename: item.filename,
        created_at: item.created_at,
        result:
          typeof item.notes_json === "string"
            ? JSON.parse(item.notes_json)
            : item.notes_json,
        file: null, // Will be downloaded on demand
      }));

      // Add the sample PDF to ensure it's always available
      const combinedHistory = [
        ...mappedHistory,
        initialHistoryData[0], // Sample PDF
      ];

      setHistoryData(combinedHistory);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to fetch history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAuthHeader]);

  // Fetch history when authenticated or token changes
  useEffect(() => {
    if (isAuthenticated()) {
      fetchHistory();
    }
  }, [accessToken, fetchHistory]);

  // Download a PDF file by filename
  const downloadPdf = useCallback(
    async (historyItem) => {
      if (!historyItem || !historyItem.filename) {
        console.error("Cannot download PDF: Invalid history item");
        return null;
      }

      // If it's our sample PDF, use the static path
      if (historyItem.filename === "sample3.pdf") {
        return historyItem.pdfFile;
      }

      // If we already have the file, return it
      if (historyItem.file) {
        return historyItem.file;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/history/download${
            historyItem.job_id
              ? `?job_id=${historyItem.job_id}&filename=${historyItem.filename}`
              : `/${historyItem.filename}`
          }`,
          {
            headers: { ...getAuthHeader() },
            responseType: "blob",
          }
        );

        // Update history item with the downloaded file
        setHistoryData((prev) => {
          return prev.map((item) => {
            if (item.id === historyItem.id) {
              return { ...item, file: response.data };
            }
            return item;
          });
        });

        return response.data;
      } catch (err) {
        console.error(`Error downloading file ${historyItem.filename}:`, err);
        setError(
          `Failed to download ${historyItem.filename}. Please try again.`
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  // Add newly converted item to history, or load from API
  const refreshHistory = useCallback(async () => {
    await fetchHistory();
  }, [fetchHistory]);

  const deleteHistoryItem = useCallback(async (filename) => {
    if (!filename) return false;
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/history/my/${filename}`,
        { headers: { ...getAuthHeader() } }
      );
      // 삭제 후 히스토리 새로고침
      await fetchHistory();
      return true;
    } catch (err) {
      setError("삭제에 실패했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, fetchHistory]);

  return (
    <HistoryContext.Provider
      value={{
        historyData,
        loading,
        error,
        downloadPdf,
        refreshHistory,
        setHistoryData,
        deleteHistoryItem,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}
