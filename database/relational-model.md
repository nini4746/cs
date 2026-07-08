# 관계형 모델 (Relational Model)

## 한 줄 요약

데이터를 테이블(관계)로 표현하는 수학적 모델. 관계 대수라는 이론적 기반 위에 SQL이 세워졌다. 키로 행을 식별하고 테이블 간 관계를 맺는다.

## 왜 필요한가

- SQL이 왜 그렇게 생겼나의 이론적 뿌리
- 관계형 DB가 지배적인 이유
- 테이블·키·관계의 정확한 의미

## 관계 = 테이블

관계형 모델(Codd, 1970)은 데이터를 **관계(relation)** = 테이블로:

```
Users (테이블 = 관계)
┌────┬───────┬──────┐
│ id │ name  │ age  │   ← 속성(attribute) = 열(column)
├────┼───────┼──────┤
│ 1  │ Alice │ 30   │   ← 튜플(tuple) = 행(row)
│ 2  │ Bob   │ 25   │
└────┴───────┴──────┘
```

- **관계** = 테이블, **튜플** = 행, **속성** = 열
- **스키마**: 테이블 구조 (열 이름, 타입)
- **도메인**: 각 속성의 가능한 값 범위 (타입)

수학적으로 관계 = 튜플의 집합 → 순서 없음, 중복 없음 (이론상). SQL은 실용적으로 완화 (순서·중복 허용).

## 키

행을 식별하고 관계를 맺는 수단:

- **후보 키(candidate key)**: 행을 유일하게 식별하는 최소 속성 집합
- **기본 키(primary key)**: 선택된 후보 키 (행의 대표 식별자). NULL 불가, 유일
- **외래 키(foreign key)**: 다른 테이블의 기본 키를 참조 → 테이블 간 관계
- **슈퍼 키**: 유일 식별하는 속성 집합 (최소 아니어도)

```
Orders
┌────┬─────────┬────────┐
│ id │ user_id │ amount │
│    │  (FK)   │        │    ← user_id가 Users.id를 참조
└────┴─────────┴────────┘
```

외래 키가 테이블을 연결 → JOIN([[sql-deep-dive]])의 기반.

## 관계 대수 (relational algebra)

SQL의 이론적 기반 - 관계에 대한 연산:

| 연산 | 기호 | 의미 | SQL |
|---|---|---|---|
| **선택(select)** | σ | 조건 맞는 행 | WHERE |
| **투영(project)** | π | 특정 열만 | SELECT 열 |
| **합집합** | ∪ | 두 관계 합침 | UNION |
| **교집합** | ∩ | 공통 행 | INTERSECT |
| **차집합** | − | 빼기 | EXCEPT |
| **곱(cartesian)** | × | 모든 조합 | CROSS JOIN |
| **조인(join)** | ⋈ | 조건으로 결합 | JOIN |
| **이름변경** | ρ | 속성/관계 이름 | AS |

- **닫혀 있음(closure)**: 연산 결과도 관계 → 연산을 조합 가능 (중첩 쿼리)
- SQL 쿼리는 관계 대수 표현식으로 번역됨 → 쿼리 최적화의 기반 → [[query-optimization]]

## 무결성 제약 (integrity constraints)

데이터 정확성을 강제:

- **개체 무결성**: 기본 키는 NULL 불가, 유일
- **참조 무결성**: 외래 키는 참조하는 기본 키가 존재해야 (없는 user_id 참조 불가)
- **도메인 제약**: 값이 타입/범위 내
- **CHECK, UNIQUE, NOT NULL**: 추가 제약

참조 무결성이 "고아 레코드"(참조 대상 없는 외래 키)를 방지 → 삭제 시 CASCADE 등.

## 선언적 vs 절차적

관계형 모델의 힘 = **선언적**:

- **무엇을** 원하는지 기술 (SQL) → DB가 **어떻게** 결정 (실행 계획 → [[query-optimization]])
- 절차적(어떻게 가져올지 직접)과 대조 → programming-languages/[[functional-programming]]의 선언적 사고
- 최적화기가 최선의 실행 방법 선택 → 사용자는 논리에 집중

## 왜 관계형이 지배하나

- **수학적 기반**: 관계 대수로 정확성·최적화 보장
- **선언적 SQL**: 표현력 + 최적화 자동
- **ACID 트랜잭션** → [[transactions-acid]]
- **성숙한 생태계**: 수십 년 최적화
- NoSQL([[nosql-landscape]])이 특정 용도에 나오지만 관계형이 여전히 기본

## 연결

- SQL 상세 → [[sql-deep-dive]]
- 정규화 (좋은 스키마) → [[normalization]]
- 관계 대수 → 쿼리 최적화 → [[query-optimization]]
- 선언적 사고 → programming-languages/[[functional-programming]]
- 트랜잭션 → [[transactions-acid]]
- 대안 → [[nosql-landscape]]

## 궁금한 것 (나중에)

- [ ] 관계 대수 vs 관계 해석 (relational calculus)
- [ ] NULL의 3값 논리 (true/false/unknown)
- [ ] 관계형 모델의 정규형 → [[normalization]]
- [ ] 왜 Codd가 계층형·네트워크형 DB를 이겼나

## 출처

- CMU 15-445 관계형 모델, Silberschatz 2장, Codd (1970)
