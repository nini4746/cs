# DP 최적화 (DP Optimization)

## 한 줄 요약

DP의 시간·공간을 줄이는 기법들. 공간 압축(직전 행만 유지), 비트마스크 상태, 그리고 전이를 빠르게 하는 고급 기법(단조 큐, 분할 정복 최적화). 상태 수와 전이 비용을 각각 공략한다.

## 왜 필요한가

- DP 표가 메모리 초과할 때
- 전이가 O(n)이라 전체가 느릴 때
- 상태를 집합으로 표현해야 할 때 (비트마스크)

## 공간 압축 (rolling array)

많은 DP가 **직전 몇 행만** 참조. 전체 표 대신 그만큼만 유지:

```
// 0/1 배낭: dp[i]는 dp[i-1]만 참조 → 1차원으로
for (물건 i)
    for (w = W; w >= wt[i]; w--)   // 역순! (덮어쓰기 방지)
        dp[w] = max(dp[w], dp[w-wt[i]] + val[i]);
```

- O(nW) 공간 → **O(W)**. [[dp-patterns]]의 배낭이 실전에서 1차원인 이유
- 역순 순회가 핵심: 정순이면 같은 물건을 여러 번 쓰게 됨 (그건 무한 배낭)
- 피보나치도 O(n)→O(1) ([[dp-fundamentals]])

주의: 경로 복원(실제 선택 추적)이 필요하면 전체 표 유지 필요. 값만 필요할 때 압축.

## 비트마스크 DP

상태가 **집합**일 때 정수의 비트로 표현:

```
상태: dp[mask] = 방문 집합이 mask일 때의 답
     mask의 i번째 비트 = i가 집합에 있나
```

- **외판원 TSP**: dp[mask][i] = mask 도시들을 방문하고 i에 있을 때 최소 비용. O(2ⁿ·n²)
- n≤20 정도까지 (2ⁿ 상태)
- 비트 연산으로 부분집합 순회 ([[bits-and-integers]])

지수지만 순진한 순열(n!)보다 훨씬 나음 (TSP: 20! vs 2²⁰·20²).

## 전이 최적화 (고급)

DP 복잡도 = 상태 수 × 전이 비용. 전이가 비싸면 그걸 공략:

### 단조 큐 최적화 (monotonic queue)

전이가 "구간 내 최소/최대"면 단조 큐(덱)로 O(1) 상각:

```
dp[i] = min(dp[j]) for j in [i-k, i-1]  + cost
→ 슬라이딩 윈도우 최소를 덱으로 O(1) → 전체 O(n)
```

- 슬라이딩 윈도우 최댓값과 같은 기법 ([[stacks-and-queues]]의 덱)

### 분할 정복 최적화 / Knuth 최적화

전이가 특정 단조성(quadrangle inequality)을 만족하면 O(n²k)→O(nk log n) 등으로. 최적 분할점이 단조로 이동하는 성질 이용. 고급 경쟁 프로그래밍.

### 볼록성 (Convex Hull Trick)

전이가 선형 함수의 최솟값이면 선분들의 하한 포락선으로 O(n) 또는 O(n log n). DP 전이를 기하 문제로.

## 최적화 선택 가이드

| 문제 | 기법 |
|---|---|
| 메모리 초과, 직전 행만 참조 | 공간 압축 |
| 상태가 집합 (n 작음) | 비트마스크 |
| 전이 = 구간 min/max | 단조 큐 |
| 전이 = 선형함수 min | CHT |
| 최적 분할점 단조 | 분할정복/Knuth |

먼저 기본 DP를 세우고([[dp-fundamentals]]), 복잡도가 부족하면 병목(상태 수? 전이?)을 보고 해당 기법 적용.

## 실무 관점

- 대부분 실무 DP는 공간 압축이면 충분
- 고급 전이 최적화는 경쟁 프로그래밍/특수 상황
- 상태 정의가 잘못되면 어떤 최적화도 소용없음 - 상태 설계가 먼저

## 연결

- DP 기본 → [[dp-fundamentals]]
- 패턴별 DP → [[dp-patterns]]
- 비트 연산 → computer-architecture/[[bits-and-integers]]
- 단조 큐/덱 → data-structures/[[stacks-and-queues]]
- TSP는 NP-hard → [[p-vs-np]]

## 궁금한 것 (나중에)

- [ ] Knuth 최적화의 quadrangle inequality 조건
- [ ] Convex Hull Trick 구현 (Li Chao tree)
- [ ] SOS DP (부분집합 합 DP)
- [ ] Aliens trick (Lagrangian 최적화)

## 출처

- CLRS 15장 보충, 경쟁 프로그래밍 고급 교재
