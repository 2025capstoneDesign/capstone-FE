import React from "react";

export default function ImageGridPanel({ imageUrls, selectedImageIndex, onImageClick }) {
  const API_URL = process.env.REACT_APP_API_URL;

  return (
    <div className="slide-container">
      <div className="slide-header">
        <h3 style={{ margin: 0, color: "#333", fontSize: "16px", fontWeight: "600" }}>
          생성된 슬라이드 이미지 ({imageUrls.length}개)
        </h3>
      </div>
      <div style={{
        flex: 1,
        padding: "20px",
        overflow: "auto",
        backgroundColor: "#f8f9fa"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
          padding: "10px"
        }}>
          {imageUrls.map((imageUrl, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: selectedImageIndex === index ? "3px solid #5CBFBC" : "2px solid transparent",
                boxShadow: selectedImageIndex === index 
                  ? "0 8px 25px rgba(92, 191, 188, 0.3)" 
                  : "0 4px 12px rgba(0, 0, 0, 0.1)",
                transform: selectedImageIndex === index ? "scale(1.02)" : "scale(1)",
                opacity: selectedImageIndex === index ? 1 : 0.8,
                backgroundColor: "#fff"
              }}
              onClick={() => onImageClick(index)}
              onMouseEnter={(e) => {
                if (selectedImageIndex !== index) {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedImageIndex !== index) {
                  e.target.style.transform = "scale(1)";
                  e.target.style.opacity = "0.8";
                }
              }}
            >
              <img
                src={`${API_URL}${imageUrl}`}
                alt={`슬라이드 ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block"
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              {/* 이미지 로드 실패시 대체 컨텐츠 */}
              <div
                style={{
                  display: "none",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f5f5",
                  color: "#666",
                  fontSize: "14px",
                  textAlign: "center"
                }}
              >
                이미지를 불러올 수 없습니다
              </div>
              {/* 슬라이드 번호 오버레이 */}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                {index + 1}
              </div>
              {/* 선택 상태 표시 */}
              {selectedImageIndex === index && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    width: "24px",
                    height: "24px",
                    backgroundColor: "#5CBFBC",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <span style={{ color: "white", fontSize: "14px", fontWeight: "bold" }}>✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {imageUrls.length === 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#666",
            fontSize: "16px",
            fontStyle: "italic"
          }}>
            생성된 이미지가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}