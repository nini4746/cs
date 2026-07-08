# 집합·관계·함수 (Sets, Relations, Functions)

## 한 줄 요약

집합(모음), 관계(원소 간 연결), 함수(각 입력에 하나의 출력)는 수학의 기본 언어. 카디널리티와 대각선 논법은 무한의 크기를 다루고, 정지 문제 불가능성의 근거가 된다.

## 왜 필요한가

- CS의 기본 어휘 (타입=집합, DB=관계, 함수)
- 대각선 논법이 왜 중요한가 (결정 불가능성)
- 관계의 성질 (동치, 순서)

## 집합 (sets)

원소의 모음 (순서·중복 없음):

- **연산**: 합집합(∪), 교집합(∩), 차집합(−), 여집합, 곱집합(×)
- **부분집합**(⊆), 멱집합(2^S, 모든 부분집합)
- CS: **타입 = 값의 집합** (programming-languages/[[type-systems-advanced]]), 집합 자료구조 (data-structures/[[hash-tables]])
- 곱집합 = 관계형 곱 (database/[[relational-model]]의 CROSS JOIN)

## 관계 (relations)

집합 원소 간의 **연결** (A×B의 부분집합):

- `(a, b) ∈ R`: a와 b가 관계 있음
- **관계형 DB**가 이것 (database/[[relational-model]] - 테이블 = 관계)

관계의 성질:
- **반사(reflexive)**: 모든 a에서 aRa (a = a)
- **대칭(symmetric)**: aRb면 bRa
- **추이(transitive)**: aRb, bRc면 aRc

### 동치 관계 (equivalence)

반사 + 대칭 + 추이 → **동치류(equivalence class)**로 분할:
- 예: mod n 합동 (math/[[modular-arithmetic]]) - 같은 나머지끼리
- automata/[[dfa-minimization]]의 Myhill-Nerode (구별 불가 상태 = 동치류)

### 순서 관계 (order)

반사 + 반대칭 + 추이 → **부분 순서**:
- 위상 정렬(algorithms/[[graph-traversal]])의 의존 순서
- 전체 순서(total order): 모든 쌍 비교 가능 (정렬 algorithms/[[comparison-sorts]])

## 함수 (functions)

각 입력에 **정확히 하나의 출력** (특수한 관계):

`f: A → B` (A=정의역, B=공역):

- **단사(injective, one-to-one)**: 다른 입력 → 다른 출력 (충돌 없음)
- **전사(surjective, onto)**: 모든 출력이 도달됨 (공역 다 씀)
- **전단사(bijective)**: 단사 + 전사 (일대일 대응) → 역함수 존재

CS: 함수형 프로그래밍(programming-languages/[[functional-programming]]), 해시 함수(단사 아님 - 충돌 data-structures/[[hash-tables]]).

## 카디널리티 (cardinality)

집합의 **크기**. 무한 집합도 크기 비교:

- **가산 무한(countable)**: 자연수와 일대일 대응 (정수, 유리수) - "셀 수 있는" 무한
- **비가산 무한(uncountable)**: 자연수보다 큼 (실수) - 대각선 논법으로 증명

## 대각선 논법 (diagonalization)

칸토어의 증명 기법 - **실수가 자연수보다 많음**:

```
실수를 자연수와 대응(나열)했다고 가정
→ 각 실수의 n번째 자리를 바꾼 새 실수 구성 (대각선)
→ 이 새 실수는 목록의 어느 것과도 다름 (n번째 자리가 다름)
→ 목록에 없음 → 나열 불가능 → 비가산
```

**CS의 핵심 응용** - 불가능성 증명:
- **정지 문제 불가능**(automata/[[decidability]]): 대각선으로 자기 참조 모순
- **비가산 언어 vs 가산 프로그램**: 프로그램은 셀 수 있지만(가산) 언어는 비가산 → 대부분 언어는 어떤 프로그램에도 대응 안 됨 (automata/[[decidability]])
- 같은 논법이 러셀 역설, 괴델 불완전성

## CS와의 연결 (종합)

집합·관계·함수가 CS 곳곳:

- **타입 = 집합** → programming-languages/[[type-systems-advanced]]
- **DB = 관계** → database/[[relational-model]]
- **동치류** → automata/[[dfa-minimization]]
- **순서** → 정렬, 위상정렬
- **대각선** → 정지 문제 → automata/[[decidability]]
- **함수** → 함수형 → programming-languages/[[functional-programming]]

## 연결

- 논리 → [[logic-and-proofs]]
- 관계형 DB → database/[[relational-model]]
- 동치류 (DFA 최소화) → automata/[[dfa-minimization]]
- 대각선 (정지 문제) → automata/[[decidability]]
- 타입 = 집합 → programming-languages/[[type-systems-advanced]]
- mod 동치 → [[modular-arithmetic]]

## 궁금한 것 (나중에)

- [ ] 러셀 역설과 집합론 공리 (ZFC)
- [ ] 연속체 가설
- [ ] 괴델 불완전성과 대각선
- [ ] 순서수·기수 (ordinal/cardinal)

## 출처

- Rosen "Discrete Mathematics" 2장, 칸토어
