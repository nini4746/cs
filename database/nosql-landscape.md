# NoSQL 지형 (NoSQL Landscape)

## 한 줄 요약

관계형 DB의 대안들 - 문서, 키-값, 컬럼, 그래프. 각각 특정 워크로드에 특화하며 무언가(주로 JOIN·트랜잭션·스키마)를 포기하고 무언가(확장성·유연성·특정 쿼리)를 얻는다. "NoSQL = 스키마 없음"이 아니라 트레이드오프의 선택.

## 왜 필요한가

- 관계형([[relational-model]]) 외에 왜 다른 DB들이 있나
- 각 NoSQL이 뭘 포기하고 뭘 얻나
- 언제 NoSQL을 쓰나

## NoSQL의 등장 배경

관계형 DB의 한계가 특정 상황에서:
- **수평 확장 어려움**: JOIN·트랜잭션이 파티셔닝([[partitioning-db]])과 상충
- **스키마 경직**: 스키마 변경이 무거움 (빠른 개발엔 부담)
- **특정 워크로드 부적합**: 그래프 순회, 대량 쓰기 등

"Not Only SQL" - 관계형을 버리는 게 아니라 **특정 용도에 특화된 대안**. 무언가를 포기해 무언가를 얻음.

## 네 유형

### 1. 문서 (document)

JSON 같은 **중첩 문서**를 저장 (MongoDB, CouchDB):

```json
{ "user": "Alice", "orders": [{"item": "노트북", "qty": 1}, ...] }
```

- **스키마 유연**: 문서마다 구조 달라도 됨 → 빠른 개발
- **관련 데이터 함께**: 한 문서에 중첩 → JOIN 회피 (역정규화 [[normalization]])
- **포기**: 여러 문서 걸친 JOIN·트랜잭션 약함, 중복 관리
- **용도**: 콘텐츠 관리, 카탈로그, 스키마 자주 바뀌는 것

### 2. 키-값 (key-value)

단순 **키 → 값** 매핑 (Redis, DynamoDB, RocksDB):

- data-structures/[[hash-tables]]를 분산으로
- **초고속·초단순**: O(1) 조회, 쉬운 확장
- **포기**: 값 내부 쿼리 불가 (키로만), 관계 없음
- **용도**: 캐시([[caching-strategies]]), 세션, 실시간 (Redis), 대규모 KV (DynamoDB)
- Redis는 자료구조 서버 (리스트, 셋, sorted set → data-structures/[[skip-list]])

### 3. 컬럼 패밀리 (wide-column)

행마다 다른 열, 대량 쓰기 (Cassandra, HBase):

- LSM-tree([[lsm-tree]]) 기반 → 쓰기 최적
- **포기**: JOIN, 복잡 쿼리, 강한 일관성 (eventual → distributed-systems/[[consistency-models]])
- **얻음**: 대량 쓰기, 선형 확장, 고가용성
- **용도**: 시계열, 로그, IoT, 대규모 쓰기
- (column store [[db-storage]]와 이름 비슷하나 다름 - 이건 분산 KV 확장)

### 4. 그래프 (graph)

노드·간선으로 **관계 자체**를 저장 (Neo4j):

- 관계 순회가 O(간선) - 관계형 JOIN보다 빠름 (algorithms/[[graph-traversal]])
- **용도**: 소셜 네트워크, 추천, 사기 탐지, 지식 그래프
- 관계형에서 다중 JOIN이 폭발하는 것을 그래프 순회로

## 트레이드오프 요약

| 유형 | 강점 | 포기 | 예 |
|---|---|---|---|
| 문서 | 유연 스키마, 중첩 | 다중 문서 JOIN | MongoDB |
| 키-값 | 속도, 확장 | 값 쿼리 | Redis, DynamoDB |
| 컬럼 | 대량 쓰기, 확장 | JOIN, 강한 일관성 | Cassandra |
| 그래프 | 관계 순회 | 대량 단순 조회 | Neo4j |
| **관계형** | JOIN, ACID, 범용 | 수평 확장 | PostgreSQL |

## NewSQL과 수렴

경계가 흐려지는 추세:

- **NewSQL**: 관계형 + 수평 확장 (Google Spanner, CockroachDB, TiDB) → ACID + 분산
- 관계형 DB도 JSON 컬럼 지원 (PostgreSQL JSONB) → 문서 기능 흡수
- "관계형 vs NoSQL"이 아니라 필요에 맞게 조합 (polyglot persistence)

## 언제 무엇을

- **기본은 관계형**: JOIN·트랜잭션·성숙도. 대부분 앱에 충분 ([[relational-model]])
- **캐시/세션** → Redis (KV)
- **유연 스키마/중첩** → MongoDB (문서)
- **대량 쓰기/시계열** → Cassandra (컬럼)
- **관계 중심** → Neo4j (그래프)
- **분산 + ACID** → Spanner/CockroachDB (NewSQL)

"NoSQL이 관계형보다 좋다"가 아니라 **워크로드에 맞는 도구 선택**. 관계형이 여전히 기본값.

## 연결

- 관계형 기준 → [[relational-model]]
- 키-값 = 분산 해시 → data-structures/[[hash-tables]]
- 컬럼 = LSM → [[lsm-tree]]
- 그래프 순회 → algorithms/[[graph-traversal]]
- 일관성 완화 (BASE) → distributed-systems/[[consistency-models]], [[cap-theorem]]
- 파티셔닝 → [[partitioning-db]]
- Redis 자료구조 → data-structures/[[skip-list]]

## 궁금한 것 (나중에)

- [ ] Spanner의 TrueTime (분산 + 강한 일관성)
- [ ] BASE vs ACID 상세
- [ ] polyglot persistence 설계
- [ ] 시계열 DB (InfluxDB, TimescaleDB)

## 출처

- CMU 15-445, "DDIA" 2-3장, 각 DB 문서
