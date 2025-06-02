import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/TestPage.css";
import ImageGridPanel from "./ImageGridPanel";
import DescriptionPanel from "./DescriptionPanel";

export default function RealTimeEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedImageIndices, setSelectedImageIndices] = useState([]);

  // Get image URLs from navigation state
  const { imageUrls = [], jobId } = location.state || {};

  // Redirect to home if no image URLs
  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      navigate("/");
    }
  }, [imageUrls, navigate]);

  // Component mount시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleImageClick = (index) => {
    setSelectedImageIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleCompleteSelection = () => {
    navigate("/");
  };

  return (
    <div className="app-wrapper">
      <div className="sub-header">
        <h1 className="page-title">실시간 변환 결과</h1>
        <div className="action-buttons">
          <button className="convert-btn" onClick={() => navigate("/")}>
            홈으로
          </button>
        </div>
      </div>
      <div className="main-content">
        <ImageGridPanel
          imageUrls={imageUrls}
          selectedImageIndices={selectedImageIndices}
          onImageClick={handleImageClick}
        />
        <DescriptionPanel 
          selectedImageIndices={selectedImageIndices}
          totalImages={imageUrls.length}
          onCompleteSelection={handleCompleteSelection}
        />
      </div>
    </div>
  );
}