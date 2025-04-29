import React from "react";
import Banner from "./Banner";
import convert_icon from "../../assets/images/convert_icon.png";
import history_icon from "../../assets/images/history_icon2.png";
import setting_icon from "../../assets/images/setting_icon.png";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const FeatureCard = ({ image, title, description, onClick }) => (
    <div
      className="w-full min-h-[16rem] relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="rounded-3xl border-2 border-[#DBE2EF] group-hover:border-gradient-hover group-hover:border-3 h-full transition-all duration-300 sm:p-[1rem]">
        <div className="p-[1.5rem] md:p-[1rem]">
          <div className="flex flex-col items-center gap-[1rem] mb-[1rem]">
            <div className="w-[3.5rem] h-[3.5rem] md:w-[4rem] md:h-[4rem] rounded-full flex items-center justify-center shrink-0">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-[1.5rem] md:text-[2rem] font-semibold text-center">{title}</h3>
          </div>
          <p className="text-[1.1rem] md:text-[1.3rem] mt-[1.5rem] text-gray-500 text-center">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full mt-[4.5rem] px-[1rem] md:px-[2rem] lg:px-[4rem]">
      {/* 메인 배너 */}
      <Banner />
      
      {/* 기능 소개 섹션 */}
      <div className="mt-[4rem] mb-[4rem] w-full max-w-[92rem] mx-auto">
        <h2 className="text-[2rem] md:text-[2.5rem] font-semibold text-center">기능을 살펴보세요</h2>
        <p className="text-gray-400 text-[1.1rem] md:text-[1.3rem] text-center mb-[2rem] md:mb-[3rem] px-[1rem]">
          필기 요정이 제공하는 다양한 기능들을 체험해보세요
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1.5rem] md:gap-[2rem] px-[1rem] md:px-[2rem]">
          <FeatureCard
            image={convert_icon}
            title="강의록 변환"
            description="강의와 음성 파일을 등록하여 필기를 생성해보세요."
            onClick={() => navigate("/convert")}
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
