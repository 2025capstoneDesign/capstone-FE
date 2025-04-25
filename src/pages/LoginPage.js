import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/common/Header/Header";
import "../styles/LoginSignup.css";
import axios from "axios";
import qs from "qs";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log("로그인 시도:", { username, password });

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
    <div className="container">
      <Header title="로그인" showBackButton={true} showMenuButton={false} />

      <div className="auth-container">
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>로그인</h2>

          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="email"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="이메일"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
            />
          </div>

          <button type="submit" className="submit-btn">
            로그인
          </button>

          <div className="auth-links">
            <Link to="/signup" className="auth-link">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
