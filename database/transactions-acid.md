# 트랜잭션과 ACID (Transactions and ACID)

## 한 줄 요약

트랜잭션은 여러 연산을 하나의 논리적 단위로 묶는다. ACID(원자성·일관성·격리성·내구성)가 그 보장이다. 은행 이체가 중간에 멈춰도 돈이 사라지지 않는 이유.

## 왜 필요한가

- 왜 여러 연산을 하나로 묶어야 하나
- ACID 각 글자의 정확한 의미
- DB가 크래시·동시성에도 데이터를 지키는 법

## 문제: 부분 실행

은행 이체 = "A에서 빼고 B에 더하기" 두 연산:

```
1. A 잔액 -= 100
2. B 잔액 += 100
```

1번 후 크래시나면? A는 줄었는데 B는 안 늘음 → **돈 증발**. 두 연산이 **전부 되거나 전부 안 되어야** → 트랜잭션.

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = A;
  UPDATE accounts SET balance = balance + 100 WHERE id = B;
COMMIT;   -- 여기까지 다 성공해야 반영, 아니면 ROLLBACK
```

## ACID

트랜잭션의 네 가지 보장:

### A - 원자성 (Atomicity)

**전부 아니면 전무**. 트랜잭션의 모든 연산이 다 반영되거나(commit) 하나도 안 됨(rollback):

- 중간 크래시 → 이미 한 것도 되돌림 (rollback)
- 구현: WAL(undo 로그) → [[recovery]]
- 위 이체가 부분 실행 안 되는 보장

### C - 일관성 (Consistency)

트랜잭션 전후로 **무결성 제약이 유지**됨:

- 제약(외래 키, CHECK, [[relational-model]]) 위반하는 트랜잭션은 거부
- "총 잔액 불변" 같은 불변식 유지 (앱+DB 협력)
- 다른 셋과 성격이 다름 (앱 로직 의존, DB만의 보장 아님)

### I - 격리성 (Isolation)

**동시 트랜잭션이 서로 간섭 안 함**:

- 여러 트랜잭션이 동시 실행돼도, 마치 순차 실행한 것 같은 결과
- 완벽한 격리(serializable)는 비쌈 → 격리 수준으로 타협 → [[concurrency-control]]
- os/[[threads-and-races]]의 경쟁 조건을 DB 레벨에서 다룸

### D - 내구성 (Durability)

**commit되면 크래시에도 살아남음**:

- commit 응답 받으면 디스크에 확실히 (전원 나가도 유지)
- 구현: WAL을 fsync로 디스크에 강제 → [[recovery]], os/[[crash-consistency]]
- "성공했다"고 하면 진짜 저장된 것

## 왜 어려운가: 두 적

ACID의 두 위협:

1. **크래시** (원자성·내구성): 중간에 전원 나감 → WAL로 해결 ([[recovery]])
2. **동시성** (격리성): 여러 트랜잭션 겹침 → 락·MVCC로 해결 ([[concurrency-control]], [[mvcc]])

이 둘이 트랜잭션 구현의 핵심 난제. 나머지 트랜잭션 노트가 각각 다룸.

## 트랜잭션 상태

```
활성(active) → 부분 완료 → COMMIT (완료) → 디스크 반영
            ↘ 실패 → ABORT → ROLLBACK (되돌림)
```

- **commit**: 모든 변경 확정, 내구성 보장
- **rollback/abort**: 모든 변경 취소 (undo)
- 오류·데드락([[concurrency-control]])·명시적 요청으로 abort

## 실무 관점

- **트랜잭션 범위 최소화**: 길면 락 오래 잡아 동시성↓ ([[concurrency-control]])
- **적절한 격리 수준**: 강할수록 안전하지만 느림 → [[concurrency-control]]
- **재시도**: 데드락·직렬화 실패 시 앱이 재시도 (트랜잭션은 원자적이라 안전)
- 분산 트랜잭션은 훨씬 어려움 → distributed-systems/[[distributed-transactions]]

## 셀프 체크

> [!question]- ACID 네 글자는 각각 무엇을 보장하며, 원자성과 내구성은 무엇으로 구현되나?
> A(원자성)는 전부 아니면 전무, C(일관성)는 트랜잭션 전후 무결성 제약 유지, I(격리성)는 동시 트랜잭션이 순차 실행한 듯 서로 간섭 안 함, D(내구성)는 commit되면 크래시에도 살아남음이다. 원자성(undo)과 내구성(fsync)은 모두 WAL로 구현된다.

> [!question]- ACID의 "두 적"은 무엇이고 각각 어떤 보장을 위협하며 무엇으로 막나?
> 크래시는 원자성·내구성을 위협하고 WAL(recovery)로 막는다. 동시성은 격리성을 위협하고 락·MVCC(concurrency-control)로 막는다. 이 둘이 트랜잭션 구현의 핵심 난제다.

> [!question]- C(일관성)가 나머지 셋과 성격이 다른 이유는?
> A·I·D는 DB가 자체적으로 보장하지만, C는 "총 잔액 불변" 같은 불변식을 앱 로직이 정의하고 DB의 제약(외래 키·CHECK)과 협력해 유지하는 것이라 앱 책임에 의존한다. 즉 순수하게 DB만의 보장이 아니다.

## 연습문제

> [!example]- 문제: 두 트랜잭션 스케줄의 충돌 직렬화 가능성(conflict serializability)을 판정하라. 초기 T1: r1(A) w1(A) r1(B) w1(B), T2: r2(A) w2(A). 스케줄 S = r1(A) w1(A) r2(A) w2(A) r1(B) w1(B).
> **풀이**
> 충돌(같은 데이터, 최소 하나가 쓰기)을 찾아 선행 그래프를 그린다.
> - A에서: w1(A) 이후 r2(A) → T1 → T2, w1(A) 이후 w2(A) → T1 → T2. (T2의 r2(A)/w2(A)가 모두 w1(A) 뒤)
> - B는 T1만 접근 → 충돌 없음.
> 선행 그래프: T1 → T2 뿐, 사이클 없음 → **충돌 직렬화 가능**하며 직렬 순서는 T1 → T2와 동치다.

> [!example]- 문제: 스케줄 S = r1(A) r2(A) w1(A) w2(A) 가 직렬화 가능한지 판정하라.
> **풀이**
> A에 대한 충돌쌍을 본다.
> - r1(A)와 w2(A): T1이 먼저 읽고 T2가 나중에 씀 → T1 → T2.
> - r2(A)와 w1(A): T2가 먼저 읽고 T1이 나중에 씀 → T2 → T1.
> 선행 그래프에 T1 → T2와 T2 → T1이 모두 있어 **사이클** 발생 → **직렬화 불가능**. 이는 두 트랜잭션이 서로의 갱신을 덮어쓰는 lost update 상황으로, 격리 수준/락이나 MVCC 충돌 감지로 막아야 한다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1. ACID 각 글자의 정확한 의미와 원자성·내구성이 WAL로 구현된다는 점.
> 2. "두 적"(크래시 vs 동시성)이 각각 어떤 보장을 위협하고 무엇(WAL vs 락/MVCC)으로 막는가.
> 3. 트랜잭션 상태 전이(active→commit/abort)와 실무 원칙(범위 최소화, 격리 수준, 재시도).

## 연결

- 무결성 제약 (C) → [[relational-model]]
- 원자성·내구성 구현 (WAL) → [[recovery]], os/[[crash-consistency]]
- 격리성 구현 → [[concurrency-control]], [[mvcc]]
- 경쟁 조건 (OS 레벨) → os/[[threads-and-races]]
- 분산 트랜잭션 → distributed-systems/[[distributed-transactions]]

## 궁금한 것 (나중에)

- [ ] BASE (NoSQL의 ACID 완화) → [[nosql-landscape]]
- [ ] 왜 C는 다른 셋과 성격이 다른가 (앱 책임)
- [ ] savepoint (부분 rollback)
- [ ] 분산에서 ACID가 왜 어려운가 → distributed-systems/[[cap-theorem]]

## 출처

- CMU 15-445 트랜잭션, Silberschatz 17장
