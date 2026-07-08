# 수학적 귀납법 (Mathematical Induction)

## 한 줄 요약

자연수·재귀 구조에 대한 명제를 증명하는 도구 - 기저(첫 케이스)와 귀납 단계(n이면 n+1)로 무한히 많은 경우를 증명한다. 재귀·루프 정당성의 수학적 기반.

## 왜 필요한가

- 무한한 경우를 어떻게 증명하나 (모든 n)
- 재귀·루프 정당성의 기반 (algorithms/[[correctness-proofs]])
- 강귀납법이 언제 필요한가

## 기본 귀납법

`P(n)`이 모든 자연수 n에 대해 참임을 증명:

```
1. 기저(base case): P(0) 또는 P(1)이 참
2. 귀납 단계(inductive step): P(k)가 참이면 → P(k+1)도 참
→ 결론: 모든 n에 대해 P(n) 참
```

직관 (도미노):
- 첫 도미노가 넘어짐 (기저)
- 어떤 도미노가 넘어지면 다음도 넘어짐 (귀납 단계)
- → 모든 도미노가 넘어짐 (전부)

무한한 경우(모든 n)를 **유한한 두 증명**(기저 + 단계)으로.

## 예: 합 공식

`1 + 2 + ... + n = n(n+1)/2`:

```
기저: n=1 → 1 = 1·2/2 = 1 ✓
귀납: P(k) 가정 (1+...+k = k(k+1)/2)
  1+...+k+(k+1) = k(k+1)/2 + (k+1)     [귀납 가정 사용]
                = (k+1)(k+2)/2          [정리]
  = P(k+1) ✓
→ 모든 n에 대해 성립
```

**귀납 가정(P(k))을 쓰는 것**이 핵심 - 이전 케이스를 발판으로.

## 강귀납법 (strong induction)

기본 귀납법의 확장 - **P(k)만이 아니라 P(1)~P(k) 전부** 가정:

```
귀납 단계: P(1), P(2), ..., P(k)가 모두 참이면 → P(k+1) 참
```

언제:
- 다음 케이스가 **여러 이전 케이스**에 의존할 때
- 예: **모든 수는 소수 곱** (n = a×b로 쪼갤 때 a, b 둘 다 이전 케이스 필요)
- **피보나치, 분할 정복**(algorithms/[[divide-and-conquer]]): n을 절반으로 → n/2 케이스 필요

기본 귀납법과 동등한 힘 (강귀납법으로 증명되는 건 기본으로도, 그 역도).

## 재귀와 귀납

**재귀 = 귀납의 프로그래밍 버전** (algorithms/[[correctness-proofs]]):

```
재귀 함수 정당성:
  기저 케이스가 맞음 (귀납 기저)
  재귀 케이스: 작은 입력이 맞다고 믿고(귀납 가정) 현재 증명
```

- `fact(n) = n × fact(n-1)`: fact(n-1)이 (n-1)!이라 가정 → fact(n) = n! ([[computer-architecture/procedures-and-stack]]의 재귀)
- 구조적 귀납(structural induction): 트리·리스트 같은 재귀 구조에 (자식이 맞으면 부모)

## 루프 불변식 = 귀납

algorithms/[[correctness-proofs]]의 루프 불변식이 귀납:

```
초기화 = 기저 (첫 반복 전 불변식 참)
유지 = 귀납 단계 (한 반복이 불변식 보존)
종료 = 결론 (루프 끝에 원하는 성질)
```

루프의 정당성을 귀납으로 증명.

## 흔한 실수

- **기저 빠뜨림**: 귀납 단계만 증명 → 불완전 (기저 없으면 아무것도 안 됨)
- **잘못된 기저**: n=1부터인데 n=0 증명 등
- **순환 논법**: 증명하려는 걸 가정에 씀
- **귀납 가정 안 씀**: 귀납 단계에서 P(k)를 안 쓰면 그냥 직접 증명 (귀납 아님)

## CS 응용

- **알고리즘 정당성**: 재귀·루프 → algorithms/[[correctness-proofs]]
- **점화식**: 마스터 정리 증명, 치환법 → algorithms/[[recurrences]]
- **자료구조 불변식**: 트리 성질 유지 (data-structures/[[balanced-trees]])
- **재귀 프로그램**: 종료·정당성

## 연결

- 논리·증명 기법 → [[logic-and-proofs]]
- 알고리즘 정당성 → algorithms/[[correctness-proofs]]
- 점화식 → algorithms/[[recurrences]]
- 재귀 → computer-architecture/[[procedures-and-stack]]
- 분할 정복 (강귀납) → algorithms/[[divide-and-conquer]]

## 궁금한 것 (나중에)

- [ ] 구조적 귀납 (트리·리스트)
- [ ] 초한 귀납 (transfinite, 순서수)
- [ ] well-ordering principle과의 동치
- [ ] 귀납으로 부등식 증명

## 출처

- Rosen "Discrete Mathematics" 5장
