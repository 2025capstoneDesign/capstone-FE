import ReactMarkdown from "react-markdown";
import { useRef, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useDetectClose from "../../hooks/useDetectClose";
import "../../css/Dropdown.css";
import remarkGfm from "remark-gfm";
import DropdownMenu from "../common/DropdownMenu";
import PageMoveModal from "../common/PageMoveModal";

export default function SummaryPanel({
  activeTab,
  setActiveTab,
  highlightColor,
  setHighlightColor,
  pageNumber,
  setPageNumber,
  numPages,
  summaryData,
  voiceData,
  pageSectionRefs,
}) {
  const contentContainerRef = useRef(null);
  const prevTabRef = useRef(activeTab);
  const prevPageRef = useRef(pageNumber);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showMoveButton, setShowMoveButton] = useState(false);

  // 특정 페이지 섹션으로 스크롤하는 함수 - 부드러운 스크롤 적용
  const scrollToPageSection = useCallback(
    (pageNum) => {
      if (activeTab === "voice" && contentContainerRef.current) {
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
    [activeTab, pageSectionRefs]
  );

  // 탭 변경 시 스크롤 처리를 위한 useEffect
  useEffect(() => {
    // 탭이 변경되었을 때만 실행
    if (prevTabRef.current !== activeTab) {
      if (activeTab === "voice" && contentContainerRef.current) {
        // 탭이 voice로 변경될 때 스크롤 처리
        // 즉시 맨 위로 스크롤
        contentContainerRef.current.scrollTop = 0;

        // React의 렌더링 사이클이 완료된 후 스크롤 실행
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToPageSection(pageNumber);
          });
        });
      }
    }

    // 탭 상태 업데이트
    prevTabRef.current = activeTab;
  }, [activeTab, pageNumber, scrollToPageSection]);

  // 페이지 변경 시 스크롤 처리를 위한 별도의 useEffect
  useEffect(() => {
    // 이전 페이지와 현재 페이지가 다르고, voice 탭일 때만 실행
    if (prevPageRef.current !== pageNumber && activeTab === "voice") {
      // requestAnimationFrame을 사용하여 DOM 업데이트 후 스크롤
      requestAnimationFrame(() => {
        scrollToPageSection(pageNumber);
      });
    }

    // 페이지 상태 업데이트
    prevPageRef.current = pageNumber;
  }, [pageNumber, activeTab, scrollToPageSection]);

  // 툴팁 위치 계산 함수
  const positionTooltip = (event) => {
    const tooltip = event.currentTarget.querySelector(".reason-tooltip");
    if (!tooltip) return;

    const segmentRect = event.currentTarget.getBoundingClientRect();

    // 툴팁이 텍스트 왼쪽(슬라이드 영역 위)에 위치하도록 설정
    tooltip.style.left = `${segmentRect.left - 270}px`; // 250px max-width + 20px 여백
    tooltip.style.top = `${segmentRect.top + 5}px`;
  };

  // 세그먼트 더블클릭 시 해당 페이지로 이동
  const handleSegmentDoubleClick = (segment) => {
    // segment.isImportant가 true이고 linkedConcept와 pageNumber가 존재할 때만 실행
    if (segment.isImportant && segment.linkedConcept && segment.pageNumber) {
      toast.info(`'${segment.linkedConcept}' 개념으로 이동하였습니다`, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setPageNumber(segment.pageNumber);
      scrollToPageSection(segment.pageNumber);
    }
  };

  // 드래그 이벤트 처리 함수
  const handleDragStart = (e, segment) => {
    e.dataTransfer.setData("text/plain", segment.text);
    setSelectedText(segment.text);
    setIsModalOpen(true);
  };

  // 텍스트 선택 이벤트 처리
  const handleTextSelection = (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText) {
      setSelectedText(selectedText);
      setShowMoveButton(true);
    } else {
      setShowMoveButton(false);
    }
  };

  const handleModalConfirm = (targetPage, text) => {
    console.log('선택된 텍스트:', text);
    console.log('이동할 페이지:', targetPage);
  };

  // 전체 voiceData를 렌더링하는 함수
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
                    onDoubleClick={() =>
                      hasLink && handleSegmentDoubleClick(segment)
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

  // AI 필기 유형 상태 관리
  const [noteType, setNoteType] = useState("Concise Summary Notes");

  const noteTypeOptions = [
    { value: "Concise Summary Notes", label: "서술형 필기" },
    { value: "Bullet Point Notes", label: "개조식 필기" },
    { value: "Keyword Notes", label: "키워드 필기" },
  ];

  const getSelectedNoteTypeLabel = () => {
    const option = noteTypeOptions.find((opt) => opt.value === noteType);
    return option ? option.label : noteType;
  };

  return (
    <div className="summary-container">
      <div className="tab-container content-tabs">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            AI 필기
          </button>
          <button
            className={`tab ${activeTab === "voice" ? "active" : ""}`}
            onClick={() => setActiveTab("voice")}
          >
            음성 원본
          </button>
        </div>

        {/* 탭에 따라 다른 컨트롤 표시 */}
        {activeTab === "voice" ? (
          <div className="color-selector visible">
            <button
              className={`color-btn red ${
                highlightColor === "red" ? "selected" : ""
              }`}
              onClick={() => setHighlightColor("red")}
              aria-label="빨강색 강조"
            />
            <button
              className={`color-btn blue ${
                highlightColor === "blue" ? "selected" : ""
              }`}
              onClick={() => setHighlightColor("blue")}
              aria-label="파랑색 강조"
            />
            <button
              className={`color-btn green ${
                highlightColor === "green" ? "selected" : ""
              }`}
              onClick={() => setHighlightColor("green")}
              aria-label="초록색 강조"
            />
          </div>
        ) : (
          <div className="note-type-selector visible">
            <DropdownMenu
              options={noteTypeOptions}
              selectedOption={getSelectedNoteTypeLabel()}
              onOptionChange={setNoteType}
            />
          </div>
        )}
      </div>

      <div 
        className="content-container" 
        ref={contentContainerRef}
        onMouseUp={handleTextSelection}
      >
        {activeTab === "ai" ? (
          <div className="ai-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                strong: ({ node, ...props }) => (
                  <strong
                    style={{
                      color:
                        noteType === "Concise Summary Notes"
                          ? "red"
                          : "inherit",
                    }}
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p style={{ whiteSpace: "pre-wrap" }} {...props} />
                ),
              }}
            >
              {summaryData[pageNumber] && summaryData[pageNumber][noteType]
                ? summaryData[pageNumber][noteType]
                : "해당 페이지의 요약 내용이 없습니다."}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="voice-content">{renderAllVoiceContent()}</div>
        )}
      </div>

      {showMoveButton && !isModalOpen && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-[#80cbc4] text-white rounded-lg shadow-lg hover:bg-[#4db6ac] hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md transition-all duration-300 text-[15px] font-medium"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="text-lg font-bold">→</span>
            이동
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
    </div>
  );
}
