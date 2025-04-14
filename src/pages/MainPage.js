import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainPage.css"; // CSS 파일
import Header, { AccountButton } from "../components/common/Header/Header.js";
import axios from "axios";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function MainPage() {
  const [file, setFile] = useState(null);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // 허용된 파일 확장자
  const allowedDocumentTypes = [".pdf", ".ppt", ".pptx"];
  const allowedAudioTypes = [".mp3", ".m4a"];

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

  const handleConvert = async () => {
    if (!file) {
      setError("강의 교안 파일을 업로드해주세요.");
      // 4.5초 후 에러 메시지 제거
      setTimeout(() => setError(""), 4500);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/lecture/upload-lecture-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("업로드 성공:", response.data);
      navigate("/test", { state: { pdfFile: file } });
    } catch (error) {
      console.error("업로드 실패:", error);
      setError("파일 업로드에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => setError(""), 4500);
    } finally {
      setIsLoading(false);
    }
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
          <li className="sidebar-title">AI 필기보조</li>
          <li onClick={() => navigate("/")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="sidebar-icon"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
            홈
          </li>
          <li onClick={() => navigate("/history")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="sidebar-icon"
            >
              <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 00-3-3h-3.879a.75.75 0 01-.53-.22L11.47 3.66A2.25 2.25 0 009.879 3H6a3 3 0 00-3 3v3.162A3.756 3.756 0 014.094 9h15.812zM4.094 10.5a2.25 2.25 0 00-2.227 2.568l.857 6A2.25 2.25 0 004.951 21H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-2.227-2.568H4.094z" />
            </svg>
            이전 작업물
          </li>
          <li className="sidebar-title">계정</li>
          <li onClick={() => navigate("/login")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="sidebar-icon"
            >
              <path
                fillRule="evenodd"
                d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
            로그인
          </li>
          <li onClick={() => navigate("/signup")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="sidebar-icon"
            >
              <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.766.766 0 01-.752.743H3.996a.748.748 0 01-.74-.724l-.007-.119.001-.003z" />
            </svg>
            회원가입
          </li>
        </ul>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>파일을 업로드하는 중입니다...</p>
          </div>
        )}

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
              강의교안 파일 선택
              <input
                type="file"
                className="hidden"
                accept=".pdf,.ppt,.pptx"
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
                accept=".mp3,.m4a"
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
              <strong>강의교안, 음성</strong> 파일을 추가해주세요
            </p>
            <ul>
              <p>지원하는 형식 : </p>
              <li>PDF</li>
              <li>PPT</li>
              <li>MP3</li>
              <li>M4A</li>
            </ul>
          </div>
        </div>

        {/* 변환 버튼 */}
        <button
          className="convert-btn"
          onClick={handleConvert}
          disabled={isLoading}
        >
          {isLoading ? "변환 중..." : "변환"}
        </button>
      </main>
    </div>
  );
}
