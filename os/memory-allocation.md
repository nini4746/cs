# 메모리 할당 (malloc 내부)

## 한 줄 요약

malloc/free는 OS가 아니라 라이브러리(할당자)가 유저공간에서 관리한다. free list로 빈 블록을 추적하고, 큰 요청만 커널(mmap)로 넘긴다. 단편화와 정렬이 핵심 설계 문제.

## 왜 필요한가

- malloc이 실제로 뭘 하나 (커널? 라이브러리?)
- 왜 malloc(1)이 16바이트를 쓰나
- 단편화가 힙에서 어떻게 생기나
- use-after-free/double-free의 무대 → [[memory-safety]]

## malloc은 유저공간 할당자다

흔한 오해: malloc이 매번 커널에 메모리를 요청한다. 실제:

- 할당자(glibc malloc, macOS의 magazine malloc 등)가 커널에서 **큰 덩어리**를 미리 받아둠 (`brk`로 힙 확장, 또는 `mmap`)
- malloc/free는 그 덩어리 안에서 유저공간 자료구조로 관리 → 시스템 콜 없이 빠름 ([[limited-direct-execution]]의 비싼 트랩 회피)
- 덩어리가 부족할 때만 커널에 더 요청

## free list: 빈 블록 추적

할당자는 빈 블록들을 연결 리스트로 관리:

```
힙: [사용중][빈 32B]→[사용중][빈 64B]→[빈 16B]→...
```

- **malloc(n)**: free list에서 n 이상인 블록을 찾아(first-fit/best-fit) 떼어줌. 남으면 쪼갬(split)
- **free(p)**: 블록을 free list에 반환. 인접한 빈 블록과 합침(coalesce)해 큰 구멍 복원

각 블록엔 **헤더**(크기, 사용 여부)가 붙음 → free(p)가 크기를 아는 이유 (p 바로 앞 헤더를 봄).

## 실측: 오버헤드와 정렬

```
malloc(1) x3: 0x...bc0  0x...bd0  0x...be0
gap = 16 bytes
```

`malloc(1)`을 세 번 했는데 주소 간격이 **16바이트**. 1바이트 요청인데:

- **정렬**: malloc은 항상 16바이트 정렬 주소 반환 (모든 타입에 안전, SIMD도 OK → [[data-layout]])
- **최소 블록 크기 + 헤더**: 헤더와 정렬 때문에 작은 요청도 최소 크기를 씀
- → 작은 객체를 많이 malloc하면 오버헤드가 큼 (객체 풀이나 arena가 나은 이유)

### 큰 할당은 mmap으로 분리

```
small=0x104e3dbc0   big(1MB)=0xba9400000
```

1MB 할당은 주소가 완전히 다른 영역. 큰 요청은 free list를 안 거치고 **mmap으로 커널에서 직접** 페이지를 받음. free 시 바로 커널에 반환(munmap) → 큰 블록이 힙을 단편화시키는 것 방지.

### free 후 재사용

```
freed b=0x...bd0, new malloc=0x...bd0 (reused)
```

free한 자리를 다음 malloc이 재사용. free list가 작동하는 증거.

## 단편화

- **외부 단편화**: 빈 공간은 충분한데 흩어져서 큰 요청 실패 ([[segmentation-and-paging]]와 같은 문제, 힙 버전). coalescing으로 완화
- **내부 단편화**: 요청보다 큰 블록을 줘서 낭비 (정렬, 최소 크기, 크기 클래스 반올림)

할당 전략(first-fit/best-fit/segregated list)이 단편화와 속도를 트레이드오프.

## 현대 할당자 기법

- **크기 클래스(size class)**: 크기를 몇 종류로 반올림, 종류별 free list → 검색 빠름 (내부 단편화 대가)
- **arena/per-thread cache**: 스레드마다 별도 힙 → 락 경합 회피 ([[locks]], [[cache-coherence]]의 false sharing 방지). tcmalloc, jemalloc의 핵심
- **slab 할당자**: 같은 크기 객체 전용 (커널에서 자주). 초기화 재사용

## 관련 버그 (메모리 안전)

- **use-after-free**: free한 포인터를 계속 씀 → 재할당된 남의 데이터 손상
- **double-free**: 두 번 free → free list 손상 (익스플로잇 표적)
- **힙 오버플로우**: 블록 경계 넘어 써서 인접 블록/헤더 손상 → [[buffer-overflow]]
- **누수(leak)**: free 안 함 → 메모리 계속 증가
- 이 클래스를 잡는 도구: ASan, `MALLOC_` 디버깅, valgrind → [[memory-safety]]

## 셀프 체크

> [!question]- malloc이 매번 커널에 메모리를 요청한다는 건 왜 오해인가?
> 할당자가 커널에서 큰 덩어리를 미리 받아두고(brk로 힙 확장 또는 mmap), malloc/free는 그 덩어리 안에서 유저공간 자료구조(free list)로 관리하기 때문이다. 시스템 콜은 덩어리가 부족할 때만 발생하므로, 대부분의 malloc/free는 비싼 트랩 없이 빠르게 끝난다.

> [!question]- free(p)는 크기를 인자로 안 받는데 어떻게 반환할 크기를 아나?
> 각 블록 바로 앞에 헤더(크기, 사용 여부)가 붙어 있어서, free(p)가 p 바로 앞 헤더를 읽어 크기를 알아낸다. 이 헤더가 작은 요청에도 최소 블록 크기를 강제하는 오버헤드의 일부이기도 하다.

> [!question]- 왜 malloc(1)이 16바이트를 쓰나?
> 두 가지가 겹친다. (1) 정렬: malloc은 모든 타입(SIMD 포함)에 안전하도록 항상 16바이트 정렬 주소를 반환한다. (2) 헤더+최소 블록 크기: 크기/사용 여부 헤더와 정렬 때문에 1바이트 요청도 최소 블록을 차지한다. 그래서 작은 객체를 많이 malloc하면 오버헤드가 커 객체 풀/arena가 유리하다.

> [!question]- 외부 단편화와 내부 단편화의 차이는?
> 외부 단편화는 빈 공간 총량은 충분한데 잘게 흩어져 있어 큰 연속 요청이 실패하는 것으로, coalescing(인접 빈 블록 합치기)으로 완화한다. 내부 단편화는 요청보다 큰 블록을 줘서 블록 안이 낭비되는 것으로, 정렬·최소 크기·크기 클래스 반올림이 원인이다.

> [!question]- 큰 할당(예: 1MB)을 free list 대신 mmap으로 처리하는 이유는?
> 큰 블록을 free list에 두면 힙 중간에 큰 구멍/조각을 남겨 외부 단편화를 악화시킨다. mmap으로 커널에서 직접 페이지를 받으면 힙과 분리된 영역에 놓이고, free 시 munmap으로 바로 커널에 반환돼 힙을 어지럽히지 않는다.

## 연습문제

> [!example]- 문제: 힙에 순서대로 32B, 16B, 32B 블록이 있고 가운데 16B만 free 상태다. 48B 요청이 실패하는 이유와 완화책을 설명하라.
> **풀이**
> 빈 공간은 16B뿐이라 48B가 애초에 안 들어가지만, 핵심은 설령 양옆 32B가 나중에 free돼도 세 조각(32+16+32=80B)이 인접해야만 48B를 만들 수 있다는 점이다. 인접한 빈 블록이 합쳐지지 않으면 총량이 충분해도 큰 요청이 실패한다(외부 단편화). 완화: free 시 인접 빈 블록을 coalesce해 큰 연속 구멍을 복원한다.

> [!example]- 문제: 24바이트 페이로드 객체를 16의 배수 크기 클래스로 반올림하는 할당자에서, 100만 개 할당 시 내부 단편화 낭비 총량을 계산하라(헤더는 무시).
> **풀이**
> 24B는 16의 배수 중 32B 클래스로 올림된다. 객체당 낭비 = 32 - 24 = 8B. 총 낭비 = 8B × 1,000,000 = 8,000,000B ≈ 7.63MiB. 크기 클래스는 free list 검색을 빠르게 하는 대신 이런 내부 단편화를 대가로 치른다.

> [!example]- 문제: 멀티스레드 서버에서 malloc/free가 락 경합으로 느려진다. per-thread arena가 어떻게 해결하는지, false sharing과의 관계까지 설명하라.
> **풀이**
> 스레드마다 별도 힙(arena)을 두면 각자 자기 arena에서 할당/해제하므로 공유 free list의 락 경합이 사라진다(tcmalloc/jemalloc의 핵심). 또한 서로 다른 스레드의 객체가 같은 캐시 라인에 섞이지 않게 되어, 인접 객체를 다른 코어가 동시에 쓸 때 캐시 라인이 코어 사이를 오가는 false sharing도 줄인다. 대가는 arena별로 메모리를 따로 쥐고 있어 전체 사용량이 늘 수 있다는 점이다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 3가지.
> 1. malloc/free가 유저공간 free list에서 어떻게 블록을 떼주고(split) 돌려받아 합치는지(coalesce) 흐름을 설명할 수 있는가.
> 2. 헤더와 정렬이 왜 malloc(1)에 16바이트를 쓰게 하는지, 내부 단편화와 연결해 설명할 수 있는가.
> 3. 외부/내부 단편화를 구분하고 각각의 완화책(coalesce vs 크기 클래스 트레이드오프)을 말할 수 있는가.

## 연결

- 힙이 사는 곳 → [[address-spaces]]
- 시스템 콜 회피 (유저공간 관리) → [[limited-direct-execution]]
- 정렬 → [[data-layout]]
- arena와 false sharing → [[cache-coherence]], [[locks]]
- 힙 버그 → [[memory-safety]], [[buffer-overflow]]

## 궁금한 것 (나중에)

- [ ] jemalloc vs tcmalloc vs 시스템 malloc 벤치마크
- [ ] free list 자체를 익스플로잇하는 힙 공격 (tcache poisoning)
- [ ] GC 언어의 할당은 왜 malloc보다 빠를 수 있나 (bump allocation) → [[garbage-collection]]
- [ ] brk vs mmap 경계는 어디서 정해지나 (M_MMAP_THRESHOLD)

## 출처

- OSTEP 17장 (free space 관리)
- CS:APP 9.9 (동적 메모리 할당)
