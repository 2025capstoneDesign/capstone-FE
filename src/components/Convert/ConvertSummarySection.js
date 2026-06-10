import React, { useState } from "react";
import DropdownMenu from "../common/DropdownMenu";
import { RiQuillPenAiFill } from "react-icons/ri";
import { TbFileDescription } from "react-icons/tb";
import { PiKeyBold } from "react-icons/pi";
import { IoListOutline } from "react-icons/io5";

/**
 * 변환 페이지 우측 안내/요약 패널 (공통)
 *
 * 기존 UploadConvert/SummarySection.js 와
 * RealTimeConvert/RealTimeSummarySection.js 는 187줄 중
 * 탭 키/라벨과 안내 문구 몇 줄만 다른 쌍둥이 파일이었다.
 * 차이점은 VARIANTS로 분리하고 구조는 하나로 통합.
 *
 * mode: "upload" (강의록 변환) | "realtime" (실시간 변환)
 */
const VARIANTS = {
  upload: {
    originalTabKey: "voice",
    originalTabLabel: "음성 원본",
    guideTitle: "필기요정 사용 방법",
    aiUploadGuide: (
      <>
        <p className="text-gray-700 mt-1">왼쪽 업로드 영역에 <span className="font-semibold text-[#5B7F7C]"> 강의록 파일</span> 과 <span className="font-semibold text-[#5B7F7C]"> 음성 파일</span> 을 업로드해주세요.</p>
        <p className="text-gray-700">파일을 업로드하고 변환을 시작하면  <span className="font-semibold text-[#5B7F7C]">AI가 작성한 필기</span>를 확인할 수 있습니다.</p>
      </>
    ),
    originalUploadGuide: (
      <>
        <p className="text-gray-700 mt-1">왼쪽 업로드 영역에 <span className="font-semibold text-[#5B7F7C]"> 강의록 파일</span> 과 <span className="font-semibold text-[#5B7F7C]"> 음성 파일</span> 을 업로드해주세요.</p>
        <p className="text-gray-700">파일을 업로드하고 변환을 시작하면  <span className="font-semibold text-[#5B7F7C]">음성 원본</span>를 확인할 수 있습니다.</p>
      </>
    ),
  },
  realtime: {
    originalTabKey: "original",
    originalTabLabel: "원본 문서",
    guideTitle: "실시간 강의 사용 방법",
    aiUploadGuide: (
      <>
        <p className="text-gray-700 mt-1">왼쪽 업로드 영역에 <span className="font-semibold text-[#5B7F7C]"> 강의록 파일</span>을 업로드해주세요.</p>
        <p className="text-gray-700">파일을 업로드하고 <span className="font-semibold text-[#5B7F7C]">실시간 강의 변환</span>을 시작하면 <span className="font-semibold text-[#5B7F7C]">실시간</span>으로 강의 내용을 확인할 수 있습니다.</p>
      </>
    ),
    originalUploadGuide: (
      <>
        <p className="text-gray-700 mt-1">왼쪽 업로드 영역에 <span className="font-semibold text-[#5B7F7C]"> 강의록 파일</span>을 업로드해주세요.</p>
        <p className="text-gray-700">파일을 업로드하고 <span className="font-semibold text-[#5B7F7C]">실시간 강의 변환</span>을 시작하면 원본 문서를 <span className="font-semibold text-[#5B7F7C]">실시간</span>으로 확인할 수 있습니다.</p>
      </>
    ),
  },
};

const NOTE_TYPE_OPTIONS = [
  { value: "Concise Summary Notes", label: "서술형 필기" },
  { value: "Bullet Point Notes", label: "개조식 필기" },
  { value: "Keyword Notes", label: "키워드 필기" },
];

const NOTE_TYPE_GUIDES = {
  "Concise Summary Notes": {
    icon: <TbFileDescription className="inline mb-1" />,
    label: "서술형 필기",
    lines: (
      <>
        <p className="text-gray-700 mt-1">전체 내용을 간단하고 명확하게 요약한 내용을 <span className="font-semibold text-[#5B7F7C]"> 줄글 형식</span>으로 확인할 수 있습니다.</p>
        <p className="text-gray-700 mt-1">전반적인 내용의 이해가 필요하다면 <span className="font-semibold text-[#5B7F7C]"> '서술형 필기'</span> 방식의 필기를 사용해보세요.</p>
      </>
    ),
  },
  "Bullet Point Notes": {
    icon: <IoListOutline className="inline mb-1" />,
    label: "개조식 필기",
    lines: (
      <>
        <p className="text-gray-700 mt-1">핵심 내용을 포인트 형태의 <span className="font-semibold text-[#5B7F7C]"> 독립적인 문장 형식</span>으로 확인할 수 있습니다.</p>
        <p className="text-gray-700 mt-1">전반적인 내용의 이해가 필요하다면 <span className="font-semibold text-[#5B7F7C]"> '개조식 필기'</span> 방식의 필기를 사용해보세요.</p>
      </>
    ),
  },
  "Keyword Notes": {
    icon: <PiKeyBold className="inline mb-1" />,
    label: "키워드 필기",
    lines: (
      <>
        <p className="text-gray-700 mt-1">개념 중심으로 <span className="font-semibold text-[#5B7F7C]"> 핵심 용어</span>와<span className="font-semibold text-[#5B7F7C]"> 정의</span>를 확인할 수 있습니다.</p>
        <p className="text-gray-700 mt-1">전반적인 내용의 이해가 필요하다면 <span className="font-semibold text-[#5B7F7C]"> '키워드 필기'</span> 방식의 필기를 사용해보세요.</p>
      </>
    ),
  },
};

function ConvertSummarySection({
  mode = "upload",
  activeTab,
  setActiveTab,
  highlightColor,
  setHighlightColor,
}) {
  const variant = VARIANTS[mode];
  const [noteType, setNoteType] = useState("Concise Summary Notes");

  const getSelectedNoteTypeLabel = () => {
    const option = NOTE_TYPE_OPTIONS.find((opt) => opt.value === noteType);
    return option ? option.label : noteType;
  };

  const noteTypeGuide =
    NOTE_TYPE_GUIDES[noteType] || NOTE_TYPE_GUIDES["Keyword Notes"];

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
            className={`tab ${
              activeTab === variant.originalTabKey ? "active" : ""
            }`}
            onClick={() => setActiveTab(variant.originalTabKey)}
          >
            <p className="text-[0.9rem]">{variant.originalTabLabel}</p>
          </button>
        </div>

        {activeTab === variant.originalTabKey ? (
          <div
            className={`color-selector ${
              activeTab === variant.originalTabKey ? "visible" : "hidden"
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
            <DropdownMenu
              options={NOTE_TYPE_OPTIONS}
              selectedOption={getSelectedNoteTypeLabel()}
              onOptionChange={setNoteType}
            />
          </div>
        )}
      </div>

      <div className="content-container">
        {activeTab === "ai" ? (
          <div className="manual-content">
            <span className="text-[1.4rem] font-semibold">
              {variant.guideTitle}
            </span>
            <br />
            {/* 파일 업로드 */}
            <br />
            <span className="text-[1.2rem] font-semibold"><RiQuillPenAiFill className="text-xl mb-1 inline mr-1 text-[#80cbc4]"/> 파일 업로드</span>
            {variant.aiUploadGuide}
            <br />

            {/* 요약 방식 */}
            <span className="text-[1.2rem] font-semibold"><RiQuillPenAiFill className="text-xl mb-1 inline mr-1 text-[#80cbc4]"/> 다양한 요약 방식 제공</span>
            <p className="text-gray-700">오른쪽 상단의 드롭버튼으로<span className="font-semibold text-[#5B7F7C]"> 요약 방식</span>을 선택할 수 있습니다. 다양한 방식으로 제공되는 필기를 확인해보세요.</p>

            <span className="text-[1.1rem] font-medium">{noteTypeGuide.icon} {noteTypeGuide.label}</span>
            <br />
            {noteTypeGuide.lines}
            <br />
          </div>
        ) : (
          <div className="manual-content">
            <span className="text-[1.4rem] font-semibold">
              {variant.guideTitle}
            </span>
            <br />
            {/* 파일 업로드 */}
            <br />
            <span className="text-[1.2rem] font-semibold"><RiQuillPenAiFill className="text-xl mb-1 inline mr-1 text-[#80cbc4]"/> 파일 업로드</span>
            {variant.originalUploadGuide}
            <br />
            <span className="text-[1.2rem] font-semibold"><RiQuillPenAiFill className="text-xl mb-1 inline mr-1 text-[#80cbc4]"/> 하이라이트 기능</span>
            <br />
            <p
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
              중요한 내용은 <span className="font-semibold text-[#5B7F7C]"> 하이라이트</span>로 표시됩니다. 오른쪽 상단의 색상 팔레트에서 색상을 바꿔보세요.
              <br />
              <br />
              문장 위에 마우스를 올리면 해당 내용이 <span className="font-semibold text-[#5B7F7C]"> 중요한 이유</span>를 확인할 수 있습니다.
              <span className="reason-tooltip">중요한 이유 확인</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConvertSummarySection;
