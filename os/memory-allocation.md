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
