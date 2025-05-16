import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/TestPage.css";
import SettingsSection from "./SettingsSection";
import ManualSection from "./ManualSection";

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

            <div className="main-content">
                <SettingsSection 
                    keyword={keyword}
                    setKeyword={setKeyword}
                    noteType={noteType}
                    setNoteType={setNoteType}
                    handleSave={handleSave}
                />
                <ManualSection />
            </div>
        </div>
    );
}

export default Setting;