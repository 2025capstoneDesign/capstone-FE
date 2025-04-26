import React from 'react';
import LogoImage from '../assets/images/logo.png';

function Header() {
  return (
    <header className="bg-white shadow-sm fixed z-[999] w-full">
      <nav className="min-w-[1280px] mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* <div className="flex justify-between items-center"> */}
            <a href="/" className="flex justify-between items-center text-2xl font-bold text-gray-600">
              <img  
                src={LogoImage} 
                alt="로고" 
                className="w-[60px] px-2 h-auto text-xl"
              />
              필기요정
            </a>
          {/* </div> */}
          <a href="/login" className="text-gray-600 text-xl hover:text-gray-900 px-6 py-2 ">
            로그인
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Header; 