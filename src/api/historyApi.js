// src/api/historyApi.js
// 변환 기록 관련 API — FastAPI /api/v1 Jobs 스펙.
//
// v1 변경점:
// - 목록: GET /jobs (notes_json 미포함 → 상세는 fetchJobDetail로 별도 조회)
// - 상세: GET /jobs/{job_id} (notes_json 포함)
// - 파일: GET /jobs/{job_id}/files/{file_path} (인증 필요, blob)
// - 삭제: DELETE /jobs/{job_id} (204 No Content)

import axios from "axios";
import { API_V1_URL } from "./client";

export const historyApi = {
  // 내 변환 기록 목록 — [{ job_id, filename, status, created_at }]
  fetchMyHistory: async (authHeader = {}) => {
    const response = await axios.get(`${API_V1_URL}/jobs`, {
      headers: { ...authHeader },
    });
    return response.data;
  },

  // job 상세 — { job_id, filename, status, created_at, notes_json }
  fetchJobDetail: async (jobId, authHeader = {}) => {
    const response = await axios.get(`${API_V1_URL}/jobs/${jobId}`, {
      headers: { ...authHeader },
    });
    return response.data;
  },

  // job 디렉터리 내 파일 다운로드 (blob 반환)
  // filePath 예: "slides.pdf", "image/1.png"
  downloadFile: async (jobId, filePath, authHeader = {}) => {
    const response = await axios.get(
      `${API_V1_URL}/jobs/${jobId}/files/${filePath}`,
      {
        headers: { ...authHeader },
        responseType: "blob",
      }
    );
    return response.data;
  },

  // 기록 삭제 — 204 No Content (body 없음)
  deleteItem: async (jobId, authHeader = {}) => {
    await axios.delete(`${API_V1_URL}/jobs/${jobId}`, {
      headers: { ...authHeader },
    });
  },
};

export default historyApi;
