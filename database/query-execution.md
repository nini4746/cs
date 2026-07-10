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

## 셀프 체크

> [!question]- iterator(Volcano) 모델은 어떻게 동작하며 장점과 단점은?
> 각 연산자가 iterator라서 `next()`를 호출하면 다음 행 하나를 반환하고, 최상위가 당기면 아래로 전파되어 한 행씩 pull된다. 장점은 파이프라이닝으로 중간 결과를 통째 저장하지 않아 메모리를 아낀다는 것. 단점은 행마다 함수 호출 오버헤드가 커서, 현대 엔진은 벡터화 실행이나 JIT 컴파일로 개선한다.

> [!question]- 세 JOIN 알고리즘의 복잡도와 각각 유리한 상황은?
> Nested loop은 O(N×M)이나 오른쪽에 인덱스가 있으면 O(N log M)이라 작은 테이블·인덱스 있을 때 유리. Hash join은 O(N+M)으로 큰 등호 조인의 기본이지만 해시 테이블이 메모리에 맞아야 한다. Sort-merge는 O(N log N + M log M)로 이미 정렬됐거나 범위 조인·정렬 출력에 좋다.

> [!question]- Hash join에서 해시 테이블이 메모리에 안 맞으면 어떻게 처리하나?
> 양쪽을 조인 키로 파티션해 디스크에 나눠 쓰고, 파티션 쌍끼리 조인하는 grace hash join을 쓴다. 이는 큰 데이터를 캐시/메모리에 맞는 블록으로 쪼개 처리하는 블로킹 발상과 같다.

> [!question]- 커버링 인덱스(인덱스 전용 스캔)가 일반 인덱스 스캔보다 빠른 이유는?
> 인덱스 전용 스캔은 쿼리가 필요로 하는 모든 열이 인덱스 안에 있어 인덱스만 읽고 테이블(힙)을 다시 조회하지 않는다. 일반 인덱스 스캔은 인덱스로 위치를 찾은 뒤 테이블 행을 가져오는 추가 랜덤 I/O가 든다.

## 연습문제

> [!example]- 문제: `SELECT * FROM orders o JOIN users u ON o.user_id = u.id WHERE u.id = 42`에서 users.id는 PK, orders.user_id에 인덱스가 있다. 최적화기가 고를 JOIN 방식과 접근 경로를 추론하라.
> **풀이**
> `u.id = 42`는 PK 등호 조건이라 users에서 1행만 나온다. 이 1행을 바깥(왼쪽)으로 두고 orders를 안쪽에 두는 **index nested loop join**이 유리하다.
> 접근 경로: users는 PK 인덱스로 1행 조회, orders는 `user_id` 인덱스로 42에 해당하는 행만 인덱스 스캔.
> 왼쪽이 1행뿐이라 hash join의 해시 테이블 구축 비용이나 sort-merge의 정렬 비용이 낭비다. 따라서 nested loop + 인덱스 조합이 최소 비용.

> [!example]- 문제: 두 대형 테이블을 등호 조인하는데(`a.k = b.k`) 양쪽 다 정렬돼 있지 않고 인덱스도 없다. 어떤 JOIN을 선택하고 이유를 설명하라. 만약 결과를 `ORDER BY k`로 요구한다면 판단이 바뀌는가?
> **풀이**
> 기본 선택: **hash join**. O(N+M)으로 큰 등호 조인에 가장 빠르고, 인덱스가 없어 index nested loop은 불가하며 nested loop은 O(N×M)로 폭발한다.
> `ORDER BY k` 요구 시: sort-merge join을 재고한다. hash join은 결과가 정렬되지 않아 뒤에 별도 정렬이 필요한데, sort-merge는 조인 과정에서 이미 k로 정렬하므로 정렬 출력을 공짜로 얻는다. 조인 비용 + 정렬 비용 총합을 비교해 최적화기가 결정한다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1. 쿼리가 연산자 트리로 표현되고 iterator 모델로 한 행씩 pull된다는 것과, 그 오버헤드를 줄이는 방향(벡터화·JIT).
> 2. 세 JOIN 알고리즘의 복잡도·메모리 요구·유리한 상황을 각각 구분해 설명.
> 3. 접근 경로(seq/index/index-only scan) 선택 기준과 실행 vs 최적화의 역할 분담.

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
