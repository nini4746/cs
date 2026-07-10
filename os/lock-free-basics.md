# 락프리 기초 (Lock-Free Basics)

## 한 줄 요약

락 없이 원자적 연산(주로 CAS)만으로 공유 자료구조를 안전하게 다루는 기법. 데드락이 원천적으로 없고 경합 시 빠를 수 있지만, ABA 문제와 메모리 순서 때문에 짜기가 매우 어렵다.

## 왜 필요한가

- 락([[locks]])의 문제(데드락, 경합, 우선순위 역전)를 피하는 다른 길
- atomic 카운터가 락보다 빨랐던 이유의 일반화 ([[threads-and-races]] 실측)
- CAS가 실제로 어떻게 자료구조를 만드나

## 핵심 도구: CAS (Compare-And-Swap)

하드웨어 원자 명령 ([[locks]]):

```c
bool CAS(T *addr, T expected, T new) {
    // 원자적으로:
    if (*addr == expected) { *addr = new; return true; }
    return false;
}
```

"값이 내가 본 그대로면 바꾸고, 아니면 실패." 락프리의 거의 모든 것이 이 위에.

## 락프리 패턴: 재시도 루프

CAS로 "읽고 - 계산하고 - 바뀌지 않았으면 커밋, 바뀌었으면 재시도":

```c
// 락프리 카운터 증가
long old, new;
do {
    old = atomic_load(&counter);
    new = old + 1;
} while (!CAS(&counter, old, new));   // 그새 남이 바꿨으면 재시도
```

- 남이 끼어들어 counter가 바뀌면 CAS 실패 → 다시 읽고 재시도
- 락처럼 블록하지 않음. 항상 "누군가는 진전" (lock-free 보장)
- 이게 `atomic_long counter; counter++`의 내부 (컴파일러가 이 루프 생성) → [[threads-and-races]]에서 atomic이 빨랐던 이유

## 진전 보장의 레벨

| | 보장 |
|---|---|
| **wait-free** | 모든 스레드가 유한 스텝 내 완료 (기아 없음). 가장 강함, 가장 어려움 |
| **lock-free** | 시스템 전체로 항상 누군가는 진전 (개별 스레드는 기아 가능) |
| **obstruction-free** | 방해 없으면 완료 |
| (락 기반) | 락 쥔 스레드가 멈추면 전체 멈춤 - 이 보장들 없음 |

락프리의 매력: 한 스레드가 죽거나 멈춰도(스케줄 아웃) 다른 스레드는 계속 진전. 락은 락 쥔 채 멈추면 전부 멈춤.

## ABA 문제

락프리의 악명 높은 함정. CAS는 "값이 같으면 안 바뀐 것"으로 보는데, **값이 A→B→A로 돌아오면** 안 바뀐 걸로 착각:

```
스레드1: old=A 읽음
스레드2: A→B→A로 바꿈 (그 사이 구조가 완전히 달라짐)
스레드1: CAS(A, new) 성공 ← A로 보이지만 실제론 딴 세상
```

특히 포인터 기반 자료구조(락프리 스택/큐)에서 재활용된 메모리 주소가 우연히 같으면 손상. 해결:
- **태그/버전 카운터**: 값에 카운터를 붙여 A(v1)≠A(v3) (double-width CAS)
- **hazard pointer / RCU**: 재사용을 지연시켜 ABA 창을 없앰

## 메모리 순서

락프리는 [[cache-coherence]]의 메모리 순서에 정면으로 노출:

- ARM 같은 약한 순서에선 다른 코어가 쓰기를 다른 순서로 볼 수 있음
- `memory_order_relaxed/acquire/release/seq_cst`로 필요한 만큼만 순서 보장 (강할수록 느림)
- 이걸 틀리면 대부분 아키텍처에서 잘 돌다가 특정 CPU/타이밍에만 깨짐 → 최악의 버그
- x86(TSO)에서 되던 게 ARM에서 안 되는 전형 ([[isa-design]])

## RCU (Read-Copy-Update)

읽기가 압도적으로 많을 때. 읽기는 **동기화 없이**(락 0), 쓰기는 복사본을 만들어 교체 후 기존 것을 아무도 안 볼 때 회수:

- 읽기 비용 거의 0 → 리눅스 커널이 애용
- 쓰기가 복잡하고 회수 타이밍 관리 필요

## 현실적 조언

락프리는 **어렵다**. 대부분의 코드엔 과함:

1. **먼저 락**을 써라. 명확하고 대부분 충분
2. 단순 카운터/플래그는 **atomic** (락프리의 쉬운 부분)
3. 진짜 확장성 병목이 증명되면 그때 **검증된 락프리 라이브러리** (직접 구현 말고)
4. 직접 짜야 하면 TSan + 형식 검증 + 리뷰 총동원

"락프리가 항상 빠르다"는 오해. 경합 낮으면 락이 더 단순하고 비슷하게 빠름. 락프리의 진짜 이점은 속도보다 **진전 보장**(멈추지 않음).

## 셀프 체크

> [!question]- 락프리의 진짜 이점은 속도가 아니라 뭔가? 왜?
> 진전 보장(progress guarantee)이다. 한 스레드가 죽거나 스케줄 아웃돼도 다른 스레드는 계속 진전한다. 락은 락 쥔 스레드가 멈추면 전체가 멈춘다. 경합이 낮으면 오히려 락이 더 단순하고 비슷하게 빠르므로, "락프리가 항상 빠르다"는 오해다.

> [!question]- CAS 재시도 루프가 락처럼 블록하지 않는데도 정확성을 보장하는 이유는?
> 읽은 값이 그대로일 때만 커밋하기 때문이다. 그새 남이 값을 바꾸면 CAS가 실패해 다시 읽고 재계산·재시도한다. 갱신 유실이 원천적으로 생길 수 없고, 실패한 쪽이 재시도하는 동안 성공한 쪽은 진전하므로 시스템 전체로는 항상 누군가 진전한다(lock-free 보장).

> [!question]- wait-free와 lock-free의 차이는?
> wait-free는 모든 스레드가 유한 스텝 내 완료를 보장해 개별 스레드의 기아가 없다(가장 강하고 가장 어려움). lock-free는 시스템 전체로는 항상 누군가 진전하지만 특정 스레드는 계속 CAS 실패로 기아에 빠질 수 있다.

> [!question]- ABA 문제가 왜 생기고, 태그 카운터가 어떻게 막나?
> CAS는 "값이 같으면 안 바뀐 것"으로 보는데, 값이 A→B→A로 되돌아오면 그새 구조가 완전히 달라졌어도 안 바뀐 걸로 착각한다(특히 재활용된 포인터 주소). 태그/버전 카운터를 값에 붙이면 A(v1)≠A(v3)이 되어 double-width CAS가 되돌아온 A를 구별해낸다. hazard pointer/RCU는 재사용 자체를 지연시켜 ABA 창을 없앤다.

> [!question]- x86에서 잘 돌던 락프리 코드가 ARM에서 깨지는 이유는?
> x86(TSO)은 메모리 순서가 강해 relaxed하게 짜도 우연히 동작하지만, ARM은 약한 순서라 다른 코어가 쓰기를 다른 순서로 볼 수 있다. 필요한 acquire/release/seq_cst를 안 걸면 특정 CPU/타이밍에만 깨지는 최악의 버그가 된다.

## 연습문제

> [!example]- 문제: 아래 락프리 push의 ABA 취약점 시나리오를 구성하라.
> ```c
> void push(Node **top, Node *n) {
>     do { n->next = *top; } while (!CAS(top, n->next, n));
> }
> Node *pop(Node **top) {
>     Node *t;
>     do { t = *top; if(!t) return NULL; } while (!CAS(top, t, t->next));
>     return t;  // 이후 free(t) 가능
> }
> ```
> **풀이**
> 1. 스택 A→B→C. 스레드1이 pop 시작: t=A, t->next=B를 읽고 CAS 직전 선점됨.
> 2. 스레드2: pop으로 A 제거(free), pop으로 B 제거, 다시 A를 push. 이제 top=A, A->next=C (B는 이미 free됨).
> 3. 스레드1 재개: CAS(top, A, B) 성공 - top이 여전히 A로 보이니까. 하지만 top이 이미 free된 B를 가리키게 되어 스택 손상.
> 해결: top에 버전 카운터를 붙여 double-width CAS로 비교(A,v1 ≠ A,v3)하거나, hazard pointer로 t가 사용 중인 동안 free를 지연시킨다.

> [!example]- 문제: 두 스레드가 각각 100만 번 락프리 카운터를 증가시킬 때, 최종 값과 "총 CAS 시도 횟수"의 하한·상한을 구하고 이유를 설명하라.
> **풀이**
> - 최종 값: 정확히 200만. CAS는 읽은 값이 유지될 때만 커밋하므로 갱신 유실이 없다.
> - CAS 시도 하한: 200만(모든 CAS가 첫 시도에 성공, 경합 전혀 없을 때).
> - 상한: 무제한. lock-free는 개별 스레드 진전을 보장하지 않아, 한 스레드가 매번 남에게 선점당해 CAS 실패·재시도를 반복(기아)할 수 있다. 실전에선 경합에 비례해 증가하며, 이 재시도 비용이 경합 높을 때 락프리가 느려지는 원인이다.

> [!example]- 문제: 읽기 99%, 쓰기 1%인 공유 설정 구조에 락프리 재시도 루프 대신 RCU를 택하는 근거를 설명하라.
> **풀이**
> RCU는 읽기를 동기화 없이(락 0, CAS 0) 수행하므로 읽기 비용이 거의 0이다. 읽기가 압도적으로 많은 이 워크로드에선 읽기 경로의 원자 연산·캐시 라인 경합 자체가 병목인데, RCU는 그걸 제거한다. 쓰기는 복사본을 만들어 포인터 교체 후 기존 것을 아무도 안 볼 때 회수하므로 드문 쓰기의 복잡성만 감수하면 된다. 리눅스 커널이 이런 read-mostly 구조에 RCU를 애용하는 이유다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 3가지.
> 1. CAS 재시도 루프가 "읽고-계산-커밋/재시도"로 갱신 유실을 막는 흐름을 코드 없이 말로 설명할 수 있는가.
> 2. lock-free / wait-free / obstruction-free의 진전 보장 차이를 각각 한 문장으로 구분할 수 있는가.
> 3. ABA가 왜 위험하고, 태그 카운터와 hazard pointer/RCU가 각각 어떤 원리로 막는지 설명할 수 있는가.

## 연결

- CAS의 하드웨어 → [[locks]], [[cache-coherence]]
- atomic 카운터 실측 → [[threads-and-races]]
- 메모리 순서와 아키텍처 → [[isa-design]], [[multicore-and-numa]]
- 데드락 없음이 매력 → [[deadlock]]
- CAS 원자 연산 자체 → concurrency-parallelism/[[atomics-and-cas]]
- acquire/release 메모리 순서 → concurrency-parallelism/[[memory-models]]

## 궁금한 것 (나중에)

- [ ] 락프리 스택(Treiber)과 큐(Michael-Scott) 구현 읽기
- [ ] hazard pointer vs epoch-based reclamation
- [ ] seqlock (rare-write, frequent-read)
- [ ] Rust가 락프리를 타입으로 어떻게 더 안전하게 하나

## 출처

- OSTEP 28장 보충, "The Art of Multiprocessor Programming" (Herlihy & Shavit)
