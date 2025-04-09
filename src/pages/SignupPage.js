import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/common/Header/Header";
import "../styles/LoginSignup.css";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 폼 제출 시에만 유효성 검사 메시지를 표시하기 위한 상태
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // 아이디 검증
    if (!formData.username.trim()) {
      newErrors.username = "아이디를 입력해주세요";
    } else if (formData.username.length < 8) {
      newErrors.username = "아이디는 8자 이상이어야 합니다";
    }
    
    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 10) {
      newErrors.password = "비밀번호는 10자 이상이어야 합니다";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "비밀번호는 숫자를 포함해야 합니다";
    }
    
    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }
    
    // 이메일 검증
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "유효한 이메일 형식이 아닙니다";
    }
    
    // 전화번호 검증
    if (!formData.phone) {
      newErrors.phone = "전화번호를 입력해주세요";
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = "유효한 전화번호 형식이 아닙니다 (10-11자리 숫자)";
    }
    
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    validateForm(); // 폼 제출 시 검증 다시 실행
    
    if (isFormValid) {
      // 여기에 회원가입 로직 추가
      console.log("회원가입 시도:", formData);
      
      // 회원가입 성공 후 로그인 페이지로 이동 (실제 구현 시 API 호출 후 성공 시 이동)
      navigate("/login");
    }
  };

  return (
    <div className="container">
      <Header 
        title="회원가입" 
        showBackButton={true}
        showMenuButton={false}
      />
      
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>회원가입</h2>
          
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
            />
            {submitted && errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">이메일 주소</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
            />
            {submitted && errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">전화번호</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="전화번호를 입력하세요"
            />
            {submitted && errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
          >
            회원가입
          </button>
          
          <div className="auth-links">
            <Link to="/login" className="auth-link">로그인 페이지로 이동</Link>
          </div>
        </form>
      </div>
    </div>
  );
}