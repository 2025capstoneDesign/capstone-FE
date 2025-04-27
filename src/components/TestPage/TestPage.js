// /src/pages/TestPage.js
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page } from "react-pdf";
import { summaryData } from "../../data/summaryData";
import { voiceData } from "../../data/voiceData";
import "../../css/TestPage.css";
import ReactMarkdown from "react-markdown";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pdfFile } = location.state || { pdfFile: "/sample3.pdf" };

  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("ai"); // "ai" or "voice"
  const [highlightColor, setHighlightColor] = useState("red");
  const [isArrowsVisible, setIsArrowsVisible] = useState(false);
  const [hoveredSide, setHoveredSide] = useState(null); // 'left', 'right', null

  // 마우스 이벤트를 제한하기 위한 쓰로틀링 관련 ref
  const pdfContainerRef = useRef(null);
  const summaryPanelRef = useRef(null);
  const contentContainerRef = useRef(null);

  // 각 페이지 섹션에 대한 ref를 저장할 객체
  const pageSectionRefs = useRef({});

  // 이전 탭 상태를 저장하기 위한 ref
  const prevTabRef = useRef(activeTab);
  // 이전 페이지 상태를 저장하기 위한 ref 추가
  const prevPageRef = useRef(pageNumber);

  // File 객체인 경우 URL 생성, 문자열인 경우 그대로 사용
  const pdfUrl =
    pdfFile instanceof File ? URL.createObjectURL(pdfFile) : pdfFile;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const [pageTransition, setPageTransition] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null);

  // 특정 페이지 섹션으로 스크롤하는 함수 - 부드러운 스크롤 적용
  const scrollToPageSection = useCallback(
    (pageNum) => {
      if (activeTab === "voice" && contentContainerRef.current) {
        // 첫 번째 페이지인 경우 항상 최상단으로 스크롤

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
    [activeTab]
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

  const changePage = (offset) => {
    const newPageNumber = Math.min(
      Math.max(1, pageNumber + offset),
      numPages || 1
    );

    if (newPageNumber !== pageNumber) {
      // 페이지 전환 애니메이션을 위한 상태 설정
      setTransitionDirection(offset > 0 ? "right" : "left");
      setPageTransition(true);

      // 단축된 지연 시간
      setTimeout(() => {
        setPageNumber(newPageNumber);
        setTimeout(() => {
          setPageTransition(false);
        }, 20);
      }, 100);
    }
  };

  // PDF 컨테이너에 마우스 진입/이탈 시 화살표 표시/숨김
  const handleMouseEnter = () => setIsArrowsVisible(true);
  const handleMouseLeave = () => {
    setIsArrowsVisible(false);
    setHoveredSide(null);
  };

  // 왼쪽 영역에 마우스 진입 시
  const handleLeftHover = () => {
    if (pageNumber > 1) {
      setHoveredSide("left");
    }
  };

  // 오른쪽 영역에 마우스 진입 시
  const handleRightHover = () => {
    if (pageNumber < numPages) {
      setHoveredSide("right");
    }
  };

  // 영역에서 마우스 이탈 시
  const handleAreaLeave = () => {
    setHoveredSide(null);
  };

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
    if (segment.linkedConcept && segment.pageNumber) {
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

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h1 className="page-title">PDF 변환 결과</h1>
        <div className="action-buttons">
          <button className="convert-btn" onClick={() => navigate("/convert")}>
            다시 변환하기
          </button>
          <button className="download-btn">다운로드</button>
        </div>
      </div>
      <div className="main-content">
        <ToastContainer />
        {/* 왼쪽 PDF 영역 */}
        <div className="slide-container" ref={pdfContainerRef}>
          <div className="slide-header">
            <div
              className="audio-icon"
              onClick={() =>
                toast.info("음성 기능이 활성화 되었습니다.", {
                  position: "top-center",
                  autoClose: 1500,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                })
              }
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z"
                  stroke="#5CBFBC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.35 9.65V11.35C4.35 15.57 7.78 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.65"
                  stroke="#5CBFBC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.61 6.56C11.519 6.19051 12.5098 6.1885 13.42 6.56C14.18 6.87 14.794 7.44448 15.13 8.17C15.2577 8.45726 15.3312 8.76303 15.348 9.074C15.3648 9.38498 15.3244 9.6964 15.229 9.994C15.1335 10.2916 14.9846 10.5696 14.7891 10.8143C14.5937 11.059 14.3549 11.2667 14.085 11.426C13.816 11.5844 13.5194 11.692 13.212 11.743C12.9046 11.794 12.5917 11.7878 12.287 11.725"
                  stroke="#5CBFBC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19V22"
                  stroke="#5CBFBC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div
            className="pdf-viewer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading="PDF 로딩중..."
              className="pdf-document"
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className={`pdf-page ${
                  pageTransition ? `transition-${transitionDirection}` : ""
                }`}
                width={window.innerWidth * 0.55}
              />
            </Document>

            {isArrowsVisible && (
              <div className="page-navigation">
                <div
                  className="nav-area left-area"
                  onMouseEnter={handleLeftHover}
                  onMouseLeave={handleAreaLeave}
                  onClick={pageNumber > 1 ? () => changePage(-1) : undefined}
                  style={{ cursor: pageNumber > 1 ? "pointer" : "default" }}
                >
                  {hoveredSide === "left" && (
                    <div className="nav-arrow-icon">&#10094;</div>
                  )}
                </div>

                <div
                  className="nav-area right-area"
                  onMouseEnter={handleRightHover}
                  onMouseLeave={handleAreaLeave}
                  onClick={
                    pageNumber < numPages ? () => changePage(1) : undefined
                  }
                  style={{
                    cursor: pageNumber < numPages ? "pointer" : "default",
                  }}
                >
                  {hoveredSide === "right" && (
                    <div className="nav-arrow-icon">&#10095;</div>
                  )}
                </div>
              </div>
            )}

            <div className="page-info">
              {pageNumber} / {numPages}
            </div>
          </div>
        </div>

        {/* 오른쪽 요약 영역 */}
        <div className="summary-container" ref={summaryPanelRef}>
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

            <div
              className={`color-selector ${
                activeTab === "voice" ? "visible" : "hidden"
              }`}
            >
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
          </div>

          <div className="content-container" ref={contentContainerRef}>
            {activeTab === "ai" ? (
              <div className="ai-content">
                <ReactMarkdown>
                  {summaryData[pageNumber] ||
                    "해당 페이지의 요약 내용이 없습니다."}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="voice-content">{renderAllVoiceContent()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
