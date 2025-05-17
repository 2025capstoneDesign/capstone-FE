import React from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoImage from "../assets/images/logo3.png";
import { useAuth } from "../context/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userEmail } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm fixed z-[999] w-full">
      <nav className="mx-auto px-6 py-[0.8rem]">
        <div className="flex justify-between items-center">
          {/* <div className="flex justify-between items-center"> */}
          <Link
            to="/"
            className="flex justify-between items-center text-2xl font-bold text-gray-600"
          >
            <img
              src={LogoImage}
              alt="로고"
              className="w-[120px] h-[43px] object-fit text-xl"
            />
            {/* 필기요정 */}
          </Link>
          {/* </div> */}
          {isAuthenticated() ? (
            <button
              onClick={handleLogout}
              className="text-gray-600 text-lg hover:text-gray-900 px-6 py-2"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/login"
              className="text-gray-600 text-lg hover:text-gray-900 px-6 py-2"
            >
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
