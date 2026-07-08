# 논리와 증명 (Logic and Proofs)

## 한 줄 요약

명제 논리·술어 논리로 참/거짓을 형식화하고, 증명 기법(직접·대우·모순·귀납)으로 명제를 확립한다. 알고리즘 정당성·타입 시스템·형식 검증의 기반.

## 왜 필요한가

- 알고리즘이 "맞다"를 어떻게 증명하나 (algorithms/[[correctness-proofs]])
- 논리 연산이 프로그래밍과 어떻게 연결되나
- 증명 기법의 도구상자

## 명제 논리 (propositional logic)

참/거짓인 **명제**와 연결사:

| 연산 | 기호 | 의미 | 프로그래밍 |
|---|---|---|---|
| 부정 | ¬P | not P | `!p` |
| 논리곱 | P ∧ Q | P and Q | `p && q` |
| 논리합 | P ∨ Q | P or Q | `p \|\| q` |
| 함의 | P → Q | P면 Q | `if p then q` |
| 동치 | P ↔ Q | P iff Q | `p == q` |

- **진리표**: 모든 경우의 참/거짓
- 논리 연산이 곧 불 대수 (computer-architecture/[[bits-and-integers]]의 비트 연산 - AND/OR/NOT이 회로)

### 함의의 함정

`P → Q`: "P면 Q". 헷갈리는 점:
- **P가 거짓이면 → 전체 참** (vacuously true): "비가 오면 우산 쓴다"에서 비 안 오면 명제는 참
- **대우**: `P → Q` ≡ `¬Q → ¬P` (동치! 증명에 활용)
- **역·이는 동치 아님**: `Q → P`(역), `¬P → ¬Q`(이)는 원명제와 다름

## 술어 논리 (predicate logic)

명제에 **변수와 한정사** 추가 (더 표현력):

- **전칭(∀)**: "모든 x에 대해" (`∀x P(x)`)
- **존재(∃)**: "어떤 x가 존재해" (`∃x P(x)`)
- 예: "모든 정수는 후속자가 있다" `∀n ∃m (m = n+1)`

**부정 규칙** (드모르간 확장):
- `¬∀x P(x)` ≡ `∃x ¬P(x)` ("모두 참"의 부정 = "하나는 거짓")
- `¬∃x P(x)` ≡ `∀x ¬P(x)`

반례 하나로 전칭 명제를 반증하는 근거.

## 증명 기법

명제를 확립하는 방법들 (algorithms/[[correctness-proofs]]의 기반):

### 직접 증명 (direct)

`P → Q`: P를 가정하고 Q를 유도. 가장 기본.

### 대우 증명 (contrapositive)

`P → Q` 대신 `¬Q → ¬P` 증명 (동치). 원명제가 어려울 때.

### 모순 증명 (contradiction)

Q를 부정(¬Q)하고 모순 유도 → Q 참. 유명 예:
- **√2가 무리수** (유리수라 가정 → 모순)
- **소수 무한** (유한이라 가정 → 모순)
- **정지 문제 불가능** (automata/[[decidability]]의 대각선)

### 귀납 증명 (induction)

자연수·재귀 구조 → [[induction]] (별도 노트):
- 기저 + 귀납 단계
- 알고리즘·재귀 정당성의 핵심

### 구성적 vs 비구성적

- **구성적**: 존재를 실제 예시로 증명 (`∃x P(x)`에 x를 제시)
- **비구성적**: 존재만 증명 (예시 없이 - 모순 등)

## CS와의 연결

논리가 CS 곳곳에:

- **알고리즘 정당성**: 루프 불변식 = 귀납 (algorithms/[[correctness-proofs]])
- **불 대수 = 회로**: AND/OR/NOT 게이트 (computer-architecture/[[bits-and-integers]])
- **타입 = 명제** (Curry-Howard): 프로그램 = 증명 (programming-languages/[[type-systems-advanced]])
- **SQL WHERE**: 술어 논리 (database/[[sql-deep-dive]])
- **형식 검증**: 논리로 시스템 증명 (distributed-systems/[[consensus-problem]])
- **SAT**: 명제 논리 만족성 (algorithms/[[p-vs-np]]의 첫 NP-완전)

## 연결

- 귀납 상세 → [[induction]]
- 알고리즘 정당성 → algorithms/[[correctness-proofs]]
- 불 연산 = 비트 → computer-architecture/[[bits-and-integers]]
- 타입=명제 → programming-languages/[[type-systems-advanced]]
- SAT → algorithms/[[p-vs-np]]
- 결정 불가 (대각선) → automata/[[decidability]]

## 궁금한 것 (나중에)

- [ ] Curry-Howard 대응 (프로그램=증명) 상세
- [ ] 자연 연역 (natural deduction)
- [ ] 직관주의 논리 vs 고전 논리
- [ ] 증명 보조기 (Coq, Lean)

## 출처

- Rosen "Discrete Mathematics" 1장
