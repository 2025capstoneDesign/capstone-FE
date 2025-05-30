import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import fileupload from "../../../assets/images/file_upload.png"
import realtime from "../../../assets/images/realtime.png"

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
    <div className="relative bg-white rounded-lg p-8 w-[90%] max-w-2xl">
      {/* 오른쪽 상단 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        aria-label="닫기"
      >
        &times;
      </button>
  
      <h2 className="text-2xl font-bold mb-6 text-center">변환 방식 선택</h2>
      
      <div className="flex space-x-4">
        <button
          onClick={handleUploadConvert}
          className="bg-white w-1/2 py-3 px-4 border-2 border text-black rounded-lg hover:border-[#5B7F7C] transition-colors"
        >
          <img 
            src={fileupload} 
            alt="파일 업로드 이미지" 
            className="w-1/2 h-auto m-auto"
          />
          <h2 className="text-lg my-2 text-center font-semibold">파일 업로드 변환</h2>
        </button>
        <button
          onClick={handleRealTimeConvert}
          className="bg-white w-1/2 py-3 px-4 border-2 border text-black rounded-lg hover:border-[#5B7F7C] transition-colors"
        >
          <img 
            src={realtime} 
            alt="실시간 변환 이미지" 
            className="w-1/2 h-auto m-auto"
          />
          <h2 className="text-lg my-2 text-center font-semibold">실시간 변환</h2>
        </button>
      </div>
  
      {/* 아래 취소 버튼은 필요시 주석 해제 */}
      {/* 
      <button
        onClick={onClose}
        className="bg-[#5B7F7C] mt-4 w-full py-2 text-white hover:bg-[#455E5C]"
      >
        취소
      </button> 
      */}
    </div>
  </div>
  
  );
};

export default ConvertSelectModal;
