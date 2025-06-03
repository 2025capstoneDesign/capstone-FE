import React, { useRef, useCallback, useEffect } from "react";

export default function AudioPanel({
  pageNumber,
  voiceData,
  highlightColor = "blue",
  numPages,
  pageSectionRefs,
  setHighlightColor
}) {
  const contentContainerRef = useRef(null);
  const prevPageRef = useRef(pageNumber);

  // 특정 페이지 섹션으로 스크롤하는 함수 - 부드러운 스크롤 적용
  const scrollToPageSection = useCallback(
    (pageNum) => {
      if (contentContainerRef.current) {
        const sectionRef = pageSectionRefs.current[pageNum];
        if (sectionRef) {
          // 상단 여백을 위한 오프셋 (모든 페이지에 동일하게 적용)
          const offsetCorrection = 5;

          // 컨테이너의 현재 스크롤 위치를 기준으로 섹션의 상대적 위치 계산
          const containerRect = contentContainerRef.current.getBoundingClientRect();
          const sectionRect = sectionRef.getBoundingClientRect();

          // 섹션이 컨테이너 상단에 딱 맞도록 스크롤 계산
          const scrollTop =
            contentContainerRef.current.scrollTop +
            (sectionRect.top - containerRect.top) -
            offsetCorrection;

          // 부드러운 스크롤 적용
          contentContainerRef.current.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
      }
    },
    [pageSectionRefs]
  );

  // 페이지 변경 시 스크롤 처리를 위한 useEffect
  useEffect(() => {
    // 이전 페이지와 현재 페이지가 다를 때만 실행
    if (prevPageRef.current !== pageNumber) {
      // requestAnimationFrame을 사용하여 DOM 업데이트 후 스크롤
      requestAnimationFrame(() => {
        scrollToPageSection(pageNumber);
      });
    }

    // 페이지 상태 업데이트
    prevPageRef.current = pageNumber;
  }, [pageNumber, scrollToPageSection]);

  // 전체 voiceData를 렌더링하는 함수 (모든 페이지)
  const renderAllVoiceContent = () => {
    // voiceData가 비어있는 경우
    if (!voiceData || Object.keys(voiceData).length === 0) {
      return <p className="no-content">음성 원본이 없습니다.</p>;
    }

    // 페이지 번호 순서대로 정렬
    const sortedPages = Object.keys(voiceData)
      .map(Number)
      .sort((a, b) => a - b);

    // 현재 PDF의 모든 페이지를 표시하기 위한 배열 생성 (1부터 numPages까지)
    const allPages = numPages
      ? Array.from({ length: numPages }, (_, i) => i + 1)
      : sortedPages;

    return allPages.map((pageNum) => {
      const pageSegments = voiceData[pageNum] || [];

      return (
        <div
          key={`page-section-${pageNum}`}
          className={`voice-page-section ${
            pageNumber === pageNum
              ? `active-page-section ${highlightColor}`
              : ""
          }`}
          ref={(el) => (pageSectionRefs.current[pageNum] = el)}
        >
          <div className="page-section-header">
            <h3>페이지 {pageNum}</h3>
          </div>

          <div className="segment-container">
            {pageSegments.length > 0 ? (
              pageSegments.map((segment) => {
                const hasLink =
                  segment.isImportant &&
                  segment.linkedConcept &&
                  segment.pageNumber;
                return (
                  <span
                    key={segment.id}
                    className={`segment-text ${
                      segment.isImportant
                        ? `important ${highlightColor} ${
                            hasLink ? "linkable" : ""
                          }`
                        : ""
                    }`}
                    onMouseEnter={
                      segment.isImportant ? positionTooltip : undefined
                    }
                  >
                    {segment.text}{" "}
                    {segment.isImportant && (
                      <span className="reason-tooltip">
                        {segment.reason}
                        {hasLink && (
                          <span className="link-notice">
                            더블클릭 시 "{segment.linkedConcept}" 개념으로 이동
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                );
              })
            ) : (
              <p className="no-page-content">
                이 페이지에 대한 음성 원본이 없습니다.
              </p>
            )}
          </div>

          {/* 각 페이지 섹션 사이에 구분선 추가 (마지막 페이지 제외) */}
          {pageNum !== allPages[allPages.length - 1] && (
            <hr className="page-section-divider" />
          )}
        </div>
      );
    });
  };

  // 툴팁 위치 계산 함수
  const positionTooltip = (event) => {
    const tooltip = event.currentTarget.querySelector(".reason-tooltip");
    if (!tooltip) return;

    const segmentRect = event.currentTarget.getBoundingClientRect();

    // 툴팁이 텍스트 왼쪽에 위치하도록 설정
    tooltip.style.left = `${segmentRect.left - 270}px`;
    tooltip.style.top = `${segmentRect.top + 5}px`;
  };

  return (
    <div className="content-container" ref={contentContainerRef}>
      <div className="voice-content">{renderAllVoiceContent()}</div>
    </div>
  );
}