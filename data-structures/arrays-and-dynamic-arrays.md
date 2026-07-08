# 배열과 동적 배열 (Arrays and Dynamic Arrays)

## 한 줄 요약

배열은 연속 메모리라 인덱싱이 O(1)이고 캐시 친화적이다. 동적 배열(vector, list, ArrayList)은 꽉 차면 2배로 키우는데, 이 "2배 성장"이 삽입을 amortized O(1)로 만든다.

## 왜 필요한가

- 가장 많이 쓰는 자료구조. 다른 것의 기반
- `append`가 왜 보통 빠른데 가끔 느린가
- 왜 2배로 키우나 (+1이 아니라)
- 배열이 왜 실전에서 링크드 리스트보다 빠른가 → [[linked-lists]]

## 배열: 연속 메모리

`T a[N]` = `sizeof(T)×N` 연속 블록 ([[data-layout]]):

- **인덱싱 O(1)**: `a[i]` 주소 = `base + i×sizeof(T)`, 곱셈 하나 (스케일 인덱스, [[assembly-basics]])
- **캐시 친화적**: 순차 접근이 캐시 라인·프리페처를 최대 활용 ([[memory-hierarchy]])
- **삽입/삭제 느림**: 중간에 넣으려면 뒤를 다 밀어야 → O(n)
- **고정 크기**: 컴파일/할당 시 크기 결정

## 동적 배열: 자라는 배열

크기를 미리 모를 때. 내부는 배열 + (용량 capacity, 크기 size):

```
[■■■■□□□□]   size=4, capacity=8
 ↑쓴 것  ↑여유
```

- **append**: 여유 있으면 그냥 씀 O(1)
- **꽉 차면**: 더 큰 배열 할당 → 기존 것 복사 → 새 원소 추가. 이때만 O(n)

## 왜 2배로 키우나 - amortized 분석

꽉 찰 때마다 **용량을 2배로**. 실측 (100만 append):

```
2x growth: 21 reallocs, ~1048575 total copies (1.0 per elem)
```

100만 삽입에 재할당은 **21번**뿐 (2²¹ ≈ 200만), 총 복사는 약 100만 = **원소당 평균 1회 복사**. 개별 append는 O(1)이거나 가끔 O(n)이지만, **평균 내면 O(1)** = amortized O(1).

### 왜 amortized O(1)인가 (수학)

용량 n까지 키우며 든 총 복사 = 1 + 2 + 4 + ... + n/2 + n ≈ **2n**. n개 삽입에 총 2n 작업 → 삽입당 평균 2 = O(1).

핵심: 비싼 재할당이 **드물게**(지수적으로 성장) 일어나 자주 일어나는 싼 삽입에 분산됨.

### +1씩 키우면? (재앙)

꽉 찰 때마다 1칸씩만 키우면 매번 재할당 → 복사 = 1+2+...+n = **n²/2**. 100만이면 5000억 복사. O(n) per append, O(n²) 전체. 2배 성장이 이걸 O(n)으로 바꿈.

### 성장 배수 트레이드오프

- **2배**: 재할당 드묾. 하지만 최악 메모리 낭비 ~2배, 옛 공간 재사용 불가(1+2+4 < 8)
- **1.5배**(일부 구현): 메모리 낭비 적음, 옛 공간 재사용 가능. 재할당 조금 더 잦음
- Java ArrayList 1.5배, Go slice·C++ vector 대략 2배·1.5~2배

## 삭제와 축소

- 끝에서 삭제(pop): O(1)
- 중간 삭제: 뒤를 당김 O(n)
- 축소: size가 capacity의 1/4로 떨어지면 절반으로 (1/2 아님 - 경계에서 반복 재할당 방지, hysteresis)

## 캐시 관점의 우위

동적 배열이 실전 최강인 이유는 Big-O만이 아님:

- 연속 메모리 → 순회 시 캐시 미스 최소 ([[cache-misses]])
- 프리페처가 다음 원소 미리 로드
- 같은 O(1) 접근이라도 링크드 리스트(pointer chasing)보다 상수가 훨씬 작음 → [[linked-lists]]

"의심스러우면 배열 써라"의 근거.

## 연결

- 메모리 배치와 인덱싱 → [[data-layout]], [[assembly-basics]]
- 캐시 친화성 → [[memory-hierarchy]], [[cache-misses]]
- 대안과 비교 → [[linked-lists]]
- amortized 분석 일반론 → algorithms/[[asymptotic-analysis]]
- 스택/큐 구현 기반 → [[stacks-and-queues]]

## 궁금한 것 (나중에)

- [ ] realloc이 in-place로 확장 가능한 경우 (복사 회피)
- [ ] 성장 배수 1.5 vs 2의 실측 메모리/속도 차이
- [ ] small-vector optimization (작으면 스택에 인라인)
- [ ] Rust Vec, C++ vector의 정확한 성장 정책

## 출처

- CLRS 17장 (amortized 분석), Open Data Structures 2장
