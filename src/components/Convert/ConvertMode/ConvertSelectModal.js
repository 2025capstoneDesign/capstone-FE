import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const ConvertSelectModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const handleUploadConvert = () => {
    if (isAuthenticated()) {
      navigate("/upload-convert");
      onClose();
    } else {
      navigate("/login", { state: { redirectTo: "/upload-convert" } });
      onClose();
    }
  };

  const handleRealTimeConvert = () => {
    if (isAuthenticated()) {
      navigate("/realtime-convert");
      onClose();
    } else {
      navigate("/login", { state: { redirectTo: "/realtime-convert" } });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">변환 방식 선택</h2>
        <div className="space-y-4">
          <button
            onClick={handleUploadConvert}
            className="w-full py-3 px-4 bg-[#5B7F7C] text-white rounded-lg hover:bg-[#455E5C] transition-colors"
          >
            파일 업로드 변환
          </button>
          <button
            onClick={handleRealTimeConvert}
            className="w-full py-3 px-4 bg-[#5B7F7C] text-white rounded-lg hover:bg-[#455E5C] transition-colors"
          >
            실시간 변환
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default ConvertSelectModal;
