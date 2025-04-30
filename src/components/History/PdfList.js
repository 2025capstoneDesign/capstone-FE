import pdf_icon from "../../assets/images/pdf.png";

export default function PdfList({
  sortedHistory,
  sortOrder,
  setSortOrder,
  handleViewPdf,
  handleDownload,
}) {
  return (
    <div className="slide-container">
      <div className="slide-header">
        <div className="sort-options">
          <button
            className={`sort-btn ${sortOrder === "date" ? "active" : ""}`}
            onClick={() => setSortOrder("date")}
          >
            날짜순
          </button>
          <button
            className={`sort-btn ${sortOrder === "title" ? "active" : ""}`}
            onClick={() => setSortOrder("title")}
          >
            제목순
          </button>
        </div>
      </div>

      <div className="p-5">
        {sortedHistory.map((pdf) => (
          <div
            key={pdf.id}
            className="flex items-center p-4 rounded-lg bg-white border border-gray-200 shadow-sm mb-3 transition-all hover:shadow-md"
          >
            <img src={pdf_icon} alt="PDF 아이콘" className="w-10 h-10 mr-4" />
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium text-gray-800">
                {pdf.title}
              </div>
              <div className="text-sm text-gray-500">
                변환일: {pdf.date} | 크기: {pdf.size}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="view-btn" onClick={() => handleViewPdf(pdf)}>
                열람하기
              </button>
              <button
                className="download-btn"
                onClick={() => handleDownload(pdf)}
              >
                다운로드
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
