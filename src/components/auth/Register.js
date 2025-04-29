import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import loginImage from "../../assets/images/login2.png";
import logo2 from "../../assets/images/logo2.png";
import "../../css/Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      console.log("회원가입 시도:", {
        email: formData.email,
        password: formData.password,
      });
      console.log("API URL:", process.env.REACT_APP_API_URL);

      // mock API 처리
      if (process.env.REACT_APP_API_URL === "mock") {
        console.log("Mock API: 회원가입 성공");
        localStorage.setItem("token", "mock_access_token");
        alert("회원가입이 완료되었습니다.");
        navigate("/");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("회원가입 응답:", response.data);

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem("token", response.data.access_token);
        alert("회원가입이 완료되었습니다.");
        navigate("/");
      }
    } catch (error) {
      console.error("회원가입 에러:", error.response?.data || error.message);
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex min-h-screen w-full relative">
      <div className="hidden lg:block w-[50%] bg-[#FBF8EF] flex items-center justify-center min-h-screen">
        <img 
          src={logo2} 
          alt="회원가입 이미지" 
          className="w-full h-full object-cover opacity-70"
        />
      </div>
      <div className="block lg:hidden absolute inset-0 z-0">
        <img 
          src={logo2} 
          alt="회원가입 배경 이미지" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full lg:w-[55%] bg-white/80 flex flex-col items-center justify-center p-[5%] min-h-screen relative z-10">
        <h2 className="text-[1.8rem] lg:text-[1.8vw] font-bold text-gray-800 mb-[3rem] lg:mb-[3vw]">
          회원가입
        </h2>
        <form onSubmit={handleSubmit} className="w-full max-w-[75%] lg:max-w-[30vw] space-y-[1.8rem] lg:space-y-[1.8vw]">
          <div className="space-y-[1rem] lg:space-y-[1vw]">
            <label htmlFor="email" className="block text-[1.1rem] lg:text-[1.1vw] font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-[1.5rem] lg:px-[1.5vw] py-[1rem] lg:py-[0.8vw] text-[1.1rem] lg:text-[1.1vw] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
            />
          </div>
          <div className="space-y-[1rem] lg:space-y-[1vw]">
            <label htmlFor="password" className="block text-[1.1rem] lg:text-[1.1vw] font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-[1.5rem] lg:px-[1.5vw] py-[1rem] lg:py-[0.8vw] text-[1.1rem] lg:text-[1.1vw] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
            />
          </div>
          <div className="space-y-[1rem] lg:space-y-[1vw]">
            <label htmlFor="confirmPassword" className="block text-[1.1rem] lg:text-[1.1vw] font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-[1.5rem] lg:px-[1.5vw] py-[1rem] lg:py-[0.8vw] text-[1.1rem] lg:text-[1.1vw] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-[1rem] lg:py-[1vw] px-[2rem] lg:px-[2vw] text-[1.2rem] lg:text-[1.2vw] bg-[#5B7F7C] text-white rounded-md hover:bg-[#455E5C] focus:outline-none focus:ring-2 focus:ring-[#455E5C] focus:ring-offset-2 transition-colors"
          >
            회원가입
          </button>
        </form>
        <p className="mt-[2rem] lg:mt-[2vw] text-[1rem] lg:text-[1vw] text-gray-600">
          이미 회원이신가요?{" "}
          <Link to="/login" className="text-[#5B7F7C] hover:text-[#455E5C] font-medium">
            로그인 하러가기
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
