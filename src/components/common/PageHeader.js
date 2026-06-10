import React from "react";

/**
 * 페이지 상단 헤더 (공통)
 * .sub-header / .page-title / .action-buttons 구조를 추출한 컴포넌트.
 * 기존 페이지별로 h1/h2가 섞여 있어 titleTag로 태그를 보존한다.
 * 버튼 영역은 children으로 받아 기존 마크업을 그대로 유지.
 */
function PageHeader({ title, titleTag: Tag = "h1", children }) {
  return (
    <div className="sub-header">
      <Tag className="page-title">{title}</Tag>
      <div className="action-buttons">{children}</div>
    </div>
  );
}

export default PageHeader;
