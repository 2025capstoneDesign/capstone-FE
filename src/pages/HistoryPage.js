import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header/Header";
import { pdfData } from "../data/pdfData";
import "../styles/HistoryPage.css";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // 검색 기능
  const filteredPdfs = pdfData.filter(
    (pdf) =>
      pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PDF 열기 (뷰어로 이동)
  const openPdf = (pdf) => {
    navigate("/test", {
      state: { pdfUrl: pdf.file, pdfTitle: pdf.title },
    });
  };

  return (
    <div className="container">
      <Header
        title="이전 작업물"
        showBackButton={true}
        showMenuButton={false}
      />

      <div className="history-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="제목 또는 설명으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`clear-search ${!searchTerm ? "hidden-button" : ""}`}
            onClick={() => setSearchTerm("")}
          >
            ✕
          </button>
        </div>

        <div className="pdf-list">
          {filteredPdfs.length > 0 ? (
            filteredPdfs.map((pdf) => (
              <div key={pdf.id} className="pdf-card">
                <div className="pdf-thumbnail">
                  <div className="pdf-icon">PDF</div>
                </div>
                <div className="pdf-info">
                  <h3>{pdf.title}</h3>
                  <p className="pdf-date">{pdf.date}</p>
                  <p className="pdf-description">{pdf.description}</p>
                  <p className="pdf-pages">{pdf.pages}페이지</p>
                </div>
                <div className="pdf-actions">
                  <button
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPdf(pdf);
                    }}
                  >
                    열람
                  </button>
                  <button
                    className="download-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(pdf.file, "_blank");
                    }}
                  >
                    다운로드
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
