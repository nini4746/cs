# 쿼리 최적화 (Query Optimization)

## 한 줄 요약

같은 SQL을 실행하는 여러 방법 중 최선의 실행 계획을 고르는 것. 비용 기반 최적화기가 통계로 각 계획의 비용을 추정해 최소를 선택한다. 통계가 틀리면 나쁜 계획이 나온다.

## 왜 필요한가

- 선언적 SQL([[relational-model]])이 어떻게 효율적으로 실행되나
- 왜 쿼리가 갑자기 느려지나 (나쁜 계획)
- 통계·힌트가 왜 중요한가

## 문제: 계획이 많다

한 SQL을 실행하는 방법이 **지수적으로 많음**:

```
SELECT ... FROM a JOIN b JOIN c WHERE ...
- JOIN 순서: (a⋈b)⋈c vs a⋈(b⋈c) vs ...
- 각 JOIN 방식: nested loop / hash / merge ([[query-execution]])
- 각 접근 경로: 풀스캔 / 인덱스 ([[index-usage]])
```

이 조합 중 **가장 빠른 계획**을 골라야. 최적화기(optimizer)의 일.

## 비용 기반 최적화 (cost-based)

각 계획의 **예상 비용을 추정해 최소를 선택**:

```
1. 가능한 계획들 생성 (JOIN 순서, 방식, 접근 경로)
2. 각 계획의 비용 추정 (I/O + CPU)
3. 최소 비용 계획 선택
```

- **비용 = 디스크 I/O + CPU** 추정 (computer-architecture/[[memory-hierarchy]]의 디스크가 지배)
- 모든 계획을 다 보면 폭발 → **동적 계획법**(algorithms/[[dp-fundamentals]])으로 JOIN 순서 탐색 (System R 알고리즘), 휴리스틱으로 가지치기

## 통계 (statistics)

비용 추정의 핵심 입력 - 최적화기가 데이터에 대해 아는 것:

- **행 수(cardinality)**: 테이블·조건의 예상 행 수
- **히스토그램**: 값 분포 (선택도 → [[index-usage]] 추정)
- **고유값 수**: 조인·GROUP BY 크기 추정
- `ANALYZE`로 갱신 (샘플링)

**통계가 오래되거나 틀리면 → 나쁜 계획**:
- 실제론 100만 행인데 100행으로 추정 → nested loop 골랐다 폭망
- 대량 삽입 후 ANALYZE 안 하면 옛 통계로 잘못 판단
- 쿼리가 갑자기 느려지는 흔한 원인 → EXPLAIN ANALYZE로 추정 vs 실제 비교 ([[index-usage]])

## 규칙 기반 변환

비용 계산 전, 항상 이득인 변환들 (heuristic):

- **조건 하향(predicate pushdown)**: WHERE를 최대한 아래로 → 일찍 필터해 데이터 줄임
- **투영 하향**: 필요한 열만 일찍 선택
- **상수 폴딩**: `WHERE 1=1` 제거 (computer-architecture/[[compiler-optimization-limits]]의 그것)
- **서브쿼리 평탄화**: 상관 서브쿼리를 JOIN으로 ([[sql-deep-dive]])

컴파일러 최적화(compilers/[[codegen-and-optimization]])와 같은 발상 - 의미 보존하며 더 효율적으로.

## JOIN 순서

가장 중요한 최적화 - JOIN 순서가 성능을 크게 좌우:

- **중간 결과 크기 최소화**: 작은 결과를 먼저 만들어 다음 JOIN 입력을 줄임
- 선택도 높은(많이 거르는) JOIN을 먼저
- N개 테이블 JOIN 순서 = N! → DP로 탐색 (algorithms/[[dp-fundamentals]])
- 잘못된 순서 = 거대한 중간 결과 → 느림

## 왜 갑자기 느려지나 (실무)

같은 쿼리가 어제는 빠르고 오늘 느림 → 흔한 원인:

1. **통계 오래됨**: 데이터 변했는데 ANALYZE 안 함 → 나쁜 계획
2. **계획 플립**: 데이터 분포 변화로 최적화기가 다른(나쁜) 계획 선택
3. **파라미터 스니핑**: 첫 실행 파라미터로 계획 캐싱 → 다른 파라미터엔 부적합
4. **인덱스 사라짐/추가**: 계획 바뀜

진단: EXPLAIN ANALYZE로 계획 확인 → 통계 갱신, 힌트, 쿼리 재작성.

## 힌트와 강제

최적화기가 틀릴 때 개입:
- **힌트**: 특정 인덱스·JOIN 방식 강제 (Oracle, MySQL)
- **통계 갱신**: ANALYZE
- **쿼리 재작성**: 최적화기가 잘 다루는 형태로
- **plan 고정**: 좋은 계획을 강제 (plan baseline)

최후 수단 - 대부분 통계·인덱스로 해결.

## 연결

- 선언적 SQL → [[relational-model]], [[sql-deep-dive]]
- 실행 방법 → [[query-execution]]
- 선택도·인덱스 → [[index-usage]], [[btree-index]]
- JOIN 순서 DP → algorithms/[[dp-fundamentals]]
- 규칙 변환 = 컴파일러 최적화 → compilers/[[codegen-and-optimization]]
- I/O 비용 → computer-architecture/[[memory-hierarchy]]

## 궁금한 것 (나중에)

- [ ] System R JOIN 순서 DP 알고리즘
- [ ] 히스토그램 종류 (equi-width vs equi-depth)
- [ ] 파라미터 스니핑 해결책
- [ ] 적응형 쿼리 실행 (실행 중 계획 수정)

## 출처

- CMU 15-445 쿼리 최적화, Selinger et al. (System R, 1979)
