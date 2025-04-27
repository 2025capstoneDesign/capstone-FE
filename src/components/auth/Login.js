import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import qs from "qs";
import "../../css/Auth.css";

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
    <div className="auth-container">
      <h2>로그인</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">아이디</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">
          로그인
        </button>
      </form>
      <p className="auth-link">
        아직 회원이 아니신가요? <Link to="/register">회원가입 하러 가기</Link>
      </p>
    </div>
  );
};

export default Login;
