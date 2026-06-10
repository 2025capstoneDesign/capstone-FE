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
import { historyApi } from "../api/historyApi";
import { useAuth } from "./AuthContext";

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  // Initialize with sample data (this will still be available even without API response)
  const initialHistoryData = [
    {
      id: -1, // Use negative ID to avoid conflicts with API data
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
      const data = await historyApi.fetchMyHistory(getAuthHeader());

      console.log("History API response:", data);

      // Map the response data to our format
      // v1 목록에는 notes_json이 없으므로 result는 열람 시 상세 조회로 채운다
      const mappedHistory = data.map((item) => {
        return {
          id: item.job_id, // v1 목록에는 별도 id가 없어 job_id를 키로 사용
          job_id: item.job_id,
          filename: item.filename,
          status: item.status,
          created_at: item.created_at,
          result:
            typeof item.notes_json === "string"
              ? JSON.parse(item.notes_json)
              : item.notes_json || null,
          file: null, // Will be downloaded on demand
        };
      });

      // Add the sample PDF to ensure it's always available
      const combinedHistory = [
        ...mappedHistory,
        initialHistoryData[0], // Sample PDF with unique negative ID
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

        const fileBlob = await historyApi.downloadFile(
          historyItem.job_id,
          historyItem.filename,
          getAuthHeader()
        );

        // Update history item with the downloaded file
        setHistoryData((prev) => {
          return prev.map((item) => {
            if (item.id === historyItem.id) {
              return { ...item, file: fileBlob };
            }
            return item;
          });
        });

        return fileBlob;
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

  // 열람 시 상세(notes_json)를 가져와 result를 채운다
  // (v1 목록 API에는 notes_json이 포함되지 않음)
  const loadJobResult = useCallback(
    async (historyItem) => {
      if (!historyItem || !historyItem.job_id) {
        return historyItem?.result || null;
      }
      if (historyItem.result) {
        return historyItem.result;
      }

      try {
        setLoading(true);

        const detail = await historyApi.fetchJobDetail(
          historyItem.job_id,
          getAuthHeader()
        );
        const result =
          typeof detail.notes_json === "string"
            ? JSON.parse(detail.notes_json)
            : detail.notes_json || null;

        setHistoryData((prev) =>
          prev.map((item) =>
            item.id === historyItem.id ? { ...item, result } : item
          )
        );

        return result;
      } catch (err) {
        console.error(
          `Error loading job detail ${historyItem.job_id}:`,
          err
        );
        setError("Failed to load note data. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  // Delete a history item
  const deleteHistoryItem = useCallback(
    async (historyItem) => {
      if (!historyItem || !historyItem.filename) {
        console.error("Cannot delete PDF: Invalid history item");
        return false;
      }

      // Cannot delete sample PDF
      if (historyItem.filename === "sample3.pdf") {
        console.error("Cannot delete sample PDF");
        return false;
      }

      try {
        setLoading(true);

        await historyApi.deleteItem(historyItem.job_id, getAuthHeader());

        // Remove item from local state
        setHistoryData((prev) => 
          prev.filter((item) => item.id !== historyItem.id)
        );

        return true;
      } catch (err) {
        console.error(`Error deleting file ${historyItem.filename}:`, err);
        setError(
          `Failed to delete ${historyItem.filename}. Please try again.`
        );
        return false;
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

  return (
    <HistoryContext.Provider
      value={{
        historyData,
        loading,
        error,
        downloadPdf,
        loadJobResult,
        deleteHistoryItem,
        refreshHistory,
        setHistoryData,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}