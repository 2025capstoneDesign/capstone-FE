//src/components/Convert/UploadConvert/LoadingSection.js

import React from "react";
import { useLoading } from "../../../context/LoadingContext";
import { useNavigate } from "react-router-dom";
import {
  TbCheck,
  TbFileAnalytics,
  TbMicrophone,
  TbRoute,
  TbWriting,
} from "react-icons/tb";

const phaseSteps = [
  {
    key: "analysis",
    phase: "자료분석",
    label: "강의 듣는 중...",
    image: "/loading_listen.gif",
    alt: "강의 듣는 중",
  },
  {
    key: "mapping",
    phase: "매핑",
    label: "슬라이드 맞추는 중...",
    image: "/loading_analyze.png",
    alt: "슬라이드 맞추는 중",
  },
  {
    key: "summary",
    phase: "요약",
    label: "필기 생성 중...",
    image: "/loading_write.png",
    alt: "필기 생성 중",
  },
];

const taskIcons = {
  speech: TbMicrophone,
  slides: TbFileAnalytics,
  mapping: TbRoute,
  summary: TbWriting,
};

const taskDisplay = {
  speech: {
    label: "강의 듣는 중...",
    fallbackMessage: "강의 내용을 분석하고 있어요",
  },
  slides: {
    label: "자료 읽는 중...",
    fallbackMessage: "슬라이드를 살펴보고 있어요",
  },
  mapping: {
    label: "슬라이드 맞추는 중...",
    fallbackMessage: "강의 흐름과 슬라이드를 맞추고 있어요",
  },
  summary: {
    label: "필기 생성 중...",
    fallbackMessage: "필기 내용을 정리하고 있어요",
  },
};

const visibleTasksByStage = [
  ["speech", "slides"],
  ["mapping"],
  ["summary"],
];

const getVisibleTasks = (taskDetails, currentStage) => {
  const tasksByKey = taskDetails.reduce((acc, task) => {
    acc[task.key] = task;
    return acc;
  }, {});

  const visibleKeys =
    visibleTasksByStage[currentStage] || visibleTasksByStage[2];

  return visibleKeys.map((key) => ({
    key,
    ...tasksByKey[key],
    ...taskDisplay[key],
  }));
};

function LoadingSection() {
  const { progress, currentStage, statusMessage, taskDetails } = useLoading();
  const navigate = useNavigate();
  const visibleTasks = getVisibleTasks(taskDetails, currentStage);
  const displayStatusMessage =
    statusMessage && statusMessage.includes("저장")
      ? "마무리 중입니다..."
      : statusMessage;

  const getTaskTone = (task) => {
    if (task.status === "completed") {
      return "border-[#5B7F7C]/30 bg-[#5B7F7C]/5 text-[#2F5F5B]";
    }
    if (task.status === "processing") {
      return "border-[#D9A441]/40 bg-[#FFF8E7] text-[#7A5B12]";
    }
    return "border-gray-200 bg-white text-gray-500";
  };

  return (
    <div className="flex-1 p-[5%] flex flex-col">
      <h2 className="text-[1.4rem] font-semibold my-[3vh] text-center">
        변환 중입니다. 잠시만 기다려주세요.
      </h2>

      {/* 진행 상태 컨테이너 */}
      <div className="w-full px-4 py-8">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {phaseSteps.map((step, index) => {
            const isActive = currentStage === index;
            const isDone = currentStage > index;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`text-xs font-semibold mb-2 ${
                    isActive || isDone ? "text-[#2F5F5B]" : "text-gray-400"
                  }`}
                >
                  {step.phase}
                </div>
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-[#EEF7F5] ring-2 ring-[#5B7F7C]/30"
                      : isDone
                      ? "bg-[#5B7F7C]/5"
                      : "bg-gray-50"
                  }`}
                >
                  <img
                    src={step.image}
                    alt={step.alt}
                    className={`w-16 h-16 sm:w-20 sm:h-20 object-contain transition-opacity duration-300 ${
                      isActive || isDone ? "opacity-100" : "opacity-30"
                    }`}
                  />
                </div>
                <div
                  className={`mt-3 h-10 flex items-center text-center text-sm font-semibold leading-snug ${
                    isActive ? "text-[#2F5F5B]" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* 진행 바 컨테이너 */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full mb-7 overflow-hidden">
          {/* 실제 진행 바 */}
          <div
            className="absolute top-0 left-0 h-3 bg-[#5B7F7C] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>

          {/* 진행 바 퍼센트 */}
          <div className="absolute top-6 right-0 text-[#5B7F7C] font-semibold">
            {Math.round(progress)}%
          </div>

          {/* 단계 구분선 */}
          <div className="absolute top-0 left-[60%] w-0.5 h-3 bg-white/80 rounded"></div>
          <div className="absolute top-0 left-[75%] w-0.5 h-3 bg-white/80 rounded"></div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8">
          {phaseSteps.map((step, index) => (
            <div
              key={step.key}
              className={`h-10 flex items-center justify-center rounded-md text-sm font-semibold border ${
                currentStage === index
                  ? "border-[#5B7F7C] text-[#2F5F5B] bg-[#EEF7F5]"
                  : currentStage > index
                  ? "border-[#5B7F7C]/20 text-[#2F5F5B] bg-white"
                  : "border-gray-200 text-gray-400 bg-white"
              }`}
            >
              {step.phase}
            </div>
          ))}
        </div>

        {/* 서버에서 전달된 상태 메시지 */}
        {displayStatusMessage && (
          <div className="text-center text-[#5B7F7C] font-medium mb-8 min-h-6">
            {displayStatusMessage}
          </div>
        )}

        <div
          className={`grid grid-cols-1 gap-3 ${
            currentStage === 0 ? "lg:grid-cols-2" : ""
          }`}
        >
          {visibleTasks.map((task) => {
            const Icon = taskIcons[task.key] || TbFileAnalytics;
            const isDone = task.status === "completed";

            return (
              <div
                key={task.key}
                className={`border rounded-lg px-4 py-3 transition-colors ${getTaskTone(
                  task
                )}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-current/20 flex items-center justify-center shrink-0">
                    {isDone ? (
                      <TbCheck className="text-xl" />
                    ) : (
                      <Icon className="text-xl" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold truncate">
                        {task.label}
                      </span>
                      <span className="text-sm font-semibold shrink-0">
                        {Math.round(task.progress || 0)}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-current rounded-full transition-all duration-500"
                        style={{ width: `${task.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-current/75 min-h-4 truncate">
                      {task.message ||
                        task.fallbackMessage ||
                        (task.status === "pending"
                          ? "대기 중"
                          : "처리 중")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-gray-500 mt-4">
        변환이 완료되면 자동으로 결과 화면으로 이동합니다.
        <br />
        <span className="font-semibold">
          변환 기록 버튼을 눌러 이전 파일을 확인할 수 있습니다.
        </span>
      </p>

      <div className="flex justify-center mt-4">
        <button
          className="bg-[#5B7F7C] text-white font-semibold py-2 px-4 rounded-lg my-5"
          onClick={() => navigate("/history")}
        >
          변환 기록 보기
        </button>
      </div>
    </div>
  );
}

export default LoadingSection;
