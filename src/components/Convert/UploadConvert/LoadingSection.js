//src/components/Convert/UploadConvert/LoadingSection.js

import React from "react";
import { useLoading } from "../../../context/LoadingContext";
import { useNavigate } from "react-router-dom";

function LoadingSection() {
  const { progress, currentStage, statusMessage } = useLoading();
  const navigate = useNavigate();

  // 각 단계의 라벨
  const stageLabels = ["강의 듣는 중...", "요약 정리 중...", "필기 생성 중..."];

  // 각 단계의 활성화 여부
  const isStage1Active = progress > 0;
  const isStage2Active = progress >= 30;
  const isStage3Active = progress >= 60;

  return (
    <div className="flex-1 p-[5%] flex flex-col">
      <h2 className="text-[1.4rem] font-semibold my-[3vh] text-center">
        변환 중입니다. 잠시만 기다려주세요.
      </h2>

      {/* 진행 상태 컨테이너 */}
      <div className="w-full px-4 py-10">
        {/* 진행 바 컨테이너 */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-8">
          {/* 실제 진행 바 */}
          <div
            className="absolute top-0 left-0 h-2 bg-[#5B7F7C] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>

          {/* 진행 바 퍼센트 */}
          <div className="absolute top-5 right-0 text-[#5B7F7C] font-semibold">
            {Math.round(progress)}%
          </div>

          {/* 단계 구분선 */}
          <div className="absolute top-0 left-[30%] w-0.5 h-2 bg-gray-400 rounded"></div>
          <div className="absolute top-0 left-[60%] w-0.5 h-2 bg-gray-400 rounded"></div>
        </div>

        {/* 서버에서 전달된 상태 메시지 */}
        {statusMessage && (
          <div className="text-center text-[#5B7F7C] font-medium mb-6">
            {statusMessage}
          </div>
        )}

        {/* 단계 컨테이너 */}
        <div className="flex justify-between mt-8">
          {/* 단계 1 */}
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

          {/* 단계 2 */}
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

          {/* 단계 3 */}
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