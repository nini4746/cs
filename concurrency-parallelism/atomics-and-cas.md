# 원자 연산과 CAS (Atomics and Compare-And-Swap)

## 한 줄 요약

락 없이 동시성을 다루는 하드웨어 기본기 - 원자 연산은 중간에 끼어들 수 없는 read-modify-write이고, 그 왕은 **compare-and-swap(CAS)**: "값이 여전히 기댓값이면 바꿔라". CAS로 락 없는 알고리즘을 짜지만, 값만 비교하는 탓에 **ABA 문제**(A→B→A를 못 알아챔)에 빠질 수 있어 버전 태그가 필요하다.

## 왜 필요한가

- 락 없이 어떻게 안전하게 공유 상태를 바꾸나
- CAS가 왜 lock-free의 심장인가
- ABA 문제가 뭐고 왜 위험한가

## 원자 연산

**중간에 관찰·중단될 수 없는 연산** (all-or-nothing):

```
문제: counter += 1 은 3단계 (읽기|증가|쓰기) → race ([[concurrency-vs-parallelism]])
해결: atomic_add(counter, 1) → 하드웨어가 하나의 불가분 연산으로
```

- CPU가 제공: `fetch-and-add`, `exchange`, `test-and-set`, `compare-and-swap`
- 캐시 일관성 프로토콜(computer-architecture/[[cache-coherence]])이 원자성 보장 (버스 락 또는 캐시라인 독점)
- 락도 결국 이 원자 연산 위에 구현됨 (os/[[locks]]의 spinlock = test-and-set)

## Compare-And-Swap (CAS, 핵심)

가장 강력한 원자 연산 - **조건부 교체**:

```
CAS(주소, expected, new):
    원자적으로 {
        if *주소 == expected:  *주소 = new; return true
        else:                  return false
    }
```

- "내가 읽은 값(expected)이 아직 그대로면 → 새 값으로. 아니면 실패(누가 바꿈)"
- **낙관적 동시성**: 일단 시도, 충돌하면 재시도 (락처럼 미리 막지 않음)

### 코드로 확인: CAS 재시도 루프

```python
def cas_increment(atomic):
    while True:
        cur = atomic.v
        if atomic.compare_and_swap(cur, cur+1):  # 아무도 안 바꿨으면 성공
            return
        # 실패 = 누가 바꿈 → 재시도
```

실행:
```
CAS 증가 5회: 5
```

- 락 없이 정확한 증가 → 경쟁 없으면 빠름, 경쟁 심하면 재시도 반복(라이브락 위험)
- CAS는 **범용성 최강**(consensus number ∞): 어떤 동시 객체도 CAS로 wait-free 구현 가능 (Herlihy)

## ABA 문제 (CAS의 함정)

CAS는 **값만** 비교 → 그 사이 A→B→A로 돌아오면 "안 바뀐 줄" 착각:

### 코드로 확인

```
ABA 문제:
  T2가 A->B->C->A 로 바꿈 (top 다시 'A', 하지만 내부는 변함)
  T1의 CAS(A->B) 성공? True  <- 성공하면 안 되는데 성공 (ABA!)
```

- 시나리오: 스레드1이 top=A 읽고 선점됨 → 스레드2가 A 빼고 B,C 처리 후 A 다시 넣음 → 스레드1 재개, top이 여전히 A라 **CAS 성공** → 하지만 그 A는 이제 다른 맥락 (이미 해제된 노드 등)
- **결과**: lock-free 스택/큐에서 해제된 메모리 참조, 자료구조 오염
- **원인**: 값 동일 ≠ 변화 없음 (시간 사이 역사를 못 봄)

### 해결

- **버전 태그(counter)**: `(값, 버전)` 쌍을 CAS → A로 돌아와도 버전이 달라 감지 (double-width CAS)
- **hazard pointer / RCU**: 메모리를 즉시 재사용 안 함 (안전한 회수) → [[lock-free-structures]]
- **GC 언어는 덜 심각**: 가비지 컬렉션이 메모리 재사용 관리 (programming-languages/[[garbage-collection]])

## LL/SC (대안)

일부 아키텍처(ARM, RISC-V)는 CAS 대신 **Load-Linked/Store-Conditional**:

```
LL(주소): 값 읽고 감시 시작
SC(주소, new): 그 사이 아무도 안 건드렸으면 저장 성공
```

- **ABA 면역**: 값이 A→B→A여도 중간에 쓰기가 있었으면 SC 실패 (값이 아니라 "건드림"을 봄)
- x86은 CAS(`cmpxchg`), ARM은 LL/SC 계열

## 왜 중요한가

- **lock-free의 기본 벽돌**: 모든 무잠금 자료구조가 CAS/LL-SC 위 ([[lock-free-structures]])
- **락도 이 위에**: 뮤텍스·스핀락 구현의 바닥 (os/[[locks]])
- **낙관적 동시성**: DB MVCC(database/[[mvcc]]), 낙관적 락도 같은 발상 (충돌 시 재시도)

## 셀프 체크

> [!question]- `counter += 1`이 원자적이지 않은 이유와 원자 연산이 해결하는 방식은?
> 읽기·증가·쓰기 3단계라 사이에 다른 스레드가 끼어들 수 있다. `atomic_add`는 하드웨어가 이 read-modify-write를 하나의 불가분 연산으로 수행해 인터리빙을 원천 차단한다.

> [!question]- CAS가 lock-free의 심장인 이유는?
> "내가 읽은 값이 그대로면 교체, 아니면 실패"라는 낙관적 조건부 교체로, 미리 막지 않고 충돌 시 재시도하며 진행한다. consensus number가 무한이라 어떤 동시 객체도 CAS로 wait-free 구현이 가능하다.

> [!question]- ABA 문제를 한 문장으로 설명하면?
> CAS는 값만 비교하므로 A→B→A로 되돌아온 사이의 변화를 못 알아채고 "안 바뀐 줄" 착각해 성공한다.

> [!question]- LL/SC가 ABA에 면역인 이유는?
> 값이 아니라 "그 사이 누가 건드렸는가"를 감시한다. A→B→A여도 중간 쓰기가 있었으면 SC가 실패한다.

## 연습문제

> [!example]- 문제: 아래 Treiber 스택 pop에서 ABA로 해제된 노드를 top에 남기는 인터리빙을 구성하라 (수동 메모리 관리 가정)
> ```
> pop(): old=top; new=old.next; if CAS(top, old, new): free(old); return old.val
> ```
> **풀이**
> top=[A→B→C]. T1이 old=A, new=B를 읽고 선점된다. T2가 pop으로 A를, 다시 pop으로 B를 빼고 free한다. 이후 T2가 push로 (재사용된 주소의) A를 다시 넣어 top=[A→C]. T1이 재개하면 top이 여전히 A라 `CAS(top, A, B)` 성공. 그러나 B는 이미 해제되어 top이 free된 노드를 가리킨다.
> 원인: 값 동일 ≠ 변화 없음. 해결: `(포인터, 버전)` double-width CAS로 버전이 달라져 감지하거나, hazard pointer로 참조 중인 노드의 회수를 지연한다.

> [!example]- 문제: 아래 CAS 재시도 카운터가 경쟁 하에서도 갱신을 절대 잃지 않음을 논증하라
> ```python
> while True:
>     cur = atomic.v
>     if atomic.compare_and_swap(cur, cur+1): return
> ```
> **풀이**
> CAS는 `atomic.v`가 읽은 `cur`와 여전히 같을 때만 성공한다. 성공했다는 것은 읽기와 쓰기 사이에 아무도 값을 바꾸지 않았음을 뜻하므로 lost update가 불가능하다. 다른 스레드가 그사이 바꿨다면 CAS가 실패하고 최신 값으로 다시 읽어 재시도한다. 경쟁이 심하면 재시도가 반복돼 개별 스레드는 굶을 수 있으나(라이브락) 매 성공은 정확한 증가라 정확성은 보장된다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) CAS의 세 인자와 성공/실패 조건, (2) ABA가 왜 값 비교의 한계에서 오는지와 버전 태그가 어떻게 막는지, (3) 락조차 결국 test-and-set 같은 원자 연산 위에 세워진다는 계층 관계.

## 연결

- race·비원자성 → [[concurrency-vs-parallelism]]
- 메모리 순서 (CAS에 order 지정) → [[memory-models]]
- lock-free 자료구조 → [[lock-free-structures]]
- 락 구현의 바닥 → os/[[locks]]
- 캐시 일관성 → computer-architecture/[[cache-coherence]]
- 낙관적 동시성 → database/[[mvcc]]
- GC와 메모리 회수 → programming-languages/[[garbage-collection]]
- CAS로 짜는 무잠금 입문 → os/[[lock-free-basics]]

## 궁금한 것 (나중에)

- [ ] consensus number와 CAS의 보편성 (Herlihy 계층)
- [ ] hazard pointer vs epoch-based reclamation
- [ ] false sharing (캐시라인 경쟁)
- [ ] 원자 연산의 실제 비용 (경쟁 시 캐시 튕김)

## 출처

- Herlihy & Shavit 5장(consensus)·9장, "C++ Concurrency in Action", os/[[locks]]
