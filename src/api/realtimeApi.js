// src/api/realtimeApi.js
// 실시간 변환 관련 API — FastAPI /api/v1 Realtime Sessions 스펙.
//
// v1 변경점:
// - 시작: POST /realtime/sessions (doc_file 선택) → { job_id, status }
// - 종료: POST /realtime/sessions/{job_id}/finish → { image_urls, result_json }
// - 세그먼트 이동: POST /realtime/sessions/{job_id}/segments/move
//   (jobId가 body에서 path로 이동, body는 { startSlide, targetSlide, text })
// - 후처리: POST /realtime/sessions/{job_id}/post-process — body { sleepSlides }
// - 파일(이미지/PDF)은 인증 필요 → blob fetch 후 object URL 변환 헬퍼 제공

import axios from "axios";
import { API_URL, API_V1_URL, getStoredAuthHeader } from "./client";

export const realtimeApi = {
  // 실시간 세션 생성 (doc_file 업로드는 선택)
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
      `${API_V1_URL}/realtime/sessions`,
      pdfFile ? formData : new FormData(),
      { headers }
    );

    return response.data;
  },

  // 실시간 세션 종료 → { image_urls, result_json } 반환
  stopRealTime: async (jobId) => {
    const response = await axios.post(
      `${API_V1_URL}/realtime/sessions/${jobId}/finish`,
      {},
      { headers: getStoredAuthHeader() }
    );
    return response.data;
  },

  // 세그먼트 이동/삭제 (targetSlide 0이면 삭제)
  moveSegment: async ({ jobId, startSlide, targetSlide, text }, authHeader = {}) => {
    const response = await fetch(
      `${API_V1_URL}/realtime/sessions/${jobId}/segments/move`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ startSlide, targetSlide, text }),
      }
    );

    if (!response.ok) {
      throw new Error("요청 실패");
    }
    return response.json();
  },

  // 졸음(sleep) 슬라이드 후처리
  postProcess: async ({ jobId, sleepSlides }, authHeader = {}) => {
    const response = await fetch(
      `${API_V1_URL}/realtime/sessions/${jobId}/post-process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ sleepSlides }),
      }
    );

    if (!response.ok) {
      throw new Error("후처리 요청 실패");
    }
    return response.json();
  },

  // 실시간 오디오 스트리밍 WebSocket URL.
  // 브라우저 WebSocket은 임의 헤더를 못 붙이므로 token을 query로 전달한다.
  getStreamUrl: (jobId) => {
    const token = localStorage.getItem("accessToken");
    const wsBase = API_URL.replace(/^http/, "ws");
    return `${wsBase}/api/v1/realtime/sessions/${jobId}/stream${
      token ? `?token=${token}` : ""
    }`;
  },

  // 서버가 주는 상대 경로(file url)를 절대 URL로 변환
  resolveFileUrl: (url) =>
    url && url.startsWith("http") ? url : `${API_URL}${url}`,

  // 인증 파일 한 개를 blob으로 받아 object URL로 변환 (실패 시 null)
  fetchFileAsObjectUrl: async (relativeUrl) => {
    try {
      const response = await fetch(realtimeApi.resolveFileUrl(relativeUrl), {
        headers: getStoredAuthHeader(),
      });
      if (!response.ok) {
        console.warn(`Failed to fetch file: ${relativeUrl} (${response.status})`);
        return null;
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn(`Failed to fetch file: ${relativeUrl}`, error);
      return null;
    }
  },

  // 인증 파일 여러 개를 object URL 배열로 변환.
  // 순서/길이를 보존한다 (인덱스가 슬라이드 번호와 매핑되므로 중요).
  fetchFilesAsObjectUrls: async (relativeUrls) => {
    return Promise.all(
      relativeUrls.map((url) => realtimeApi.fetchFileAsObjectUrl(url))
    );
  },
};

export default realtimeApi;
