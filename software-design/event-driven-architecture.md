# 이벤트 기반 아키텍처 (Event-Driven Architecture)

## 한 줄 요약

컴포넌트가 이벤트를 발행·구독해 느슨하게 통신하는 구조. 강한 결합의 직접 호출 대신 이벤트로 반응한다. CQRS·이벤트 소싱이 확장이며, 비동기의 복잡도가 대가.

## 왜 필요한가

- 직접 호출(강결합) 대신 이벤트로
- CQRS·이벤트 소싱이 뭔가
- 옵서버 패턴의 아키텍처 규모 버전

## 이벤트 기반이란

컴포넌트가 **이벤트를 발행하고, 관심 있는 쪽이 구독**해 반응:

```
직접 호출 (강결합):
  주문 서비스 → 결제 호출 → 재고 호출 → 알림 호출  (주문이 다 알아야)

이벤트 기반 (느슨):
  주문 서비스 → "주문 생성됨" 이벤트 발행
  결제·재고·알림이 각자 구독해 반응 (주문은 누가 듣는지 모름)
```

- **옵서버 패턴**([[behavioral-patterns]])의 시스템/아키텍처 규모 버전
- distributed-systems/[[message-queues]]의 pub/sub이 인프라
- **느슨한 결합**([[coupling-cohesion]]): 발행자가 구독자를 모름 → 독립 추가·변경

## 이점

- **결합↓**: 새 구독자 추가 시 발행자 안 건드림 (OCP [[solid]])
- **확장성**: 비동기 → 발행자가 안 기다림 (distributed-systems/[[message-queues]]의 버퍼링)
- **탄력성**: 구독자 하나 죽어도 이벤트는 큐에 (나중 처리)
- **감사·재생**: 이벤트 로그 (아래 이벤트 소싱)

## CQRS (명령-조회 책임 분리)

**쓰기(command)와 읽기(query)를 분리**:

```
쓰기 모델: 명령 처리, 정규화 (database/[[normalization]])
읽기 모델: 조회 최적화, 역정규화 (읽기 전용 뷰)
둘을 이벤트로 동기화
```

- 쓰기·읽기 요구가 다를 때 (쓰기 정합성 vs 읽기 성능)
- 읽기 모델을 여러 개 (용도별 뷰)
- 이벤트로 읽기 모델 갱신 (eventual consistency distributed-systems/[[consistency-models]])
- 복잡도↑ → 정말 필요할 때만

## 이벤트 소싱 (event sourcing)

**상태 대신 이벤트를 저장** - 현재 상태는 이벤트를 재생해 계산:

```
전통: 현재 잔액 저장 (100)
이벤트 소싱: [입금 50, 출금 30, 입금 80] 저장 → 재생하면 잔액 100
```

- **완전한 이력**: 모든 변경이 이벤트로 (감사·디버깅)
- **시간 여행**: 과거 상태 재구성 (특정 시점 재생)
- database/[[recovery]]의 WAL, distributed-systems/[[message-queues]]의 로그와 같은 "로그가 진실" 발상
- 스냅샷으로 재생 최적화 (매번 처음부터 안 하게)
- 복잡도·저장 비용 대가

## 대가: 비동기 복잡도

이벤트 기반의 비용 (distributed-systems 문제들):

- **비동기 추론 어려움**: 흐름이 이벤트로 흩어짐 → 추적 어려움 (distributed-systems/[[observability-basics]])
- **eventual consistency**: 즉시 반영 안 됨 (distributed-systems/[[consistency-models]])
- **순서·중복**: at-least-once → 멱등 처리(distributed-systems/[[idempotency]])
- **디버깅**: "왜 이 일이 일어났나"를 이벤트 체인으로 추적
- **테스트**: 비동기 흐름 테스트 어려움 ([[testing-strategy]])

## 언제 쓰나

- **느슨한 결합 필요**: 여러 컴포넌트가 한 사건에 반응 (마이크로서비스 [[monolith-vs-microservices]])
- **비동기가 자연스러움**: 알림·집계·파이프라인
- **감사·이력 중요**: 이벤트 소싱 (금융, 규제)
- **과함**: 단순 CRUD엔 이벤트·CQRS·소싱 오버엔지니어링 ([[deep-modules]] 경계)

## 연결

- 옵서버 (패턴 버전) → [[behavioral-patterns]]
- pub/sub 인프라 → distributed-systems/[[message-queues]]
- 결합↓ → [[coupling-cohesion]]
- eventual consistency → distributed-systems/[[consistency-models]]
- 멱등성 → distributed-systems/[[idempotency]]
- 로그=진실 → database/[[recovery]]
- 마이크로서비스 → [[monolith-vs-microservices]]
- 관측성 → distributed-systems/[[observability-basics]]

## 궁금한 것 (나중에)

- [ ] 이벤트 소싱 + CQRS 조합
- [ ] saga와 이벤트 기반 (distributed-systems/[[distributed-transactions]])
- [ ] 이벤트 스키마 진화 (버저닝)
- [ ] outbox 패턴 (DB 트랜잭션 + 이벤트)

## 출처

- "Building Event-Driven Microservices", Fowler (Event Sourcing/CQRS)
