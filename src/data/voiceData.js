// /src/data/voiceData.js

export const voiceData = {
  1: [
    {
      id: "1-1",
      text: "안녕하세요, 오늘은 정보 보안 개론에 대해 배우겠습니다. 정보 보안이란 무엇인지, 주요 개념과 기본 용어들을 살펴볼 예정입니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "1-2",
      text: "정보 보안이란 CIA 트라이어드로 요약됩니다. 기밀성(Confidentiality), 무결성(Integrity), 가용성(Availability)의 세 요소를 보장하는 것이 핵심입니다.",
      isImportant: true,
      reason: "시험에 반드시 나오는 CIA 트라이어드 개념입니다.",
      linkedConcept: "CIA 보장 메커니즘",
      pageNumber: 5,
    },
    {
      id: "1-3",
      text: "기밀성은 데이터가 인가된 사용자만 접근할 수 있도록 하는 속성입니다. 무결성은 데이터가 인가되지 않은 방식으로 변경되지 않았음을 보장하는 속성입니다. 가용성은 인가된 사용자가 필요할 때 시스템이 이용 가능해야 함을 의미합니다. 그 외에도 진위성(Authenticity)과 책임 추적성(Accountability)이 추가되기도 합니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "1-4",
      text: "이제 보안 관련 주요 용어들을 살펴보겠습니다. Adversary는 시스템을 공격하는 위협 행위자를 의미합니다. Attack은 위협으로부터 유래된 시스템 보안에 대한 공격 행위입니다. Countermeasure는 위협이나 취약점을 줄이기 위한 대책을 말합니다.",
      isImportant: true,
      reason: "시험에 출제하신다고 강조하셨습니다.",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "1-5",
      text: "Risk는 특정 위협이 특정 취약점을 이용해 손해를 끼칠 확률을 의미합니다. Security Policy는 민감하고 중요한 자산 보호를 위한 규칙과 관행입니다. Threat는 보안을 위반할 수 있는 잠재적 가능성을 뜻합니다. Vulnerability는 시스템 설계 또는 운영상 약점을 말합니다.",
      isImportant: true,
      reason:
        "교수님께서 이 용어들은 시험에 빈출된다고 특별히 강조하셨으며, 정확한 정의를 암기해야 한다고 말씀하셨습니다.",
      linkedConcept: "",
      pageNumber: null,
    },
  ],
  2: [
    {
      id: "2-1",
      text: "이 페이지에서는 보안 개념 및 상호 관계에 대해 살펴보겠습니다. 보안 요소들 간의 관계를 이해하는 것이 중요합니다. 이러한 개념적 이해가 없으면 보안 시스템을 제대로 설계할 수 없습니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "2-2",
      text: "취약점이 있고 이를 위협이 공격하면 위험이 발생합니다. 그리고 이 위험에 대응하기 위한 대책을 수립합니다. 이러한 관계를 잘 이해해야 효과적인 보안 정책을 수립할 수 있습니다.",
      isImportant: true,
      reason:
        "시험에 자주 출제되는 중요 개념입니다. 취약점-위협-위험-대책의 인과관계는 보안 프레임워크 설계의 기초가 됩니다.",
      linkedConcept: "위험 관리 프레임워크",
      pageNumber: 7,
    },
  ],
  3: [
    {
      id: "3-1",
      text: "이번 페이지에서는 취약점, 공격, 대책의 유형에 대해 살펴보겠습니다. 시스템 취약점은 무결성 손상, 기밀성 누출, 가용성 상실로 나타날 수 있습니다. 각 취약점 유형에 따라 대응 방식도 달라집니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "3-2",
      text: "공격은 수동적 공격과 능동적 공격으로 나눌 수 있습니다. 수동적 공격은 정보를 획득하는 데 중점을 두며, 능동적 공격은 시스템이나 데이터를 변경하는 데 중점을 둡니다.",
      isImportant: true,
      reason:
        "교수님께서 시험에 반드시 나온다고 강조하신 부분입니다. 예시를 들어 자세히 설명했습니다.",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "3-3",
      text: "또한 내부자 공격과 외부자 공격으로 구분할 수도 있습니다. 내부자 공격은 권한을 가진 사용자에 의한 공격으로, 탐지하기 어렵고 피해가 클 수 있습니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "3-4",
      text: "대책은 예방, 탐지, 복구의 세 단계로 구성됩니다. 예방은 공격을 사전에 방지하는 것, 탐지는 공격이 발생했을 때 이를 감지하는 것, 복구는 공격 후 시스템을 원래 상태로 되돌리는 것을 의미합니다.",
      isImportant: true,
      reason:
        "시험에 자주 출제되는 보안 대책의 3단계입니다. 이 개념은 실제 보안 시스템 구현에 필수적이라고 강조하셨습니다.",
      linkedConcept: "",
      pageNumber: null,
    },
  ],
  4: [
    {
      id: "4-1",
      text: "이번 페이지에서는 컴퓨터 보안의 범위에 대해 다루겠습니다. 보안은 시스템, 구성 요소, 운영 절차 등 다양한 영역에 적용됩니다. 이러한 요소들이 모두 적절히 보호되어야 전체 시스템이 안전하다고 할 수 있습니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "4-2",
      text: "조직 내에서 보안은 계층적으로 구성되어야 효과적입니다. 물리적 보안, 네트워크 보안, 애플리케이션 보안, 데이터 보안 등 여러 층의 보안이 함께 작동해야 합니다.",
      isImportant: true,
      reason:
        "시험에 출제된다고 특별히 강조하신 개념입니다. 방어 계층화(Defense in Depth) 원칙은 현대 보안 설계의 핵심입니다.",
      linkedConcept: "",
      pageNumber: null,
    },
  ],
  5: [
    {
      id: "5-1",
      text: "보안 설계의 기본 원칙에 대해 알아보겠습니다. 이러한 원칙들은 시스템 설계 시 반드시 고려해야 할 사항들입니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "5-2",
      text: "최소 권한의 원칙(Principle of least privilege)은 사용자나 프로세스가 작업 수행에 필요한 최소한의 권한만 부여받아야 한다는 것입니다.",
      isImportant: true,
      reason:
        "시험에 자주 출제되는 보안 설계 원칙입니다. 이 원칙이 침해 사고의 영향 범위를 최소화한다고 강조하셨습니다.",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "5-3",
      text: "모듈화(Modularity)는 시스템을 독립적인 구성 요소로 나누어 설계하는 것입니다. 이렇게 하면 한 부분의 취약점이 전체 시스템에 미치는 영향을 제한할 수 있습니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "5-4",
      text: "계층화(Layering)는 여러 방어 계층을 구축하여 하나의 방어 메커니즘이 실패해도 다른 계층이 보호를 제공하도록 하는 것입니다.",
      isImportant: true,
      reason:
        "교수님께서 시험에 중요하게 다룰 것이라고 특별히 언급하신 개념입니다. 방어 계층화는 현대 보안 아키텍처의 핵심 원칙입니다.",
      linkedConcept: "방어 계층화 구현",
      pageNumber: 4,
    },
  ],
  6: [
    {
      id: "6-1",
      text: "공격 표면에 대해 살펴보겠습니다. 공격 표면은 시스템이 공격에 노출될 수 있는 모든 지점을 말합니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "6-2",
      text: "네트워크 공격 표면은 외부와 연결되는 모든 네트워크 인터페이스, 포트, 프로토콜 등을 포함합니다. 이 부분은 방화벽, IDS/IPS 등으로 보호해야 합니다.",
      isImportant: true,
      reason:
        "시험에 자주 출제되는 공격 표면 개념입니다. 네트워크 공격 표면 감소가 보안 강화의 핵심 전략이라고 강조하셨습니다.",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "6-3",
      text: "소프트웨어 공격 표면은 애플리케이션의 입력값, API, 설정 등을 포함합니다. 이 부분은 입력값 검증, 코드 검토 등으로 보호해야 합니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "6-4",
      text: "인적 공격 표면은 사회공학적 공격에 취약한 조직 구성원을 포함합니다. 이 부분은 교육, 인식 제고 등으로 보호해야 합니다.",
      isImportant: true,
      reason:
        "교수님께서 특별히 강조하신 부분으로, 실제 보안 사고의 대부분이 인적 요소에서 시작된다고 설명하셨습니다.",
      linkedConcept: "",
      pageNumber: null,
    },
  ],
  7: [
    {
      id: "7-1",
      text: "보안 전략에 대해 살펴보겠습니다. 효과적인 보안 전략은 조직의 목표와 리소스를 고려하여 수립되어야 합니다.",
      isImportant: false,
      reason: "",
      linkedConcept: "",
      pageNumber: null,
    },
    {
      id: "7-2",
      text: "보안 전략은 보안 정책 수립, 구현, 보장, 평가의 4단계로 나눌 수 있습니다. 각 단계는 순차적으로 진행되며, 지속적인 개선을 위해 반복될 수 있습니다.",
      isImportant: true,
      reason:
        "시험에 출제된다고 강조하신 보안 전략의 4단계입니다. 이 체계적인 접근 방식이 효과적인 보안 관리의 핵심입니다.",
      linkedConcept: "",
      pageNumber: null,
    },
  ],
};
