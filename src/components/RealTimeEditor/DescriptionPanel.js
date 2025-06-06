import React from "react";

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
        {/* 메인 아이콘 */}
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

        {/* 메인 메시지 */}
        <h2
          style={{
            color: "#333",
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "8px",
            lineHeight: "1.4",
          }}
        >
          슬라이드 선택
        </h2>

        <p
          style={{
            color: "#666",
            fontSize: "16px",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          수업을 놓쳤던 슬라이드를 선택해주세요
        </p>

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

        {/* 추가 안내 */}
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "12px",
            padding: "16px",
            width: "100%",
            maxWidth: "350px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              color: "#856404",
              fontSize: "14px",
              margin: 0,
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            💡 수업을 놓친 슬라이드가 있나요?
            <br />
            필기요정이 도와드릴게요!
          </p>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={onCompleteSelection}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "16px",
            padding: "18px 40px",
            fontSize: "18px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "40px",
            marginTop: "10px",
            transition: "all 0.3s ease",
            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.3)";
          }}
        >
          필기 요정에게 맡기기 🧚‍♀️
        </button>
      </div>
    </div>
  );
}
