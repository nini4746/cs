# DDD 기초 (Domain-Driven Design)

## 한 줄 요약

복잡한 비즈니스 도메인을 소프트웨어 설계의 중심에 두는 접근. 유비쿼터스 언어(공통 용어), bounded context(경계), aggregate(일관성 단위)가 핵심 개념. 마이크로서비스 경계 설정의 이론적 기반.

## 왜 필요한가

- 복잡한 도메인을 어떻게 모델링하나
- 마이크로서비스 경계를 어디에 긋나
- 비즈니스와 코드의 간극 좁히기

## DDD의 전제

Eric Evans의 접근: **복잡한 소프트웨어의 어려움은 기술이 아니라 도메인(업무)에 있다**:

- 은행·물류·의료의 진짜 복잡함은 코드가 아니라 **업무 규칙**
- 그래서 **도메인을 설계 중심에** (기술이 아니라)
- 개발자와 도메인 전문가가 협력해 모델을 만듦

## 유비쿼터스 언어 (ubiquitous language)

**개발자와 도메인 전문가가 같은 용어** 사용:

- 코드·대화·문서가 같은 단어 (번역 없이)
- 예: 도메인 전문가가 "주문 확정"이라 하면 코드도 `confirmOrder()` (내부적으로 `updateStatus(2)` 아니라)
- 용어 불일치 = 오해·버그의 근원
- [[naming-and-readability]]의 이름 짓기가 도메인 언어와 일치

## Bounded Context (경계 컨텍스트)

핵심 개념 - **모델의 경계**:

- 같은 단어가 컨텍스트마다 다른 의미
- 예: "상품(Product)"이 판매 컨텍스트(가격·재고)와 배송 컨텍스트(무게·크기)에서 다름
- 각 컨텍스트가 자기 모델 (하나의 거대 통합 모델 대신)
- 컨텍스트 간 명확한 인터페이스 (번역 계층)

### 마이크로서비스 경계

Bounded context가 **마이크로서비스 분해의 기준** ([[monolith-vs-microservices]]):
- 서비스 = bounded context (자연스러운 경계)
- 함께 바뀌는 것이 한 컨텍스트 (응집 [[coupling-cohesion]])
- 잘못된 경계 = 분산 모놀리스 ([[monolith-vs-microservices]]의 실수)
- DDD가 "어디서 나눌까"의 답

## 전술 패턴 (개념만)

도메인 모델의 구성 요소:

- **엔티티(entity)**: 식별자로 구별 (User - id로 동일성). 상태 변함
- **값 객체(value object)**: 값으로 구별 (Money - 같은 금액이면 같음). 불변 (programming-languages/[[functional-programming]]의 불변성)
- **aggregate**: 함께 변하는 객체 묶음 + 루트 (일관성 경계)
  - aggregate 루트를 통해서만 접근 (내부 캡슐화 [[deep-modules]])
  - **트랜잭션 경계**: 한 aggregate = 한 트랜잭션 (database/[[transactions-acid]]) → 마이크로서비스에서 중요
- **repository**: aggregate 저장·조회 추상 (DB 감춤, [[layered-architecture]]의 데이터 계층)
- **domain service**: 엔티티에 안 맞는 도메인 로직
- **domain event**: 도메인에서 일어난 사건 → [[event-driven-architecture]]

## 전략 설계

큰 그림 (context 간 관계):
- **context map**: bounded context들의 관계도
- **anti-corruption layer**: 외부/레거시 모델이 내 도메인을 오염 안 시키게 번역 ([[structural-patterns]]의 어댑터)

## 언제 DDD

- **복잡한 도메인**: 업무 규칙이 진짜 복잡할 때 (은행, 보험, 물류)
- **오래 갈 시스템**: 도메인 이해가 자산
- **과함**: 단순 CRUD엔 DDD 오버엔지니어링 ([[deep-modules]] 경계) - 유비쿼터스 언어 정도만 취하기도
- 전술 패턴 다 쓸 필요 없음 (필요한 개념만)

## 실용적 취사선택

- **유비쿼터스 언어**: 거의 항상 유용 (용어 일치)
- **bounded context**: 마이크로서비스·큰 시스템에
- **aggregate**: 일관성·트랜잭션 경계 중요할 때
- 나머지는 도메인 복잡도에 따라

## 연결

- 마이크로서비스 경계 → [[monolith-vs-microservices]]
- 이름·언어 → [[naming-and-readability]]
- 값 객체 불변 → programming-languages/[[functional-programming]]
- aggregate = 트랜잭션 경계 → database/[[transactions-acid]]
- repository = 데이터 계층 → [[layered-architecture]]
- domain event → [[event-driven-architecture]]
- anti-corruption = 어댑터 → [[structural-patterns]]
- 응집 → [[coupling-cohesion]]

## 궁금한 것 (나중에)

- [ ] aggregate 설계 규칙 (작게 유지)
- [ ] context mapping 패턴 (partnership, conformist 등)
- [ ] event storming (도메인 탐색 워크숍)
- [ ] CQRS/이벤트 소싱과 DDD → [[event-driven-architecture]]

## 출처

- Eric Evans "Domain-Driven Design", Vaughn Vernon "Implementing DDD"
