# LSM-tree

## 한 줄 요약

쓰기를 메모리에 모았다가 순차로 디스크에 내보내는 자료구조. B+tree의 제자리 갱신 대신 순차 쓰기로 쓰기 성능을 극대화한다. Cassandra, RocksDB, LevelDB의 기반이며 SSD와 궁합이 좋다.

## 왜 필요한가

- 쓰기 많은 워크로드에서 왜 B+tree([[btree-index]]) 대신 LSM인가
- SSD([[ssd-internals]])와 왜 잘 맞나
- 읽기 성능은 어떻게 보완하나

## B+tree의 쓰기 문제

B+tree([[btree-index]])는 **제자리 갱신(in-place)**:

- 삽입·수정 시 해당 페이지를 찾아 수정 → **랜덤 쓰기**
- SSD는 제자리 덮어쓰기 불가([[ssd-internals]]) → write amplification
- 쓰기 많으면 (로그, 시계열, IoT) 랜덤 쓰기가 병목

LSM의 아이디어: **랜덤 쓰기를 순차 쓰기로 바꾸자**.

## LSM 구조

쓰기를 계층으로 처리:

```
쓰기 → memtable (메모리, 정렬된 구조)
        ↓ 꽉 차면 flush
      SSTable (디스크, 정렬·불변 파일)
        ↓ 쌓이면 병합
      더 큰 SSTable (compaction)
```

1. **memtable**: 메모리의 정렬 구조 (보통 skip list → data-structures/[[skip-list]], 또는 균형 트리). 쓰기는 여기 먼저 → 빠름
2. **WAL**: 크래시 대비 memtable 쓰기를 로그에도 (내구성 → [[recovery]])
3. **flush**: memtable이 차면 **SSTable**(Sorted String Table)로 디스크에 **순차 기록**. 불변(immutable)
4. **compaction**: SSTable들이 쌓이면 병합·정렬 (오래된/삭제된 것 정리)

핵심: 디스크 쓰기가 항상 **순차**(새 SSTable 추가) → SSD 친화, 높은 쓰기 처리량.

## 읽기: 여러 곳을 봐야

쓰기는 빠르지만 읽기가 복잡 - 데이터가 여러 SSTable + memtable에 흩어짐:

```
읽기: memtable 확인 → 최신 SSTable → 오래된 SSTable → ...
      (최신 값을 찾을 때까지)
```

- 여러 파일 조회 → B+tree보다 읽기 느릴 수 있음
- **블룸 필터**([[bloom-filter]] - data-structures!)로 최적화: 각 SSTable에 블룸 필터 → "이 키 없음"을 빠르게 판단 → 불필요한 디스크 읽기 회피
- 캐싱·인덱스로 보완

data-structures/[[bloom-filter]]가 실제로 쓰이는 대표 사례.

## compaction

SSTable이 무한정 쌓이면 읽기 느려지고 공간 낭비 → 주기적 **병합**:

- 여러 SSTable을 병합 정렬 (algorithms/[[comparison-sorts]]의 merge)
- 중복 키는 최신만, 삭제 표시(tombstone)된 것 제거
- **전략**: leveled (레벨별 크기, RocksDB) vs size-tiered (비슷한 크기끼리, Cassandra)
- compaction이 CPU·I/O 소모 → 쓰기 처리량과 읽기 성능의 균형점

## LSM vs B+tree

| | LSM-tree | B+tree |
|---|---|---|
| 쓰기 | 빠름 (순차) | 느림 (제자리, 랜덤) |
| 읽기 | 느릴 수 있음 (여러 SSTable) | 빠름 (한 트리) |
| 공간 | compaction 전 중복 | 안정적 |
| SSD | 친화 (순차 쓰기) | write amplification |
| write amp | 낮음 (앱), compaction 있음 | 있음 |
| 예 | Cassandra, RocksDB, LevelDB | PostgreSQL, MySQL |

**쓰기 vs 읽기 트레이드오프**. 쓰기 폭주(로그, 시계열, 이벤트) → LSM. 읽기·범위·트랜잭션 중심 → B+tree. os/[[ssd-internals]]의 로그 구조와 같은 발상.

## 어디에 쓰나

- **Cassandra, ScyllaDB**: 쓰기 많은 분산 DB → distributed-systems/[[partitioning]]
- **RocksDB, LevelDB**: 임베디드 KV 스토어 (다른 DB의 스토리지 엔진으로도)
- **시계열 DB**, 이벤트 스토어, 로그 시스템
- MySQL의 MyRocks 등 스토리지 엔진 선택지

## 셀프 체크

> [!question]- LSM-tree가 B+tree 대비 쓰기가 빠른 근본 이유는?
> B+tree는 제자리 갱신(in-place)이라 해당 페이지를 찾아 수정하는 랜덤 쓰기가 발생한다. LSM은 쓰기를 memtable에 모았다가 SSTable로 디스크에 순차 기록하므로 랜덤 쓰기가 순차 쓰기로 바뀐다. 순차 쓰기는 SSD와 궁합이 좋고 처리량이 높다.

> [!question]- LSM에서 하나의 키를 읽으려면 왜 여러 곳을 봐야 하나, 그리고 이를 어떻게 최적화하나?
> 같은 키의 데이터가 memtable과 여러 SSTable에 시점별로 흩어져 있어 최신 값을 찾을 때까지 memtable → 최신 SSTable → 오래된 SSTable 순으로 훑어야 한다. 각 SSTable에 블룸 필터를 붙여 "이 키는 이 파일에 없음"을 빠르게 판단해 불필요한 디스크 읽기를 건너뛴다.

> [!question]- compaction은 무엇이며 왜 필요한가?
> SSTable이 무한정 쌓이면 읽기 시 볼 파일이 늘어 느려지고 중복·삭제 데이터로 공간이 낭비된다. compaction은 여러 SSTable을 병합 정렬해 중복 키는 최신만 남기고 tombstone으로 표시된 삭제 항목을 제거한다. 대신 CPU·I/O를 소모한다.

> [!question]- WAL은 LSM에서 어떤 역할을 하나?
> memtable은 메모리에 있어 크래시 시 사라지므로, 내구성을 위해 memtable 쓰기를 WAL(로그)에도 함께 기록한다. 크래시 후 WAL을 재생해 flush되지 않은 memtable을 복원한다.

## 연습문제

> [!example]- 문제: 시계열 센서 데이터를 초당 수십만 건 수집하는 시스템의 스토리지 엔진으로 LSM과 B+tree 중 무엇을 고르고, 그 이유를 트레이드오프로 설명하라.
> **풀이**
> LSM을 선택한다. 워크로드가 쓰기 폭주(대량 순차 삽입)이고 최근 데이터 위주의 조회가 많다. LSM은 랜덤 쓰기를 순차 쓰기로 바꿔 높은 쓰기 처리량을 내고 SSD의 write amplification을 줄인다. 대가는 읽기가 여러 SSTable을 봐야 해 느릴 수 있다는 점인데, 블룸 필터와 시간 기반 파티셔닝으로 완화된다. 반대로 B+tree는 제자리 갱신의 랜덤 쓰기가 병목이 되어 이 워크로드에 불리하다.

> [!example]- 문제: leveled compaction과 size-tiered compaction의 차이를 쓰고, 각각 읽기 증폭/쓰기 증폭/공간 증폭 측면에서 어떤 성향인지 설명하라.
> **풀이**
> leveled(RocksDB): 레벨별로 크기가 정해진 겹치지 않는 SSTable로 유지. 한 키가 레벨당 최대 1개 파일에만 있어 읽기 증폭·공간 증폭이 낮지만, 병합이 잦아 쓰기 증폭이 크다.
> size-tiered(Cassandra): 비슷한 크기의 SSTable이 일정 개수 모이면 병합. 병합 빈도가 낮아 쓰기 증폭은 작지만, 같은 키가 여러 tier에 남을 수 있어 읽기 증폭과 공간 증폭(병합 전 중복)이 크다.
> 즉 읽기 최적 vs 쓰기 최적의 선택이며 RUM(Read-Update-Memory) 트레이드오프의 사례다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1) memtable → WAL → flush → SSTable → compaction으로 이어지는 쓰기 경로를 그림 없이 순서대로 설명할 수 있는가.
> 2) "쓰기는 순차라 빠르고 읽기는 여러 파일이라 느리다"는 핵심 트레이드오프와, 블룸 필터·compaction이 각각 무엇을 보완하는지 말할 수 있는가.
> 3) LSM vs B+tree를 쓰기/읽기/공간/SSD 관점에서 비교하고 어떤 워크로드에 무엇을 쓸지 판단할 수 있는가.

## 연결

- B+tree 대안 → [[btree-index]]
- SSD 로그 구조 → os/[[ssd-internals]]
- 블룸 필터 최적화 → data-structures/[[bloom-filter]]
- memtable = skip list → data-structures/[[skip-list]]
- compaction = merge → algorithms/[[comparison-sorts]]
- WAL 내구성 → [[recovery]]
- 분산 KV → distributed-systems/[[partitioning]]

## 궁금한 것 (나중에)

- [ ] leveled vs size-tiered compaction 상세
- [ ] read/write/space amplification 트레이드오프 (RUM 추측)
- [ ] tombstone과 삭제 처리
- [ ] LSM의 범위 쿼리 성능

## 출처

- CMU 15-445, "Designing Data-Intensive Applications" 3장 (DDIA)
