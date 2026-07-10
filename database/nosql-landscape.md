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

## 셀프 체크

> [!question]- "NoSQL = 스키마 없음"이 왜 부정확한 표현인가?
> NoSQL의 본질은 스키마의 유무가 아니라 트레이드오프의 선택이다. 각 유형은 주로 JOIN·트랜잭션·유연한 스키마 중 무언가를 포기하고 확장성·특정 쿼리 성능·유연성을 얻는다. "Not Only SQL"은 관계형을 버리는 게 아니라 특정 용도에 특화된 대안을 뜻한다.

> [!question]- 문서 DB와 키-값 DB의 핵심 차이는 무엇이며 각각 무엇을 포기하나?
> 문서 DB(MongoDB)는 JSON 같은 중첩 문서를 저장해 유연한 스키마와 관련 데이터 중첩을 얻지만 여러 문서에 걸친 JOIN·트랜잭션이 약하다. 키-값 DB(Redis, DynamoDB)는 키→값 매핑으로 O(1) 조회와 쉬운 확장을 얻지만 값 내부를 쿼리할 수 없고 관계를 표현하지 못한다.

> [!question]- 컬럼 패밀리(wide-column) DB가 대량 쓰기에 강한 이유와 그 대가는?
> Cassandra 같은 컬럼 패밀리 DB는 LSM-tree 기반이라 쓰기를 순차로 처리해 대량 쓰기와 선형 확장, 고가용성을 얻는다. 대가로 JOIN과 복잡 쿼리를 포기하고 강한 일관성 대신 eventual consistency를 택하는 경우가 많다.

> [!question]- 그래프 DB가 관계형 JOIN 대비 유리한 워크로드는 무엇이며 그 이유는?
> 소셜 네트워크, 추천, 사기 탐지처럼 관계를 여러 단계 순회하는 워크로드다. 관계형에서는 깊은 순회가 다중 JOIN으로 폭발하지만, 그래프 DB는 노드·간선으로 관계 자체를 저장해 순회가 간선 수에 비례(O(간선))하는 비용으로 처리된다.

## 연습문제

> [!example]- 문제: 다음 각 요구사항에 가장 적합한 데이터 스토어 유형을 고르고 이유를 쓰라. (1) 사용자 세션 캐시 (2) 스키마가 자주 바뀌는 상품 카탈로그 (3) 초당 수십만 건의 IoT 센서 로그 (4) 친구의 친구 추천
> **풀이**
> (1) 키-값(Redis) - 세션ID→데이터의 단순 O(1) 조회, 빠른 만료 처리.
> (2) 문서(MongoDB) - 상품마다 속성이 달라도 되는 유연한 스키마, 중첩 표현.
> (3) 컬럼 패밀리(Cassandra) - LSM 기반 대량 쓰기와 선형 확장.
> (4) 그래프(Neo4j) - 다단계 관계 순회를 JOIN 폭발 없이 처리.

> [!example]- 문제: 팀이 "관계형을 버리고 전부 MongoDB로 가자"고 한다. 이 결정을 트레이드오프 관점에서 비판적으로 검토하고, 대안적 접근을 제시하라.
> **풀이**
> 문제점: 대부분의 앱은 여러 엔티티에 걸친 JOIN과 ACID 트랜잭션(예: 결제·재고 차감의 원자성)이 필요한데 문서 DB는 여러 문서에 걸친 트랜잭션·JOIN이 약하다. 유연한 스키마의 대가로 중복 관리와 일관성 부담이 앱으로 넘어온다.
> 대안: 기본은 관계형(성숙도·JOIN·ACID)으로 두고, 필요한 부분만 특화 스토어를 조합하는 polyglot persistence. 예를 들어 핵심 주문·결제는 PostgreSQL, 세션 캐시는 Redis, 검색·유연 문서는 MongoDB. 또 관계형의 JSONB로 문서 기능을 일부 흡수하거나, 분산+ACID가 필요하면 NewSQL(Spanner, CockroachDB)을 검토한다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1) 네 유형(문서·키-값·컬럼·그래프) 각각이 "무엇을 포기하고 무엇을 얻는가"를 한 줄씩 말할 수 있는가.
> 2) 관계형이 여전히 기본값인 이유(JOIN·ACID·성숙도)와 NewSQL·JSONB 같은 수렴 흐름을 설명할 수 있는가.
> 3) 임의의 워크로드가 주어졌을 때 적절한 스토어를 고르고 polyglot persistence로 조합하는 판단을 할 수 있는가.

## 연결

- 관계형 기준 → [[relational-model]]
- 키-값 = 분산 해시 → data-structures/[[hash-tables]]
- 컬럼 = LSM → [[lsm-tree]]
- 그래프 순회 → algorithms/[[graph-traversal]]
- 일관성 완화 (BASE) → distributed-systems/[[consistency-models]], [[cap-theorem]]
- 파티셔닝 → [[partitioning-db]]
- Redis 자료구조 → data-structures/[[skip-list]]
- KV 캐시 스토어(Redis) → distributed-systems/[[caching-strategies]]

## 궁금한 것 (나중에)

- [ ] Spanner의 TrueTime (분산 + 강한 일관성)
- [ ] BASE vs ACID 상세
- [ ] polyglot persistence 설계
- [ ] 시계열 DB (InfluxDB, TimescaleDB)

## 출처

- CMU 15-445, "DDIA" 2-3장, 각 DB 문서
