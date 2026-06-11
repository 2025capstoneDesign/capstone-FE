//src/components/Convert/UploadConvert/LoadingSection.js

import React from "react";
import { useLoading } from "../../../context/LoadingContext";
import { useNavigate } from "react-router-dom";
import {
  TbCheck,
  TbFileAnalytics,
  TbMicrophone,
  TbRoute,
  TbSparkles,
  TbWriting,
} from "react-icons/tb";

const phaseLabels = [
  "자료 분석",
  "슬라이드 매핑",
  "필기 생성",
  "결과 저장",
];

const taskIcons = {
  speech: TbMicrophone,
  slides: TbFileAnalytics,
  mapping: TbRoute,
  summary: TbWriting,
  save: TbSparkles,
};

function LoadingSection() {
  const { progress, currentStage, statusMessage, taskDetails } = useLoading();
  const navigate = useNavigate();

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
      <div className="w-full px-4 py-10">
        {/* 진행 바 컨테이너 */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full mb-8 overflow-hidden">
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
          <div className="absolute top-0 left-[95%] w-0.5 h-3 bg-white/80 rounded"></div>
        </div>

        {/* 서버에서 전달된 상태 메시지 */}
        {statusMessage && (
          <div className="text-center text-[#5B7F7C] font-medium mb-8 min-h-6">
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          {phaseLabels.map((label, index) => (
            <div
              key={label}
              className={`h-10 flex items-center justify-center rounded-md text-sm font-semibold border ${
                currentStage === index
                  ? "border-[#5B7F7C] text-[#2F5F5B] bg-[#EEF7F5]"
                  : "border-gray-200 text-gray-400 bg-white"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {taskDetails.map((task) => {
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
