import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import loginImage from "../../assets/images/login2.png";
import { useAuth } from "../../context/AuthContext";
import { useHistory } from "../../context/HistoryContext";
import { showError, handleApiError } from "../../utils/errorHandler";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const { refreshHistory, loading: historyLoading } = useHistory();
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("로그인 중...");

  const handleLogin = async (e) => {
    e.preventDefault();
    setShowLoading(true);

    try {
      console.log("로그인 시도:", { username, password });
      
      const result = await login({ username, password });
      
      if (result.success) {
        // Fetch history after successful login
        setLoadingMessage("기록을 불러오는 중...");
        await refreshHistory();
        navigate("/");
      } else {
        showError(result.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      handleApiError(error, "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Loading Modal */}
      {showLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center">
            <img 
              src="/loading_listen.gif" 
              alt="로딩 중" 
              className="w-[200px] h-[200px] object-contain mb-4"
            />
            <p className="text-gray-700 text-lg font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}

      <div className="hidden lg:block w-[50%] bg-[#FBF8EF] flex items-center justify-center min-h-screen">
        <img 
          src={loginImage} 
          alt="로그인 이미지" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="block lg:hidden absolute inset-0 z-0">
        <img 
          src={loginImage} 
          alt="로그인 배경 이미지" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full lg:w-[55%] bg-white/80 flex flex-col items-center justify-center p-[5%] min-h-screen relative z-10">
        <h2 className="text-[1.8rem] lg:text-[1.8vw] font-bold text-gray-800 mb-[3rem] lg:mb-[3vw]">
          로그인
        </h2>
        <form onSubmit={handleLogin} className="w-full max-w-[75%] lg:max-w-[30vw] space-y-[1.8rem] lg:space-y-[1.8vw]">
          <div className="space-y-[1rem] lg:space-y-[1vw]">
            <label htmlFor="username" className="block text-[1.1rem] lg:text-[1.1vw] font-medium text-gray-700">
              아이디
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-[1.5rem] lg:px-[1.5vw] py-[1rem] lg:py-[0.8vw] text-[1.1rem] lg:text-[1.1vw] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-[1rem] lg:py-[1vw] px-[2rem] lg:px-[2vw] text-[1.2rem] lg:text-[1.2vw] bg-[#5B7F7C] text-white rounded-md hover:bg-[#455E5C] focus:outline-none focus:ring-2 focus:ring-[#455E5C] focus:ring-offset-2 transition-colors"
          >
            로그인
          </button>
        </form>
        <p className="mt-[2rem] lg:mt-[2vw] text-[1rem] lg:text-[1vw] text-gray-600">
          아직 회원이 아니신가요?{" "}
          <Link to="/register" className="text-[#5B7F7C] hover:text-[#455E5C] font-medium">
            회원가입 하러가기
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
