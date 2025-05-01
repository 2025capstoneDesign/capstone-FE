import ReactMarkdown from "react-markdown";

export default function Manual() {
  return (
    <div className="summary-container">
      <div className="tab-container content-tabs">
        <h2 className="manual-title" style={{ fontSize: "1.2rem" }}>
          사용설명서
        </h2>
      </div>

      <div className="content-container">
        <div className="manual-content">
          <ReactMarkdown>
            {`
## PDF 변환 기록 사용설명서

#### 주요 기능

##### 1. PDF 열람하기
- '열람하기' 버튼을 클릭하여 변환된 PDF를 열람할 수 있습니다.
- 열람 시 AI 필기와 음성 원본을 함께 확인할 수 있습니다.

##### 2. PDF 다운로드
- '다운로드' 버튼을 클릭하여 변환된 PDF를 다운로드할 수 있습니다.

##### 3. 정렬 기능
- 상단의 정렬 버튼을 통해 PDF 목록을 날짜순 또는 제목순으로 정렬할 수 있습니다.
  - 날짜순: 최신 변환 파일이 상단에 표시됩니다.
  - 제목순: 파일명의 알파벳 순서대로 정렬됩니다.

##### 4. 새로 변환하기
- 상단의 '새로 변환하기' 버튼을 클릭하여 새로운 PDF를 변환할 수 있습니다.
            `}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
