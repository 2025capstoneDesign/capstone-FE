import React from 'react';
import Banner from './Banner';
import convert_icon from '../../assets/images/convert_icon.png';
import history_icon from '../../assets/images/history_icon.png';
import setting_icon from '../../assets/images/setting_icon.png';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  
  const FeatureCard = ({ image, title, description, onClick }) => (
    <div className="w-auto h-[280px] relative group cursor-pointer" onClick={onClick}>
      <div className="rounded-3xl border-2 border-[#DBE2EF] group-hover:border-gradient-hover group-hover:border-3 h-full transition-all duration-300">
        <div className="p-8">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0">
              <img src={image} alt={title} className="w-full h-full object-contain" />
            </div>
            <h3 className="text-3xl font-semibold text-center">{title}</h3>
          </div>
          <p className="text-2xl mt-8 text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="min-w-[1280px] ">
      {/* <div className="mx-4 mb-16">
        <h1 className="text-6xl font-bold my-8">필기요정 소개</h1>
        <p className="text-gray-500 text-xl">
          필기요정은 당신의 학습을 돕기 위해서 존재합니다.<br/>
          강의를 들으면서 놓쳤던 부분들도 다시 확인하고 기록해보세요.
        </p>
      </div> */}
      
      {/* 메인 배너 */}
      <Banner />

      {/* 기능 소개 섹션 */}
      <div className="mt-24 mb-16 max-w-[1480px] mx-auto">
        <h2 className="mx-4 text-5xl font-semibold mb-12">기능을 살펴보세요</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            image={convert_icon}
            title="강의록 변환"
            description="강의와 음성 파일을 등록하여 필기를 생성해보세요."
            onClick={() => navigate('/convert')}
          />
          <FeatureCard
            image={history_icon}
            title="히스토리"
            description="이전에 변환했던 강의들을 다시 찾아볼 수 있습니다."
          />
          <FeatureCard
            image={setting_icon}
            title="사용자 설정"
            description="내가 원하는 조건으로 요약본을 생성할 수 있습니다."
          />
        </div>
      </div>
    </section>
  );
}

export default Home;