# 쿼리 실행 (Query Execution)

## 한 줄 요약

SQL 쿼리를 실제로 실행하는 방법. 연산자(스캔, JOIN, 집계)를 트리로 조합하고, iterator 모델로 한 행씩 끌어올린다. JOIN 알고리즘 선택(nested loop / hash / merge)이 성능을 좌우한다.

## 왜 필요한가

- SQL이 실제로 어떻게 실행되나
- JOIN이 세 가지 방식 중 뭘 쓰나
- EXPLAIN의 연산자를 이해

## 쿼리 = 연산자 트리

SQL을 관계 대수([[relational-model]]) 연산자의 트리로:

```
SELECT ... FROM a JOIN b WHERE ... GROUP BY ...
→        집계 (GROUP BY)
          |
        필터 (WHERE)
          |
        JOIN (a ⋈ b)
        /    \
    스캔 a   스캔 b
```

각 연산자가 아래에서 데이터를 받아 처리해 위로. 실행 계획([[index-usage]]의 EXPLAIN)이 이 트리.

## Iterator 모델 (Volcano)

가장 흔한 실행 모델 - 각 연산자가 **iterator**:

```
각 연산자: next() 호출하면 다음 행 하나 반환
  최상위가 next() 호출 → 아래로 전파 → 한 행씩 끌어올림 (pull)
```

- **pull 기반**: 위에서 당기면 아래가 한 행씩 생산 (programming-languages/[[functional-programming]]의 lazy와 유사)
- **파이프라이닝**: 중간 결과를 통째 저장 안 하고 흐름으로 → 메모리 절약
- 단점: 행마다 함수 호출 오버헤드 → 현대는 **벡터화 실행**(한 번에 여러 행, computer-architecture/[[simd]])이나 컴파일(JIT → programming-languages/[[compiled-vs-interpreted]])로 개선

## JOIN 알고리즘 (핵심)

JOIN([[sql-deep-dive]])을 실제로 실행하는 세 방법 - 상황에 따라 최적화기가 선택:

### Nested Loop Join

```
for 각 왼쪽 행:
    for 각 오른쪽 행:
        조건 맞으면 결합
```

- O(N×M) - 단순, 작은 테이블에 OK
- 오른쪽에 인덱스([[btree-index]]) 있으면 안쪽 루프가 O(log M) → **index nested loop** (빠름)
- 한쪽이 작을 때 유리

### Hash Join

```
1. 작은 테이블로 해시 테이블 구축 (조인 키 → 행)
2. 큰 테이블을 스캔하며 해시 조회
```

- O(N+M) - 등호 조인에 빠름
- 해시 테이블(data-structures/[[hash-tables]])이 메모리에 맞아야 (안 맞으면 파티션해 디스크 - grace hash join, computer-architecture/[[matrix-blocking]]의 블로킹 발상)
- 큰 테이블 등호 조인의 기본

### Sort-Merge Join

```
1. 양쪽을 조인 키로 정렬
2. 두 정렬 리스트를 병합하며 매칭
```

- O(N log N + M log M) - 정렬 비용
- 이미 정렬됐거나(인덱스 순) 정렬이 필요하면(ORDER BY) 유리
- 범위 조인·정렬 출력에 좋음

| JOIN | 복잡도 | 언제 |
|---|---|---|
| nested loop | O(NM), 인덱스면 O(N log M) | 작은 테이블, 인덱스 있음 |
| hash | O(N+M) | 큰 등호 조인 |
| sort-merge | O(N log N) | 이미 정렬, 범위 조인 |

## 집계 실행

GROUP BY([[sql-deep-dive]]) 실행:
- **해시 집계**: 그룹 키로 해시 테이블, 각 그룹 누적 (data-structures/[[hash-tables]])
- **정렬 집계**: 정렬 후 연속된 같은 키 묶음
- 최적화기가 선택 (해시가 흔함, 정렬은 이미 정렬됐을 때)

## 접근 방법 (access path)

테이블에서 행을 가져오는 법:
- **풀스캔(seq scan)**: 전체 읽기 → 많은 행 필요할 때
- **인덱스 스캔**: 인덱스로 좁혀 조회 → 소수 행 ([[btree-index]], [[index-usage]])
- **인덱스 전용 스캔**: 커버링 인덱스 → 테이블 안 봄
- 최적화기가 선택도([[index-usage]]) 보고 선택

## 실행 vs 최적화

- **실행(execution)**: 계획대로 데이터 처리 (이 노트)
- **최적화(optimization)**: 어떤 계획을 쓸지 결정 → [[query-optimization]]
- 최적화기가 JOIN 방식·접근 경로·순서를 정하면 실행기가 수행

## 연결

- 관계 대수 연산자 → [[relational-model]]
- 어떤 계획을 고르나 → [[query-optimization]]
- JOIN 종류 → [[sql-deep-dive]]
- 해시 조인 = 해시 테이블 → data-structures/[[hash-tables]]
- grace hash = 블로킹 → computer-architecture/[[matrix-blocking]]
- 인덱스 접근 → [[btree-index]], [[index-usage]]
- 벡터화 → computer-architecture/[[simd]]

## 궁금한 것 (나중에)

- [ ] 벡터화 실행 엔진 (한 번에 배치)
- [ ] 쿼리 컴파일 (JIT로 계획을 코드로)
- [ ] grace hash join의 파티셔닝
- [ ] 병렬 쿼리 실행 (여러 코어)

## 출처

- CMU 15-445 쿼리 실행, Silberschatz 15장
