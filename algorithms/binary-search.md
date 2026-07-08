# 이진 탐색 (Binary Search)

## 한 줄 요약

정렬된 배열에서 절반씩 줄여가며 O(log n)에 찾는다. 단순해 보이지만 off-by-one 버그의 온상이다. 반열린 구간 [lo, hi)로 통일하면 변형(lower_bound, 답 이분 탐색)도 안전하게 짤 수 있다.

## 왜 필요한가

- 가장 기본적인 O(log n) 알고리즘
- off-by-one 없이 짜는 법 (JDK도 9년간 버그였음 → [[bits-and-integers]])
- "답을 이분 탐색"이라는 강력한 응용

## 기본 아이디어

정렬된 배열에서 중간을 보고 목표와 비교, 절반을 버림:

```
목표보다 중간이 작으면 → 오른쪽 절반
크면 → 왼쪽 절반
같으면 → 찾음
```

매 단계 후보가 반 → log₂ n 단계 → **O(log n)**. n=10억이 30단계.

## off-by-one 지옥

이진 탐색은 짧지만 경계 처리가 악명 높음:

- `lo <= hi` vs `lo < hi`?
- `hi = mid` vs `hi = mid - 1`?
- `mid = (lo+hi)/2` → **오버플로우** ([[bits-and-integers]]의 JDK 버그). `mid = lo + (hi-lo)/2`로

이 조합을 헷갈리면 무한 루프나 하나 놓침. 해법: **한 가지 규칙으로 통일.**

## 통일 규칙: 반열린 구간 [lo, hi)

탐색 범위를 **[lo, hi)** (lo 포함, hi 제외)로 일관되게:

```c
int lower_bound(int *a, int n, int x) {  // x 이상인 첫 위치
    int lo = 0, hi = n;              // 전체 = [0, n)
    while (lo < hi) {                // 구간이 비면 종료
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < x) lo = mid + 1;  // mid는 답 아님, 오른쪽
        else hi = mid;                 // mid가 답 후보, 포함
    }
    return lo;   // 첫 x 이상 위치 (없으면 n)
}
```

- 불변식([[correctness-proofs]]): 답은 항상 [lo, hi) 안
- `lo < hi`로 종료 (구간 빔), `mid+1`/`mid`로 갱신
- 이 틀 하나로 대부분 변형 커버

## 변형: lower_bound / upper_bound

단순 "찾기"보다 **경계 찾기**가 실전에 유용:

- **lower_bound(x)**: x **이상**인 첫 위치
- **upper_bound(x)**: x **초과**인 첫 위치
- upper − lower = x의 개수 (중복 처리)

실측 (`{1,3,3,3,5,7,9}`):

```
lower_bound(3)=1    ← 첫 3의 위치 (중복 중 첫)
lower_bound(4)=4    ← 4 없음, 4 이상 첫 위치(5)
lower_bound(0)=0    ← 전부보다 작음
lower_bound(10)=7   ← 전부보다 큼 = n (못 찾음 신호)
```

모든 경계(존재/부재/양끝)가 정확. C++ `std::lower_bound`, Python `bisect_left`가 이것.

## 강력한 응용: 답을 이분 탐색

배열이 아니라 **답의 범위를 이분 탐색**. "조건을 만족하는 최소/최대 값"을 찾을 때:

```
"단조성"이 있으면 이분 탐색 가능:
  어떤 값 x에서 조건이 참이면 x보다 큰(작은) 것도 참
→ 참/거짓 경계를 이분 탐색
```

예:
- **최소 용량 찾기**: "이 용량으로 D일 안에 배송 가능?" → 가능/불가능이 단조 → 최소 용량 이분 탐색
- **제곱근**: f(x)=x²이 단조 → sqrt 이분 탐색
- **파라메트릭 서치**: 최적화를 판정 문제로 바꿔 이분

핵심: **판정 함수가 단조**면(어느 지점부터 참/거짓 뒤집힘) 그 경계를 O(log(범위) × 판정비용)에. 배열 없이도 이분 탐색.

## 조건: 단조성

이진 탐색은 **정렬(단조성)**이 전제:
- 배열: 정렬돼야
- 답 이분: 판정 함수가 단조여야
- 단조성 없으면 절반을 못 버림 → 이진 탐색 불가

## 연결

- O(log n)과 성장률 → [[asymptotic-analysis]]
- 오버플로우 버그 → computer-architecture/[[bits-and-integers]]
- 불변식으로 정당성 → [[correctness-proofs]]
- BST의 탐색도 같은 원리 → data-structures/[[binary-search-trees]]

## 궁금한 것 (나중에)

- [ ] 회전된 정렬 배열에서 이분 탐색
- [ ] 실수 이분 탐색의 종료 조건 (epsilon)
- [ ] exponential search (경계 모를 때)
- [ ] 삼분 탐색 (단봉 함수 최댓값)

## 출처

- CLRS 2.3 연습, Jon Bentley "Programming Pearls"
