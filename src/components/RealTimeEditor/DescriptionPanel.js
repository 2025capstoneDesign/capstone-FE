import React from "react";

const SUCCESS_MESSAGE = "실시간 변환이 성공적으로 완료되었습니다!";

export default function DescriptionPanel({
  selectedImageIndices,
  totalImages,
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

          {/* 결과 정보 */}
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
                marginBottom: "12px",
              }}
            >
              <span style={{ color: "#666", fontSize: "14px" }}>
                생성된 슬라이드
              </span>
              <span
                style={{ color: "#333", fontSize: "16px", fontWeight: "600" }}
              >
                {totalImages}개
              </span>
            </div>
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
                  color: "#5CBFBC",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {selectedImageIndices.length > 0
                  ? `${selectedImageIndices.length}개`
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
            왼쪽에서 생성된 슬라이드 이미지들을 확인하고 클릭하여 선택할 수
            있습니다. 여러 슬라이드를 중복 선택할 수 있습니다.
          </p>

          {/* 선택 완료 버튼 */}
          {selectedImageIndices.length > 0 && (
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
              선택 완료
            </button>
          )}

          {/* 추가 안내 */}
          {selectedImageIndices.length > 0 && (
            <div
              style={{
                backgroundColor: "#e3f2fd",
                border: "1px solid #90caf9",
                borderRadius: "8px",
                padding: "16px",
                width: "100%",
                maxWidth: "300px",
              }}
            >
              <p
                style={{
                  color: "#1976d2",
                  fontSize: "14px",
                  margin: 0,
                  fontWeight: "500",
                }}
              >
                {selectedImageIndices.length === 1
                  ? `${selectedImageIndices
                      .map((i) => i + 1)
                      .join(", ")}번 슬라이드가 선택되었습니다.`
                  : `${selectedImageIndices
                      .map((i) => i + 1)
                      .join(", ")}번 슬라이드들이 선택되었습니다.`}
              </p>
            </div>
          )}

          {selectedImageIndices.length === 0 && totalImages > 0 && (
            <div
              style={{
                backgroundColor: "#fff3e0",
                border: "1px solid #ffb74d",
                borderRadius: "8px",
                padding: "16px",
                width: "100%",
                maxWidth: "300px",
              }}
            >
              <p
                style={{
                  color: "#f57c00",
                  fontSize: "14px",
                  margin: 0,
                  fontWeight: "500",
                }}
              >
                졸았던 슬라이드를 골라보세요!
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
