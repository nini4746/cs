# 멱등성 (Idempotency)

## 한 줄 요약

같은 연산을 여러 번 실행해도 결과가 한 번과 같은 성질. 분산 시스템의 재시도 안전성을 보장하는 핵심 도구 - 네트워크 불확실성 속에서 exactly-once를 근사한다.

## 왜 필요한가

- 분산 시스템 전반에서 계속 나온 개념의 종합
- 재시도가 왜 위험하고 멱등성이 어떻게 구하나
- 멱등 키 구현

## 멱등성 정의

**f(f(x)) = f(x)** - 여러 번 적용해도 한 번과 같음:

```
멱등: "잔액을 100으로 설정" → 여러 번 해도 100 (같음)
비멱등: "잔액에서 100 차감" → 여러 번 하면 계속 줄어듦 (다름)
```

web/[[rest-design]]의 PUT(멱등) vs POST(비멱등)의 그 개념.

## 왜 분산에서 필수

부분 실패([[why-distributed]])와 재시도의 만남:

```
요청 보냄 → 응답 없음 ([[rpc]]의 모호성)
  → 재시도? 
    - 실제론 성공했는데 응답만 손실 → 재시도로 중복 실행!
    - 비멱등이면 (이체) → 두 번 이체 (재앙)
    - 멱등이면 → 두 번 해도 한 번 효과 (안전)
```

**멱등성 = 재시도 안전성**. 네트워크가 불확실하니 재시도는 필수인데, 재시도가 안전하려면 멱등해야.

## 지금까지 나온 곳 (종합)

멱등성이 분산 시스템 전반의 핵심:

- **RPC**([[rpc]]): at-least-once + 멱등 = exactly-once 근사
- **분산 트랜잭션**([[distributed-transactions]]): saga 단계·보상이 멱등해야
- **메시지 큐**([[message-queues]]): at-least-once 소비를 멱등 처리로
- **복구**(database/[[recovery]]): redo/undo가 멱등 (여러 번 해도 안전)
- **REST**(web/[[rest-design]]): PUT/DELETE 멱등
- 이 노트가 그 종합.

## 자연히 멱등인 연산

- **설정(set)**: `x = 5` (몇 번 해도 5)
- **삭제(delete)**: 이미 없으면 그대로
- **삽입 with 고유 키**: 중복 키면 무시/에러
- **max/min 갱신**: `x = max(x, 5)`

## 비멱등을 멱등으로: 멱등 키

**증분·생성 같은 비멱등 연산**을 안전하게 (web/[[rest-design]]):

```
1. 클라이언트가 요청마다 고유 ID(Idempotency-Key) 부여
2. 서버가 그 ID를 기록 (처리했나)
3. 재시도(같은 ID) → 이미 처리했으면 → 저장된 결과 반환 (재실행 안 함)
```

- 결제 API의 표준 (Stripe 등): 같은 멱등 키면 중복 결제 안 됨
- 서버가 ID → 결과 매핑 저장 (data-structures/[[hash-tables]], 일정 기간)
- **중복 제거(dedup)**: 이미 본 요청 ID면 스킵

## 멱등성 설계 패턴

- **자연 멱등 선호**: 가능하면 set/upsert로 설계 (increment 대신)
- **멱등 키**: 비멱등 연산엔 클라이언트 생성 ID
- **버전/조건부**: "버전 5일 때만 갱신" (낙관적, 재시도 시 이미 갱신됐으면 무시) → database/[[mvcc]]
- **고유 제약**: DB 유니크 키로 중복 삽입 방지 (database/[[relational-model]])

## 정확히 한 번 (exactly-once) 재고

"정확히 한 번"은 불가능([[rpc]])하지만 **효과적 exactly-once**:

```
at-least-once 전달 (재시도로 유실 방지)
  + 멱등 처리 (중복 효과 제거)
= 효과적으로 정확히 한 번
```

- 전달은 여러 번일 수 있지만 **효과는 한 번** → 실용적 exactly-once
- 분산 시스템의 현실적 해법 ([[message-queues]], [[distributed-transactions]])

## 연결

- 부분 실패 → [[why-distributed]]
- RPC 의미론 → [[rpc]]
- saga 보상 → [[distributed-transactions]]
- 메시지 처리 → [[message-queues]]
- REST 멱등 → web/[[rest-design]]
- 복구 redo/undo → database/[[recovery]]
- 조건부 갱신 → database/[[mvcc]]
- 고유 제약 → database/[[relational-model]]

## 궁금한 것 (나중에)

- [ ] 멱등 키 저장 기간·정리
- [ ] Kafka 멱등 프로듀서 구현
- [ ] outbox 패턴과 멱등성
- [ ] 멱등성 vs 결정성(determinism) 차이

## 출처

- "DDIA", Stripe 멱등성 API 설계, web/[[rest-design]]
