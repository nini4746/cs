# SQL 심화 (SQL Deep Dive)

## 한 줄 요약

SQL의 핵심 - JOIN 종류(무엇을 남기나), 집계와 GROUP BY, 서브쿼리, window 함수. 선언적으로 "무엇을" 쓰면 DB가 "어떻게"를 정한다. 실행 의미를 알면 올바른 쿼리를 쓴다.

## 왜 필요한가

- INNER/LEFT JOIN을 헷갈리면 데이터가 사라지거나 늘어남
- GROUP BY, window 함수의 정확한 동작
- 서브쿼리 vs JOIN 선택

## JOIN: 테이블 결합

외래 키([[relational-model]])로 테이블을 연결. 종류가 "무엇을 남기나"로 갈림:

### INNER JOIN: 매칭만

양쪽에 **매칭되는 행만**. 실측 (users ⋈ orders):
```
Alice|100    Alice|200    Bob|50
(Carol은 주문 없어서 빠짐)
```

### LEFT JOIN: 왼쪽 전부

왼쪽 테이블 전부 + 매칭되면 오른쪽, 없으면 NULL:
```
Alice|100    Alice|200    Bob|50    Carol|(NULL)
(Carol이 주문 없어도 포함, amount는 NULL)
```

**차이가 결정적**: "주문 없는 사용자도 보고 싶으면" LEFT, "주문 있는 것만" INNER. 잘못 쓰면 데이터 누락/과다.

| JOIN | 남기는 것 |
|---|---|
| INNER | 양쪽 매칭 |
| LEFT | 왼쪽 전부 + 매칭 |
| RIGHT | 오른쪽 전부 + 매칭 |
| FULL OUTER | 양쪽 전부 |
| CROSS | 모든 조합 (곱) |

## 집계와 GROUP BY

행들을 그룹으로 묶어 집계 (COUNT, SUM, AVG, MAX, MIN):

실측 (사용자별 주문 수·합계):
```
Alice|2|300     ← 주문 2개, 합 300
Bob|1|50
Carol|0|(NULL)  ← LEFT JOIN이라 0개도 표시
```

- **GROUP BY user_id**: 각 사용자로 묶음
- 집계 함수가 각 그룹에 적용
- **HAVING**: 그룹에 조건 (WHERE는 그룹 전 행에, HAVING은 그룹 후에)
- 주의: SELECT에 집계 안 된 열은 GROUP BY에 있어야 함 (표준)

## Window 함수

집계처럼 계산하되 **행을 합치지 않고** 각 행에 결과 부여:

실측 (금액 순위):
```
Alice|200|1    ← RANK: 1위
Alice|100|2
Bob|50|3
```

- `RANK() OVER (ORDER BY amount DESC)`: 순위를 매기되 원본 행 유지
- GROUP BY는 행을 합치지만, window는 **각 행에 집계값** 추가
- 종류: ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD(이전/다음 행), 이동 평균(PARTITION + 프레임)
- 순위, 누적합, 이동평균, 그룹 내 비교에 강력. GROUP BY로 어려운 것

## 서브쿼리 vs JOIN

같은 결과를 두 방식으로:

```sql
-- 서브쿼리
SELECT name FROM users WHERE id IN (SELECT user_id FROM orders);
-- JOIN
SELECT DISTINCT u.name FROM users u JOIN orders o ON u.id=o.user_id;
```

- **상관 서브쿼리(correlated)**: 외부 행마다 실행 → 느릴 수 있음 (최적화기가 JOIN으로 바꾸기도)
- **JOIN**: 보통 최적화 잘 됨
- 최적화기가 종종 동등하게 처리하지만, 가독성·성능 위해 상황에 맞게 → [[query-optimization]]

## 쿼리 실행 순서 (논리적)

SQL은 작성 순서와 **실행 순서가 다름**:

```
작성: SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY
실행: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

- FROM/JOIN이 먼저 (테이블 결합)
- WHERE가 그룹 전 필터, HAVING이 그룹 후
- SELECT의 별칭을 WHERE에서 못 쓰는 이유 (SELECT가 나중)
- 이 순서를 알면 오류·성능 이해

## 선언적: 무엇 vs 어떻게

SQL은 **무엇을** 원하는지만 → DB가 **어떻게** 실행할지 결정 ([[relational-model]]):
- 같은 결과를 여러 방식으로 실행 가능 → 최적화기가 선택 → [[query-optimization]]
- 실행 계획을 EXPLAIN으로 확인 → [[index-usage]]

## 연결

- 관계형 기반 → [[relational-model]]
- 인덱스가 JOIN·WHERE 가속 → [[btree-index]], [[index-usage]]
- 실행 방법 → [[query-execution]], [[query-optimization]]
- 정규화된 스키마의 JOIN → [[normalization]]

## 궁금한 것 (나중에)

- [ ] CTE (WITH 절)와 재귀 쿼리
- [ ] window 프레임 (ROWS BETWEEN)
- [ ] LATERAL JOIN
- [ ] EXISTS vs IN 성능 차이

## 출처

- CMU 15-445 SQL, Silberschatz 3-5장
