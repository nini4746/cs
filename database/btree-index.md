# B+tree 인덱스 (B+tree Index)

## 한 줄 요약

DB 인덱스의 표준 자료구조. B+tree([[b-trees]])로 키를 정렬 저장해 O(log n) 조회와 범위 스캔을 준다. 인덱스 없으면 풀스캔 O(n), 있으면 트리 탐색. 클러스터드/논클러스터드로 데이터 배치가 갈린다.

## 왜 필요한가

- 인덱스가 왜 조회를 빠르게 하나
- 인덱스가 왜 B+tree인가 → data-structures/[[b-trees]]
- 클러스터드 vs 논클러스터드 차이

## 인덱스 = 빠른 조회 자료구조

인덱스 없으면 조건 조회가 **풀스캔** O(n) (모든 행 검사). 인덱스는 **정렬된 자료구조**로 O(log n):

실측 (SQLite EXPLAIN, 10만 행):
```
인덱스 있음: SEARCH t USING COVERING INDEX idx_val   ← 인덱스 탐색
인덱스 없음: SCAN t2                                  ← 풀스캔
```

같은 `WHERE val=50000`인데 인덱스가 SCAN(전체)을 SEARCH(트리 탐색)로. 10만 행에서 17회(log₂) vs 10만 회.

## 왜 B+tree인가

DB 인덱스 = 거의 항상 **B+tree** → data-structures/[[b-trees]]:

- **디스크 친화**: 노드 = 페이지([[db-storage]]), 높은 fanout → 적은 디스크 접근 (10억 행이 3~4 페이지 읽기)
- **범위 스캔**: 리프가 연결 리스트 → `WHERE age BETWEEN 20 AND 40`이 리프 순회로 O(범위)
- **정렬 유지**: ORDER BY 공짜
- 해시 인덱스는 등호(`=`)만, 범위·정렬 불가 → 그래서 기본은 B+tree

data-structures/[[b-trees]]에서 "왜 이진 트리가 아니라 B-tree인가"의 실전.

## 클러스터드 vs 논클러스터드

인덱스와 실제 데이터의 관계로 갈림:

### 클러스터드 인덱스 (clustered)

**데이터 자체가 인덱스 순서로 저장**:

```
인덱스 = 데이터 (리프에 실제 행)
```

- 테이블당 하나만 (물리적 순서는 하나)
- 보통 기본 키 → 기본 키 순으로 물리 저장 (MySQL InnoDB)
- 기본 키 조회·범위가 매우 빠름 (리프가 곧 데이터)

### 논클러스터드 인덱스 (secondary)

**인덱스는 별도, 리프가 행 위치를 가리킴**:

```
인덱스 리프 → 행 ID(또는 기본 키) → 실제 행 조회
```

- 여러 개 가능 (열마다 인덱스)
- 인덱스 찾은 뒤 실제 행을 또 조회 (**세컨더리 조회, bookmark lookup**) → 추가 비용
- PostgreSQL은 모든 인덱스가 논클러스터드 (heap + 인덱스 분리)

## 커버링 인덱스

실측의 "COVERING INDEX"가 핵심 최적화:

- 쿼리에 필요한 **모든 열이 인덱스에** 있으면 → 실제 행 조회 불필요 (인덱스만으로 답)
- 세컨더리 조회 회피 → 빠름
- `SELECT val FROM t WHERE val=x`에서 인덱스가 val을 담으니 테이블 안 봄
- 자주 함께 조회하는 열을 인덱스에 포함시켜 유도

## 인덱스의 대가

인덱스는 공짜가 아님:

- **쓰기 느려짐**: INSERT/UPDATE/DELETE 시 인덱스도 갱신 (B+tree 재조정)
- **공간**: 인덱스가 디스크 차지
- **너무 많으면**: 쓰기 부담↑, 최적화기 혼란
- → 조회 패턴에 맞는 인덱스만 (무작정 다 걸면 역효과) → [[index-usage]]

읽기 vs 쓰기 트레이드오프. 읽기 많으면 인덱스 이득, 쓰기 많으면 부담.

## LSM-tree 대안

쓰기 많은 워크로드는 B+tree 대신 LSM-tree → [[lsm-tree]]:
- B+tree는 제자리 갱신 → SSD에 부담 (os/[[ssd-internals]])
- LSM은 순차 쓰기 → 쓰기 최적. Cassandra, RocksDB

## 연결

- B+tree 자료구조 → data-structures/[[b-trees]]
- 페이지 저장 → [[db-storage]]
- 인덱스 실전 사용 → [[index-usage]]
- 쓰기 최적 대안 → [[lsm-tree]]
- 쿼리 실행에서 인덱스 → [[query-execution]]

## 궁금한 것 (나중에)

- [ ] 복합 인덱스의 리프 정렬 (열 순서) → [[index-usage]]
- [ ] 인덱스 전용 스캔 (index-only scan)
- [ ] partial index, expression index
- [ ] fillfactor와 페이지 분할

## 출처

- CMU 15-445 인덱스, data-structures/[[b-trees]]
