# 인덱스 활용 (Index Usage)

## 한 줄 요약

인덱스를 언제 타고 안 타나, 복합 인덱스의 열 순서가 왜 중요한가, EXPLAIN으로 실행 계획을 읽는 법. 인덱스를 만들어도 잘못 쓰면 무용지물이다.

## 왜 필요한가

- 인덱스를 만들었는데 왜 안 타나
- 복합 인덱스 열 순서를 어떻게 정하나
- 쿼리가 느릴 때 진단하는 법

## 인덱스를 타는 조건

B+tree 인덱스([[btree-index]])는 **정렬**에 의존 → 정렬을 활용할 수 있어야 탐:

**타는 경우:**
- 등호: `WHERE val = 5`
- 범위: `WHERE val BETWEEN 10 AND 20`, `val > 5`
- 정렬: `ORDER BY val` (인덱스 순서 그대로)
- 접두사: `WHERE name LIKE 'abc%'` (앞부분 고정)

**못 타는 경우:**
- 함수 적용: `WHERE UPPER(name) = 'X'` (인덱스는 원본 값 정렬 → 함수 결과는 모름). 해결: expression index
- 앞이 와일드카드: `LIKE '%abc'` (접두사 안 고정 → 정렬 무의미)
- 타입 불일치: VARCHAR 열에 숫자 비교 `WHERE zip = 12345` (열을 매 행 변환 → 인덱스 무력. 반대로 숫자 열에 `= '5'`는 상수만 한 번 변환돼 인덱스 유지)
- 부정: `!=`, `NOT IN` (범위로 좁힐 수 없음)
- 낮은 선택도: 조건이 대부분 행 매칭 → 풀스캔이 더 나음 (최적화기 판단)

## 선택도 (selectivity)

인덱스 효율 = **얼마나 좁히나**:

- **높은 선택도**: 조건이 소수 행만 (고유값 많음, 예: 이메일) → 인덱스 이득 큼
- **낮은 선택도**: 조건이 다수 행 (예: 성별 boolean) → 인덱스보다 풀스캔이 나을 수 있음 (인덱스 조회 + 세컨더리 조회가 풀스캔보다 비쌈)
- 최적화기가 **통계**([[query-optimization]])로 선택도 추정해 인덱스 여부 결정

## 복합 인덱스: 열 순서가 핵심

여러 열 인덱스 `(a, b, c)`는 **정렬이 a→b→c 순** (사전순):

```
(a,b,c) 인덱스는:
  WHERE a=? 
  WHERE a=? AND b=?
  WHERE a=? AND b=? AND c=?     ← 앞에서부터 연속으로 써야 탐
  ORDER BY a, b, c
```

**leftmost prefix 규칙**: 앞 열부터 연속으로 써야 인덱스 활용:
- `WHERE a=? AND b=?` → 탐 (a, b 앞 2개)
- `WHERE b=?` (a 건너뜀) → **못 탐** (b는 각 a 안에서만 정렬)
- `WHERE a=? AND c=?` → a만 탐, c는 못 씀 (b 건너뛰어서)

전화번호부 비유: (성, 이름) 정렬이면 "성으로 찾기"·"성+이름"은 빠르지만 "이름만"은 전체 뒤짐.

**설계**: 자주 함께·순서대로 쓰는 열을, 등호 조건 열을 앞에, 범위 열을 뒤에.

## EXPLAIN: 실행 계획 읽기

쿼리가 어떻게 실행되는지 → 성능 진단의 핵심 도구:

```sql
EXPLAIN SELECT ... ;           -- 계획
EXPLAIN ANALYZE SELECT ... ;   -- 실제 실행 + 시간 (PostgreSQL)
```

읽을 것:
- **Seq Scan / Full Scan**: 풀스캔 (인덱스 못 탐 - 의도했나?)
- **Index Scan / Index Seek**: 인덱스 사용 (좋음)
- **Index Only Scan**: 커버링 인덱스 ([[btree-index]])
- **행 추정 vs 실제**: 통계가 틀리면 나쁜 계획 → ANALYZE로 통계 갱신
- **JOIN 방식**: nested loop / hash / merge → [[query-execution]]
- **비용(cost)**: 최적화기의 추정

느린 쿼리 → EXPLAIN → 풀스캔이면 인덱스 추가/수정 → 다시 확인. [[btree-index]]에서 본 SEARCH vs SCAN의 실전 진단.

## 흔한 함정

1. **인덱스 만들었는데 안 탐**: 함수·타입불일치·낮은 선택도·통계 오래됨
2. **복합 인덱스 순서 틀림**: leftmost prefix 위반
3. **너무 많은 인덱스**: 쓰기 느려짐 ([[btree-index]])
4. **통계 오래됨**: 최적화기가 잘못 판단 → ANALYZE
5. **OR 조건**: 인덱스 못 탈 수 있음 (UNION으로 바꾸기도)

## 연결

- B+tree 인덱스 구조 → [[btree-index]]
- 통계와 최적화기 → [[query-optimization]]
- JOIN 실행 방식 → [[query-execution]]
- SQL 쿼리 → [[sql-deep-dive]]

## 궁금한 것 (나중에)

- [ ] 통계 히스토그램과 카디널리티 추정
- [ ] 인덱스 힌트 (최적화기 강제)
- [ ] partial/expression/covering 인덱스 설계
- [ ] 인덱스 스캔 vs 비트맵 스캔

## 출처

- CMU 15-445, "Use The Index, Luke" (Markus Winand)
