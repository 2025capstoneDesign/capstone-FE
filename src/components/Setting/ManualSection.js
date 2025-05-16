import React from "react";
import ReactMarkdown from "react-markdown";

function ManualSection() {
  return (
    <div className="summary-container">
      <div className="tab-container content-tabs">
        <h2 className="manual-title" style={{ fontSize: "1.2rem" }}>
          설정 사용설명서
        </h2>
      </div>

      <div className="content-container">
        <div className="manual-content">
          <ReactMarkdown>
            {`
## 사용자 설정 사용설명서

#### 주요 기능

##### 1. 기본 키워드 설정
- 자주 검색하는 키워드를 미리 설정해두면 매번 입력하지 않아도 됩니다.
- 설정된 키워드는 변환 시 자동으로 적용됩니다.

##### 2. 기본 필기 방식 설정
- 원하는 필기 방식을 기본값으로 설정할 수 있습니다.
- 선택할 수 있는 필기 방식:
  - 서술형 필기: 전체 내용을 간단하고 명확하게 요약한 내용을 줄글 형식으로 제공합니다.
  - 개조식 필기: 핵심 내용을 포인트 형태의 독립적인 문장 형식으로 제공합니다.
  - 키워드 필기: 개념 중심으로 핵심 용어와 정의를 제공합니다.

##### 3. 설정 저장
- '설정 저장' 버튼을 클릭하여 변경사항을 저장합니다.
- 저장된 설정은 다음 변환 시 자동으로 적용됩니다.
            `}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default ManualSection;