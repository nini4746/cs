# 선형 시스템 (Linear Systems)

## 한 줄 요약

여러 선형 방정식을 동시에 푸는 것 (Ax = b). 가우스 소거법으로 풀고, rank로 해의 존재·유일성을 판정한다. 최적화·회귀·시뮬레이션의 기반.

## 왜 필요한가

- 연립 방정식을 체계적으로 푸는 법
- 해가 언제 있고 유일한가
- ML 회귀·최적화의 기반

## 선형 시스템 = Ax = b

여러 선형 방정식을 행렬로:

```
2x + y = 5        [2 1] [x]   [5]
x  - y = 1   →    [1 -1][y] = [1]
                     A    x  =  b
```

- **A**: 계수 행렬, **x**: 미지수, **b**: 우변
- "x를 구하라" = A 변환을 되돌려 b가 어디서 왔나 ([[vectors-and-matrices]]의 역변환)

## 가우스 소거법 (Gaussian elimination)

체계적 풀이 - 행 연산으로 삼각형 만들기:

```
1. 행 연산 (행 교환, 상수배, 더하기)으로 위삼각 행렬로
2. 후진 대입(back substitution): 아래에서 위로 미지수 구함
```

- **O(n³)**: n개 방정식 (computer-architecture/[[matrix-blocking]]의 행렬 연산과 같은 규모)
- 수치 안정성: **피벗팅**(큰 수를 축으로) - 작은 수로 나누면 오차 (computer-architecture/[[floating-point]]의 정밀도)
- LU 분해로 재사용 (같은 A, 다른 b)

## 해의 존재와 유일성

**rank**(독립 방정식 수)로 판정:

- **유일해**: rank = 미지수 수 (방정식이 딱 맞음)
- **무한해**: rank < 미지수 (방정식 부족 - 자유 변수)
- **해 없음**: 모순 (0 = 1 같은 것)

기하학: n차원에서 초평면들의 교집합
- 한 점 (유일), 직선/평면 (무한), 안 만남 (없음)

## 선형 독립과 rank

- **선형 독립**: 어떤 벡터도 다른 것들의 조합으로 안 됨
- **rank**: 독립인 행(열) 수 = 실제 정보량
- rank 부족 = 중복 방정식 (같은 정보 반복)
- **역행렬 존재 조건**: 정사각 + full rank (역변환 가능 [[vectors-and-matrices]])

## 최소 제곱 (least squares)

**해가 없을 때 가장 가까운 근사** - ML의 핵심:

```
방정식이 미지수보다 많음 (overdetermined) → 정확한 해 없음
→ 오차를 최소화하는 x (최소 제곱)
→ 정규방정식: AᵀAx = Aᵀb
```

- **선형 회귀**(ai-ml/[[linear-models]]): 데이터에 직선 맞추기 = 최소 제곱
- 측정 오차·노이즈 있는 실제 데이터 (완벽한 해 없음)
- 경사하강법(ai-ml/[[training-dynamics]])으로도 풀 수 있음

## 조건수 (conditioning)

수치 안정성 - 입력 오차가 결과에 얼마나 증폭:

- **잘 조건화**: 작은 입력 변화 → 작은 결과 변화 (안정)
- **나쁘게 조건화(ill-conditioned)**: 작은 오차가 크게 증폭 → 부동소수점(computer-architecture/[[floating-point]]) 오차 치명적
- 조건수로 측정 (역행렬 관련)

## CS 응용

- **선형 회귀** → ai-ml/[[linear-models]] (최소 제곱)
- **최적화**: 제약 최적화, LP (algorithms/[[network-flow]]의 쌍대성)
- **그래픽**: 변환 방정식
- **시뮬레이션**: 물리 방정식 이산화
- **네트워크 유량** → algorithms/[[network-flow]]

## 연결

- 행렬·역변환 → [[vectors-and-matrices]]
- 부동소수점 오차 → computer-architecture/[[floating-point]]
- 행렬 연산 규모 → computer-architecture/[[matrix-blocking]]
- 선형 회귀 (최소 제곱) → ai-ml/[[linear-models]]
- 경사하강 → ai-ml/[[training-dynamics]]
- LP 쌍대성 → algorithms/[[network-flow]]

## 궁금한 것 (나중에)

- [ ] LU/QR/Cholesky 분해
- [ ] 반복법 (Jacobi, 켤레기울기) - 큰 희소 시스템
- [ ] 조건수와 수치 안정성 상세
- [ ] 정규방정식 유도 (최소 제곱)

## 출처

- Strang "Linear Algebra" 1-3장
