# Lock-free 자료구조 (Lock-Free Data Structures)

## 한 줄 요약

락 대신 CAS 재시도 루프로 만든 동시 자료구조. 진행 보장의 강도에 따라 wait-free > lock-free > obstruction-free로 나뉜다. Treiber 스택·Michael-Scott 큐가 고전. 락의 병목·데드락·우선순위 역전을 피하지만, ABA·메모리 회수·재시도 라이브락이라는 새 난제를 떠안는다.

## 왜 필요한가

- 락 없는 자료구조가 왜·언제 필요한가
- 진행 보장(progress guarantee)의 계층
- lock-free가 공짜가 아닌 이유

## 왜 lock-free인가

락([[atomics-and-cas]], os/[[locks]])의 문제를 피함:

```
락의 병:
- 데드락 (os/[[deadlock]])
- 우선순위 역전 (낮은 우선순위가 락 쥐고 선점됨)
- 호위(convoy): 락 쥔 스레드가 선점되면 나머지 다 대기
- 락 쥔 스레드 죽으면 영구 블록
lock-free: 어떤 스레드가 멈춰도 다른 스레드는 진행 (락 안 씀)
```

## 진행 보장 계층 (핵심 개념)

"어떤 스레드가 반드시 진행하는가"의 강도:

```
wait-free     : 모든 스레드가 유한 단계 안에 완료 (기아 없음) - 가장 강함, 어려움
lock-free     : 최소 한 스레드는 진행 (시스템 전체는 멈추지 않음) - 개별은 굶을 수 있음
obstruction-free: 홀로 실행되면 완료 (경쟁 없을 때만 보장) - 가장 약함
blocking(락)   : 한 스레드 멈추면 다 멈출 수 있음
```

- lock-free = "누군가는 항상 앞으로 간다" (전역 진행), 하지만 특정 스레드는 계속 재시도로 굶을 수도
- wait-free는 이론상 이상적이나 구현 복잡·느릴 때 많음 → 대부분 lock-free로 타협

## Treiber 스택 (고전 lock-free)

CAS 루프로 top을 교체:

### 코드로 확인

```python
def push(self, val):
    while True:
        old = self.top
        node = Node(val, old)
        if cas(self.top, old, node): return   # top 그대로면 성공, 아니면 재시도
def pop(self):
    while True:
        old = self.top
        if old is None: return None
        if cas(self.top, old, old.next): return old.val
```

실행:
```
push 1,2,3 후 pop x4: [3, 2, 1, None]  (LIFO + 빈 스택 None)
```

- 각 연산이 **CAS 재시도 루프**([[atomics-and-cas]]): top이 내가 읽은 그대로일 때만 성공
- 다른 스레드가 그사이 바꿨으면 CAS 실패 → 다시 읽고 재시도 (lock-free: 누군가는 성공)

## Michael-Scott 큐

**lock-free FIFO 큐** - 실무 표준 (java.util.concurrent 등):

- head/tail 두 포인터를 CAS로 갱신
- **교묘함**: tail이 뒤처질 수 있어 "돕기(helping)" 필요 (다른 스레드의 미완 연산을 대신 완료)
- lock-free 알고리즘의 전형: 부분 완료 상태를 다른 스레드가 이어받음

## 새로운 난제 (공짜 아님)

lock-free는 락 문제를 없애지만 새 문제:

- **ABA 문제**([[atomics-and-cas]]): pop한 노드가 재사용되면 CAS가 속음 → 버전 태그 필요
- **메모리 회수(reclamation)**: 다른 스레드가 아직 볼 수 있는 노드를 언제 free? → 어려운 문제
  - **hazard pointer**: "내가 보는 중"인 포인터 표시 → 그건 회수 안 함
  - **RCU**(read-copy-update): 유예 기간 후 회수 (리눅스 커널)
  - **epoch-based**: 시대 구분으로 안전 시점 판단
  - GC 언어는 이 문제 완화 (programming-languages/[[garbage-collection]])
- **라이브락**: 경쟁 심하면 모두 재시도만 반복 (wait-free 아니면 개별 기아 가능)
- **정확성 증명 어려움**: linearizability 증명이 미묘 (아래)

## Linearizability (정확성 기준)

동시 자료구조가 "맞다"는 것의 정의:

```
각 연산이 호출과 반환 사이 어느 한 순간에 원자적으로 일어난 것처럼 보임
→ 동시 실행 결과가 어떤 순차 실행과 동일
```

- 동시 자료구조의 황금 정확성 기준 (sequential consistency보다 강함)
- distributed-systems/[[consistency-models]]의 선형화 가능성과 같은 개념

## 언제 쓰나 (실무 판단)

- **경쟁 심한 핫스팟**: 락 병목이 심한 큐·카운터 (스레드풀 작업 큐 등)
- **실시간·저지연**: 락의 예측 불가 블로킹을 피해야 할 때
- **주의**: 구현·검증 어려움 → **대부분은 검증된 라이브러리 사용** (직접 구현 X)
- 락이 충분히 빠르면 굳이 lock-free 안 함 (복잡도 대비 이득 확인)

## 셀프 체크

> [!question]- wait-free, lock-free, obstruction-free의 진행 보장 강도 차이는?
> wait-free는 모든 스레드가 유한 단계에 완료(기아 없음)로 가장 강하다. lock-free는 최소 한 스레드는 진행(전역 진행)하나 개별은 굶을 수 있다. obstruction-free는 홀로 실행될 때만 완료를 보장하며 가장 약하다.

> [!question]- Treiber 스택 push가 CAS 하나로 정확한 이유는?
> `CAS(top, old, node)`는 top이 내가 읽은 old와 여전히 같을 때만 성공한다. 그사이 누가 top을 바꿨으면 실패해 다시 읽고 재시도하므로, 성공 시점엔 항상 일관된 연결이 보장된다.

> [!question]- lock-free가 떠안는 메모리 회수 문제란?
> pop한 노드를 다른 스레드가 아직 참조 중일 수 있어 언제 free할지가 어렵다. hazard pointer(참조 표시), RCU(유예 기간), epoch 기반으로 안전 시점을 판단하며, GC 언어는 이 문제를 완화한다.

> [!question]- linearizability의 정의는?
> 각 연산이 호출과 반환 사이 어느 한 순간에 원자적으로 일어난 것처럼 보이는 것. 동시 실행 결과가 어떤 순차 실행과 동일해야 하며, sequential consistency보다 강한 정확성 기준이다.

## 연습문제

> [!example]- 문제: 아래 Treiber pop이 lock-free임을 논증하고, 두 스레드가 동시에 pop할 때 자료 손실이 없음을 보여라
> ```python
> def pop(self):
>     while True:
>         old = self.top
>         if old is None: return None
>         if cas(self.top, old, old.next): return old.val
> ```
> **풀이**
> lock-free 증명: CAS가 실패하는 유일한 경우는 다른 스레드가 그사이 top을 바꿨을 때인데, top이 바뀌었다는 것은 다른 스레드의 push/pop이 성공(진행)했다는 뜻이다. 즉 어떤 스레드도 실패로 반복하려면 반드시 다른 스레드가 성공해야 하므로 전역 진행이 보장된다.
> 손실 없음: 두 스레드가 같은 old를 읽어도 CAS는 하나만 성공한다. 실패한 쪽은 갱신된 top을 다시 읽어 다른 노드를 pop하므로, 같은 노드가 두 번 반환되지 않는다. (단 노드 재사용 시 ABA 별도 대비 필요.)

> [!example]- 문제: Michael-Scott 큐에서 tail이 실제 마지막 노드보다 뒤처질 때 다른 스레드가 왜 "돕기(helping)"를 해야 하는지 설명하라
> **풀이**
> enqueue는 (1) 마지막 노드의 next를 CAS로 연결, (2) tail을 새 노드로 CAS 전진 - 두 단계다. 스레드가 (1) 성공 후 (2) 전에 선점되면 tail이 뒤처진 부분 완료 상태가 된다. 다른 스레드가 이를 그대로 두면 tail 기준 삽입이 영원히 실패한다. 그래서 tail.next가 non-null인 걸 본 스레드가 tail 전진 CAS를 대신 수행(helping)해 미완 연산을 이어받아야 lock-free 진행이 유지된다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 세 진행 보장 계층을 "누가 반드시 진행하는가"로 구분, (2) CAS 재시도 루프가 왜 전역 진행을 주지만 개별 기아는 허용하는가, (3) lock-free가 락 문제를 없애는 대신 떠안는 새 난제(ABA·메모리 회수·라이브락)와 linearizability의 필요성.

## 연결

- CAS·ABA → [[atomics-and-cas]]
- 메모리 순서 → [[memory-models]]
- 락의 문제들 → os/[[locks]], os/[[deadlock]]
- 메모리 회수와 GC → programming-languages/[[garbage-collection]]
- linearizability → distributed-systems/[[consistency-models]]
- os의 lock-free 입문 → os/[[lock-free-basics]]

## 궁금한 것 (나중에)

- [ ] Michael-Scott 큐 helping 상세
- [ ] hazard pointer vs epoch (성능·복잡도)
- [ ] wait-free universal construction (Herlihy)
- [ ] lock-free vs 락의 실제 벤치마크 (경쟁도별)

## 출처

- Herlihy & Shavit 9-11장, Treiber(1986), Michael & Scott(1996)
