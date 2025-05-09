import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/TestPage.css";

function Setting() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [noteType, setNoteType] = useState("서술형 필기");

    useEffect(() => {
        // localStorage에서 저장된 설정 불러오기
        const savedKeyword = localStorage.getItem("defaultKeyword");
        const savedNoteType = localStorage.getItem("defaultNoteType");
        
        if (savedKeyword) setKeyword(savedKeyword);
        if (savedNoteType) setNoteType(savedNoteType);
    }, []);

    const handleSave = () => {
        localStorage.setItem("defaultKeyword", keyword);
        localStorage.setItem("defaultNoteType", noteType);
        alert("설정이 저장되었습니다.");
    };
    
    return (
        <div className="app-wrapper">
            <div className="sub-header">
                <h2 className="page-title">사용자 설정</h2>
                <div className="action-buttons">
                    <button className="convert-btn" onClick={() => navigate("/")}>
                        홈으로
                    </button>
                </div>
            </div>

            <div className="mx-[25px]">
                <div className="flex-[1.7]">
                    <div className="w-full bg-[#fff] rounded-[12px] shadow-md">
                        <div className="h-[56px] bg-[#fffaec] px-[15px] py-[20px] border-b-[1px] rounded-t-[12px]">
                        </div>
                        <div className="p-[20px] space-y-6">
                            <p>설정페이지에 대한 설명...</p>
                            <div className="space-y-2">
                                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
                                    키워드 입력
                                </label>
                                <input
                                    type="text"
                                    id="keyword"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
                                    placeholder="키워드를 입력하세요"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="noteType" className="block text-sm font-medium text-gray-700">
                                    기본 필기 방식
                                </label>
                                <select
                                    id="noteType"
                                    value={noteType}
                                    onChange={(e) => setNoteType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
                                >
                                    <option value="서술형 필기">서술형 필기</option>
                                    <option value="개조식 필기">개조식 필기</option>
                                    <option value="키워드 필기">키워드 필기</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-2 px-4 bg-[#5B7F7C] text-white rounded-md hover:bg-[#455E5C] focus:outline-none focus:ring-2 focus:ring-[#455E5C] focus:ring-offset-2 transition-colors"
                            >
                                설정 저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Setting;
