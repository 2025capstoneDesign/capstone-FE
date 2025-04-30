// /src/data/dummyData.js
// (summaryData + voiceData 통합본)

export const dummyData = {
  /* ---------- SLIDE 1 ---------- */
  slide1: {
    "Concise Summary Notes": `📘 **1. 정보 보안 개론**

이 페이지에서는 정보 보안 및 암호학에 대한 기본 개념을 소개합니다. 정보 시스템 자원의 무결성, 가용성, 기밀성을 유지하기 위한 보호 개념(CIA Triad)을 중심으로 정의되며, 컴퓨터 보안이란 하드웨어, 소프트웨어, 펌웨어, 데이터, 통신을 포함한 시스템 자원을 보호하는 것입니다. 여기에는 다음 세 가지 주요 요소가 포함됩니다:

1️⃣ **Confidentiality(기밀성)** – 데이터 기밀성과 개인 프라이버시 보장을 의미  
2️⃣ **Integrity(무결성)** – 데이터 및 시스템의 무결성, 즉 정보가 변경되지 않았음을 의미  
3️⃣ **Availability(가용성)** – 정보 및 시스템이 인가된 사용자에게 언제든지 접근 가능해야 한다는 개념  

또한 **Authenticity(진위성)**, **Accountability(책임 추적성)** 같은 요구사항도 소개됩니다.

🔑 **주요 용어**  
• Adversary – 시스템을 공격하는 주체  
• Attack – 위협으로부터 유래된 시스템 보안에 대한 공격 행위  
• Countermeasure – 위협이나 취약점을 줄이기 위한 조치  
• Risk – 특정 위협이 특정 취약점을 이용해 손해를 끼칠 확률  
• Security Policy – 민감하고 중요한 자산 보호를 위한 규칙과 관행  
• Threat – 보안을 위반할 수 있는 잠재적 가능성  
• Vulnerability – 시스템 설계 또는 운영상 약점

📎 **요약 설명**  
정보 보안의 개념과 용어를 정리한 입문 페이지로, 이후 모든 보안 개념의 기초가 됩니다.`,
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {
      segment1: {
        text: "안녕하세요, 오늘은 정보 보안 개론에 대해 배우겠습니다. 정보 보안이란 무엇인지, 주요 개념과 기본 용어들을 살펴볼 예정입니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment2: {
        text: "정보 보안이란 CIA 트라이어드로 요약됩니다. 기밀성(Confidentiality), 무결성(Integrity), 가용성(Availability)의 세 요소를 보장하는 것이 핵심입니다.",
        reason: "시험에 반드시 나오는 CIA 트라이어드 개념입니다.",
        isImportant: true,
        linkedConcept: "CIA 보장 메커니즘",
        pageNumber: 5,
      },
      segment3: {
        text: "기밀성은 데이터가 인가된 사용자만 접근할 수 있도록 하는 속성입니다. 무결성은 데이터가 인가되지 않은 방식으로 변경되지 않았음을 보장하는 속성입니다. 가용성은 인가된 사용자가 필요할 때 시스템이 이용 가능해야 함을 의미합니다. 그 외에도 진위성(Authenticity)과 책임 추적성(Accountability)이 추가되기도 합니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment4: {
        text: "이제 보안 관련 주요 용어들을 살펴보겠습니다. Adversary는 시스템을 공격하는 위협 행위자를 의미합니다. Attack은 위협으로부터 유래된 시스템 보안에 대한 공격 행위입니다. Countermeasure는 위협이나 취약점을 줄이기 위한 대책을 말합니다.",
        reason: "시험에 출제하신다고 강조하셨습니다.",
        isImportant: true,
        linkedConcept: "",
        pageNumber: null,
      },
      segment5: {
        text: "Risk는 특정 위협이 특정 취약점을 이용해 손해를 끼칠 확률을 의미합니다. Security Policy는 민감하고 중요한 자산 보호를 위한 규칙과 관행입니다. Threat는 보안을 위반할 수 있는 잠재적 가능성을 뜻합니다. Vulnerability는 시스템 설계 또는 운영상 약점을 말합니다.",
        reason:
          "교수님께서 이 용어들은 시험에 빈출된다고 특별히 강조하셨으며, 정확한 정의를 암기해야 한다고 말씀하셨습니다.",
        isImportant: true,
        linkedConcept: "",
        pageNumber: null,
      },
    },
  },

  /* ---------- SLIDE 2 ---------- */
  slide2: {
    "Concise Summary Notes": `# 🔐 대칭 암호화 (Symmetric Encryption) 개념과 종류

## 📌 대칭 암호화 기본 개념
- **핵심 가정** : 송신자와 수신자가 **동일한 키**를 공유  
- **특징** : 대칭/비공개 키(Symmetric/Private key) 사용  

### 작동 방식
1. 송신자 : 평문(X)을 암호화 알고리즘과 키(K)로 암호문(Y) 생성 → Y = E[K, X]  
2. 수신자 : 암호문(Y)을 복호화 알고리즘과 동일한 키(K)로 평문(X) 복원 → X = D[K, Y]`,
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {
      segment1: {
        text: "이 페이지에서는 보안 개념 및 상호 관계에 대해 살펴보겠습니다. 보안 요소들 간의 관계를 이해하는 것이 중요합니다. 이러한 개념적 이해가 없으면 보안 시스템을 제대로 설계할 수 없습니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment2: {
        text: "취약점이 있고 이를 위협이 공격하면 위험이 발생합니다. 그리고 이 위험에 대응하기 위한 대책을 수립합니다. 이러한 관계를 잘 이해해야 효과적인 보안 정책을 수립할 수 있습니다.",
        reason:
          "시험에 자주 출제되는 중요 개념입니다. 취약점-위협-위험-대책의 인과관계는 보안 프레임워크 설계의 기초가 됩니다.",
        isImportant: true,
        linkedConcept: "위험 관리 프레임워크",
        pageNumber: 7,
      },
    },
  },

  /* ---------- SLIDE 3 ---------- */
  slide3: {
    "Concise Summary Notes": `## 🧩 블록 암호 (Block Cipher)

- **입력** : 한 번에 한 블록의 요소 처리  
- **출력** : 입력 블록마다 하나의 블록 생성  

### 특징
- 키 재사용 가능, 전자 코드북 모드(ECB) 등 다양한 운영 모드  
- **주요 예시** : DES, AES, ARIA, SEED …  

### 설계 매개변수
- 📏 블록 크기, 🔑 키 크기, 🔄 라운드 수, 🧮 서브키 생성 알고리즘, ⚙️ 라운드 함수`,
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {
      segment1: {
        text: "이번 페이지에서는 취약점, 공격, 대책의 유형에 대해 살펴보겠습니다. 시스템 취약점은 무결성 손상, 기밀성 누출, 가용성 상실로 나타날 수 있습니다. 각 취약점 유형에 따라 대응 방식도 달라집니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment2: {
        text: "공격은 수동적 공격과 능동적 공격으로 나눌 수 있습니다. 수동적 공격은 정보를 획득하는 데 중점을 두며, 능동적 공격은 시스템이나 데이터를 변경하는 데 중점을 둡니다.",
        reason:
          "교수님께서 시험에 반드시 나온다고 강조하신 부분입니다. 예시를 들어 자세히 설명했습니다.",
        isImportant: true,
        linkedConcept: "",
        pageNumber: null,
      },
      segment3: {
        text: "또한 내부자 공격과 외부자 공격으로 구분할 수도 있습니다. 내부자 공격은 권한을 가진 사용자에 의한 공격으로, 탐지하기 어렵고 피해가 클 수 있습니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment4: {
        text: "대책은 예방, 탐지, 복구의 세 단계로 구성됩니다. 예방은 공격을 사전에 방지하는 것, 탐지는 공격이 발생했을 때 이를 감지하는 것, 복구는 공격 후 시스템을 원래 상태로 되돌리는 것을 의미합니다.",
        reason:
          "시험에 자주 출제되는 보안 대책의 3단계입니다. 이 개념은 실제 보안 시스템 구현에 필수적이라고 강조하셨습니다.",
        isImportant: true,
        linkedConcept: "",
        pageNumber: null,
      },
    },
  },

  /* ---------- SLIDE 4 ---------- */
  slide4: {
    "Concise Summary Notes": `## 📶 스트림 암호 (Stream Cipher)

- **입력** : 연속적으로 요소 처리  
- **출력** : 한 번에 하나의 요소 생성  
- 블록 암호보다 빠르고, 키는 한 번만 사용  
- 알려진 평문 공격에 취약 (M ⊕ C = M ⊕ (M ⊕ k) = k)

### 작동 방식
키(K)로 생성된 의사 난수 바이트 스트림(k)을 평문(M)과 XOR`,
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {
      segment1: {
        text: "이번 페이지에서는 컴퓨터 보안의 범위에 대해 다루겠습니다. 보안은 시스템, 구성 요소, 운영 절차 등 다양한 영역에 적용됩니다. 이러한 요소들이 모두 적절히 보호되어야 전체 시스템이 안전하다고 할 수 있습니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment2: {
        text: "조직 내에서 보안은 계층적으로 구성되어야 효과적입니다. 물리적 보안, 네트워크 보안, 애플리케이션 보안, 데이터 보안 등 여러 층의 보안이 함께 작동해야 합니다.",
        reason:
          "시험에 출제된다고 특별히 강조하신 개념입니다. 방어 계층화(Defense in Depth) 원칙은 현대 보안 설계의 핵심입니다.",
        isImportant: true,
        linkedConcept: "",
        pageNumber: null,
      },
    },
  },

  /* ---------- SLIDE 5 ---------- */
  slide5: {
    "Concise Summary Notes": "",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {
      segment1: {
        text: "보안 설계의 기본 원칙에 대해 알아보겠습니다. 이러한 원칙들은 시스템 설계 시 반드시 고려해야 할 사항들입니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment2: {
        text: "최소 권한의 원칙(Principle of least privilege)은 사용자나 프로세스가 작업 수행에 필요한 최소한의 권한만 부여받아야 한다는 것입니다.",
        reason:
          "시험에 자주 출제되는 보안 설계 원칙입니다. 이 원칙이 침해 사고의 영향 범위를 최소화한다고 강조하셨습니다.",
        isImportant: true,
        linkedConcept: "",
        pageNumber: null,
      },
      segment3: {
        text: "모듈화(Modularity)는 시스템을 독립적인 구성 요소로 나누어 설계하는 것입니다. 이렇게 하면 한 부분의 취약점이 전체 시스템에 미치는 영향을 제한할 수 있습니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment4: {
        text: "계층화(Layering)는 여러 방어 계층을 구축하여 하나의 방어 메커니즘이 실패해도 다른 계층이 보호를 제공하도록 하는 것입니다.",
        reason:
          "교수님께서 시험에 중요하게 다룰 것이라고 특별히 언급하신 개념입니다. 방어 계층화는 현대 보안 아키텍처의 핵심 원칙입니다.",
        isImportant: true,
        linkedConcept: "방어 계층화 구현",
        pageNumber: 4,
      },
    },
  },

  /* ---------- SLIDE 6 ---------- */
  slide6: {
    "Concise Summary Notes":
      "🛡️ 6. 공격 표면: 시스템의 네트워크, 소프트웨어, 사람(사회공학 포함) 측면에서 발생할 수 있는 보안 취약점을 정의하고, 이를 최소화하는 것이 보안의 핵심이라고 설명합니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {
      segment1: {
        text: "공격 표면에 대해 살펴보겠습니다. 공격 표면은 시스템이 공격에 노출될 수 있는 모든 지점을 말합니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment2: {
        text: "네트워크 공격 표면은 외부와 연결되는 모든 네트워크 인터페이스, 포트, 프로토콜 등을 포함합니다. 이 부분은 방화벽, IDS/IPS 등으로 보호해야 합니다.",
        reason:
          "시험에 자주 출제되는 공격 표면 개념입니다. 네트워크 공격 표면 감소가 보안 강화의 핵심 전략이라고 강조하셨습니다.",
        isImportant: true,
        linkedConcept: "",
        pageNumber: null,
      },
      segment3: {
        text: "소프트웨어 공격 표면은 애플리케이션의 입력값, API, 설정 등을 포함합니다. 이 부분은 입력값 검증, 코드 검토 등으로 보호해야 합니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment4: {
        text: "인적 공격 표면은 사회공학적 공격에 취약한 조직 구성원을 포함합니다. 이 부분은 교육, 인식 제고 등으로 보호해야 합니다.",
        reason:
          "교수님께서 특별히 강조하신 부분으로, 실제 보안 사고의 대부분이 인적 요소에서 시작된다고 설명하셨습니다.",
        isImportant: true,
        linkedConcept: "",
        pageNumber: null,
      },
    },
  },

  /* ---------- SLIDE 7 ---------- */
  slide7: {
    "Concise Summary Notes":
      "📜 7. 보안 전략: 보안 정책 수립, 구현, 보장, 평가의 4단계로 나눠 설명합니다. 각 단계는 보안을 체계적으로 관리하기 위한 전략 수립에 필수적입니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {
      segment1: {
        text: "보안 전략에 대해 살펴보겠습니다. 효과적인 보안 전략은 조직의 목표와 리소스를 고려하여 수립되어야 합니다.",
        reason: "",
        isImportant: false,
        linkedConcept: "",
        pageNumber: null,
      },
      segment2: {
        text: "보안 전략은 보안 정책 수립, 구현, 보장, 평가의 4단계로 나눌 수 있습니다. 각 단계는 순차적으로 진행되며, 지속적인 개선을 위해 반복될 수 있습니다.",
        reason:
          "시험에 출제된다고 강조하신 보안 전략의 4단계입니다. 이 체계적인 접근 방식이 효과적인 보안 관리의 핵심입니다.",
        isImportant: true,
        linkedConcept: "",
        pageNumber: null,
      },
    },
  },

  /* ---------- SLIDES 8 ~ 32 (요약만) ---------- */
  slide8: {
    "Concise Summary Notes":
      "🔏 8. 암호학 소개: 고전 암호에서 현대 암호학까지, 보안 기술의 변천사를 간단히 설명하고 암호 기초 개념 및 활용 영역(무결성, 인증, 키 분배 등)을 소개합니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide9: {
    "Concise Summary Notes":
      "📚 9. 고전 암호학: 암호학의 역사적 배경과 고전적 암호 방법(예: 시저 암호 등)에 대한 개념적 설명이 포함됩니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide10: {
    "Concise Summary Notes":
      "📦 10. 현대 암호학과 기술 구성요소: 해시 함수, 난수 생성기, 암호화, 전자서명, 키 공유 등 현대 암호학의 기술 구성요소를 소개합니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide11: {
    "Concise Summary Notes":
      "🔐 11. 암호화 개요: 대칭키와 비대칭키 암호화 개념을 도입하며, 각 방식의 장단점을 설명합니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide12: {
    "Concise Summary Notes":
      "🗝️ 12. 대칭키 암호화: 송수신자가 같은 키를 공유하는 방식으로, 빠르지만 키 공유에 제약이 있습니다. 대표 알고리즘: AES, DES 등.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide13: {
    "Concise Summary Notes":
      "🔓 13. 비대칭키 암호화: 공개키와 개인키를 사용하는 방식으로, 키 관리가 용이하나 속도가 느립니다. 대표 알고리즘: RSA, ElGamal 등.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide14: {
    "Concise Summary Notes":
      "📄 14. 암호 관련 용어 정리: 평문, 암호문, 암호화/복호화 알고리즘, 키의 정의 등을 간단히 정리합니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide15: {
    "Concise Summary Notes":
      "📢 15. 케르크호프의 원칙: 알고리즘 자체는 공개되어도 안전해야 한다는 개념으로, 보안은 키의 비밀성에 의존해야 한다는 핵심 원칙을 설명합니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide16: {
    "Concise Summary Notes":
      "🧠 16. 암호 공격의 유형: 무차별 공격과 암호해독 공격(암호문만 가진 경우, 평문-암호문 쌍 존재 등)의 차이점을 설명합니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide17: {
    "Concise Summary Notes":
      "🔁 17. 시프트 암호: 문자 위치를 일정 수만큼 이동하는 방식으로, 시저 암호의 예시와 공격법(브루트포스 등)을 함께 설명합니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide18: {
    "Concise Summary Notes":
      "🧮 18. 아핀 암호: 선형 변환 방식의 고전 암호. 키 쌍 (α, β) 사용, 수학적 계산이 필요하며 공격 방식도 설명됩니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide19: {
    "Concise Summary Notes":
      "🔄 19. 치환 암호: 알파벳의 위치를 임의로 재배열하여 암호화하는 방식으로, 키 공간이 매우 큽니다. 통계적 분석에 의해 공격 가능성이 있음.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide20: {
    "Concise Summary Notes":
      "📊 20. 통계 분석 기법: 평문과 암호문의 문자 출현 빈도를 비교하여 치환 암호를 해독하는 기법을 소개합니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide21: {
    "Concise Summary Notes":
      "🔍 21. 통계 분석 예제: 실제 암호문을 통계적으로 분석하여 평문을 복원하는 과정을 단계별로 보여줍니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide22: {
    "Concise Summary Notes":
      "🔡 22. 비제네르 암호: 다중 문자 키를 사용하는 다중 치환 암호로, 공격 난이도가 높지만 특정 방법으로 해독 가능.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide23: {
    "Concise Summary Notes":
      "🔁 23. 전치 암호: 문자 순서를 바꾸는 방식으로, 수학적 행렬을 활용해 암호화/복호화가 이루어짐. 힐 암호로도 확장 가능.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide24: {
    "Concise Summary Notes":
      "🔄 24. 선형 피드백 시프트 레지스터(LFSR): 선형 함수를 이용한 난수 생성 방식으로, 스트림 암호 설계의 기반이 되는 개념.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide25: {
    "Concise Summary Notes":
      "🔢 25. LFSR 암호 및 공격 기법: 초기 키 값을 바탕으로 생성된 스트림을 평문과 XOR하여 암호화. 공격 시에는 선형 관계를 역산해 키를 복원.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide26: {
    "Concise Summary Notes":
      "🧨 26. 원타임 패드(OTP): 키를 한 번만 사용하고 폐기하는 암호 방식으로, 이론상 완벽한 보안을 제공하나 현실적 활용에는 비효율적.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide27: {
    "Concise Summary Notes":
      "📚 27. 참고 문헌: 암호학 및 정보 보안 이론 관련 주요 교재(Introduction to Modern Cryptography 등) 목록.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide28: {
    "Concise Summary Notes":
      "📖 28. 복습 슬라이드 1: 강의 전반 내용을 요약하며 핵심 개념을 정리하는 복습 페이지입니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide29: {
    "Concise Summary Notes":
      "📖 29. 복습 슬라이드 2: 암호화 유형별 비교 및 사례 정리를 포함한 추가 복습 자료.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide30: {
    "Concise Summary Notes":
      "🧩 30. 보안 문제 예제 1: 학습 내용을 기반으로 한 간단한 문제 풀이 예시.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide31: {
    "Concise Summary Notes":
      "🧩 31. 보안 문제 예제 2: 고급 수준의 암호 공격 사례와 방어 전략 관련 예시 문제.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
  slide32: {
    "Concise Summary Notes":
      "✅ 32. 정리 및 다음 강의 예고: 전체 강의 요약 및 다음 강의 주제 소개로 마무리됩니다.",
    "Bullet Point Notes": "",
    "Keyword Notes": "",
    "Chart/Table Summary": " ",
    Segments: {},
  },
};
