# 스레드와 경쟁 조건 (Threads and Races)

## 한 줄 요약

두 스레드가 공유 데이터를 동시에 수정하면, `counter++` 같은 단순 연산도 유실된다. 원인은 read-modify-write가 원자적이지 않아 중간에 끼어들 수 있기 때문. 임계 구역을 상호 배제로 보호해야 한다.

## 왜 필요한가

- 멀티스레드 버그의 근본 (동시성 전체의 출발점)
- `counter++`가 왜 안전하지 않나
- 락([[locks]])이 왜 필요한지의 동기

## 실증: 갱신 유실

스레드 4개가 각각 공유 카운터를 100만 번 증가. 기대값 400만:

```c
long counter = 0;
void* inc(void* a){ for(long i=0;i<1000000;i++) counter++; }
```

이 머신 `-O0`, 3회 실행:

```
expected: 4000000
actual  : 1056714  (LOST UPDATES!)
actual  : 1024376  (LOST UPDATES!)
actual  : 1125304  (LOST UPDATES!)
```

400만이 아니라 100만대, 게다가 **실행마다 값이 다름**. 300만 번의 증가가 사라졌다. 이것이 경쟁 조건.

(주의: `-O1`이면 컴파일러가 `counter += 1000000` 한 방으로 접어 경쟁 창이 거의 사라짐 → 우연히 맞을 수 있음. 버그가 최적화 수준·타이밍에 따라 숨는 게 경쟁 조건의 악질적 특성. `-O0`로 실제 read-modify-write를 유지해야 재현.)

## 원인: ++는 원자적이 아니다

`counter++`는 한 명령처럼 보이지만 실제로 세 단계 ([[assembly-basics]]):

```
1. load  counter → 레지스터   (읽기)
2. add   레지스터, 1          (수정)
3. store 레지스터 → counter   (쓰기)
```

두 스레드가 겹치면:

```
스레드A: load counter (=5)
스레드B: load counter (=5)     ← A가 아직 store 전
스레드A: add → 6, store (=6)
스레드B: add → 6, store (=6)   ← 5+1을 또 함. 하나 유실!
```

두 번 증가했는데 결과는 +1. 이 read-modify-write 사이 끼어듦(interleaving)이 유실의 원인.

## 용어

- **경쟁 조건(race condition)**: 결과가 스레드 실행 순서(스케줄링)에 의존하는 상황
- **임계 구역(critical section)**: 공유 자원에 접근하는 코드 (여기선 `counter++`)
- **상호 배제(mutual exclusion)**: 한 번에 하나의 스레드만 임계 구역에 들어가게 보장
- **원자성(atomicity)**: 연산이 나눌 수 없게(전부 또는 전무) 실행됨

## 왜 어려운가

1. **비결정적**: 스케줄링에 의존 → 재현이 들쭉날쭉. 테스트에서 안 나다 운영에서 터짐
2. **최적화/타이밍에 숨음**: 위처럼 `-O1`에선 안 보일 수 있음
3. **조합 폭발**: 인터리빙 경우의 수가 방대 → 전수 테스트 불가
4. 그래서 **설계로** 막아야 함 (테스트로 못 잡음)

## 해결의 방향

임계 구역을 **상호 배제로 보호**:

```c
lock(&m);
counter++;      // 한 번에 한 스레드만
unlock(&m);
```

- **락/뮤텍스** → [[locks]]: 임계 구역을 감쌈
- **원자적 연산** → CAS, atomic add: 하드웨어가 read-modify-write를 원자적으로 ([[lock-free-basics]])
- **조건 변수** → [[condition-variables]]: 조건 대기
- **세마포어** → [[semaphores]]: 카운팅 기반

위 예제는 `counter++`를 락으로 감싸거나 `atomic_long`으로 바꾸면 정확히 400만.

## 원자적 연산 미리보기

`counter++`를 하드웨어 원자 명령으로:

```c
#include <stdatomic.h>
atomic_long counter = 0;
counter++;   // 원자적 - 유실 없음, 락 불필요
```

하드웨어가 read-modify-write를 하나의 나눌 수 없는 연산으로 실행 ([[cache-coherence]]의 라인 독점 활용). 단순 카운터엔 락보다 이게 나음.

## 연결

- 공유 메모리의 근원 → [[process-vs-thread]]
- 상호 배제 구현 → [[locks]]
- 원자 연산과 CAS → [[lock-free-basics]]
- 조건 대기 → [[condition-variables]]
- ++의 세 단계 → [[assembly-basics]]

## 궁금한 것 (나중에)

- [ ] ThreadSanitizer(TSan)로 경쟁을 자동 탐지하는 법
- [ ] 메모리 순서(memory_order)가 원자 연산 비용을 바꾸는 법 → [[cache-coherence]]
- [ ] 왜 volatile은 동기화 도구가 아닌가 (흔한 오해)
- [ ] happens-before 관계의 정확한 정의 → [[clocks]]

## 출처

- OSTEP 25-26장 (동시성 도입)
