import { Link } from "react-router-dom";
import "./Header.css";

const Header = ({
  title,
  onMenuClick,
  showBackButton = false,
  showMenuButton = true,
  rightContent,
}) => {
  return (
    <div className="topbar">
      <div className="left-section">
        {showBackButton && (
          <Link to="/" className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 
              32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 
              32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
            </svg>
            돌아가기
          </Link>
        )}
        {showMenuButton && (
          <button className="menu-btn" onClick={onMenuClick}>
            &#9776;
          </button>
        )}
      </div>

      <div className="title">{title}</div>
      <div className="right-section">{rightContent}</div>
    </div>
  );
};

export const AccountButton = () => (
  <Link to="/login">
    <button className="account-btn">
      <svg
        className="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        fill="white"
      >
        <path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112h-91.4c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z" />
      </svg>
    </button>
  </Link>
);

export default Header;
