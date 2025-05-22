import React from "react";

function SettingsSection({ keyword, setKeyword, noteType, setNoteType, handleSave }) {
  return (
    <div className="slide-container">
      <div className="slide-header">
        <h2 className="text-[1.1rem] font-semibold px-[15px]">사용자 설정</h2>
      </div>
      
      <div className="p-5">
        <div className="w-full bg-[#fff]">
          <div className="p-[20px] space-y-6">
            <p className="text-gray-700">
              필기요정의 기본 설정을 변경할 수 있습니다. 설정한 내용은 다음 변환 시 자동으로 적용됩니다.
            </p>
            
            <div className="space-y-2">
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
                기본 키워드 설정
              </label>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
                placeholder="키워드를 입력하세요"
              />
              <p className="text-sm text-gray-500">강의록 변환 시 중점적으로 찾을 키워드를 설정합니다.</p>
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
              <p className="text-sm text-gray-500">기본으로 적용될 필기 방식을 선택합니다.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="noteType" className="block text-sm font-medium text-gray-700">
                필기 언어 설정
              </label>
              <select
                id="noteType"
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#455E5C]"
              >
                <option value="한국어">한국어</option>
                <option value="영어">영어</option>
              </select>
              <p className="text-sm text-gray-500">생성될 필기의 언어를 선택합니다.</p>
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
  );
}

export default SettingsSection;