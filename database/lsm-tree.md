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
