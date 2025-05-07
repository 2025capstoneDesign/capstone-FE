import React from 'react';
import bannerImage from '../../assets/images/banner_image2.png';
import overlayImage from '../../assets/images/overlay3.png';
import { useNavigate } from 'react-router-dom';

const Banner = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate('/convert');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative w-full h-[35vh] md:h-[45vh] lg:h-[45vh] overflow-hidden">
      {/* 그라데이션 배경 */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(130deg, #1A4642 0%, #80CBC4 59%, #B4EBE6 75%, #D9E1BB 88%, #FDD691 97%)',
          opacity: 1
        }}
      />
      
      {/* 오버레이 이미지 */}
      <div className="absolute inset-0">
        <img 
          src={overlayImage} 
          alt="배경 오버레이" 
          className="w-full h-full object-cover opacity-0 md:ml-[10%] xl:opacity-100"
        />
      </div>
      
      {/* 컨텐츠 */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="w-full px-[8%]">
          <h1 className="text-[1.5rem] leading-[0.2rem] md:text-[2rem] xl-[2.5rem] font-[350] text-white tracking-wide">
            필기요정과 함께!
          </h1>
          <h1 className="py-2 md:py-4 text-[2.5rem] md:text-[3.2rem] lg:text-[3.2rem] text-white font-[580] tracking-wide">
            자동 필기 생성 서비스
          </h1>
          <p className="mt-[1rem] md:mt-[1.8rem] lg:mt-[2rem] xl-[2.5rem] text-white font-[350] text-[1rem] md:text-[1.2rem] lg:text-[1.3rem] tracking-wide leading-relaxed">
            강의록과 녹음본으로 새로운 <span className='text-orange-300 font-[450]'>나만의 강의록</span>을 생성할 수 있습니다.<br/>
            AI가 도와주는 <span className='text-orange-300 font-[450]'>스마트한 필기 정리</span>를 경험해보세요.
          </p>
          <button 
            onClick={handleButtonClick}
            className="mt-[1.5rem] md:mt-[2rem] border border-white text-white px-[1.5rem] py-[0.75rem] rounded-full font-[350] text-[1rem] md:text-[1.2rem] hover:bg-white/10 transition-all"
          >
            변환하러 가기
          </button>
        </div>
        
        {/* 메인 이미지 */}
        <div className="absolute right-[6vw] md:top-10 w-0 md:w-[30%] lg:w-[30%] max-w-[550px]">
          <img 
            src={bannerImage} 
            alt="필기 이미지" 
            className="w-full h-auto animate-float"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner;