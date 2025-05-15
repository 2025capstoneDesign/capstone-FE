import { useState, useEffect, useCallback, useRef } from "react";

/**
 * blobUrl Hook
 *
 * 이 훅은 다음 기능을 제공합니다:
 * - File 객체 또는 Blob으로부터 Blob URL 생성
 * - 생성된 URL을 추적하여 정리 가능
 * - 컴포넌트 언마운트 시 자동 정리
 * - 특정 URL 또는 전체 URL 수동 정리 함수 제공
 * - URL을 통해 원본 File/Blob 객체 조회 가능
 */

function useBlobUrlManager() {
  // blobUrl -> 원본 File/Blob 객체를 매핑하는 Map
  const [blobUrlMap, setBlobUrlMap] = useState({});

  // 생성되었지만 아직 해제되지 않은 URL들을 추적
  const activeUrlsRef = useRef(new Set());

  /**
   * File 또는 Blob으로부터 Blob URL 생성
   * @param {File|Blob} fileOrBlob - URL을 생성할 File 또는 Blob
   * @param {string} [key] - 이 URL을 참조하기 위한 선택적 키 (기본값: 자동 생성)
   * @returns {string} 생성된 Blob URL
   */
  const createBlobUrl = useCallback((fileOrBlob, key) => {
    if (!(fileOrBlob instanceof File) && !(fileOrBlob instanceof Blob)) {
      console.warn("createBlobUrl는 File 또는 Blob 객체가 필요합니다");
      return fileOrBlob; // File/Blob이 아닌 경우 그대로 반환
    }

    // blob URL 생성
    const blobUrl = URL.createObjectURL(fileOrBlob);

    // 활성 URL 세트에 추가
    activeUrlsRef.current.add(blobUrl);

    // blob URL과 원본 파일 간의 매핑 저장
    setBlobUrlMap((prev) => ({
      ...prev,
      [blobUrl]: fileOrBlob,
    }));

    return blobUrl;
  }, []);

  /**
   * 특정 Blob URL을 해제하고 추적에서 제거
   * @param {string} blobUrl - 해제할 Blob URL
   */
  const revokeBlobUrl = useCallback((blobUrl) => {
    if (blobUrl && typeof blobUrl === "string" && blobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(blobUrl);

      // 활성 URL 세트에서 제거
      activeUrlsRef.current.delete(blobUrl);

      // blob URL 맵에서 제거
      setBlobUrlMap((prev) => {
        const newMap = { ...prev };
        delete newMap[blobUrl];
        return newMap;
      });
    }
  }, []);

  /**
   * 이 훅이 생성한 모든 Blob URL 해제
   */
  const revokeAllBlobUrls = useCallback(() => {
    // 모든 활성 URL 해제
    activeUrlsRef.current.forEach((url) => {
      if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    // 세트 초기화
    activeUrlsRef.current.clear();

    // 맵 초기화
    setBlobUrlMap({});
  }, []);

  /**
   * Blob URL로부터 원본 File 또는 Blob 조회
   * @param {string} blobUrl - 조회할 Blob URL
   * @returns {File|Blob|null} 원본 File 또는 Blob, 찾지 못한 경우 null
   */
  const getOriginalFile = useCallback(
    (blobUrl) => {
      return blobUrlMap[blobUrl] || null;
    },
    [blobUrlMap]
  );

  /**
   * 주어진 URL이 이 훅에서 관리하는 Blob URL인지 확인
   * @param {string} url - 확인할 URL
   * @returns {boolean} URL이 관리되는 Blob URL인 경우 true
   */
  const isManagedBlobUrl = useCallback((url) => {
    return (
      url &&
      typeof url === "string" &&
      url.startsWith("blob:") &&
      activeUrlsRef.current.has(url)
    );
  }, []);

  // 컴포넌트 언마운트 시 모든 blob URL 정리
  useEffect(() => {
    return () => {
      revokeAllBlobUrls();
    };
  }, [revokeAllBlobUrls]);

  return {
    createBlobUrl,
    revokeBlobUrl,
    revokeAllBlobUrls,
    getOriginalFile,
    isManagedBlobUrl,
    blobUrlMap,
  };
}

export default useBlobUrlManager;
