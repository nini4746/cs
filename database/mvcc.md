# MVCC (다중 버전 동시성 제어)

## 한 줄 요약

데이터의 여러 버전을 유지해 읽기와 쓰기가 서로 막지 않게 한다. 읽기는 시점의 스냅샷을 보고, 쓰기는 새 버전을 만든다. PostgreSQL·MySQL·Oracle의 핵심이며, 그 대가가 vacuum이다.

## 왜 필요한가

- 왜 읽기가 쓰기를 안 막나 (2PL은 막음)
- PostgreSQL의 vacuum이 뭐고 왜 필요한가
- 스냅샷 격리의 함정

## 문제: 읽기-쓰기 충돌

2PL([[concurrency-control]])에서는 쓰기 락이 읽기를 막음:
- 누가 쓰는 중이면 읽기가 대기 → 읽기 많은 워크로드에서 병목
- "읽기와 쓰기가 서로 안 막으면 좋겠다"

**MVCC의 해법**: 데이터를 덮어쓰지 않고 **새 버전을 만듦** → 읽기는 옛 버전, 쓰기는 새 버전 → 서로 무관.

## 핵심: 여러 버전

각 행이 여러 버전을 가짐 (트랜잭션 ID로 태그):

```
행 X:
  버전1 (txn 10이 만듦, txn 15가 지움)  ← 옛 값
  버전2 (txn 15가 만듦)                  ← 새 값
```

- **읽기**: 자기 시작 시점의 **스냅샷**을 봄 (그 시점에 유효했던 버전). 남이 나중에 써도 안 보임
- **쓰기**: 새 버전 생성 (옛 버전은 그대로 - 다른 읽기가 볼 수 있으니)
- **읽기는 락 안 잡음** → 쓰기와 안 충돌. programming-languages/[[functional-programming]]의 불변성·persistent 구조와 같은 발상

## 스냅샷 격리 (snapshot isolation)

MVCC가 제공하는 격리:
- 각 트랜잭션이 **일관된 스냅샷**(시작 시점)을 봄
- 트랜잭션 내내 같은 데이터 (non-repeatable read 없음)
- 읽기가 쓰기를, 쓰기가 읽기를 안 막음 → 높은 동시성
- 쓰기-쓰기 충돌만 처리 (같은 행 동시 수정 → 하나 abort)

os/[[lock-free-basics]]의 RCU(읽기 락 없음)와 유사한 정신.

## 대가: 옛 버전 정리 (vacuum)

새 버전을 계속 만들면 **옛 버전(dead tuple)이 쌓임** → 회수 필요:

- **PostgreSQL vacuum**: 아무 트랜잭션도 안 보는 옛 버전을 회수 (garbage collection → programming-languages/[[garbage-collection]]과 같은 도달성 판단)
- 안 하면 **테이블 부풀림(bloat)** → 공간 낭비, 성능 저하
- **autovacuum**이 자동으로 하지만 튜닝 필요 (대량 쓰기 시 못 따라감)
- 트랜잭션 ID 순환(wraparound) 문제도 vacuum이 관리

MVCC의 성능 이득 대가 = vacuum 관리. PostgreSQL 운영의 핵심 이슈.

## 구현 방식 차이

- **PostgreSQL**: 새 버전을 테이블에 직접 (옛 버전도 테이블에) → vacuum 필요, 테이블 bloat
- **MySQL InnoDB / Oracle**: 옛 버전을 **undo 로그**에 (테이블엔 최신만) → 읽기 시 undo로 옛 버전 재구성. bloat 적지만 undo 관리
- 둘 다 MVCC지만 옛 버전을 어디 두나가 다름

## write skew: 스냅샷 격리의 함정

스냅샷 격리는 SERIALIZABLE이 아님 → **write skew**([[concurrency-control]]):

- 두 트랜잭션이 각자 스냅샷을 보고 서로 다른 행을 씀 → 쓰기-쓰기 충돌 없어서 둘 다 커밋 → 불변식 깨짐
- 예: "당직 최소 1명"인데 둘이 동시에 빠짐
- MVCC 스냅샷 격리로는 못 막음 → **SSI**(Serializable Snapshot Isolation, PostgreSQL SERIALIZABLE)나 명시적 락(`SELECT FOR UPDATE`)

## MVCC vs 2PL

| | MVCC | 2PL (락) |
|---|---|---|
| 읽기-쓰기 | 안 막음 | 막음 |
| 읽기 락 | 없음 | 공유 락 |
| 공간 | 옛 버전 (vacuum) | 없음 |
| 동시성 | 높음 | 낮음 |
| 채택 | PostgreSQL, MySQL, Oracle | 일부 (순수 락) |

현대 DB 주류는 MVCC (읽기 많은 웹 워크로드에 유리). 쓰기-쓰기는 여전히 락/충돌 처리.

## 셀프 체크

> [!question]- MVCC에서 읽기가 쓰기를 막지 않는(그 반대도) 근본 메커니즘은?
> 데이터를 덮어쓰지 않고 새 버전을 만들기 때문이다. 읽기는 자기 시작 시점의 스냅샷에 유효했던 옛 버전을 락 없이 보고, 쓰기는 새 버전을 만든다. 서로 다른 버전을 건드리므로 충돌하지 않는다. 오직 쓰기-쓰기(같은 행 동시 수정)만 충돌 처리한다.

> [!question]- PostgreSQL에서 vacuum이 왜 필요하며 안 하면 무슨 일이 생기나?
> MVCC가 새 버전을 계속 만들면 아무 트랜잭션도 더는 보지 않는 옛 버전(dead tuple)이 쌓인다. vacuum은 이 도달 불가능한 옛 버전을 회수한다. 안 하면 테이블 부풀림(bloat)으로 공간이 낭비되고 성능이 저하되며, 트랜잭션 ID wraparound 문제도 관리하지 못한다.

> [!question]- PostgreSQL과 MySQL InnoDB의 MVCC 구현은 옛 버전을 어디에 두는 점에서 어떻게 다른가?
> PostgreSQL은 새 버전과 옛 버전을 모두 테이블에 직접 저장해 vacuum이 필요하고 bloat가 생긴다. InnoDB(및 Oracle)는 테이블엔 최신 버전만 두고 옛 버전은 undo 로그에 두어, 읽기 시 undo로 옛 버전을 재구성한다. bloat는 적지만 undo 관리가 필요하다.

> [!question]- write skew란 무엇이며 왜 스냅샷 격리로는 못 막나?
> 두 트랜잭션이 각자 스냅샷을 보고 서로 다른 행을 수정해 개별적으로는 쓰기-쓰기 충돌이 없지만, 합쳐 놓으면 불변식이 깨지는 현상이다(예: 당직 최소 1명인데 둘이 동시에 빠짐). 서로 다른 행을 쓰므로 스냅샷 격리는 충돌을 감지하지 못한다. SSI나 `SELECT FOR UPDATE` 명시적 락이 필요하다.

## 연습문제

> [!example]- 문제: 계좌 잔액 규칙 "두 계좌 합이 0 이상이어야 함"이 있고, 각각 잔액 100인 계좌 A, B가 있다. 두 트랜잭션 T1(A에서 200 인출), T2(B에서 200 인출)가 스냅샷 격리에서 동시에 실행될 때 무슨 일이 생기는지 판정하고 해결책을 제시하라.
> **풀이**
> T1은 시작 스냅샷에서 A=100, B=100을 보고 합 200 ≥ 200이므로 A에서 인출 가능하다고 판단, A=-100으로 씀. T2도 같은 스냅샷에서 합 200을 보고 B=-100으로 씀. 둘은 서로 다른 행(A, B)을 수정해 쓰기-쓰기 충돌이 없어 모두 커밋된다. 결과 합 -200으로 불변식 위반 = write skew.
> 해결: 격리 수준을 SERIALIZABLE(PostgreSQL의 SSI)로 올려 위험한 읽기-쓰기 의존을 감지해 한쪽을 abort시키거나, 두 계좌 행을 `SELECT ... FOR UPDATE`로 명시적 락을 걸어 직렬화한다.

> [!example]- 문제: autovacuum이 대량 쓰기를 못 따라가 테이블 bloat가 심해졌다. 이 상황이 왜 MVCC의 구조적 대가인지 설명하고, bloat가 초래하는 구체적 문제 두 가지를 쓰라.
> **풀이**
> MVCC는 갱신·삭제 시 옛 버전을 즉시 지우지 않고 남겨 두어야 다른 스냅샷이 볼 수 있으므로, 성능(읽기-쓰기 비차단)의 대가로 반드시 사후 정리(vacuum)가 필요하다. 쓰기 속도가 vacuum 회수 속도를 넘으면 dead tuple이 계속 쌓인다.
> 문제 1 - 공간 낭비: 실제 유효 데이터보다 테이블·인덱스가 훨씬 커진다.
> 문제 2 - 성능 저하: 스캔 시 dead tuple까지 훑게 되어 쿼리가 느려지고 캐시 효율이 떨어진다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1) "새 버전을 만든다"는 한 문장에서 읽기-쓰기 비차단, 스냅샷 격리, 옛 버전 누적(vacuum)까지 인과로 이어 설명할 수 있는가.
> 2) 스냅샷 격리가 SERIALIZABLE이 아니라는 점과 write skew 예시를 스스로 만들 수 있는가.
> 3) MVCC와 2PL을 읽기 락·동시성·공간 관점에서 비교하고, 왜 현대 DB 주류가 MVCC인지 말할 수 있는가.

## 연결

- 격리성·2PL → [[concurrency-control]]
- ACID → [[transactions-acid]]
- 불변성·버전 → programming-languages/[[functional-programming]]
- 옛 버전 GC → programming-languages/[[garbage-collection]]
- 읽기 락 없음 → os/[[lock-free-basics]]
- undo 로그 → [[recovery]]
- 스냅샷 격리 ~ 일관성 모델 → distributed-systems/[[consistency-models]]

## 궁금한 것 (나중에)

- [ ] SSI가 write skew를 막는 법
- [ ] PostgreSQL vacuum 튜닝
- [ ] 트랜잭션 ID wraparound 상세
- [ ] 가시성 판단 (어느 버전을 볼지) 알고리즘

## 출처

- CMU 15-445 MVCC, "DDIA" 7장
