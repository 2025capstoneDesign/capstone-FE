import React from 'react';
import bannerImage from '../../assets/images/banner_image.png';
import overlayImage from '../../assets/images/overlay2.png';
import { useNavigate } from 'react-router-dom';

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[510px] min-w-[1600px] overflow-hidden mx-auto">
      {/* 그라데이션 배경 */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(130deg, #1A4642 0%, #80CBC4 53%, #B4EBE6 65%, #D9E1BB 78%, #FDD691 97%)',
          opacity: 1
        }}
      />
      
      {/* 오버레이 이미지 */}
      <div className="absolute inset-0">
        <img 
          src={overlayImage} 
          alt="배경 오버레이" 
          className="w-full h-full object-cover opacity-40"
        />
      </div>
      
      {/* 컨텐츠 */}
      <div className="relative z-10 p-20 justify-between items-center h-full">
        <div className="">
          <h1 className=" px-36 text-4xl font-[350] text-white tracking-wide">필기요정과 함께!</h1>
          <h1 className="py-4 px-36 text-6xl text-white font-[580] tracking-wide">자동 필기 생성 서비스</h1>
          <p className="mt-16 text-white font-[350] px-36 text-xl tracking-wide">
            강의록과 녹음본으로 새로운 <span className='text-orange-300 font-[450]'>나만의 강의록</span>을 생성할 수 있습니다.<br/>
            AI가 도와주는 <span className='text-orange-300 font-[450]'>스마트한 필기 정리</span>를 경험해보세요.
          </p>
          <button 
            onClick={() => navigate('/convert')}
            className="my-8 mx-36 border border-whi6te text-white px-6 py-3 rounded-full font-[350] hover:bg-white/10 transition-all text-xl"
          >
            변환하러 가기
          </button>
        </div>
        
        {/* 메인 이미지 */}
        <div className="absolute px-36 right-0 bottom-0">
          <img 
            src={bannerImage} 
            alt="필기 이미지" 
            className="w-[740px] h-auto animate-float"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner;