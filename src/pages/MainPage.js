import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainPage.css"; // CSS 파일
import Header, { AccountButton } from "../components/common/Header/Header.js";

import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
export default function MainPage() {
  const [file, setFile] = useState(null);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // 허용된 파일 확장자
  const allowedDocumentTypes = [".pdf", ".ppt", ".pptx", ".doc", ".docx"];
  const allowedAudioTypes = [".mp3"];

  // 파일 업로드 & 유효성 검사
  const handleFileUpload = (event, setFileState, isAudio = false) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    const fileExtension =
      "." + uploadedFile.name.split(".").pop().toLowerCase();
    const allowedTypes = isAudio ? allowedAudioTypes : allowedDocumentTypes;

    if (!allowedTypes.includes(fileExtension)) {
      setError(
        `지원하지 않는 파일 형식입니다. ${
          isAudio ? "음성" : "문서"
        } 파일은 ${allowedTypes.join(", ")} 형식만 가능합니다.`
      );
      event.target.value = ""; // 파일 입력 초기화
      setFileState(null);
      // 3초 후 에러 메시지 제거
      setTimeout(() => setError(""), 3000);
      return;
    }

    setError("");
    setFileState(uploadedFile);
  };

  const handleConvert = () => {
    const pdfToUse = file;
    navigate("/test", {
      state: { pdfFile: pdfToUse },
    });
  };

  return (
    <div className="container">
      <Header
        title="필기보조 AI"
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        rightContent={<AccountButton />}
      />

      {/* 사이드바 */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <ul>
          <li>메뉴 1</li>
          <li>메뉴 2</li>
          <li>메뉴 3</li>
        </ul>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        <div className="upload-section">
          <svg
            className="upload-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M7.685 3c1.364 0 2.633.582 3.533 1.573l.168.195.01-.008a4.7 4.7 0 0 1 
                      2.128-.797l.289-.025.263-.007c1.633 0 3.125.835 4.009 2.187l.054.088.103.012c2.552.35 
                      4.524 2.473 4.739 5.082l.014.238.005.234c0 3.02-2.346 5.484-5.284 5.6l-.216.004h-4.417V22H12v-4.624H6.315c-2.514 
                      0-4.577-1.963-4.796-4.465l-.014-.223-.005-.218c0-1.315.511-2.548 1.4-3.458l.078-.077-.03-.144a5 5 0 0 
                      1-.054-.39l-.016-.197-.008-.298C2.87 5.197 5.025 3 7.685 3m0 1.081c-2.06 0-3.732 1.71-3.732 3.825q0 
                      .351.061.694l.047.226.114.472-.357.33a3.85 3.85 0 0 0-1.235 2.842c0 2.048 1.57 3.717 3.54 3.82l.192.005H12v-5.508l-2.52 
                      2.5-.795-.787 3.857-3.821 3.856 3.821-.794.787-2.521-2.499v5.506H17.5c2.367 0 4.303-1.908 4.412-4.31l.005-.212c0-2.265-1.635-4.167-3.794-4.478l-.21-.025-.424-.04-.216-.366a3.71 
                      3.71 0 0 0-3.197-1.85 3.65 3.65 0 0 0-2.034.616l-.197.142-.676.517-.504-.684a3.7 3.7 0 0 0-2.98-1.523"
            ></path>
          </svg>

          {/* 에러 메시지 표시 */}
          {error && (
            <div
              className="error-message"
              style={{ color: "red", marginBottom: "10px" }}
            >
              {error}
            </div>
          )}

          {/* 강의록 업로드 */}
          <div className="file-upload">
            <label className="upload-btn">
              강의록 파일 선택
              <input
                type="file"
                className="hidden"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={(e) => handleFileUpload(e, setFile, false)}
              />
              <svg
                className="upload-btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="m17 9 1 1-6 6-6-6 1-1 5 5.17z"></path>
              </svg>
            </label>
            <div className="file-name">
              {file ? file.name : "선택된 파일 없음"}
            </div>
          </div>

          {/* 음성 업로드 */}
          <div className="file-upload">
            <label className="upload-btn">
              음성 파일 선택
              <input
                type="file"
                className="hidden"
                accept=".mp3"
                onChange={(e) => handleFileUpload(e, setRecord, true)}
              />
              <svg
                className="upload-btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="m17 9 1 1-6 6-6-6 1-1 5 5.17z"></path>
              </svg>
            </label>
            <div className="file-name">
              {record ? record.name : "선택된 파일 없음"}
            </div>
          </div>

          {/* 지원 파일 형식 */}
          <div className="file-types">
            <p>
              <strong>강의록, 음성</strong> 파일을 추가해주세요
            </p>
            <ul>
              <p>지원하는 형식 : </p>
              <li>PDF</li>
              <li>PPT</li>
              <li>DOC</li>
              <li>MP3</li>
            </ul>
          </div>
        </div>

        {/* 변환 버튼 */}
        <button className="convert-btn" onClick={handleConvert}>
          변환
        </button>
      </main>
    </div>
  );
}
