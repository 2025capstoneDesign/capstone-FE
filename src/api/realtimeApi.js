// src/api/realtimeApi.js
// 실시간 변환 관련 API. 컴포넌트들에 흩어져 있던 HTTP 호출을 이동.
// 엔드포인트는 기존 그대로 (v1 마이그레이션은 별도 단계에서 진행).

import axios from "axios";
import { API_URL, getStoredAuthHeader } from "./client";

export const realtimeApi = {
  // 실시간 변환 시작 (doc_file 업로드는 선택)
  startRealTime: async (pdfFile = null) => {
    const formData = new FormData();

    if (pdfFile) {
      formData.append("doc_file", pdfFile);
    }

    const headers = {
      "Content-Type": "multipart/form-data",
      ...getStoredAuthHeader(),
    };

    const response = await axios.post(
      `${API_URL}/api/realTime/start-realtime`,
      pdfFile ? formData : {},
      { headers }
    );

    return response.data;
  },

  // 실시간 변환 종료 → { image_urls, ... } 반환
  stopRealTime: async (jobId) => {
    const response = await axios.post(
      `${API_URL}/api/realTime/stop-realtime?jobId=${jobId}`,
      {},
      { headers: getStoredAuthHeader() }
    );
    return response.data;
  },

  // 세그먼트 이동/삭제 (targetSlide 0이면 삭제)
  moveSegment: async ({ jobId, startSlide, targetSlide, text }, authHeader = {}) => {
    const response = await fetch(`${API_URL}/api/realTime/move-segment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify({ jobId, startSlide, targetSlide, text }),
    });

    if (!response.ok) {
      throw new Error("요청 실패");
    }
    return response.json();
  },

  // 졸음(sleep) 슬라이드 후처리
  postProcess: async ({ jobId, sleepSlides }, authHeader = {}) => {
    const response = await fetch(`${API_URL}/api/realTime/post-process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify({ jobId, sleepSlides }),
    });

    if (!response.ok) {
      throw new Error("후처리 요청 실패");
    }
    return response.json();
  },

  // 원본 PDF URL
  getOriginalPdfUrl: (jobId) => `${API_URL}/file/${jobId}/original.pdf`,

  // 서버가 주는 상대 경로(file url)를 절대 URL로 변환
  resolveFileUrl: (url) =>
    url && url.startsWith("http") ? url : `${API_URL}${url}`,
};

export default realtimeApi;
