import React from "react";
import { Link } from "react-router-dom";
import LogoImage from "../assets/images/logo2.png";

function Header() {
  return (
    <header className="bg-white shadow-sm fixed z-[999] w-full">
      <nav className="min-w-[1280px] mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* <div className="flex justify-between items-center"> */}
          <Link
            to="/"
            className="flex justify-between items-center text-2xl font-bold text-gray-600"
          >
            <img
              src={LogoImage}
              alt="로고"
              className="w-[50px] h-[43px] object-contain text-xl"
            />
            필기요정
          </Link>
          {/* </div> */}
          <Link
            to="/login"
            className="text-gray-600 text-xl hover:text-gray-900 px-6 py-2"
          >
            로그인
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
