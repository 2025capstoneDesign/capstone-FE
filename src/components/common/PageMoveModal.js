import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../../css/PageMoveModal.css';

export default function PageMoveModal({ isOpen, onClose, onConfirm, maxPage, selectedText }) {
  const [pageNum, setPageNum] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(pageNum);
    if (num >= 0 && num <= maxPage) {
      onConfirm(num, selectedText);
      onClose();
    } else {
      toast.error(`1부터 ${maxPage} 사이의 페이지 번호를 입력해주세요.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="page-move-modal-overlay">
      <div className="page-move-modal-content">
        <div className="page-move-modal-header">
          {/* <h3>페이지 이동</h3> */}
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="page-move-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="pageNumber">이동할 페이지 번호</label>
              <input
                id="pageNumber"
                type="number"
                min="1"
                max={maxPage}
                value={pageNum}
                onChange={(e) => setPageNum(e.target.value)}
                placeholder="페이지 번호 입력"
                autoFocus
              />
            </div>
            <div className="modal-buttons">
              <button type="submit" className="confirm-button">확인</button>
              <button type="button" className="cancel-button" onClick={onClose}>
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 