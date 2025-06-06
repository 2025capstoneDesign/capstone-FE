import React from "react";

const SUCCESS_MESSAGE = "실시간 변환 완료!";

export default function DescriptionPanel({
  selectedImageIndices,
  onCompleteSelection,
}) {
  return (
    <div className="content-container">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          height: "100%",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        {/* 성공 아이콘 */}
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#5CBFBC",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            boxShadow: "0 4px 16px rgba(92, 191, 188, 0.3)",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "36px",
              fontWeight: "bold",
            }}
          >
            ✓
          </span>
        </div>

        {/* 성공 메시지 */}
        <h2
          style={{
            color: "#333",
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "16px",
            lineHeight: "1.4",
          }}
        >
          {SUCCESS_MESSAGE}
        </h2>

        {/* 결과 정보 - 선택된 슬라이드 표시 */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "300px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#666", fontSize: "14px" }}>
              선택된 슬라이드
            </span>
            <span
              style={{
                color: selectedImageIndices.length > 0 ? "#5CBFBC" : "#999",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {selectedImageIndices.length > 0
                ? `${selectedImageIndices
                    .sort((a, b) => a - b)
                    .map((i) => i + 1)
                    .join(", ")}번`
                : "없음"}
            </span>
          </div>
        </div>

        {/* 설명 텍스트 */}
        <p
          style={{
            color: "#666",
            fontSize: "16px",
            lineHeight: "1.6",
            marginBottom: "20px",
          }}
        >
          졸았던 슬라이드를 필기요정에 맡겨보세요!
        </p>

        {/* 저장 버튼 */}
        <button
          onClick={onCompleteSelection}
          style={{
            backgroundColor: "#5CBFBC",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "16px 32px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "16px",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 16px rgba(92, 191, 188, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#4a9c99";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#5CBFBC";
            e.target.style.transform = "translateY(0)";
          }}
        >
          저장하기
        </button>

        {/* 설명 박스 */}
        <div
          style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #93c5fd",
            borderRadius: "8px",
            padding: "16px",
            width: "100%",
            maxWidth: "300px",
            marginTop: "16px",
          }}
        >
          <p
            style={{
              color: "#1e40af",
              fontSize: "14px",
              margin: 0,
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            필기요정이 음성을 재배치해줍니다!
          </p>
        </div>
      </div>
    </div>
  );
}
