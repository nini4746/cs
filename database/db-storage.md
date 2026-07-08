# DB 저장 구조 (Database Storage)

## 한 줄 요약

DB가 디스크에 데이터를 어떻게 배치하나 - 페이지 단위로 나누고, 슬롯 구조로 가변 길이 행을 담는다. row store(행 단위)와 column store(열 단위)가 워크로드에 따라 갈린다.

## 왜 필요한가

- DB가 파일에 실제로 어떻게 저장하나
- OLTP와 OLAP 저장이 왜 다른가 (row vs column)
- 페이지가 왜 저장의 기본 단위인가

## 페이지: 저장의 단위

DB는 디스크를 **고정 크기 페이지**(보통 4~16KB)로 나눔 → computer-architecture/[[memory-hierarchy]], os/[[ssd-internals]]의 블록:

- 디스크/SSD가 블록 단위 접근 → 페이지 = 블록에 맞춤
- 읽기/쓰기가 페이지 단위 (한 행만 필요해도 페이지 통째)
- **버퍼 풀**([[buffer-pool]])이 페이지를 메모리에 캐싱

## 슬롯 구조 (slotted page)

가변 길이 행(문자열 등)을 페이지에 담는 표준:

```
페이지:
[헤더][슬롯 배열 →][......빈 공간......][← 실제 행 데이터]
      각 슬롯 = (오프셋, 길이)          행들이 뒤에서 앞으로
```

- **슬롯 배열**: 각 행의 위치(오프셋)를 가리킴 (앞에서 자람)
- **행 데이터**: 뒤에서 앞으로 자람
- 둘이 가운데 빈 공간을 향해 → 페이지가 찰 때까지
- **간접 참조**: 행 ID = (페이지, 슬롯번호). 슬롯을 통해 접근 → 행이 페이지 내 이동해도 슬롯만 갱신 (data-structures/[[linked-lists]]의 간접과 유사)

## 행 저장 (row store) - OLTP

한 행의 모든 열을 **함께 저장**:

```
[id=1,name=Alice,age=30][id=2,name=Bob,age=25]...
 ← 한 행이 연속
```

- **한 행 전체 접근이 빠름**: `SELECT * WHERE id=1` → 한 곳에서 다 읽음
- **트랜잭션(OLTP)에 최적**: 개별 레코드 삽입/수정/조회
- 대부분 전통 DB (PostgreSQL, MySQL 기본)
- 단점: 한 열만 집계(`AVG(age)`)해도 모든 열을 읽음 → 낭비

## 열 저장 (column store) - OLAP

한 열의 모든 값을 **함께 저장**:

```
id:   [1,2,3,...]
name: [Alice,Bob,...]
age:  [30,25,...]
 ← 한 열이 연속
```

- **집계·분석이 빠름**: `AVG(age)` → age 열만 순차 읽음 (필요한 것만)
- **압축 잘 됨**: 같은 열 = 비슷한 값 → 압축률↑ (computer-architecture/[[data-layout]]의 SoA)
- **SIMD 벡터화**: 같은 타입 연속 → computer-architecture/[[simd]]
- **분석(OLAP)에 최적**: 몇 열을 많은 행에 걸쳐 집계
- 단점: 한 행 전체 조회는 여러 열을 모아야 → 느림
- 예: ClickHouse, Redshift, Parquet, DuckDB

## row vs column 정리

| | row store | column store |
|---|---|---|
| 저장 단위 | 행 연속 | 열 연속 |
| 강점 | 개별 레코드 (OLTP) | 집계·분석 (OLAP) |
| 압축 | 낮음 | 높음 |
| SIMD | 어려움 | 쉬움 |
| 예 | PostgreSQL, MySQL | ClickHouse, Redshift |

**워크로드가 저장 방식을 정함** → computer-architecture/[[data-layout]]의 AoS vs SoA와 정확히 같은 트레이드오프. 이게 [[normalization]]의 OLTP/OLAP 구분과 연결.

## 파일 조직

테이블을 파일에 배치하는 방식:

- **heap file**: 순서 없이 (삽입 순). 스캔은 전체 순회
- **정렬 파일**: 키 순 정렬 → 범위 조회 빠름, 삽입 비쌈
- **인덱스 조직(clustered)**: 인덱스 순서로 저장 → [[btree-index]]

대부분 heap file + 별도 인덱스([[btree-index]]) 조합.

## TOAST / 큰 값

페이지보다 큰 값(긴 문자열, BLOB)은 별도 저장:
- PostgreSQL TOAST: 큰 값을 압축하거나 별도 테이블에
- 행에는 포인터만 → 행이 페이지에 맞게

## 연결

- 페이지 = 블록 → computer-architecture/[[memory-hierarchy]], os/[[ssd-internals]]
- 버퍼 풀 캐싱 → [[buffer-pool]]
- row/column = AoS/SoA → computer-architecture/[[data-layout]]
- column의 SIMD → computer-architecture/[[simd]]
- OLTP/OLAP → [[normalization]]
- 인덱스 조직 → [[btree-index]]

## 궁금한 것 (나중에)

- [ ] column store 압축 기법 (RLE, 딕셔너리, delta)
- [ ] 하이브리드 (HTAP) - row+column 동시
- [ ] PostgreSQL의 페이지 레이아웃 상세
- [ ] Parquet 파일 포맷

## 출처

- CMU 15-445 저장 (디스크, 페이지, 튜플)
