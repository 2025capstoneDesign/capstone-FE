import { Document, Page } from "react-pdf";
import { toast } from "react-toastify";

export default function PdfViewer({
  pdfUrl,
  pageNumber,
  numPages,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  goPrevPage,
  goNextPage,
}) {
  return (
    <div className="slide-container">
      <div className="slide-header">
        <div
          className="audio-icon"
          onClick={() =>
            toast.info("음성 기능이 활성화 되었습니다.", {
              position: "top-center",
              autoClose: 1500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            })
          }
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z"
              stroke="#5CBFBC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.35 9.65V11.35C4.35 15.57 7.78 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.65"
              stroke="#5CBFBC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.61 6.56C11.519 6.19051 12.5098 6.1885 13.42 6.56C14.18 6.87 14.794 7.44448 15.13 8.17C15.2577 8.45726 15.3312 8.76303 15.348 9.074C15.3648 9.38498 15.3244 9.6964 15.229 9.994C15.1335 10.2916 14.9846 10.5696 14.7891 10.8143C14.5937 11.059 14.3549 11.2667 14.085 11.426C13.816 11.5844 13.5194 11.692 13.212 11.743C12.9046 11.794 12.5917 11.7878 12.287 11.725"
              stroke="#5CBFBC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 19V22"
              stroke="#5CBFBC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="pdf-viewer">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          className="pdf-document"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={window.innerWidth * 0.5}
          />
        </Document>

        <div className="nav-area left" onClick={goPrevPage}>
          <div className="nav-arrow-icon">&#10094;</div>
        </div>
        <div className="nav-area right" onClick={goNextPage}>
          <div className="nav-arrow-icon">&#10095;</div>
        </div>

        <div className="page-info">
          {pageNumber} / {numPages}
        </div>
      </div>
    </div>
  );
}
