# 동시성 제어 (Concurrency Control)

## 한 줄 요약

동시 트랜잭션이 서로 간섭하지 않게 하는 격리성(ACID의 I)의 구현. 2PL(락)과 격리 수준으로 타협하며, 각 수준이 특정 이상 현상(dirty read ~ phantom)을 허용/금지한다.

## 왜 필요한가

- ACID의 격리성([[transactions-acid]])을 어떻게 구현하나
- 격리 수준 4단계가 뭘 막고 뭘 허용하나
- 동시성과 성능의 트레이드오프

## 문제: 동시 실행의 이상 현상

여러 트랜잭션이 겹치면 os/[[threads-and-races]]의 경쟁 조건이 DB에서 발생. 대표 이상 현상:

- **dirty read**: 커밋 안 된 데이터를 읽음 → 그 트랜잭션이 rollback되면 유령 데이터
- **non-repeatable read**: 같은 행을 두 번 읽었는데 값이 다름 (사이에 남이 수정+커밋)
- **phantom read**: 같은 조건 조회를 두 번 했는데 행 개수가 다름 (사이에 남이 삽입)
- **lost update**: 두 트랜잭션이 같은 값을 읽고 각자 수정 → 하나 유실 (os/[[threads-and-races]]의 그것)

## 직렬성 (serializability)

이상적 격리 = **직렬성**: 동시 실행 결과가 **어떤 순차 실행과 같음**:

- 트랜잭션들을 마치 하나씩 순서대로 한 것 같은 결과
- **충돌 직렬성(conflict serializable)**: 충돌 연산(같은 데이터, 하나는 쓰기)의 순서로 판정. 의존 그래프에 사이클 없으면 직렬 가능
- 완벽하지만 비쌈 → 실무는 격리 수준으로 타협

## 2PL (Two-Phase Locking)

락으로 직렬성 보장 (os/[[locks]]의 DB 버전):

```
성장 단계(growing): 락 획득만 (해제 없음)
축소 단계(shrinking): 락 해제만 (획득 없음)
```

- 락을 다 얻은 뒤에야 풀기 시작 → 직렬성 보장
- **strict 2PL**: commit까지 락 유지 (cascading abort 방지) - 실무 표준
- **공유 락(읽기)/배타 락(쓰기)**: os/[[locks]]의 reader-writer
- 대가: 락 대기 → **데드락** 가능 → 탐지 후 한 트랜잭션 abort ([[transactions-acid]]의 재시도, os/[[deadlock]])

## 격리 수준 (isolation levels)

성능을 위해 격리를 단계적으로 완화. SQL 표준 4단계:

| 수준 | dirty read | non-repeatable | phantom |
|---|---|---|---|
| **READ UNCOMMITTED** | 허용 | 허용 | 허용 |
| **READ COMMITTED** | 방지 | 허용 | 허용 |
| **REPEATABLE READ** | 방지 | 방지 | 허용* |
| **SERIALIZABLE** | 방지 | 방지 | 방지 |

- 아래로 갈수록 **엄격(안전) + 느림**(락 많음), 위는 **느슨 + 빠름**
- **READ COMMITTED**: 많은 DB 기본 (PostgreSQL). 커밋된 것만 읽음
- **SERIALIZABLE**: 완벽하지만 락·재시도 많음
- (*MVCC 구현은 REPEATABLE READ에서 phantom도 막기도 → [[mvcc]])

**선택**: 대부분 앱은 READ COMMITTED로 충분. 정확성 critical(금융)이면 SERIALIZABLE. 트레이드오프를 의식하고 선택.

## 두 접근: 비관 vs 낙관

- **비관적(pessimistic)**: 락으로 미리 막음 (2PL). 충돌 잦으면 유리
- **낙관적(optimistic, OCC)**: 일단 진행하고 커밋 시 충돌 검사, 충돌이면 abort+재시도. 충돌 드물면 유리 (락 오버헤드 없음)
- **MVCC**: 버전으로 읽기-쓰기 충돌 회피 → [[mvcc]] (현대 DB 주류)

os/[[lock-free-basics]]의 낙관적 동시성과 같은 발상.

## write skew (교묘한 이상)

SERIALIZABLE 아니면 생기는 미묘한 문제:
- 두 트랜잭션이 각자 다른 행을 읽고 쓰는데, 둘 다 만족하던 불변식이 함께 깨짐
- 예: "당직 최소 1명" - 두 의사가 동시에 "다른 사람 있으니 나 빠짐" → 둘 다 빠짐
- 스냅샷 격리([[mvcc]])의 함정 → SERIALIZABLE이나 명시적 락으로 방지

## 셀프 체크

> [!question]- dirty read, non-repeatable read, phantom read를 각각 구분하라.
> dirty read는 커밋 안 된 데이터를 읽는 것으로 그 트랜잭션이 rollback되면 유령 데이터가 된다. non-repeatable read는 같은 행을 두 번 읽었는데 사이에 남이 수정+커밋해 값이 달라지는 것이다. phantom read는 같은 조건 조회를 두 번 했는데 사이에 남이 삽입해 행 개수가 달라지는 것이다.

> [!question]- 충돌 직렬성(conflict serializable)은 어떻게 판정하나?
> 충돌 연산(같은 데이터에 접근하고 그중 하나 이상이 쓰기)의 순서로 트랜잭션 간 의존 그래프를 그린다. 이 그래프에 사이클이 없으면 어떤 순차 실행과 동등한 결과라 직렬 가능하다. 사이클이 있으면 직렬화 불가능하다.

> [!question]- 2PL의 두 단계는 무엇이며, strict 2PL은 무엇을 추가로 막나?
> 성장 단계에서는 락 획득만 하고(해제 없음), 축소 단계에서는 락 해제만 한다(획득 없음). 락을 다 얻은 뒤에야 풀기 시작해 직렬성을 보장한다. strict 2PL은 commit까지 락을 유지해 cascading abort(연쇄 취소)를 방지하며 실무 표준이다.

> [!question]- 비관적·낙관적·MVCC 세 접근은 각각 언제 유리한가?
> 비관적(2PL)은 락으로 미리 막아 충돌이 잦을 때 유리하다. 낙관적(OCC)은 일단 진행하고 커밋 시 충돌을 검사해 충돌이 드물 때 락 오버헤드가 없어 유리하다. MVCC는 버전으로 읽기-쓰기 충돌을 회피하며 현대 DB의 주류다.

> [!question]- write skew는 무엇이고 어느 격리 수준에서 발생하나?
> 두 트랜잭션이 각자 다른 행을 읽고 쓰는데 둘 다 만족하던 불변식이 함께 깨지는 미묘한 이상이다(예: "당직 최소 1명"인데 두 의사가 동시에 다른 사람 믿고 빠짐). 스냅샷 격리의 함정으로 SERIALIZABLE이 아니면 발생하며, SERIALIZABLE이나 명시적 락으로 방지한다.

## 연습문제

> [!example]- 문제: 스케줄 S: r1(A) w1(A) r2(A) w2(A) r1(B) w1(B) 가 충돌 직렬 가능한지 판정하라 (숫자는 트랜잭션 번호)
> **풀이**
> 충돌 쌍을 찾는다. A에 대해: w1(A)와 r2(A) 충돌, w1(A)와 w2(A) 충돌 → T1이 A를 T2보다 먼저 쓰므로 T1 → T2. r1(A)와 w2(A) 충돌도 T1 → T2.
> B는 T1만 접근하므로 T2와의 충돌 없음.
> 의존 그래프: T1 → T2 하나뿐, 사이클 없음.
> 결론: 충돌 직렬 가능하며 순차 순서 T1, T2와 동등하다.

> [!example]- 문제: 재고 차감 로직 `SELECT qty ... ; UPDATE SET qty=qty-1`을 두 트랜잭션이 동시에 실행할 때 lost update가 나는 시나리오를 보이고, 격리 수준·락으로 막는 방법을 제시하라
> **풀이**
> 시나리오: 초기 qty=10. T1이 10을 읽고, T2도 10을 읽는다. T1이 9로 UPDATE, T2도 (자기가 읽은) 10 기준 9로 UPDATE. 실제로 2번 팔렸는데 qty=9 → 한 번의 차감이 유실(lost update).
> 방지 1(락): `SELECT ... FOR UPDATE`로 읽는 순간 배타 락을 걸어 T2가 T1 커밋까지 대기하게 한다(비관적).
> 방지 2(격리 수준): SERIALIZABLE에서는 이 스케줄이 직렬화 불가능으로 판정돼 한쪽이 abort+재시도된다.
> 방지 3(원자적 갱신): 읽기 없이 `UPDATE SET qty=qty-1 WHERE qty>0`처럼 DB가 원자적으로 처리하게 하면 read-modify-write 경쟁 자체가 사라진다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1. 네 가지 이상 현상(dirty/non-repeatable/phantom read, lost update)과, 이상적 격리인 직렬성(충돌 직렬성 그래프 판정).
> 2. 2PL(성장/축소, strict)이 락으로 직렬성을 보장하는 방식과 그 대가(데드락).
> 3. 격리 수준 4단계가 무엇을 막고 허용하는지의 표와, 비관/낙관/MVCC 선택 기준.

## 연결

- 격리성 (ACID I) → [[transactions-acid]]
- 락 (2PL 기반) → os/[[locks]], reader-writer os/[[semaphores]]
- 데드락 → os/[[deadlock]]
- MVCC (읽기-쓰기 분리) → [[mvcc]]
- 낙관적 동시성 → os/[[lock-free-basics]]
- 경쟁 조건 (OS) → os/[[threads-and-races]]
- 직렬성 ~ 분산의 일관성 모델 → distributed-systems/[[consistency-models]]

## 궁금한 것 (나중에)

- [ ] 충돌 직렬성 그래프 판정 상세
- [ ] SSI (Serializable Snapshot Isolation) → [[mvcc]]
- [ ] 락 에스컬레이션 (행→페이지→테이블)
- [ ] 격리 수준별 실제 성능 벤치마크

## 출처

- CMU 15-445 동시성 제어, Silberschatz 18장
