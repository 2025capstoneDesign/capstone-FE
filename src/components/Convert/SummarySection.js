import React, { useState, useRef } from "react";
import useDetectClose from "../../hooks/useDetectClose";
import "../../css/Dropdown.css";

function SummarySection({
  activeTab,
  setActiveTab,
  highlightColor,
  setHighlightColor,
}) {
  const [noteType, setNoteType] = useState("Concise Summary Notes");
  const dropDownRef = useRef(null);
  const [isOpen, setIsOpen] = useDetectClose(dropDownRef, false);

  const handleNoteTypeChange = (type) => {
    setNoteType(type);
    setIsOpen(false);
  };

  return (
    <div className="summary-container">
      <div className="tab-container content-tabs">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            <p className="text-[0.9rem]">AI 필기</p>
          </button>
          <button
            className={`tab ${activeTab === "voice" ? "active" : ""}`}
            onClick={() => setActiveTab("voice")}
          >
            <p className="text-[0.9rem]">음성 원본</p>
          </button>
        </div>

        {activeTab === "voice" ? (
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
        ) : (
          <div className="note-type-selector visible">
            <div className="dropdown-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
              >
                {noteType === "Concise Summary Notes"
                  ? "간결한 요약"
                  : noteType === "Bullet Point Notes"
                  ? "불릿 포인트"
                  : "키워드 요약"}
              </button>
              <ul
                ref={dropDownRef}
                className={`menu ${isOpen ? "active" : ""}`}
              >
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNoteTypeChange("Concise Summary Notes");
                  }}
                >
                  간결한 요약
                </li>
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNoteTypeChange("Bullet Point Notes");
                  }}
                >
                  불릿 포인트
                </li>
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNoteTypeChange("Keyword Notes");
                  }}
                >
                  키워드 요약
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="content-container">
        {activeTab === "ai" ? (
          <div className="ai-content">
            <p className="text-[1.1rem] text-gray-700">
              {(() => {
                const commonContent = (
                  <>
                    <span className="text-[1.4rem] font-semibold">
                      필기요정 사용 방법
                    </span>
                    <br />
                    <br />
                    🔹 왼쪽 업로드 영역에 강의록 파일과 음성 파일을
                    업로드해주세요.
                    <br />
                    🔹 파일을 업로드하고 변환을 시작하면 AI가 작성한 필기를
                    확인할 수 있습니다.
                    <br />
                    <br />
                    <br />
                    <span className="text-[1.4rem] font-semibold">
                      다양한 요약 방식 제공
                    </span>
                    <br />
                    <br />
                    🔹 오른쪽 상단의 드롭버튼으로 요약 방식을 선택할 수
                    있습니다. 다양한 방식으로 제공되는 필기를 확인해보세요.
                    <br />
                    <br />
                  </>
                );

                return (
                  <>
                    {noteType === "Concise Summary Notes" ? (
                      <>
                        {commonContent}
                        <span className="text-[1.2rem]">[간결한 요약]</span>
                        <br />
                        🔹 전체 내용을 간단하고 명확하게 요약한 내용을 줄글
                        형식으로 확인할 수 있습니다.
                        <br />
                        🔹 전반적인 내용의 이해가 필요하다면 '간결한 요약'
                        방식의 필기를 사용해보세요.
                      </>
                    ) : noteType === "Bullet Point Notes" ? (
                      <>
                        {commonContent}
                        <span className="text-[1.2rem]">[불릿포인트]</span>
                        <br />
                        🔹 핵심 내용을 포인트 형태의 독립적인 문장 형식으로
                        확인할 수 있습니다.
                        <br />
                        🔹 핵심 내용을 빠르게 확인하고 싶다면 '불릿 포인트'
                        방식의 필기를 사용해보세요.
                      </>
                    ) : (
                      <>
                        {commonContent}
                        <span className="text-[1.2rem]">[키워드 요약]</span>
                        <br />
                        🔹 개념 중심으로 핵심 용어와 정의를 확인할 수 있습니다.
                        <br />
                        🔹 강의에 등장하는 용어와 정의를 정리하고 싶다면 '키워드
                        요약' 방식의 필기를 사용해보세요.
                      </>
                    )}
                  </>
                );
              })()}
            </p>
          </div>
        ) : (
          <div className="voice-content">
            <p className="text-[1.1rem] text-gray-700">
              <span className="text-[1.4rem] font-semibold">
                필기요정 사용 방법
              </span>
              <br />
              <br />
              🔹 왼쪽 업로드 영역에 강의록 파일과 음성 파일을 업로드해주세요.
              <br />
              🔹파일을 업로드하고 변환을 시작하면 음성 원본을 확인할 수
              있습니다.
            </p>
            <p className="text-[1.1rem] text-gray-700">
              <br />
              <br />
              <span className="text-[1.4rem] font-semibold">
                하이라이트 기능
              </span>
              <br />
              <span
                className={`segment-text important ${highlightColor}`}
                onMouseEnter={(e) => {
                  const tooltip =
                    e.currentTarget.querySelector(".reason-tooltip");
                  if (tooltip) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    tooltip.style.left = `${rect.left - 140}px`;
                    tooltip.style.top = `${rect.top + 5}px`;
                  }
                }}
              >
                <br />
                🔹중요한 내용은 하이라이트로 표시됩니다. 오른쪽 상단의 색상
                팔레트에서 색상을 바꿔보세요.
                <br />
                🔹문장 위에 마우스를 올리면 해당 내용이 중요한 이유를 확인할 수
                있습니다.
                <span className="reason-tooltip">중요한 이유 확인</span>
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SummarySection;
