# 선택 (Selection)

## 한 줄 요약

"k번째로 작은 원소"를 정렬 없이 찾는 문제. quickselect가 평균 O(n)이고, median-of-medians는 피벗을 똑똑히 골라 최악도 O(n)을 보장한다. 전체 정렬(O(n log n))보다 빠르다.

## 왜 필요한가

- 중앙값, k번째 원소, 상위 k개를 정렬 없이
- 정렬(O(n log n))이 과한 경우 - 하나만 필요한데 전부 정렬?
- quickselect가 퀵정렬과 어떻게 다른가

## 문제

정렬 안 된 배열에서 **k번째로 작은 원소**(순위 k). 특수 경우: k=n/2면 중앙값.

순진한 방법: 전체 정렬 후 a[k-1] → O(n log n). 하지만 **하나만** 필요하면 O(n)에 가능.

## quickselect

퀵정렬([[comparison-sorts]])의 아이디어를 재활용. 피벗으로 분할하되 **한쪽만 재귀**:

```
1. 피벗 선택, 분할 → 피벗이 순위 p에 놓임
2. k == p면: 찾음
   k < p면: 왼쪽만 재귀 (오른쪽 버림)
   k > p면: 오른쪽만 재귀
```

퀵정렬은 양쪽 재귀(T=2T(n/2)), quickselect는 **한쪽만**:

```
T(n) = T(n/2) + O(n) = O(n)   (평균)
```

기하급수 합 n + n/2 + n/4 + ... = 2n → **평균 O(n)**. 정렬보다 빠름 (log n 배).

### 최악 O(n²)

피벗이 계속 최악(정렬 입력 + 끝 피벗)이면 한쪽이 안 줄어 O(n²). 퀵정렬과 같은 약점. 랜덤 피벗으로 평균 O(n) 사실상 보장 (기대값).

## median-of-medians: 최악 O(n) 보장

피벗을 **똑똑히 골라** 최악도 O(n)으로:

```
1. 원소를 5개씩 그룹으로 나눔
2. 각 그룹의 중앙값을 구함 (n/5개)
3. 그 중앙값들의 중앙값을 재귀로 구함 → 이걸 피벗으로
4. 이 피벗은 항상 "충분히 가운데" → 분할이 3:7 이상 균형 보장
```

- 피벗이 최소 30% 이상을 항상 버림 → T(n) = T(n/5) + T(7n/10) + O(n) = **O(n)** 최악
- 이론적으로 아름답지만 **상수가 커서** 실무는 랜덤 quickselect 선호
- introselect: quickselect 하다 나빠지면 median-of-medians로 (introsort와 같은 발상 → [[comparison-sorts]])

## 복잡도 정리

| 방법 | 평균 | 최악 |
|---|---|---|
| 정렬 후 인덱스 | O(n log n) | O(n log n) |
| quickselect | **O(n)** | O(n²) |
| median-of-medians | O(n) | **O(n)** |

## top-k 문제

"가장 큰/작은 k개"는 선택의 사촌. 두 접근:

- **힙**: 크기 k 힙 유지, 스트림 순회 → O(n log k). 스트리밍에 적합 ([[heaps]])
- **quickselect**: k번째를 찾으면 그 왼쪽이 top-k → O(n). 전체가 메모리에 있을 때

k가 작고 스트림이면 힙, 전체 배열이고 정확한 경계면 quickselect.

## 어디에 쓰나

- 중앙값 (통계, median-of-3 피벗)
- 백분위수 (p50, p99 지연시간 → devops/[[observability]])
- top-k (검색 결과, 추천)
- 이상치 제거

## 연결

- 퀵정렬 분할 → [[comparison-sorts]]
- 점화식 (한쪽 재귀) → [[recurrences]]
- top-k 힙 → data-structures/[[heaps]]
- 백분위수 → devops/[[observability]], math/[[statistics-basics]]

## 궁금한 것 (나중에)

- [ ] median-of-medians가 5개 그룹인 이유 (3,7이면?)
- [ ] introselect 전환 기준
- [ ] 스트리밍 중앙값 (두 힙)
- [ ] 근사 백분위수 (t-digest, 대용량)

## 출처

- CLRS 9장 (중앙값과 순서 통계)
