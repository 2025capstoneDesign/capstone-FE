import React, { useRef, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PageMoveModal from "../common/PageMoveModal";
import { useAuth } from "../../context/AuthContext";
import { showError } from "../../utils/errorHandler";
import { useLocation } from "react-router-dom";

export default function AudioPanel({
  pageNumber,
  voiceData,
  highlightColor = "blue",
  numPages,
  pageSectionRefs,
  onDataUpdate,
}) {
  const contentContainerRef = useRef(null);
  const prevPageRef = useRef(pageNumber);
  const location = useLocation();
  const { getAuthHeader } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedPage, setSelectedPage] = useState(null);
  const [showMoveButton, setShowMoveButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get jobId from navigation state
  const { jobId } = location.state || {};

  // 특정 페이지 섹션으로 스크롤하는 함수 - 부드러운 스크롤 적용
  const scrollToPageSection = useCallback(
    (pageNum) => {
      if (contentContainerRef.current) {
        const sectionRef = pageSectionRefs.current[pageNum];
        if (sectionRef) {
          // 상단 여백을 위한 오프셋 (모든 페이지에 동일하게 적용)
          const offsetCorrection = 5;

          // 컨테이너의 현재 스크롤 위치를 기준으로 섹션의 상대적 위치 계산
          const containerRect =
            contentContainerRef.current.getBoundingClientRect();
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

  // 텍스트가 속한 페이지 번호 찾기
  const findTextPageNumber = (text) => {
    if (!voiceData) return null;

    // 모든 페이지를 순회하면서 텍스트가 포함된 페이지 찾기
    for (const [pageNum, segments] of Object.entries(voiceData)) {
      const pageText = segments.map((segment) => segment.text).join(" ");
      if (pageText.includes(text)) {
        return parseInt(pageNum);
      }
    }
    return null;
  };

  // 텍스트 선택 이벤트 처리
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      setSelectedText(selectedText);
      const textPage = findTextPageNumber(selectedText);
      setSelectedPage(textPage);
      setShowMoveButton(true);
    } else {
      setShowMoveButton(false);
      setSelectedPage(null);
    }
  };

  // 세그먼트 이동/삭제 API 호출
  const handleModalConfirm = async (targetPage, text) => {
    if (!jobId) {
      showError("작업 ID가 없습니다.");
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/api/realTime/move-segment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          jobId,
          startSlide: selectedPage,
          targetSlide: targetPage,
          text: text,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // result.json으로 voiceData 업데이트
        if (result.result && onDataUpdate) {
          onDataUpdate(result.result);
        }

        const action = targetPage === 0 ? "삭제" : "이동";
        toast.success(`텍스트가 성공적으로 ${action}되었습니다.`, {
          position: "top-center",
          autoClose: 1500,
        });
      } else {
        throw new Error("요청 실패");
      }
    } catch (error) {
      console.error("Move/delete error:", error);
      showError("텍스트 이동/삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setShowMoveButton(false);
    }
  };

  return (
    <>
      <div
        className="content-container"
        ref={contentContainerRef}
        onMouseUp={handleTextSelection}
      >
        <div className="voice-content">{renderAllVoiceContent()}</div>
      </div>

      {showMoveButton && !isModalOpen && (
        <div className="fixed bottom-8 right-8 z-50 flex gap-2">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-[#80cbc4] text-white rounded-lg shadow-lg hover:bg-[#4db6ac] hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md transition-all duration-300 text-[15px] font-medium"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
          >
            이동
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md transition-all duration-300 text-[15px] font-medium"
            onClick={() => handleModalConfirm(0, selectedText)}
            disabled={isLoading}
          >
            삭제
          </button>
        </div>
      )}

      <PageMoveModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setShowMoveButton(false);
        }}
        onConfirm={handleModalConfirm}
        maxPage={numPages}
        selectedText={selectedText}
      />
    </>
  );
}
