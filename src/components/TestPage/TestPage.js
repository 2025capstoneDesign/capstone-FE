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
  /* ───────────────────── 초기 설정 ───────────────────── */
  const location = useLocation();
  const navigate = useNavigate();
  const { pdfFile } = location.state || { pdfFile: "/sample3.pdf" };

  /** File → object URL 변환 (메모리 누수 방지) */
  const pdfUrl =
    pdfFile instanceof File ? URL.createObjectURL(pdfFile) : pdfFile;

  /** 페이지·탭 상태 */
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("ai"); // ai | voice
  const [highlightColor, setHighlightColor] = useState("red");

  /** 이전 상태 추적용 ref */
  const prevTabRef = useRef(activeTab);
  const prevPageRef = useRef(pageNumber);

  /** 스크롤·DOM 참조 */
  const contentContainerRef = useRef(null);
  const pageSectionRefs = useRef({});

  /* ───────────────────── Side-effects ───────────────────── */

  /** 컴포넌트 최초 마운트 시 스크롤 0 */
  useEffect(() => window.scrollTo(0, 0), []);

  /** PDF 로드 완료 시 총 페이지 수 설정 */
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  /** voice 탭 활성화 → 해당 페이지 섹션으로 스크롤 */
  const scrollToPageSection = useCallback(
    (pageNum) => {
      if (activeTab !== "voice") return;
      const section = pageSectionRefs.current[pageNum];
      const container = contentContainerRef.current;
      if (!section || !container) return;

      const top =
        container.scrollTop +
        section.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        5; // offset

      container.scrollTo({ top, behavior: "smooth" });
    },
    [activeTab]
  );

  /** 탭 변경 시 보정 스크롤 */
  useEffect(() => {
    if (prevTabRef.current !== activeTab && activeTab === "voice") {
      contentContainerRef.current.scrollTop = 0; // 맨 위로
      requestAnimationFrame(() =>
        requestAnimationFrame(() => scrollToPageSection(pageNumber))
      );
    }
    prevTabRef.current = activeTab;
  }, [activeTab, pageNumber, scrollToPageSection]);

  /** 페이지 변경 시 voice 섹션 스크롤 */
  useEffect(() => {
    if (prevPageRef.current !== pageNumber && activeTab === "voice") {
      requestAnimationFrame(() => scrollToPageSection(pageNumber));
    }
    prevPageRef.current = pageNumber;
  }, [pageNumber, activeTab, scrollToPageSection]);

  /* ───────────────────── 페이지 이동 ───────────────────── */

  const [transitionDir, setTransitionDir] = useState(null); // left | right | null

  /** 페이지 번호 변경 (최소 리렌더) */
  const changePage = (offset) => {
    setPageNumber((prev) => {
      const next = Math.min(Math.max(1, prev + offset), numPages || 1);
      if (next === prev) return prev;
      setTransitionDir(offset > 0 ? "right" : "left");
      return next;
    });
  };

  /* ───────────────────── voice 렌더링 ───────────────────── */

  const renderVoice = () => {
    if (!voiceData || !numPages) {
      return <p className="no-content">음성 원본이 없습니다.</p>;
    }
    const pages = Array.from({ length: numPages }, (_, i) => i + 1);

    return pages.map((p) => (
      <div
        key={p}
        className={`voice-page-section ${
          p === pageNumber ? `active-page-section ${highlightColor}` : ""
        }`}
        ref={(el) => (pageSectionRefs.current[p] = el)}
      >
        <div className="page-section-header">
          <h3>페이지 {p}</h3>
        </div>
        <div className="segment-container">
          {(voiceData[p] || []).map((seg) => {
            const linkable =
              seg.isImportant && seg.linkedConcept && seg.pageNumber;
            return (
              <span
                key={seg.id}
                className={`segment-text ${
                  seg.isImportant
                    ? `important ${highlightColor} ${
                        linkable ? "linkable" : ""
                      }`
                    : ""
                }`}
                onDoubleClick={() => linkable && handleSegmentDoubleClick(seg)}
              >
                {seg.text}{" "}
                {seg.isImportant && (
                  <span className="reason-tooltip">
                    {seg.reason}
                    {linkable && (
                      <span className="link-notice">
                        더블클릭 시 "{seg.linkedConcept}" 개념으로 이동
                      </span>
                    )}
                  </span>
                )}
              </span>
            );
          })}
          {voiceData[p]?.length === 0 && (
            <p className="no-page-content">
              이 페이지에 대한 음성 원본이 없습니다.
            </p>
          )}
        </div>
        {p !== pages[pages.length - 1] && (
          <hr className="page-section-divider" />
        )}
      </div>
    ));
  };

  const handleSegmentDoubleClick = (seg) => {
    toast.info(`'${seg.linkedConcept}' 개념으로 이동하였습니다`, {
      position: "top-center",
      autoClose: 1500,
    });
    setPageNumber(seg.pageNumber);
    scrollToPageSection(seg.pageNumber);
  };

  /* ───────────────────── JSX ───────────────────── */

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

        {/* ────────── PDF 영역 ────────── */}
        <div className="slide-container">
          <div className="slide-header">
            <div
              className="audio-icon"
              onClick={() =>
                toast.info("음성 기능이 활성화 되었습니다.", {
                  position: "top-center",
                  autoClose: 1500,
                })
              }
            >
              {/* … (SVG 동일) */}
            </div>
          </div>

          <div className="pdf-viewer">
            {/* Document / Page – loading 프롭을 null 로 지정해 로딩 텍스트 제거 */}
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={null}
            >
              <Page
                key={
                  pageNumber
                } /* key를 페이지 번호로 지정 → 페이지 교체 시 새 DOM 생성 */
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={window.innerWidth * 0.55}
                className={`pdf-page ${
                  transitionDir ? `transition-${transitionDir}` : ""
                }`}
                onRenderSuccess={() => setTransitionDir(null)} // 페이드 완료 후 dir 초기화
              />
            </Document>

            {/* 페이지 네비게이션 – 상태값 없이 CSS hover만 사용 */}
            <div
              className="nav-area left-area"
              onClick={pageNumber > 1 ? () => changePage(-1) : undefined}
            >
              <div
                className={`nav-arrow-icon ${
                  pageNumber === 1 ? "disabled" : ""
                }`}
              >
                &#10094;
              </div>
            </div>
            <div
              className="nav-area right-area"
              onClick={pageNumber < numPages ? () => changePage(1) : undefined}
            >
              <div
                className={`nav-arrow-icon ${
                  pageNumber === numPages ? "disabled" : ""
                }`}
              >
                &#10095;
              </div>
            </div>

            <div className="page-info">
              {pageNumber} / {numPages}
            </div>
          </div>
        </div>

        {/* ────────── 요약 패널 ────────── */}
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

            <div
              className={`color-selector ${
                activeTab === "voice" ? "visible" : "hidden"
              }`}
            >
              {["red", "blue", "green"].map((c) => (
                <button
                  key={c}
                  className={`color-btn ${c} ${
                    highlightColor === c ? "selected" : ""
                  }`}
                  onClick={() => setHighlightColor(c)}
                  aria-label={`${c} 강조`}
                />
              ))}
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
              <div className="voice-content">{renderVoice()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
