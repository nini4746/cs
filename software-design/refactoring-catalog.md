# 리팩토링 카탈로그 (Refactoring)

## 한 줄 요약

동작을 바꾸지 않고 내부 구조를 개선하는 것. 코드 냄새(smell)를 알아채고, 작고 안전한 단계로 개선한다. 테스트가 안전망이며, 기능 추가와 리팩토링을 섞지 않는다.

## 왜 필요한가

- 코드를 어떻게 개선하나 (깨지 않고)
- 코드 냄새를 어떻게 알아채나
- 안전한 리팩토링 순서

## 리팩토링이란

**외부 동작은 유지하며 내부 구조 개선** (Fowler):

- 기능 추가·버그 수정과 **분리** (리팩토링은 동작 안 바꿈)
- 목적: 가독성([[naming-and-readability]])·유지보수성·복잡도↓ ([[deep-modules]])
- "작동하는 코드를 왜 건드리나?" → 이해·수정 쉽게 (다음 변경을 위해)

## 코드 냄새 (code smells)

리팩토링이 필요하다는 신호:

- **긴 함수/큰 클래스**: 여러 일 (SRP 위반 [[solid]], 응집↓ [[coupling-cohesion]])
- **중복 코드**: 같은 로직 반복 (DRY 위반)
- **긴 파라미터 목록**: 인자 많음 ([[creational-patterns]] 빌더)
- **기능 편애(feature envy)**: 다른 클래스 데이터를 많이 씀 (결합↑ [[coupling-cohesion]])
- **원시 집착(primitive obsession)**: 도메인 개념을 원시 타입으로 (타입 만들기 programming-languages/[[type-systems-advanced]])
- **거대한 조건문**: 복잡한 if/switch (전략·상태 패턴 [[behavioral-patterns]])
- **주석으로 도배**: 코드가 불명확 ([[naming-and-readability]])
- **shotgun surgery**: 하나 바꾸면 여러 곳 (결합↑)

## 주요 리팩토링

냄새 → 대응 리팩토링:

- **함수 추출(extract function)**: 긴 함수를 이름 있는 작은 함수로 → 가장 흔함
- **이름 변경(rename)**: 불명확한 이름 개선 ([[naming-and-readability]])
- **변수 추출**: 복잡한 식을 이름 있는 변수로
- **조건문을 다형성으로**: switch → 전략/상태 ([[behavioral-patterns]], programming-languages/[[oop-under-the-hood]])
- **중복 제거**: 공통 추출
- **클래스 추출**: 큰 클래스를 응집 있는 것들로
- **매직 넘버를 상수로** ([[naming-and-readability]])

## 안전한 리팩토링

리팩토링의 위험 = 동작이 바뀌는 것 → 안전 장치:

### 테스트가 안전망

- **테스트 먼저**([[testing-strategy]]): 리팩토링 전 테스트 있어야 (동작 보존 확인)
- 각 단계 후 테스트 → 깨지면 즉시 발견
- 테스트 없으면 리팩토링 위험 (특성화 테스트부터)

### 작은 단계

- **한 번에 하나**: 작은 변경 + 테스트 반복 (큰 변경은 위험)
- 각 단계가 동작 보존 → 언제든 멈춰도 안전
- IDE 자동 리팩토링 활용 (rename, extract - 안전 보장)

### 기능과 분리

- **리팩토링 커밋과 기능 커밋 분리** (devops/[[git-internals]]): 리뷰·롤백 쉬움
- "리팩토링 + 기능 추가 동시" = 뭐가 문제인지 모름
- Fowler: "두 모자를 번갈아 쓰되 동시에 안 씀"

## 언제 리팩토링

- **기능 추가 전**: 추가하기 쉽게 먼저 정리 ("preparatory refactoring")
- **이해할 때**: 읽으며 개선 ("comprehension refactoring")
- **냄새 발견 시**: 보이스카웃 규칙 (왔을 때보다 깨끗하게)
- **과하지 않게**: 안 바뀔 코드는 그냥 둠 (리팩토링도 비용)

## 리팩토링 vs 재작성

- **리팩토링**: 점진적 개선 (안전, 지속)
- **재작성(rewrite)**: 처음부터 (위험 - Joel의 "최악의 실수")
- 대부분 리팩토링이 나음 (재작성은 기존 지식·엣지케이스 유실)

## 연결

- 가독성 → [[naming-and-readability]]
- 냄새 = 원칙 위반 → [[solid]], [[coupling-cohesion]]
- 조건문→패턴 → [[behavioral-patterns]], programming-languages/[[oop-under-the-hood]]
- 테스트 안전망 → [[testing-strategy]]
- 커밋 분리 → devops/[[git-internals]]
- 복잡도↓ → [[deep-modules]]

## 궁금한 것 (나중에)

- [ ] 특성화 테스트 (레거시 리팩토링 전)
- [ ] 대규모 리팩토링 (strangler fig)
- [ ] 리팩토링 자동화 도구
- [ ] 언제 재작성이 정당한가

## 출처

- Martin Fowler "Refactoring" (2판)
