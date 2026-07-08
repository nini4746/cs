# 집중 부등식 (Concentration Inequalities)

## 한 줄 요약

랜덤 변수가 기댓값 근처에 얼마나 몰리는지(집중되는지)를 정량화하는 부등식들. 마르코프·체비쇼프·체르노프 순으로 강해지며, 랜덤 알고리즘·해시·ML의 성능 보장 도구.

## 왜 필요한가

- 랜덤 알고리즘이 "대부분 잘 된다"를 어떻게 보장하나
- 해시 부하 분산·오류 확률의 상한
- 왜 여러 번 반복하면 확실해지나

## 문제: 평균에서 벗어날 확률

기댓값([[random-variables]])은 평균인데, **실제 값이 평균에서 크게 벗어날 확률**은? 집중 부등식이 그 상한:

- "랜덤 알고리즘이 평균은 빠른데 가끔 느릴 확률?"
- "해시가 대체로 고르게 분산되는가?"
- 이런 걸 확률적으로 보장

## 마르코프 부등식 (Markov)

가장 약하지만 가장 일반적 (음이 아닌 랜덤 변수):

```
P(X ≥ a) ≤ E[X] / a
```

- "평균의 a배 이상일 확률은 1/a 이하"
- 정보 최소 (기댓값만) → 느슨한 상한
- 다른 부등식의 building block

## 체비쇼프 부등식 (Chebyshev)

분산까지 사용 → 더 강함:

```
P(|X - E[X]| ≥ kσ) ≤ 1/k²
```

- "평균에서 k 표준편차 이상 벗어날 확률은 1/k² 이하"
- 분산([[random-variables]])이 작으면 더 집중
- 큰 수의 법칙 증명에 쓰임

## 체르노프 바운드 (Chernoff)

**독립 랜덤 변수의 합**에 대해 → 지수적으로 강함:

```
P(합이 평균에서 벗어남) ≤ e^(-거리²/...)   (지수적으로 작음)
```

- **지수적 감소**: 벗어날 확률이 지수적으로 작아짐 (마르코프·체비쇼프보다 훨씬 tight)
- 독립 시행이 많을수록 극도로 집중
- 랜덤 알고리즘 분석의 핵심 도구

## CS 응용

### 해시 부하 분산

- n개 키를 m개 버킷에 (data-structures/[[hash-tables]])
- 체르노프: 어느 버킷도 평균의 몇 배 넘을 확률이 지수적으로 작음 → "대체로 고르게 분산" 보장
- 로드 밸런싱 (요청이 서버에 고르게)

### 랜덤 알고리즘 보장

- 퀵정렬 랜덤 피벗(algorithms/[[comparison-sorts]]): 최악 O(n²) 확률이 극히 작음 → "거의 항상 O(n log n)"
- quickselect(algorithms/[[selection]]) 평균 O(n) 보장
- "높은 확률로(with high probability)" 성능 보장

### 반복으로 확실하게

- 오류 확률 있는 알고리즘을 **여러 번 반복** → 오류 확률 지수적 감소 (체르노프)
- 밀러-라빈 소수 판정([[modular-arithmetic]]): 반복으로 오류 확률 → 0
- 확률적 자료구조(data-structures/[[bloom-filter]]의 false positive)

### ML 일반화

- 훈련 오차와 실제 오차의 차이 상한 (PAC 학습)
- 샘플 크기가 크면 집중 (ai-ml/[[ml-fundamentals]])

### 부하 분산 (power of two choices)

- 랜덤 2개 중 덜 붐비는 곳 선택 → 최대 부하가 극적으로 감소 (분산 시스템 로드 밸런싱)

## 부등식 강도 순

```
마르코프 (기댓값만) < 체비쇼프 (분산) < 체르노프 (독립 합, 지수)
느슨함 ────────────────────────────→ tight
```

정보를 더 쓸수록(분산, 독립성) 더 강한 보장.

## 연결

- 랜덤 변수·분산 → [[random-variables]]
- 확률 기초 → [[probability-basics]]
- 해시 분산 → data-structures/[[hash-tables]]
- 랜덤 퀵정렬/select → algorithms/[[comparison-sorts]], [[selection]]
- 블룸 필터 오류 → data-structures/[[bloom-filter]]
- 소수 판정 반복 → [[modular-arithmetic]]
- ML 일반화 → ai-ml/[[ml-fundamentals]]

## 궁금한 것 (나중에)

- [ ] 체르노프 바운드 유도 (모먼트 생성 함수)
- [ ] Hoeffding 부등식 (유계 변수)
- [ ] power of two choices 분석
- [ ] union bound와 조합

## 출처

- MIT 6.041, "Probability and Computing" (Mitzenmacher & Upfal)
