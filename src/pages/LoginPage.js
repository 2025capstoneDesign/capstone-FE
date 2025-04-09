import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/common/Header/Header";
import "../styles/LoginSignup.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "아이디를 입력해주세요";
    }
    
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (validate()) {
      // 여기에 로그인 로직 추가
      console.log("로그인 시도:", formData);
      
      // 로그인 성공 후 메인 페이지로 이동 (실제 구현 시 API 호출 후 성공 시 이동)
      navigate("/");
    }
  };

  return (
    <div className="container">
      <Header 
        title="로그인" 
        showBackButton={true}
        showMenuButton={false}
      />
      
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>로그인</h2>
          
          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="아이디를 입력하세요"
            />
            {submitted && errors.username && <p className="error-message">{errors.username}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
            />
            {submitted && errors.password && <p className="error-message">{errors.password}</p>}
          </div>
          
          <button type="submit" className="submit-btn">로그인</button>
          
          <div className="auth-links">
            <Link to="/signup" className="auth-link">회원가입</Link>
          </div>
        </form>
      </div>
    </div>
  );
}