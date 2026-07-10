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

## 셀프 체크

> [!question]- 인덱스 `(a, b, c)`가 있을 때 `WHERE b = ?` 조건은 왜 인덱스를 못 타나?
> 복합 인덱스는 a → b → c 사전순으로 정렬되어 b는 각 a 값 안에서만 정렬되어 있다. a를 건너뛰면 b가 전체적으로 정렬된 게 아니므로 정렬을 활용해 좁힐 수 없다. leftmost prefix 규칙 위반이다.

> [!question]- VARCHAR 열에 `WHERE zip = 12345`(숫자)는 인덱스를 못 타는데, 숫자 열에 `= '5'`(문자열)는 왜 인덱스를 타나?
> VARCHAR 열에 숫자를 비교하면 매 행의 열 값을 숫자로 변환해야 하므로 인덱스 정렬이 무력화된다. 반대로 숫자 열에 문자열 상수를 비교하면 상수 하나만 한 번 숫자로 변환되고 열 값은 그대로라 인덱스가 유지된다.

> [!question]- 선택도(selectivity)가 낮은 조건에서 최적화기가 인덱스 대신 풀스캔을 택하는 이유는?
> 조건이 대부분의 행을 매칭하면, 인덱스 조회 후 각 행을 세컨더리로 다시 읽는 비용이 그냥 테이블을 순차로 읽는 풀스캔보다 오히려 비싸진다. 최적화기는 통계로 선택도를 추정해 이 판단을 내린다.

> [!question]- EXPLAIN 출력에서 Seq Scan, Index Scan, Index Only Scan은 각각 무엇을 뜻하나?
> Seq Scan은 풀스캔(인덱스 못 탐), Index Scan은 인덱스로 위치를 찾아 테이블을 조회, Index Only Scan은 필요한 열이 모두 인덱스에 있어 테이블 조회 없이 인덱스만으로 답하는 커버링 인덱스 상황이다.

## 연습문제

> [!example]- 문제: 아래 쿼리들이 인덱스 `(country, city, age)`를 어디까지 활용하는지 판정하라. (1) `WHERE country='KR' AND city='Seoul'` (2) `WHERE country='KR' AND age>30` (3) `WHERE city='Seoul' AND age=25`
> **풀이**
> (1) country, city 앞 2개 연속 사용 → 인덱스 완전 활용(등호 2개).
> (2) country는 등호로 탐, age는 city를 건너뛰었으므로 인덱스로 좁히지 못하고 country='KR' 범위 내에서 필터링만 됨. 즉 country까지만 인덱스 활용.
> (3) country를 아예 안 썼으므로 leftmost prefix 위반 → 인덱스 못 탐(풀스캔).

> [!example]- 문제: `SELECT * FROM users WHERE UPPER(email) = 'A@B.COM'`이 인덱스 `(email)`을 안 탄다. 인덱스가 타도록 두 가지 방법을 제시하라.
> **풀이**
> 원인: 인덱스는 원본 email 값으로 정렬되어 있는데 함수 UPPER의 결과는 그 정렬과 무관하다.
> 방법 1 - expression index 생성: `CREATE INDEX idx_email_upper ON users (UPPER(email));` 그러면 UPPER(email) 값 자체가 정렬되어 조건이 인덱스를 탄다.
> 방법 2 - 애초에 정규화된 값을 저장하고 쿼리에서 함수를 없앤다: 저장 시 소문자로 통일해 `WHERE email = 'a@b.com'`로 조회. 원본 email 인덱스를 그대로 활용한다.

> [!example]- 문제: 느린 쿼리를 발견했다. 진단부터 해결까지의 표준 절차를 순서대로 쓰라.
> **풀이**
> 1) `EXPLAIN`(또는 PostgreSQL `EXPLAIN ANALYZE`)으로 실행 계획을 본다.
> 2) Seq Scan/Full Scan이면 인덱스를 못 탄 것 - 조건이 함수·타입불일치·부정·낮은 선택도 중 무엇에 걸렸는지 확인한다.
> 3) 행 추정치와 실제가 크게 다르면 통계가 오래된 것 → `ANALYZE`로 갱신.
> 4) 필요한 인덱스를 추가/수정(복합 인덱스면 등호 열을 앞, 범위 열을 뒤).
> 5) 다시 EXPLAIN으로 Index Scan으로 바뀌었는지 확인한다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1) B+tree 인덱스가 "정렬"에 의존한다는 사실로부터 타는/못 타는 조건(등호·범위·접두사 vs 함수·앞 와일드카드·타입불일치·부정)을 전부 도출할 수 있는가.
> 2) leftmost prefix 규칙을 전화번호부 비유로 설명하고, 등호 열은 앞·범위 열은 뒤라는 복합 인덱스 설계 원칙을 이유와 함께 말할 수 있는가.
> 3) 선택도가 인덱스 사용 여부를 좌우하는 이유와, EXPLAIN으로 이를 진단하는 흐름을 설명할 수 있는가.

## 연결

- B+tree 인덱스 구조 → [[btree-index]]
- 통계와 최적화기 → [[query-optimization]]
- JOIN 실행 방식 → [[query-execution]]
- SQL 쿼리 → [[sql-deep-dive]]
- 인덱스가 의존하는 정렬 구조 → data-structures/[[b-trees]]
- 선택도·카디널리티 추정의 통계 → math/[[statistics-basics]]

## 궁금한 것 (나중에)

- [ ] 통계 히스토그램과 카디널리티 추정
- [ ] 인덱스 힌트 (최적화기 강제)
- [ ] partial/expression/covering 인덱스 설계
- [ ] 인덱스 스캔 vs 비트맵 스캔

## 출처

- CMU 15-445, "Use The Index, Luke" (Markus Winand)
