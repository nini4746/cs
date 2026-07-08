# TDD (테스트 주도 개발)

## 한 줄 요약

테스트를 먼저 쓰고 통과시키는 개발 방식 - Red(실패 테스트)→Green(통과)→Refactor(개선) 사이클. 설계를 유도하고 안전망을 만들지만, 만능은 아니며 적합한 상황과 아닌 상황이 있다.

## 왜 필요한가

- TDD가 정확히 뭔가 (테스트 먼저)
- Red-Green-Refactor 사이클
- 언제 효과 있고 언제 아닌가

## TDD 사이클

**테스트를 코드보다 먼저** (Kent Beck):

```
1. Red: 실패하는 테스트 작성 (아직 기능 없음 → 실패)
2. Green: 테스트를 통과하는 최소 코드 작성 (일단 통과만)
3. Refactor: 통과 유지하며 코드 개선 ([[refactoring-catalog]])
→ 반복 (작은 단위로)
```

- 테스트가 **명세** 역할 (무엇을 만들지 먼저 정의)
- 작은 단계 (하나의 작은 기능씩)
- 각 사이클이 몇 분

## 왜 테스트 먼저

거꾸로(코드 먼저, 테스트 나중)와 대조:

- **설계 유도**: 테스트를 먼저 쓰면 "어떻게 쓸까"(인터페이스)를 먼저 생각 → 쓰기 쉬운 API ([[api-design-principles]])
- **테스트 가능한 설계**: 테스트 먼저면 자연히 결합 낮은 코드 ([[coupling-cohesion]], DI [[solid]])
- **YAGNI**: 테스트가 요구하는 것만 구현 (과설계 방지)
- **안전망 보장**: 모든 코드가 테스트를 가짐 (나중에 하면 빠뜨림)
- **빠른 피드백**: 즉시 검증

## 효과 있는 경우

- **명확한 요구사항**: 무엇을 만들지 알 때 (테스트로 표현 가능)
- **로직 중심**: 알고리즘·비즈니스 규칙 (입력→출력 명확)
- **회귀 위험**: 자주 바뀌는 핵심 코드
- **리팩토링 예정**: 안전망 필요 ([[refactoring-catalog]])
- 순수 함수(programming-languages/[[functional-programming]]) - 테스트 쓰기 쉬움

## 효과 적은/어려운 경우

TDD가 만능이 아님:

- **탐색적 개발**: 무엇을 만들지 모를 때 (프로토타입) → 테스트 먼저 못 씀
- **UI·시각적**: 정답이 주관적 (테스트로 표현 어려움)
- **외부 의존 많음**: 목만 잔뜩 → 구현 테스트 (의미 적음 [[testing-strategy]])
- **성능·탐구**: 실험이 목적
- 이럴 땐 코드 먼저, 테스트는 안정된 후

## 오해와 비판

- **"TDD = 100% 커버리지"**: 아님 - 가치 있는 것만 ([[testing-strategy]]의 과도한 테스트 경계)
- **"TDD가 항상 낫다"**: 아님 - 상황 의존 (DHH의 "TDD is dead" 논쟁)
- **테스트에 묶임**: 구현 세부를 테스트하면 리팩토링 시 다 깨짐 → 동작 테스트 ([[testing-strategy]])
- TDD는 **도구지 종교 아님** - 맞는 곳에

## 관련 실천법

- **BDD**(행위 주도): 테스트를 자연어 시나리오로 (Given-When-Then) - 비개발자 소통
- **테스트 우선 vs 테스트 나중**: 둘 다 테스트는 필요, 순서만 다름
- **red-green-refactor**의 refactor가 핵심 - TDD가 설계를 지속 개선

## 실전 균형

- **핵심 로직엔 TDD**: 알고리즘·규칙 (명확·중요)
- **탐색엔 유연하게**: 프로토타입 후 테스트
- **결국 테스트는 필요**([[testing-strategy]]): TDD든 아니든 안전망은 있어야
- 팀·상황에 맞게 (강제보다 판단)

## 연결

- 테스트 전략 → [[testing-strategy]]
- refactor 단계 → [[refactoring-catalog]]
- 설계 유도 (DI·결합) → [[solid]], [[coupling-cohesion]]
- API 설계 → [[api-design-principles]]
- 순수 함수 테스트 → programming-languages/[[functional-programming]]
- 테스트=버그 존재 → algorithms/[[correctness-proofs]]

## 궁금한 것 (나중에)

- [ ] "TDD is dead" 논쟁 (DHH vs Beck vs Fowler)
- [ ] BDD와 Cucumber
- [ ] 런던파 vs 시카고파 TDD (목 vs 상태)
- [ ] 레거시에 TDD 도입

## 출처

- Kent Beck "Test-Driven Development", "Is TDD Dead?" 대담
