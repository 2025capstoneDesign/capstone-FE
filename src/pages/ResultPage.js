import { useLocation, useNavigate } from "react-router-dom";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { file, record } = location.state || { file: null, record: null };

  return (
    <div className="container">
      <h1>업로드한 파일</h1>

      {/* 강의록 파일 미리보기 */}
      <p><strong>강의록 파일:</strong> {file ? file.name : "파일 없음"}</p>
      {file instanceof File && file.type === "application/pdf" && (
        <iframe src={URL.createObjectURL(file)} width="100%" height="500px"></iframe>
      )}

      {/* 음성 파일 미리보기 */}
      <p><strong>음성 파일:</strong> {record ? record.name : "파일 없음"}</p>
      {record instanceof File && record.type === "audio/mpeg" && (
        <audio controls>
          <source src={URL.createObjectURL(record)} type="audio/mpeg" />
          브라우저가 오디오 태그를 지원하지 않습니다.
        </audio>
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>뒤로 가기</button>
    </div>
  );
}
