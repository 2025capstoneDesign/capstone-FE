import React from 'react';
import { useNavigate } from 'react-router-dom';

const RealTimeConvert = () => {
  const navigate = useNavigate();

  return (
    <div className="app-wrapper convert-page">
      <div className="sub-header">
        <h2 className="page-title">실시간 변환</h2>
        <div className="action-buttons">
          <button className="convert-btn" onClick={() => navigate("/")}>
            홈으로
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="container mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p>실시간 변환 페이지</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeConvert; 