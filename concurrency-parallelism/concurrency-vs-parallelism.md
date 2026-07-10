# 동시성 vs 병렬성 (Concurrency vs Parallelism)

## 한 줄 요약

동시성은 여러 일을 **논리적으로 동시에 다루는 구조**(한 코어에서 번갈아도 됨), 병렬성은 여러 일을 **물리적으로 동시에 실행**(여러 코어)하는 것. 둘 다 어려운 근본 이유는 **인터리빙의 비결정성** - `counter += 1`조차 원자적이지 않아, 실행 순서에 따라 결과가 달라진다. 순차 프로그램의 직관이 무너지는 지점.

## 왜 필요한가

- 동시성과 병렬성은 뭐가 다른가 (자주 혼동)
- 왜 동시 프로그래밍이 그렇게 어려운가
- os/[[threads-and-races]]의 race를 왜 근본 문제로 다루나

## 동시성 ≠ 병렬성 (Rob Pike)

```
동시성(concurrency): 여러 일을 다루는 구조 (구성, dealing with)
  - 한 코어에서 번갈아 실행해도 동시성 (인터리빙)
병렬성(parallelism): 여러 일을 동시에 실행 (물리, doing)
  - 여러 코어에서 진짜 동시
```

- **동시성은 설계, 병렬성은 실행**: 동시적으로 구성하면 병렬 실행이 가능해짐 (하지만 병렬 없이도 동시성)
- 싱글코어도 동시성 있음 (os/[[cpu-scheduling]]의 시분할) - 웹서버가 요청 여럿 다룸
- GPU는 병렬성 극단 ([[gpu-computing]]), Go 고루틴은 동시성 추상 ([[message-passing]])

## 왜 어려운가: 인터리빙의 폭발

순차 프로그램은 한 가지 실행 순서. 동시 프로그램은 **가능한 인터리빙이 조합적으로 폭발**:

```
스레드 2개, 각 3단계 → 가능한 인터리빙 20가지
그중 하나라도 버그면 → 재현·디버깅 지옥 (Heisenbug)
```

- **비결정성**: 같은 입력이 실행마다 다른 결과 (스케줄러 타이밍에 의존)
- 순차적 사고 직관이 안 통함 → 정형 도구·모델 필요 ([[memory-models]])

## 핵심 병: race condition

**공유 상태 + 비원자 연산 + 인터리빙** = 버그:

`counter += 1`은 사실 3단계 (읽기 → 증가 → 쓰기)라 원자적이지 않음.

### 코드로 확인 (결정적 시연)

두 스레드가 각각 +1 (기대값 2), 나쁜 인터리빙:

```python
t1_read = counter        # 0  T1 읽기
t2_read = counter        # 0  T2도 읽기 (T1 쓰기 전!)
counter = t1_read + 1    # 1  T1 쓰기
counter = t2_read + 1    # 1  T2 쓰기 (T1 갱신 덮어씀!)
```

실행:
```
두 스레드가 각각 +1 (기대값 2):
  나쁜 인터리빙 (락 없음): 1  <- lost update!
  좋은 순서   (락 있음): 2
```

- 두 번 증가했는데 결과가 **1** (한 번의 갱신이 사라짐 - lost update)
- 원인: 읽기와 쓰기 **사이**에 다른 스레드가 끼어듦 (원자성 위반)
- 해결: 락으로 read-modify-write를 원자적으로 (os/[[locks]]) 또는 원자 연산 ([[atomics-and-cas]])

## 동시성 버그의 종류

- **race condition**: 위 - 순서에 따라 결과 달라짐
- **데드락**: 서로 상대의 락을 기다림 (os/[[deadlock]])
- **라이브락**: 계속 양보하다 진행 못 함
- **기아(starvation)**: 특정 스레드가 자원 영영 못 얻음
- **원자성 위반·순서 위반**: 가정한 순서가 안 지켜짐 ([[memory-models]])
- 공통 원인: **공유 가변 상태(shared mutable state)**

## 근본 해법의 방향

동시성 문제를 다루는 세 갈래 (이 과목의 지도):

```
1. 공유 상태를 지킨다: 락·원자연산 (os/[[locks]], [[atomics-and-cas]], [[lock-free-structures]])
2. 공유를 없앤다: 메시지 전달·불변성 (actor/CSP [[message-passing]])
3. 순서를 정의한다: 메모리 모델 (happens-before [[memory-models]])
```

- **"공유하지 말고 통신하라"**(Go 격언): 공유 상태가 병의 근원 → 메시지로 회피
- 함수형 불변성도 같은 정신 (programming-languages/[[functional-programming]])

## 왜 이게 중요한가

- **멀티코어 시대 필연**: 클럭 한계로 코어 수로 성능↑ (computer-architecture/) → 병렬 안 하면 성능 정체
- **거의 모든 시스템이 동시적**: 서버, UI, 분산 시스템(distributed-systems/)
- **가장 어려운 버그**: 재현 안 되고, 순차 직관이 배신 → 원리 이해가 필수

## 셀프 체크

> [!question]- 동시성과 병렬성의 차이를 Rob Pike식으로 구분하면?
> 동시성은 여러 일을 논리적으로 다루는 구조(dealing with, 설계)이고, 병렬성은 여러 일을 물리적으로 동시에 실행(doing)하는 것이다. 싱글코어 시분할도 동시성이며, 동시적으로 구성하면 병렬 실행이 가능해진다.

> [!question]- 동시 프로그램이 순차 프로그램보다 근본적으로 어려운 이유는?
> 가능한 인터리빙이 조합적으로 폭발하고 스케줄러 타이밍에 따라 결과가 달라지는 비결정성 때문이다. 순차적 사고 직관이 배신하고 버그가 재현되지 않는다(Heisenbug).

> [!question]- lost update는 왜 발생하나?
> `counter += 1`이 읽기·증가·쓰기 3단계라, 두 스레드가 갱신 전에 같은 값을 읽으면 한쪽의 증가가 덮어써진다. 원자성 위반이 원인이다.

> [!question]- 동시성 문제를 다루는 세 갈래 접근은?
> (1) 공유 상태를 지킨다(락·원자연산), (2) 공유를 없앤다(메시지 전달·불변성), (3) 순서를 정의한다(메모리 모델의 happens-before).

## 연습문제

> [!example]- 문제: 두 스레드가 각각 `counter += 1`(초기 0)을 실행할 때 결과가 2가 아닌 1이 되는 인터리빙을 단계별로 적어라
> **풀이**
> ```
> t1_read = counter      # 0  T1 읽기
> t2_read = counter      # 0  T2도 읽기 (T1 쓰기 전)
> counter = t1_read + 1  # 1  T1 쓰기
> counter = t2_read + 1  # 1  T2 쓰기 (T1 갱신 덮어씀)
> ```
> 두 스레드의 읽기가 모두 쓰기보다 앞서면 둘 다 0을 보고 각자 1을 쓴다. 한 번의 증가가 사라져 결과는 1. read-modify-write를 락이나 원자 연산으로 불가분하게 만들어야 한다.

> [!example]- 문제: 아래 지연 초기화가 왜 데이터 레이스이고 두 개의 인스턴스가 생길 수 있는지 설명하라
> ```python
> instance = None
> def get():
>     if instance is None:      # 확인
>         instance = build()    # 생성 (여러 스레드 동시 진입 가능)
>     return instance
> ```
> **풀이**
> check-then-act가 원자적이지 않다. T1이 `is None`을 통과하고 `build()` 실행 중, T2도 아직 None을 보고 통과해 각자 `build()`를 호출한다. 서로 다른 인스턴스가 만들어져 싱글턴 가정이 깨진다. 락으로 임계 구역을 감싸거나 double-checked locking + 적절한 메모리 순서가 필요하다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 동시성(구조)과 병렬성(실행)을 예로 구분, (2) race가 공유 가변 상태 + 비원자 연산 + 인터리빙에서 나온다는 세 조건, (3) 이 과목의 세 해법 지도(지키기/없애기/순서 정의)가 각각 어느 노트로 이어지는지.

## 연결

- race·스레드 기초 → os/[[threads-and-races]], os/[[locks]]
- 시분할 동시성 → os/[[cpu-scheduling]]
- 순서·재정렬 정의 → [[memory-models]]
- 원자 연산 → [[atomics-and-cas]]
- 공유 없애기 → [[message-passing]]
- 병렬성 한계 → [[parallelism-limits]]
- 불변성 → programming-languages/[[functional-programming]]

## 궁금한 것 (나중에)

- [ ] 결정적 재현 (record-replay 디버깅)
- [ ] 정형 검증 (TLA+, model checking) → automata/와 연결
- [ ] 데이터 레이스 탐지기 (ThreadSanitizer)
- [ ] 왜 공유 메모리 vs 메시지 전달 논쟁

## 출처

- Rob Pike "Concurrency is not Parallelism", Herlihy & Shavit 1장, os/[[threads-and-races]]
