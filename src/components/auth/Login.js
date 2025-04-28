import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import qs from "qs";
import loginImage from "../../assets/images/login2.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log("로그인 시도:", { username, password });
      console.log("API URL:", process.env.REACT_APP_API_URL);

      // mock API 처리
      if (process.env.REACT_APP_API_URL === "mock") {
        console.log("Mock API: 로그인 성공");
        localStorage.setItem("token", "mock_access_token");
        navigate("/");
        return;
      }

      const formData = qs.stringify({
        username,
        password,
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("로그인 응답:", response.data);

      if (response.data.access_token) {
        // 로그인 성공 시 access_token을 localStorage에 저장
        localStorage.setItem("token", response.data.access_token);
        // 홈 화면으로 이동
        navigate("/");
      } else {
        alert("로그인 응답에 토큰이 없습니다.");
      }
    } catch (error) {
      console.error("로그인 에러:", error.response?.data || error.message);
      alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="flex h-screen w-full min-w-[1480px]">
      <div className="w-1/2 bg-[#FBF8EF] flex items-center justify-center h-screen">
        <img src={loginImage} alt="로그인 이미지" className="w-full h-full object-fit" />
      </div>
      <div className="w-1/2 bg-white flex flex-col items-center justify-center p-16 h-screen">
        <h2 className="text-4xl font-bold text-gray-800 mb-14">로그인</h2>
        <form onSubmit={handleLogin} className="w-full max-w-xl space-y-8">
          <div className="space-y-4">
            <label htmlFor="username" className="block text-xl font-medium text-gray-700">
              아이디
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-6 py-4 text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
            />
          </div>
          <div className="space-y-4">
            <label htmlFor="password" className="block text-xl font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 px-8 text-xl bg-[#5B7F7C] text-white rounded-md hover:bg-[#455E5C] focus:outline-none focus:ring-2 focus:ring-[#455E5C] focus:ring-offset-2 transition-colors"
          >
            로그인
          </button>
        </form>
        <p className="text-lg text-gray-600 mt-8">
          아직 회원이 아니신가요?{" "}
          <Link to="/register" className="text-[#5B7F7C] hover:text-[#455E5C] font-medium">
            회원가입 하러 가기
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
