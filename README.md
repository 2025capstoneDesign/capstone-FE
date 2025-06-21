# 필기요정 AI(SmartLectureNote)
<img src="https://github.com/user-attachments/assets/601e5aaa-b38c-46b8-958d-0f5a0cb4c6f4" width="200" alt="Image" />


강의 **음성(STT)** 과 **슬라이드(PDF)** 를 자동으로 매핑해  
**슬라이드별 복습** 을 가능하게 하는 AI 서비스입니다.

> _“이 말, 어느 슬라이드를 설명할 때 나온 걸까?”_  
> 필기요정이 **음성 텍스트 ↔️ 슬라이드** 를 자동 연결해드립니다.

---

## 목차
1. [🚀 배경](#-배경)
2. [🧩 주요 기능](#-주요-기능)
3. [📕 사용자 메뉴얼](#-사용자-메뉴얼)
4. [🎬 화면 소개](#-화면-소개)
5. [⚙️ 실행 방법](#️-실행-방법)

---

## 🚀 배경
1. **녹음은 많지만 활용은 적다**  
   학생들은 수업을 녹음해 두지만, **어느 슬라이드** 내용인지 몰라 결국 듣지 않게 됩니다.  
2. **슬라이드 ↔️ 음성 자동 매칭**  
   강의 STT와 슬라이드를 **콘텐츠 기반 AI** 로 매칭해드립니다.  
3. **슬라이드별 요약**  
   각 슬라이드에 요약본과 수업 스크립트를 제공하여, **빠르고 정확한 복습** 이 가능해집니다.

---

## 🧩 주요 기능
| 기능 | 설명 |
|------|------|
| **강의록 변환** | 녹음파일 + 슬라이드 업로드 → 슬라이드별 음성/요약 자동 배치 |
| **실시간 변환** | 강의 중 실시간 STT 수집 후, 현재 슬라이드에 즉시 매칭 |
| **히스토리 관리** | 이전 변환 결과를 다시 열람 가능 |
| **슬라이드 재매핑** | 수업을 놓쳤을 때 원하는 슬라이드를 클릭하면 해당 구간 음성만 재매핑 |

---

## 📕 사용자 메뉴얼
더 자세한 사용법은 아래 PDF를 참고하세요.  
[📘 **필기요정 메뉴얼 다운로드**](https://github.com/user-attachments/files/20836246/Team1_Manual.pdf)

---

## 🎬 화면 소개

### 1. 메인 화면
<img src="https://github.com/user-attachments/assets/ac6b333b-89f9-43a9-b0bc-01c43b89d0ab" width="800" alt="메인 화면"/>
<br>



> - 서비스 메인화면입니다.  
> - **강의록 변환**·**히스토리**·**설정** 3가지 메뉴로 이루어져 있습니다.

---

### 2. 로그인 · 회원가입
<img src="https://github.com/user-attachments/assets/319e7e16-f5bc-4467-a20b-11aeceb9b68c" width="800" alt="로그인/회원가입"/>




> - 사용자는 회원가입 / 로그인 후 서비스 사용이 가능합니다.  

---

### 3. 강의 변환 방식 선택
<img src="https://github.com/user-attachments/assets/02055cf4-d95e-4f40-81a2-23f7ee4a683e" width="800" alt="변환 방식 선택"/>

> 사용자는 두 가지 변환 방식 중 선택 가능합니다.
> - **강의록 변환** : 수업 녹음본과 슬라이드를 업로드하여 요약본을 생성합니다. 
> - **실시간 변환** : 강의 진행 중 녹음을 실시간 STT로 변환하고 강의를 마친 후 요약본을 생성합니다.

---

#### 3-1. 강의록 변환 플로우

##### 1) 파일 업로드
<img src="https://github.com/user-attachments/assets/d820a17e-911a-44a1-89e8-fab19a53d1c8" width="800" alt="강의록 업로드"/>



> - 사용자는 **슬라이드 PDF** 와 **녹음 파일** 을 업로드합니다.  

##### 2) 변환 결과 열람
<img src="https://github.com/user-attachments/assets/d8371412-9341-481a-9629-10ce5aa47316" width="800" alt="변환 결과"/>



> - 슬라이드 좌측에는 **강의록**이, 우측에는 **수업 요약 내용**이 표시됩니다.  
> - 좌측 상단탭을 통해 음성 원본을 열람할 수도 있습니다.

---

#### 3-2. 실시간 변환 플로우

##### 1) 슬라이드 업로드 & 녹음 시작
<img src="https://github.com/user-attachments/assets/9415093c-e8c5-42be-bc20-38ed99279a61" width="800" alt="실시간 업로드"/>



> - 강의 시작 전 수업에 사용할 강의록을 업로드하고 **녹음 시작** 버튼을 누르면, WebSocket으로 음성이 스트리밍됩니다.

##### 2) 실시간 수업 듣기
<img width="800" alt="Image" src="https://github.com/user-attachments/assets/f62f2de7-234b-4212-8c14-8c8306c1caf2" />



> - STT 결과가 실시간으로 나타나며, 시청 중인 슬라이드에 자동 할당됩니다.  

##### 3) 슬라이드 선택 & 재매핑
<img src="https://github.com/user-attachments/assets/5bb462a6-26c8-4002-a76a-80f0c03b52f0" width="800" alt="슬라이드 재매핑"/>



> - 강의를 놓쳤을 때 원하는 슬라이드를 선택하면 **재매핑** 요청할 수 있습니다.  
> - 필기요정이 해당 슬라이드 범위의 STT를 찾아 자동 재배치합니다.

---

### 4. 히스토리 열람
<img src="https://github.com/user-attachments/assets/3ea50710-954c-4570-a935-0a57fce4ba28" width="800" alt="히스토리 열람"/>



> - 과거에 변환했던 강의별 노트를 리스트로 보여줍니다.  

---

## ⚙️ 실행 방법
```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수(.env) 설정
# 예시
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8001

# 3. 개발 서버 실행
npm start
```
