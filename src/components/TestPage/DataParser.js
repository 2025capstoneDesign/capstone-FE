// /src/components/TestPage/DataParser.js
// 이 파일은 dummyData.js의 데이터를 TestPage에서 사용할 수 있는 형식으로 변환합니다.

/**
 * JSON 형식의 데이터를 TestPage에서 사용할 수 있는 형식으로 변환합니다.
 *
 * @param {Object} data - 변환할 데이터 객체 (dummyData.js 형식 또는 API 응답 형식)
 * @returns {Object} - 변환된 데이터 객체 {summaryData, voiceData}
 */
export const parseData = (data) => {
  // 데이터 유효성 검사
  if (!data || typeof data !== "object") {
    console.error("DataParser - 유효하지 않은 데이터 형식:", data);
    return { summaryData: {}, voiceData: {} };
  }

  // API가 result 필드 안에 데이터를 반환하는 경우 처리
  if (data.result && typeof data.result === "object") {
    console.log("DataParser - result 필드 데이터 사용");
    return parseData(data.result); // 재귀적으로 내부 데이터 파싱
  }

  console.log("DataParser - 데이터 파싱 시작:", Object.keys(data));

  // 올바른 형식인지 확인 (최소한 하나의 슬라이드 키가 있어야 함 - slide1, slide2 등)
  const hasSlideKeys = Object.keys(data).some(key => /slide\d+/.test(key));
  if (!hasSlideKeys) {
    console.error("DataParser - 슬라이드 데이터를 찾을 수 없음:", data);
    return { summaryData: {}, voiceData: {} };
  }

  // summaryData 생성: 페이지 번호를 키로 하는 객체 생성
  const summaryData = {};

  // voiceData 생성: 페이지 번호를 키로, 각 페이지의 세그먼트 배열을 값으로 하는 객체
  const voiceData = {};

  // 데이터 파싱
  Object.keys(data).forEach((slideKey, index) => {
    // 슬라이드 키가 아닌 경우 건너뛰기
    if (!/slide\d+/.test(slideKey)) {
      return;
    }

    const slideData = data[slideKey] || {};

    // slideKey에서 숫자 추출 ("slide5" -> 5), 없으면 인덱스 + 1 사용
    const pageNumberFromKey = slideKey.match(/\d+/);
    const pageNumber = pageNumberFromKey
      ? parseInt(pageNumberFromKey[0])
      : index + 1;

    // summaryData에 모든 요약 유형 추가
    summaryData[pageNumber] = {
      "Concise Summary Notes": slideData["Concise Summary Notes"] || "",
      "Bullet Point Notes": slideData["Bullet Point Notes"] || "",
      "Keyword Notes": slideData["Keyword Notes"] || "",
      "Chart/Table Summary": slideData["Chart/Table Summary"] || "",
    };

    // voiceData에 세그먼트 데이터 추가
    if (slideData.Segments && typeof slideData.Segments === "object") {
      // 각 세그먼트를 배열로 변환
      const segments = Object.keys(slideData.Segments).map((segmentKey) => {
        const segment = slideData.Segments[segmentKey] || {};
        return {
          id: segmentKey,
          text: segment.text || "",
          reason: segment.reason || "",
          isImportant:
            segment.isImportant === true || segment.isImportant === "true",
          linkedConcept: segment.linkedConcept || "",
          pageNumber: segment.pageNumber || null,
        };
      });

      // 해당 페이지에 세그먼트 추가
      voiceData[pageNumber] = segments;
    } else {
      // 세그먼트가 없는 경우 빈 배열 추가
      voiceData[pageNumber] = [];
    }
  });

  console.log("DataParser - 파싱 완료, 페이지 수:", Object.keys(summaryData).length);
  return { summaryData, voiceData };
};

/**
 * 특정 PDF 파일 이름에 해당하는 데이터를 찾아 반환합니다.
 *
 * @param {Object} allData - 모든 데이터를 포함하는 객체
 * @param {string} pdfName - 찾을 PDF 파일 이름 (예: "sample3.pdf")
 * @returns {Object} - 해당 PDF에 대한 변환된 데이터 {summaryData, voiceData}
 */
export const getDataForPdf = (allData, pdfName) => {
  if (!pdfName || !allData) return { summaryData: {}, voiceData: {} };

  // 기본적으로 현재는 하나의 더미 데이터만 있으므로 바로 반환
  // 실제 백엔드 연동 시 여러 PDF 파일에 대한 데이터가 있을 경우 해당 PDF 파일명으로 필터링 필요
  return parseData(allData);
};
