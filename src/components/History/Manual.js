import ReactMarkdown from "react-markdown";
import { PiDownloadSimpleBold } from "react-icons/pi";
import { MdDateRange } from "react-icons/md";
import { BsAlphabetUppercase } from "react-icons/bs";
import { RiQuillPenAiFill } from "react-icons/ri";

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
        <>
          <span className="text-[1.4rem] font-semibold">
          PDF 변환 기록 사용설명서
          </span>
          <br />
          {/* <span className="font-semibold">
            주요 기능
          </span> */}
          {/* 열람하기 */}
          <br />
            <span className="text-[1.2rem] font-semibold"><RiQuillPenAiFill className="text-xl mb-1 inline mr-1 text-[#80cbc4]"/> PDF 열람하기</span>
          <p class="text-gray-700 mt-1"><span class="text-sm px-2 py-1 text-black border-2 rounded-full">열람하기</span> 버튼을 클릭하여 변환된 PDF를 열람할 수 있습니다.</p>
          <p class="text-gray-700">열람 시 <span class="font-semibold text-[#5B7F7C]">AI 필기</span>와 <span class="font-semibold text-[#5B7F7C]">음성 원본</span>을 함께 확인할 수 있습니다.</p>
          <br />

          {/* 다운로드 */}
          <span className="text-[1.2rem] font-semibold"><RiQuillPenAiFill className="text-xl mb-1 inline mr-1 text-[#80cbc4]"/> PDF 다운로드</span>
          <p class="text-gray-700 mt-1"><PiDownloadSimpleBold className="text-xl mb-1 inline"/> 버튼을 클릭하여 변환된 PDF를 다운로드할 수 있습니다.</p>
          <br />

          {/* 정렬기능 */}
          <span className="text-[1.2rem] font-semibold"><RiQuillPenAiFill className="text-xl mb-1 inline mr-1 text-[#80cbc4]"/> 정렬 기능</span>
          <p class="text-gray-700 mt-1">상단의 정렬 버튼을 통해 PDF 목록을 <span class="font-semibold text-[#5B7F7C]">날짜순</span> 또는 <span class="font-semibold text-[#5B7F7C]">제목순</span>으로 정렬할 수 있습니다.</p>
          <ul class="list-disc list-inside text-gray-700 mt-2 space-y-1">
            <li><MdDateRange className="text-xl mb-1 inline mr-1"/><strong>날짜순:</strong> 최신 변환 파일이 상단에 표시됩니다.</li>
            <li><BsAlphabetUppercase className="text-xl mb-1 inline mr-1"/><strong>제목순:</strong> 파일명의 알파벳 순서대로 정렬됩니다.</li>
          </ul>
        </>
          {/* <ReactMarkdown>
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
          </ReactMarkdown> */}
        </div>
      </div>
    </div>
  );
}
