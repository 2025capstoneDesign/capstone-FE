import React from "react";

/**
 * 전체 화면 로딩 모달 (공통)
 * 기존 7개 파일에 복붙되어 있던 동일 JSX를 추출한 컴포넌트.
 * DOM 구조와 클래스는 기존과 100% 동일하게 유지.
 */
function LoadingModal({ message, alt = "로딩 중" }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg flex flex-col items-center">
        <img
          src="/loading_listen.gif"
          alt={alt}
          className="w-[200px] h-[200px] object-contain mb-4"
        />
        <p className="text-gray-700 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}

export default LoadingModal;
