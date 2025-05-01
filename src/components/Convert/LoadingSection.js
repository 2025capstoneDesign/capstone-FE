//src/components/Convert/LoadingSection.js

import React from "react";
import { useLoading } from "../../context/LoadingContext";
import { useNavigate } from "react-router-dom";

function LoadingSection() {
  const { progress, currentStage } = useLoading();
  const navigate = useNavigate();

  // Stage labels
  const stageLabels = ["강의 듣는 중...", "요약 정리 중...", "필기 생성 중..."];

  // Calculate which segments are active
  const isStage1Active = progress > 0;
  const isStage2Active = progress >= 30;
  const isStage3Active = progress >= 60;

  return (
    <div className="flex-1 p-[5%] flex flex-col">
      <h2 className="text-[1.4rem] font-semibold my-[3vh] text-center">
        변환 중입니다. 잠시만 기다려주세요.
      </h2>

      {/* Progress container */}
      <div className="w-full px-4 py-10">
        {/* Progress bar container */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-8">
          {/* Actual progress bar */}
          <div
            className="absolute top-0 left-0 h-2 bg-[#5B7F7C] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>

          {/* Progress percentage */}
          <div className="absolute top-5 right-0 text-[#5B7F7C] font-semibold">
            {Math.round(progress)}%
          </div>

          {/* Stage dividers */}
          <div className="absolute top-0 left-[30%] w-0.5 h-2 bg-gray-400 rounded"></div>
          <div className="absolute top-0 left-[60%] w-0.5 h-2 bg-gray-400 rounded"></div>
        </div>

        {/* Stages */}
        <div className="flex justify-between mt-12">
          {/* Stage 1 */}
          <div className="flex flex-col items-center w-1/3 px-2">
            <div
              className={`mb-4 text-center font-semibold ${
                currentStage === 0 ? "text-[#5B7F7C]" : "text-gray-300"
              }`}
            >
              {stageLabels[0]}
            </div>
            <div className="w-full flex justify-center">
              <img
                src="/loading_listen.gif"
                alt="강의 듣는 중"
                className={`w-24 h-24 ${
                  isStage1Active ? "opacity-100" : "opacity-30"
                }`}
              />
            </div>
          </div>

          {/* Stage 2 */}
          <div className="flex flex-col items-center w-1/3 px-2">
            <div
              className={`mb-4 text-center font-semibold ${
                currentStage === 1 ? "text-[#5B7F7C]" : "text-gray-300"
              }`}
            >
              {stageLabels[1]}
            </div>
            <div className="w-full flex justify-center">
              <img
                src="/loading_analyze.png"
                alt="요약 정리 중"
                className={`w-24 h-24 ${
                  isStage2Active ? "opacity-100" : "opacity-30"
                }`}
              />
            </div>
          </div>

          {/* Stage 3 */}
          <div className="flex flex-col items-center w-1/3 px-2">
            <div
              className={`mb-4 text-center font-semibold ${
                currentStage === 2 ? "text-[#5B7F7C]" : "text-gray-300"
              }`}
            >
              {stageLabels[2]}
            </div>
            <div className="w-full flex justify-center">
              <img
                src="/loading_write.png"
                alt="필기 생성 중"
                className={`w-24 h-24 ${
                  isStage3Active ? "opacity-100" : "opacity-30"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instruction text */}
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
