# 확률 기초 (Probability Basics)

## 한 줄 요약

불확실성을 수로 다루는 법. 조건부 확률과 베이즈 정리가 핵심이며, 생일 역설처럼 직관을 배신하는 결과가 많다. 랜덤 알고리즘·ML·해시 분석의 기반.

## 왜 필요한가

- 알고리즘 평균 분석·랜덤화의 기반
- 베이즈 정리 (ML·필터링)
- 직관을 배신하는 확률 (생일 역설, 해시 충돌)

## 기본

- **표본 공간**: 가능한 결과 전체
- **사건(event)**: 결과의 부분집합
- **확률 P(A)**: 0~1, 사건이 일어날 정도
- **여사건**: P(¬A) = 1 − P(A) (자주 이게 계산 쉬움)

## 조건부 확률

`P(A|B)`: B가 주어졌을 때 A의 확률:

```
P(A|B) = P(A ∩ B) / P(B)
```

- **독립**: P(A|B) = P(A) (B가 A에 영향 없음) → P(A∩B) = P(A)P(B)
- **곱의 법칙**: P(A∩B) = P(A|B)P(B)

## 베이즈 정리 (Bayes' theorem)

확률의 핵심 - **증거로 믿음 갱신**:

```
P(A|B) = P(B|A) P(A) / P(B)
  사후 = 우도 × 사전 / 증거
```

- **사전(prior)** P(A): 원래 믿음
- **우도(likelihood)** P(B|A): A일 때 B 관측 확률
- **사후(posterior)** P(A|B): 증거 B 본 후 갱신된 믿음

### 유명한 함정: 검사 역설

```
병이 1% (드묾), 검사 정확도 99%
양성 나왔을 때 실제 병일 확률은?
→ 직관: 99%?  실제: ~50%! (베이즈)
```

드문 병은 거짓 양성이 많아 양성이어도 실제 병 확률 낮음. 사전 확률(희귀성)이 결정적. 의료·스팸 필터의 흔한 오해.

### CS 응용

- **스팸 필터**: P(스팸|단어) - 나이브 베이즈 (network/[[email-protocols]])
- **ML 분류**: 베이지안 분류기 (ai-ml/[[ml-fundamentals]])

## 생일 역설 - 실측

직관을 배신하는 대표 (조합론 [[combinatorics]] + 확률):

실측 시뮬레이션:
```
10명: 12.1%
23명: 50.9%   ← 겨우 23명인데 50% 넘음!
40명: 89.4%
60명: 99.3%
```

- "365일인데 23명이면 겹칠 리가?" → 직관 틀림
- **쌍의 개수**가 많아서 (23명 = 253쌍, C(23,2))
- 여사건으로 계산: 모두 다를 확률 = 365/365 × 364/365 × ... → 1에서 빼기
- **CS 함의**: 해시 충돌(data-structures/[[hash-tables]]), 생일 공격(security/[[hashing]]) - n비트 해시가 2^(n/2)에 충돌

## 기댓값 (expectation)

랜덤 변수의 평균 → [[random-variables]]:
- `E[X] = Σ x·P(x)`
- 선형성: E[X+Y] = E[X]+E[Y] (독립 아니어도!)
- 알고리즘 평균 분석의 도구 (algorithms/[[asymptotic-analysis]]의 평균)

## CS 응용 (종합)

- **랜덤 알고리즘**: 퀵정렬 평균 O(n log n) (algorithms/[[comparison-sorts]]), quickselect (algorithms/[[selection]])
- **해시**: 충돌 확률, 로드 팩터 (data-structures/[[hash-tables]])
- **확률적 자료구조**: 블룸 필터, HLL (data-structures/[[bloom-filter]], [[hyperloglog]])
- **ML**: 베이즈 분류, 확률 모델 (ai-ml/)
- **스킵 리스트**: 확률적 균형 (data-structures/[[skip-list]])
- **AIMD 공정성**: 혼잡 제어 (network/[[congestion-control]])

## 연결

- 조합 (경우의 수) → [[combinatorics]]
- 랜덤 변수·분포 → [[random-variables]]
- 통계 → [[statistics-basics]]
- 해시 충돌·생일 공격 → data-structures/[[hash-tables]], security/[[hashing]]
- 확률적 자료구조 → data-structures/[[bloom-filter]]
- 베이즈 분류 → ai-ml/[[ml-fundamentals]]
- 평균 분석 → algorithms/[[asymptotic-analysis]]

## 궁금한 것 (나중에)

- [ ] 몬티 홀 문제 (또 다른 직관 배신)
- [ ] 나이브 베이즈 분류기 상세
- [ ] 조건부 독립
- [ ] 마르코프 체인 → [[eigenvalues]]

## 출처

- MIT 6.041, Rosen 7장
