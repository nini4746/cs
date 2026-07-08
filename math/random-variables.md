# 랜덤 변수와 분포 (Random Variables)

## 한 줄 요약

랜덤 결과에 수를 대응시킨 것이 랜덤 변수. 기댓값·분산으로 요약하고, 주요 분포(이항·기하·정규·포아송)가 흔한 상황을 모델링한다. 알고리즘 분석·성능 모델링의 도구.

## 왜 필요한가

- 확률을 수치로 다루기 (기댓값·분산)
- 흔한 상황의 표준 분포
- 알고리즘·시스템 성능 모델링

## 랜덤 변수 (random variable)

랜덤 결과 → 수 (함수 [[sets-relations-functions]]):

- **이산(discrete)**: 셀 수 있는 값 (주사위, 동전 횟수)
- **연속(continuous)**: 실수 범위 (지연시간, 키)
- 예: X = 동전 10번 중 앞면 수

## 기댓값과 분산

분포를 두 수로 요약:

### 기댓값 (expectation)

```
E[X] = Σ x·P(x)   (이산)
```

- 평균, 장기 평균값
- **선형성**: `E[X+Y] = E[X]+E[Y]` (독립 무관! 강력) → 복잡한 걸 쪼개 분석
- 알고리즘 평균 시간 (algorithms/[[asymptotic-analysis]])

### 분산 (variance)

```
Var[X] = E[(X - E[X])²]   (평균에서 얼마나 퍼졌나)
표준편차 = √Var
```

- 흩어짐·불확실성
- **꼬리 위험**: 평균만 보면 안 됨 (p99 지연 - algorithms/[[selection]], distributed-systems/[[observability-basics]])

## 주요 분포

흔한 상황의 표준 모델:

### 이항 분포 (binomial)

**n번 독립 시행, 각 성공 확률 p** → 성공 횟수:
- 예: 동전 n번 중 앞면 수, 패킷 n개 중 손실 수
- E[X] = np

### 기하 분포 (geometric)

**첫 성공까지 시행 횟수**:
- 예: 재시도 몇 번에 성공 (network/[[tcp-reliability]]의 재전송)
- 무기억성(memoryless)

### 포아송 분포 (Poisson)

**단위 시간당 사건 수** (드문 사건):
- 예: 초당 요청 수, 시간당 장애 수
- 대기열 이론(queuing)의 기반 → 서버 부하 모델링 (network/[[internet-overview]]의 큐잉 지연)

### 정규 분포 (normal/Gaussian)

**종 모양, 많은 것의 합** → 중심극한정리:
- 자연·측정 오차가 정규 (computer-architecture/[[floating-point]] 노이즈)
- **중심극한정리(CLT)**: 독립 랜덤 변수 많이 합치면 → 정규에 근사 (원 분포 무관!) → 통계의 기반 [[statistics-basics]]
- 68-95-99.7 규칙 (표준편차 1/2/3 안에)

### 균등 분포 (uniform)

모든 값이 같은 확률:
- 랜덤 생성기, 해시(이상적, data-structures/[[hash-tables]]), 버킷 정렬 가정 (algorithms/[[linear-sorts]])

## 큰 수의 법칙 (LLN)

시행을 많이 하면 **표본 평균 → 기댓값**:
- 생일 역설 시뮬레이션([[probability-basics]])이 이론값에 수렴한 이유
- 몬테카를로 방법의 기반 (랜덤 샘플로 근사)

## CS 응용

- **알고리즘 평균 분석**: 기댓값 (algorithms/[[asymptotic-analysis]]) - 퀵정렬, 해시
- **성능 모델링**: 포아송 도착 + 대기열 (지연 예측)
- **꼬리 지연**: 분산·p99 (distributed-systems/[[observability-basics]])
- **랜덤화**: 스킵 리스트(data-structures/[[skip-list]]), 랜덤 피벗
- **ML**: 확률 모델, 샘플링 (ai-ml/)
- **집중 부등식**: 성능 보장 → [[concentration]]

## 연결

- 확률 기초 → [[probability-basics]]
- 통계·CLT → [[statistics-basics]]
- 집중 부등식 → [[concentration]]
- 평균 분석 → algorithms/[[asymptotic-analysis]]
- 재전송 (기하) → network/[[tcp-reliability]]
- 큐잉 (포아송) → network/[[internet-overview]]
- p99 (분산) → distributed-systems/[[observability-basics]]

## 궁금한 것 (나중에)

- [ ] 중심극한정리 증명 직관
- [ ] 대기열 이론 (M/M/1)
- [ ] 결합 분포·공분산
- [ ] 지수 분포 (연속 무기억성)

## 출처

- MIT 6.041, Rosen 7장
