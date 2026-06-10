// src/api/historyApi.js
// 변환 기록(History) 관련 API. HistoryContext에 흩어져 있던 HTTP 호출을 이동.
// 엔드포인트는 기존 그대로. authHeader는 호출부(AuthContext.getAuthHeader)에서 주입한다.

import axios from "axios";
import { API_URL } from "./client";

export const historyApi = {
  // 내 변환 기록 목록
  fetchMyHistory: async (authHeader = {}) => {
    const response = await axios.get(`${API_URL}/api/history/my`, {
      headers: { ...authHeader },
    });
    return response.data;
  },

  // 기록 PDF 다운로드 (blob 반환)
  downloadFile: async (historyItem, authHeader = {}) => {
    const response = await axios.get(
      `${API_URL}/api/history/download${
        historyItem.job_id
          ? `?job_id=${historyItem.job_id}&filename=${historyItem.filename}`
          : `/${historyItem.filename}`
      }`,
      {
        headers: { ...authHeader },
        responseType: "blob",
      }
    );
    return response.data;
  },

  // 기록 삭제 (job_id 우선, 없으면 filename)
  deleteItem: async (historyItem, authHeader = {}) => {
    const deleteUrl = historyItem.job_id
      ? `${API_URL}/api/history/my/${historyItem.job_id}`
      : `${API_URL}/api/history/my/${historyItem.filename}`;

    await axios.delete(deleteUrl, {
      headers: { ...authHeader },
    });
  },
};

export default historyApi;
