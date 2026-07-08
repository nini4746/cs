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

## 연결

- 격리성·2PL → [[concurrency-control]]
- ACID → [[transactions-acid]]
- 불변성·버전 → programming-languages/[[functional-programming]]
- 옛 버전 GC → programming-languages/[[garbage-collection]]
- 읽기 락 없음 → os/[[lock-free-basics]]
- undo 로그 → [[recovery]]

## 궁금한 것 (나중에)

- [ ] SSI가 write skew를 막는 법
- [ ] PostgreSQL vacuum 튜닝
- [ ] 트랜잭션 ID wraparound 상세
- [ ] 가시성 판단 (어느 버전을 볼지) 알고리즘

## 출처

- CMU 15-445 MVCC, "DDIA" 7장
