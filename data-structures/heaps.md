# 힙 (Heaps)

## 한 줄 요약

부모가 항상 자식보다 작은(또는 큰) 완전 이진 트리. 배열로 표현되어 캐시 친화적이고, 최솟값/최댓값을 O(1)에 보고 O(log n)에 꺼낸다. 우선순위 큐의 표준 구현.

## 왜 필요한가

- 우선순위 큐(priority queue)의 내부
- "가장 급한 것부터" 처리하는 스케줄링, 다익스트라([[shortest-paths]])
- heapsort, top-k 문제

## 힙 성질

**힙 순서**: 모든 노드에서 부모 ≤ 자식 (min-heap) 또는 부모 ≥ 자식 (max-heap).

```
min-heap:
        0
      /   \
     1      2
    / \    / \
   3   4  5   7
```

- 루트 = 최솟값 (min-heap). **O(1)에 최솟값 확인**
- BST와 다름: 힙은 부모-자식만 정렬, 형제/전체 순서는 없음 → 정렬 출력 못 함, 하지만 최솟값은 즉시

## 배열 표현 - 포인터 없음

**완전 이진 트리**(마지막 레벨 빼고 꽉 참)라서 배열로 딱 맞게:

```
인덱스 i의:
  부모   = (i-1)/2
  왼자식 = 2i+1
  오른자식= 2i+2
```

- 포인터 없이 배열만 → **캐시 친화적** ([[memory-hierarchy]], [[linked-lists]]의 교훈), 메모리 절약
- 산술로 부모/자식 이동

## 연산

### sift-down / sift-up

힙 순서가 깨진 노드를 제자리로:

- **sift-up**: 삽입한 노드를 부모와 비교하며 위로 (부모보다 작으면 교환)
- **sift-down**: 루트의 노드를 자식과 비교하며 아래로 (더 작은 자식과 교환)

### 주요 연산

| 연산 | 방법 | 복잡도 |
|---|---|---|
| peek (최솟값) | a[0] | O(1) |
| insert | 끝에 추가 후 sift-up | O(log n) |
| extract-min | 루트 반환, 끝 원소를 루트로 후 sift-down | O(log n) |
| build-heap | 아래에서 sift-down | **O(n)** |

### build-heap이 O(n)인 이유

각 삽입이 O(log n)이니 n번 = O(n log n)일 것 같지만, **바닥부터 sift-down**하면 O(n):

- 대부분 노드는 바닥 근처 → sift-down 거리 짧음
- 높이별 노드 수 × 이동 거리를 합치면 수렴 → O(n)
- CLRS의 유명한 분석. 힙을 한 번에 만들 땐 삽입 반복보다 이게 빠름

## heapsort - 실측

힙으로 정렬: build-heap 후 extract-min 반복:

```c
build_heap(a);                 // O(n)
for (m=n; m>0; m--) {          // n번 extract
    output(a[0]);
    a[0]=a[m-1]; sift_down(a, m-1, 0);
}
```

실측: `{5,2,8,1,9,3,7,4,6,0}` → build-heap 후 루트=0 → 반복 추출 → `0 1 2 3 4 5 6 7 8 9`. 정확히 정렬.

- **O(n log n)** 보장 (최악도), **제자리(in-place)**, 안정 아님
- 퀵정렬보다 상수가 크고 캐시 지역성이 나빠 실무 기본은 아니지만, 최악 O(n log n) 보장이 필요할 때 → algorithms/[[comparison-sorts]]

## 우선순위 큐

힙의 대표 용도. "우선순위 높은 것부터":

- **다익스트라/프림**: 가장 가까운 정점 먼저 → [[shortest-paths]], [[mst]]
- **작업 스케줄링**: 우선순위 순 처리
- **이벤트 시뮬레이션**: 다음 이벤트(시간 최소)
- **허프만 코딩**: 빈도 최소 둘 병합 → algorithms/[[greedy]]
- **top-k**: 크기 k 힙으로 스트림에서 상위 k개

이름이 "큐"지만 FIFO 아님 - 우선순위 순 ([[stacks-and-queues]]의 주의).

## 변형

- **이진 힙**: 위 기본. 대부분 충분
- **d-ary 힙**: 자식 d개 → 높이 낮춤, decrease-key 잦을 때
- **피보나치 힙**: decrease-key O(1) amortized → 다익스트라 이론 최적. 상수 커서 실무엔 드묾
- **이항 힙 / 페어링 힙**: 병합(meld) 지원

## 연결

- 배열 기반 = 캐시 친화 → [[memory-hierarchy]], [[linked-lists]]
- 우선순위 큐 개념 → [[stacks-and-queues]]
- heapsort → algorithms/[[comparison-sorts]]
- 다익스트라/프림 → algorithms/[[shortest-paths]], [[mst]]
- 허프만 → algorithms/[[greedy]]

## 궁금한 것 (나중에)

- [ ] 피보나치 힙이 이론상 빠른데 실무에서 안 쓰는 이유
- [ ] d-ary 힙의 최적 d
- [ ] 중앙값을 두 힙으로 유지 (min+max heap)
- [ ] 힙 기반 top-k vs quickselect

## 출처

- CLRS 6장 (힙, heapsort)
