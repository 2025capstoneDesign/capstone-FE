// 실시간 API 응답 처리를 위한 데이터 파서
// TestPage/DataParser.js를 기반으로 실시간 처리에 맞게 수정됨

/**
 * 시간을 HH:mm:ss.SSS 형식으로 포맷팅
 * @param {Date} date - 포맷팅할 Date 객체
 * @returns {string} - 포맷팅된 시간 문자열
 */
export const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

/**
 * 시작 시간과 종료 시간 사이의 지속 시간을 계산
 * @param {Date} startTime - 시작 시간
 * @param {Date} endTime - 종료 시간
 * @returns {number} - 초 단위의 지속 시간
 */
export const calculateDuration = (startTime, endTime) => {
  return Math.floor((endTime - startTime) / 1000);
};

/**
 * API 요청을 위한 meta_json 배열 생성
 * @param {number} slideId - 현재 슬라이드 번호
 * @param {Date} startTime - 녹음 시작 시간
 * @param {Date} endTime - 녹음 종료 시간
 * @returns {Array} - API용 메타 JSON 배열
 */
export const createMetaJson = (slideId, startTime, endTime) => {
  return [
    {
      slide_id: slideId,
      start_time: formatTime(startTime),
      end_time: formatTime(endTime),
    },
  ];
};

/**
 * 실시간 API 응답을 파싱하고 기존 데이터를 완전히 대체
 * @param {Object} apiResponse - API 응답 데이터
 * @param {Object} existingData - 현재 PDF 데이터 {summaryData, voiceData}
 * @returns {Object} - 업데이트된 데이터 객체 {summaryData, voiceData}
 */
export const parseRealTimeResponse = (apiResponse, existingData) => {
  if (!apiResponse || typeof apiResponse !== "object") {
    console.error("RealTimeDataParser - Invalid API response:", apiResponse);
    return existingData;
  }

  console.log(
    "RealTimeDataParser - Processing response:",
    Object.keys(apiResponse)
  );

  // Clone existing data to avoid mutation
  const updatedSummaryData = { ...existingData.summaryData };
  const updatedVoiceData = { ...existingData.voiceData };

  // Process each slide in the response
  Object.keys(apiResponse).forEach((slideKey) => {
    if (!/slide\d+/.test(slideKey)) {
      return;
    }

    const slideData = apiResponse[slideKey] || {};

    // Extract page number from slide key
    const pageNumberFromKey = slideKey.match(/\d+/);
    const pageNumber = pageNumberFromKey
      ? parseInt(pageNumberFromKey[0])
      : null;

    if (!pageNumber) {
      console.warn(
        "RealTimeDataParser - Could not extract page number from:",
        slideKey
      );
      return;
    }

    console.log(`RealTimeDataParser - Processing slide ${pageNumber}`);

    // Replace summary data completely
    updatedSummaryData[pageNumber] = {
      "Concise Summary Notes": slideData["Concise Summary Notes"] || "",
      "Bullet Point Notes": slideData["Bullet Point Notes"] || "",
      "Keyword Notes": slideData["Keyword Notes"] || "",
      "Chart/Table Summary": slideData["Chart/Table Summary"] || "",
    };

    // Replace voice data (segments) completely
    if (slideData.Segments && typeof slideData.Segments === "object") {
      const segments = Object.keys(slideData.Segments).map((segmentKey) => {
        const segment = slideData.Segments[segmentKey] || {};
        return {
          id: segmentKey,
          text: segment.text || "",
          reason: segment.reason || "",
          isImportant:
            segment.isImportant === true || segment.isImportant === "true",
          linkedConcept: segment.linkedConcept || "",
          pageNumber: segment.pageNumber || pageNumber,
        };
      });

      // Replace segments completely for this page instead of merging
      updatedVoiceData[pageNumber] = segments;
    }
  });

  console.log(
    "RealTimeDataParser - Updated pages:",
    Object.keys(updatedSummaryData)
  );

  return {
    summaryData: updatedSummaryData,
    voiceData: updatedVoiceData,
  };
};

/**
 * 오디오 녹음 지속 시간이 최소 요구사항을 충족하는지 검증
 * @param {Date} startTime - 녹음 시작 시간
 * @param {Date} endTime - 녹음 종료 시간
 * @param {number} minDuration - 최소 지속 시간(초) (기본값: 10)
 * @returns {boolean} - 지속 시간이 유효하면 true
 */
export const isValidDuration = (startTime, endTime, minDuration = 10) => {
  const duration = calculateDuration(startTime, endTime);
  return duration >= minDuration;
};
