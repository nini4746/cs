# 캐시 일관성 (Cache Coherence)

## 한 줄 요약

각 코어가 자기 캐시를 가지면, 한 코어가 값을 바꿔도 다른 코어의 캐시엔 옛 값이 남는다. 이를 막는 하드웨어 프로토콜(MESI)이 있고, 그 부작용이 false sharing이다.

## 왜 필요한가

- [[memory-hierarchy]]의 false sharing이 왜 일어나는지의 근본 원인
- 멀티스레드 프로그램이 왜 코어를 늘려도 안 빨라지는 경우가 있나
- 원자적 연산(CAS)과 락이 하드웨어에서 어떻게 비싼지 → [[locks]]

## 문제: 캐시가 코어마다 있다

L1/L2는 코어 전용([[memory-hierarchy]]). 코어 A와 B가 같은 변수 x를 각자 캐시에 로드한 상태에서 A가 x를 바꾸면:

- A의 캐시: x = 새 값
- B의 캐시: x = 옛 값 ← 문제. B가 이걸 읽으면 틀림

**일관성(coherence)** = "어느 코어가 읽어도 최신 값을 본다"는 보장. 소프트웨어가 아니라 하드웨어가 책임진다.

## MESI 프로토콜

각 캐시 라인에 4상태 중 하나를 태그:

| 상태 | 의미 |
|---|---|
| **M** (Modified) | 이 캐시만 가짐 + 수정됨 (메모리와 다름). 유일한 최신본 |
| **E** (Exclusive) | 이 캐시만 가짐 + 메모리와 동일 |
| **S** (Shared) | 여러 캐시가 가짐 + 메모리와 동일 |
| **I** (Invalid) | 무효 (없는 것과 같음) |

핵심 규칙:

- 쓰려면 라인을 **M 상태로** 만들어야 함 → 다른 모든 캐시의 그 라인을 **I(무효화)** 시킴 (invalidate 메시지 브로드캐스트)
- 그래서 한 코어의 쓰기는 다른 코어들에게 "네 사본 버려" 신호를 보냄
- 다음에 그 코어가 읽으면 미스 → 최신본을 M 가진 캐시나 메모리에서 가져옴

코어들은 서로의 메모리 트래픽을 감시(**snooping**)하거나 디렉토리로 관리. 이 조율이 코어 간 통신 비용을 만든다.

## false sharing - MESI의 부작용

[[memory-hierarchy]]에서 측정한 현상의 원인이 이제 보인다.

두 스레드가 **다른 변수**를 쓰는데 그 변수들이 **같은 캐시 라인(64B)**에 있으면:

1. 코어 A가 변수1 씀 → 라인을 M으로, 코어 B의 라인 무효화
2. 코어 B가 변수2 씀 → 라인을 다시 뺏어옴(M), 코어 A 무효화
3. A가 또 씀 → 다시 뺏김... **라인이 코어 사이를 핑퐁**

논리적으로 두 스레드는 아무것도 공유하지 않는데, 물리적으로 같은 라인이라 MESI가 라인을 계속 주고받게 만듦. 각 쓰기가 코어 간 무효화 왕복(수십~수백 사이클)을 유발 → [[memory-hierarchy]]에서 padding으로 6배 빨라진 그 현상.

**해결**: 스레드별 데이터를 캐시 라인 단위로 분리 (`alignas(64)`, padding).

## 메모리 순서 (memory ordering) - 곁가지

일관성(한 주소의 최신값)과 별개로, **여러 주소에 대한 쓰기가 다른 코어에 어떤 순서로 보이나**는 또 다른 문제 (memory consistency).

- x86: 강한 순서(TSO) - 대부분 순서 유지
- ARM: 약한 순서 - 컴파일러/CPU가 재배열 가능 → 명시적 배리어(`dmb`) 필요
- 그래서 락프리 코드가 아키텍처마다 다르게 동작. Apple의 Rosetta가 x86 번역 시 겪는 난제 → [[isa-design]], [[lock-free-basics]]

## 실전 함의

- 원자적 연산(CAS)·락은 라인을 M으로 확보 + 무효화 → 경합 심하면 코어 간 트래픽 폭발 ([[locks]])
- 공유 카운터를 여러 스레드가 증가시키면 그 라인이 핑퐁 → 코어 늘려도 안 빨라짐. 스레드별 카운터 후 합산이 정석
- 코어 수 확장성의 숨은 벽이 대부분 여기

## 연결

- false sharing 측정과 padding → [[memory-hierarchy]]
- 락/CAS가 이 프로토콜 위에서 비싼 이유 → [[locks]], [[lock-free-basics]]
- 메모리 순서와 배리어 → [[multicore-and-numa]]
- 투기 실행 + 캐시 흔적 (Spectre) → [[branch-prediction]]

## 궁금한 것 (나중에)

- [ ] MESI 상태 전이도 전체 (MOESI, MESIF 변형)
- [ ] snooping vs directory 방식의 확장성 차이
- [ ] `perf c2c`로 false sharing을 실제로 잡는 법
- [ ] atomic의 memory_order_relaxed~seq_cst가 하드웨어에서 뭘 바꾸나

## 출처

- CS:APP 6장 보충, P&H 5.8
- Ulrich Drepper, "What Every Programmer Should Know About Memory"
