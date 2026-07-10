# 분산 트랜잭션 (Distributed Transactions)

## 한 줄 요약

여러 노드에 걸친 원자적 연산. 2PC(2단계 커밋)가 고전이지만 blocking 문제가 있어, 실무는 saga 패턴으로 원자성을 포기하고 보상으로 대체한다. exactly-once는 멱등성으로 근사한다.

## 왜 필요한가

- 여러 서비스/DB에 걸친 작업을 어떻게 원자적으로
- 2PC의 문제와 saga 대안
- 마이크로서비스에서 트랜잭션 다루기

## 문제: 여러 노드의 원자성

한 DB의 트랜잭션(database/[[transactions-acid]])은 원자적. 하지만 **여러 노드/서비스**에 걸치면?

```
주문 서비스: 주문 생성
결제 서비스: 결제 처리
재고 서비스: 재고 차감
→ 셋 다 성공하거나 셋 다 안 되어야 (원자성)
```

부분 실패([[why-distributed]])로 일부만 성공하면 → 불일치 (결제됐는데 재고 안 빠짐).

## 2PC (Two-Phase Commit)

고전적 분산 원자 커밋 - **코디네이터**가 조율:

```
Phase 1 (prepare/vote):
  코디네이터 → 참여자들: "커밋 준비됐나?"
  참여자: 준비되면 "yes" (이후 커밋 보장, 락 유지)

Phase 2 (commit/abort):
  모두 yes → 코디네이터: "커밋해" → 모두 커밋
  하나라도 no → "abort" → 모두 롤백
```

- 모두 동의해야 커밋 → 원자성
- database/[[recovery]]의 로그로 각자 준비 상태 기록

### 2PC의 문제: blocking

- **코디네이터가 Phase 2 전에 죽으면**: 참여자들이 "yes" 한 채 **영원히 대기** (커밋? abort? 모름) → 락 유지 → blocking
- **동기·느림**: 모든 참여자 응답 대기 (가장 느린 것에 맞춤)
- **가용성 낮음**: 하나라도 죽으면 전체 막힘 (CP [[cap-theorem]])
- 3PC로 완화 시도하지만 복잡 → 실무에선 2PC를 피하는 추세

## saga 패턴

마이크로서비스의 실용 대안 - **원자성을 포기하고 보상으로**:

```
각 단계를 로컬 트랜잭션으로 순차 실행:
  주문 생성 → 결제 → 재고 차감
실패하면 → 보상 트랜잭션(compensating)으로 되돌림:
  재고 실패 → 결제 취소 → 주문 취소
```

- **원자성 없음**: 중간 상태가 잠깐 보임 (eventual consistency [[consistency-models]])
- **보상**: 각 단계에 "취소" 액션 정의 (환불, 재고 복원)
- **blocking 없음**: 각 로컬 트랜잭션은 독립, 락 짧음
- 두 종류: **coreography**(각 서비스가 이벤트로 반응, [[message-queues]]) vs **orchestration**(중앙 조율자)

트레이드오프: 원자성·격리 포기 (중간 상태 노출) ↔ 가용성·확장성.

## exactly-once는 멱등성으로

분산에서 "정확히 한 번"([[rpc]])은 불가능 → **멱등성으로 근사**:

- 재시도해도 안전하게 ([[idempotency]])
- saga 단계도 멱등이어야 (중복 실행/보상 안전)
- 메시지 처리도 멱등 ([[message-queues]])

## 실무: 트랜잭션 피하기

마이크로서비스 설계 원칙:

- **분산 트랜잭션 최소화**: 되도록 한 서비스/DB 안에서 (경계 잘 나누기)
- **saga로 느슨하게**: 꼭 여러 서비스면 saga + 보상 + 멱등
- **eventual consistency 수용**: 강한 원자성 대신 결국 일관 ([[consistency-models]])
- **2PC는 특수한 경우만**: 강한 일관성 필수 + 참여자 적을 때

## NewSQL의 접근

일부 시스템은 분산 트랜잭션을 강하게 지원:
- **Spanner, CockroachDB**: 2PC + 합의(Raft [[raft]]) + TrueTime([[clocks]]) → 분산인데 ACID
- 하지만 지연 비용 (전역 일관성은 비쌈)
- database/[[nosql-landscape]]의 NewSQL

## 셀프 체크

> [!question]- 2PC의 두 단계는 각각 무엇을 하나?
> Phase 1(prepare/vote): 코디네이터가 참여자들에게 "커밋 준비됐나?"를 묻고, 준비된 참여자는 "yes"로 이후 커밋을 보장하며 락을 유지한다. Phase 2(commit/abort): 모두 yes면 커밋 지시, 하나라도 no면 전체 롤백.

> [!question]- 2PC의 blocking 문제는 언제 발생하나?
> 참여자들이 "yes"를 보낸 뒤 **코디네이터가 Phase 2 전에 죽으면**, 참여자들은 커밋인지 abort인지 모른 채 영원히 대기하며 락을 유지한다. 그동안 가용성이 막힌다(CP).

> [!question]- saga가 포기하는 것과 그 대신 쓰는 것은?
> 원자성과 격리를 포기한다(중간 상태가 잠깐 보임 = eventual consistency). 대신 각 단계를 로컬 트랜잭션으로 순차 실행하고, 실패하면 **보상 트랜잭션(compensating)**으로 되돌린다(환불·재고 복원). 락이 짧아 blocking이 없다.

> [!question]- saga의 choreography와 orchestration 방식 차이는?
> choreography는 각 서비스가 이벤트에 반응해 다음 단계를 진행하는 분산 방식이다. orchestration은 중앙 조율자가 전체 흐름을 지시하는 방식이다.

> [!question]- 분산에서 exactly-once는 어떻게 근사하나?
> 진짜 "정확히 한 번"은 불가능하므로 **at-least-once 전달 + 멱등 처리**로 근사한다. saga 단계와 보상도 멱등이어야 중복 실행/보상이 안전하다.

## 연습문제

> [!example]- 문제: 2PC에서 코디네이터가 commit 결정을 내린 직후 죽었고 참여자들은 yes 상태로 대기 중이다. 무엇이 문제이고 어떻게 완화하나
> **풀이**
> 1. 참여자들은 코디네이터의 최종 결정(commit/abort)을 받지 못해 락을 쥔 채 무한 대기 → blocking.
> 2. 참여자끼리 서로 물어봐도, 결정을 아무도 못 받았다면 안전하게 진행할 수 없다(누군가는 이미 커밋했을 수 있음).
> 3. 완화: 코디네이터가 결정을 database/recovery의 로그에 먼저 기록 → 재시작 후 결정을 복구해 참여자에게 재전달.
> 4. 근본 대안: 참여자 간 blocking을 줄이려는 3PC가 있으나 복잡하고 완전하지 않아, 실무는 saga로 2PC 자체를 피하는 추세.

> [!example]- 문제: 주문→결제→재고 세 마이크로서비스 작업에 2PC와 saga 중 무엇을 쓸지 판정하라
> **풀이**
> 1. 2PC 검토: 세 서비스가 락을 쥔 채 동기 대기 → 가장 느린 것에 맞춰지고, 하나만 죽어도 전체가 막힌다(가용성↓).
> 2. saga 검토: 각 단계를 로컬 트랜잭션으로 실행, 실패 시 보상으로 되돌림 → blocking 없고 확장성↑, 대신 중간 상태 노출(eventual).
> 3. 판정: 마이크로서비스 경계를 넘는 이 작업은 **saga**가 적합. 각 단계와 보상을 멱등하게 설계.
> 4. 예외: 강한 일관성이 필수이고 참여자가 적을 때만 2PC를 고려.

> [!example]- 문제: saga로 주문→결제→재고를 진행하다 재고 차감에서 실패했다. 어떻게 복구하나
> **풀이**
> 1. 실패 지점: 재고 차감 실패 → 이미 성공한 앞 단계들을 되돌려야 한다.
> 2. 보상 실행(역순): 결제 취소(환불) → 주문 취소.
> 3. 각 보상은 **멱등**해야 한다. 재시도로 환불이 두 번 나가면 안 되므로 멱등 키/조건부로 방어.
> 4. 결과: 원자성은 없지만 보상을 통해 결국 일관된 상태(eventual consistency)로 수렴.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
>
> 1. 2PC의 두 단계와 blocking이 생기는 정확한 시점을 그림으로 설명할 수 있나.
> 2. saga가 원자성을 포기하고 보상으로 대체하는 트레이드오프(가용성·확장성 ↔ 중간 상태 노출)를 말할 수 있나.
> 3. exactly-once를 at-least-once + 멱등으로 근사하는 이유와, saga 단계가 왜 멱등이어야 하는지 설명할 수 있나.

## 연결

- 단일 DB 트랜잭션 → database/[[transactions-acid]]
- 부분 실패 → [[why-distributed]]
- 2PC blocking, CP → [[cap-theorem]]
- eventual consistency → [[consistency-models]]
- 멱등성 → [[idempotency]], [[rpc]]
- saga 이벤트 → [[message-queues]]
- 로그 (prepare) → database/[[recovery]]
- 합의 기반 (Spanner) → [[raft]]

## 궁금한 것 (나중에)

- [ ] saga orchestration 프레임워크 (Temporal, Cadence)
- [ ] 3PC가 blocking을 줄이는 (실패하는) 법
- [ ] Spanner의 분산 트랜잭션 상세
- [ ] outbox 패턴 (트랜잭션 + 메시지)

## 출처

- MIT 6.824, "DDIA" 9장, saga 패턴 (Garcia-Molina)
