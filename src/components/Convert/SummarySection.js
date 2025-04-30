import React from "react";

function SummarySection({
  activeTab,
  setActiveTab,
  highlightColor,
  setHighlightColor,
}) {
  return (
    <div className="summary-container">
      <div className="tab-container content-tabs">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            <p className="text-[1.1rem]">AI 필기</p>
          </button>
          <button
            className={`tab ${activeTab === "voice" ? "active" : ""}`}
            onClick={() => setActiveTab("voice")}
          >
            <p className="text-[1.1rem]">음성 원본</p>
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

      <div className="content-container">
        {activeTab === "ai" ? (
          <div className="ai-content">
            <p className="text-[1.1rem] text-gray-500">
              파일을 업로드하고 변환을 시작하면 AI가 작성한 필기를 확인할 수
              있습니다.
            </p>
          </div>
        ) : (
          <div className="voice-content">
            <p className="text-[1.1rem] text-gray-500 mb-[3rem]">
              파일을 업로드하고 변환을 시작하면 음성 원본을 확인할 수 있습니다.
            </p>
            <p className="text-[1.1rem] text-gray-500">
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
                중요한 내용은 하이라이트로 표시됩니다. 상단의 색상 팔레트에서
                색상을 바꿔보세요.
                <br />
                글자 위에 마우스를 올리면 해당 내용이 중요한 이유를 확인할 수
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
