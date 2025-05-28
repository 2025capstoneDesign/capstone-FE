// Real-time data parser for processing API responses
// Based on TestPage/DataParser.js but adapted for real-time processing

/**
 * Formats time in HH:mm:ss.SSS format
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

/**
 * Calculates duration between start and end times
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {number} - Duration in seconds
 */
export const calculateDuration = (startTime, endTime) => {
  return Math.floor((endTime - startTime) / 1000);
};

/**
 * Creates meta_json array for API request
 * @param {number} slideId - Current slide number
 * @param {Date} startTime - Recording start time
 * @param {Date} endTime - Recording end time
 * @returns {Array} - Meta JSON array for API
 */
export const createMetaJson = (slideId, startTime, endTime) => {
  return [
    {
      slide_id: slideId,
      start_time: formatTime(startTime),
      end_time: formatTime(endTime)
    }
  ];
};

/**
 * Parses real-time API response and replaces existing data completely
 * @param {Object} apiResponse - API response data
 * @param {Object} existingData - Current PDF data {summaryData, voiceData}
 * @returns {Object} - Updated data object {summaryData, voiceData}
 */
export const parseRealTimeResponse = (apiResponse, existingData) => {
  if (!apiResponse || typeof apiResponse !== "object") {
    console.error("RealTimeDataParser - Invalid API response:", apiResponse);
    return existingData;
  }

  console.log("RealTimeDataParser - Processing response:", Object.keys(apiResponse));

  // Clone existing data to avoid mutation
  const updatedSummaryData = { ...existingData.summaryData };
  const updatedVoiceData = { ...existingData.voiceData };

  // Process each slide in the response
  Object.keys(apiResponse).forEach(slideKey => {
    if (!/slide\d+/.test(slideKey)) {
      return;
    }

    const slideData = apiResponse[slideKey] || {};
    
    // Extract page number from slide key
    const pageNumberFromKey = slideKey.match(/\d+/);
    const pageNumber = pageNumberFromKey ? parseInt(pageNumberFromKey[0]) : null;
    
    if (!pageNumber) {
      console.warn("RealTimeDataParser - Could not extract page number from:", slideKey);
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
      const segments = Object.keys(slideData.Segments).map(segmentKey => {
        const segment = slideData.Segments[segmentKey] || {};
        return {
          id: segmentKey,
          text: segment.text || "",
          reason: segment.reason || "",
          isImportant: segment.isImportant === true || segment.isImportant === "true",
          linkedConcept: segment.linkedConcept || "",
          pageNumber: segment.pageNumber || pageNumber,
        };
      });

      // Replace segments completely for this page instead of merging
      updatedVoiceData[pageNumber] = segments;
    }
  });

  console.log("RealTimeDataParser - Updated pages:", Object.keys(updatedSummaryData));
  
  return {
    summaryData: updatedSummaryData,
    voiceData: updatedVoiceData
  };
};

/**
 * Validates if audio recording duration meets minimum requirement
 * @param {Date} startTime - Recording start time
 * @param {Date} endTime - Recording end time
 * @param {number} minDuration - Minimum duration in seconds (default: 10)
 * @returns {boolean} - True if duration is valid
 */
export const isValidDuration = (startTime, endTime, minDuration = 10) => {
  const duration = calculateDuration(startTime, endTime);
  return duration >= minDuration;
};