# 메모리 모델 (Memory Models)

## 한 줄 요약

멀티코어에서 "한 스레드의 쓰기를 다른 스레드가 언제 어떤 순서로 보는가"의 규칙. CPU와 컴파일러가 성능을 위해 명령을 **재정렬**하기 때문에, 순차적 직관(sequential consistency)은 기본이 아니다. happens-before 관계와 acquire/release 원자 연산으로 필요한 순서만 강제하는 것이 현대 동시성의 토대.

## 왜 필요한가

- 왜 내가 쓴 순서대로 다른 스레드가 못 보나
- happens-before가 뭔가
- acquire/release, memory_order가 왜 필요한가

## 문제: 재정렬 (reordering)

내가 쓴 순서 ≠ 실제 실행/관찰 순서:

```
컴파일러 재정렬: 최적화로 명령 순서 바꿈 (의존 없으면)
CPU 재정렬: store buffer, 비순차 실행 (out-of-order, computer-architecture/)
캐시 전파 지연: 한 코어의 쓰기가 다른 코어에 늦게 보임
```

- **단일 스레드는 문제 없음**: 재정렬해도 그 스레드 관점 결과 동일 (as-if 규칙)
- **멀티 스레드는 깨짐**: 다른 스레드가 재정렬된 중간 상태를 관찰

### 고전 예: store buffer 재정렬

```
초기 x=y=0
스레드1: x=1; r1=y      스레드2: y=1; r2=x
직관: r1=r2=0은 불가능? → 실제 x86에서 가능!
(각 코어의 store buffer 때문에 상대 쓰기를 늦게 봄)
```

- 순차적 직관으로는 설명 안 되는 결과가 실제 하드웨어에서 나옴

## Sequential Consistency (기준선)

가장 강한(직관적) 모델 - **모든 스레드가 하나의 전역 순서에 동의**:

```
Lamport 정의: 실행 결과가 = 어떤 순차적 인터리빙과 같음
              각 스레드 내 순서는 프로그램 순서대로
```

- 가장 이해하기 쉽지만 **비쌈**: 하드웨어가 모든 재정렬 금지 → 성능 손해
- 그래서 실제 하드웨어·언어는 **더 약한(relaxed) 모델** 채택 → 재정렬 허용하되 도구 제공

## Happens-Before (핵심 관계)

"이 쓰기가 저 읽기보다 먼저 일어났다"를 정의하는 **부분 순서**:

```
A happens-before B 이면 → A의 효과를 B가 반드시 봄
프로그램 순서(같은 스레드) + 동기화(락/원자연산)로 성립
```

- **동기화가 없으면 순서 보장 없음** → 데이터 레이스 = 미정의 동작(C++/Java)
- 락 해제 → 다음 락 획득 사이 happens-before (그래서 락이 가시성도 보장)
- 이 부분 순서만 지키면 재정렬해도 안전 → 성능과 정확성의 균형

## Acquire / Release (실용 도구)

happens-before를 세밀하게 세우는 원자 연산 순서:

```
release 쓰기: 그 이전의 모든 쓰기가 이 지점 전에 완료 (뒤로 못 넘어감)
acquire 읽기: 그 이후의 모든 읽기가 이 지점 후에 (앞으로 못 넘어감)
release-acquire 짝 → happens-before 성립
```

- **깃발 패턴**: `data=42; flag.store(true, release)` ↔ `while(!flag.load(acquire)); use(data)` → data 가시성 보장
- **memory_order**(C++): relaxed(순서 무관, 원자성만) < acquire/release < seq_cst(가장 강함, 기본)
- 필요한 만큼만 강한 순서 → 불필요한 배리어 제거로 성능

## 언어별 메모리 모델

- **Java**(JMM, 2004): `volatile`, `synchronized`의 happens-before 규정 - 언어 최초의 정식 메모리 모델
- **C++11**: `std::atomic` + memory_order → 저수준 제어
- **Go**: 채널·뮤텍스 기반 happens-before ("메모리 공유로 통신 말고, 통신으로 공유")
- **Rust**: 타입 시스템이 데이터 레이스를 **컴파일 타임에** 차단 (Send/Sync) → programming-languages/[[type-systems-advanced]]

## 왜 중요한가

- **lock-free의 전제**: 원자 연산만으로 자료구조 만들려면 메모리 순서를 정확히 ([[atomics-and-cas]], [[lock-free-structures]])
- **미묘한 버그의 근원**: "가끔 안 되는" 동시성 버그의 상당수가 가시성·순서 문제
- **하드웨어 이해**: store buffer·캐시 일관성(computer-architecture/[[cache-coherence]])이 소프트웨어에 새어 나옴

## 셀프 체크

> [!question]- 내가 쓴 순서대로 다른 스레드가 못 보는 세 가지 원인은?
> 컴파일러 재정렬(의존 없으면 순서 바꿈), CPU 재정렬(store buffer·비순차 실행), 캐시 전파 지연(한 코어의 쓰기가 늦게 보임). 단일 스레드는 as-if 규칙으로 안전하지만 멀티 스레드는 중간 상태가 관찰된다.

> [!question]- happens-before는 무엇을 보장하나?
> A happens-before B이면 A의 효과를 B가 반드시 본다는 부분 순서다. 프로그램 순서와 동기화(락 해제→획득, release→acquire)로 성립하며, 동기화가 없으면 순서 보장이 없어 데이터 레이스는 미정의 동작이다.

> [!question]- release 쓰기와 acquire 읽기의 짝이 하는 일은?
> release 쓰기는 그 이전 쓰기들이 넘어오지 못하게, acquire 읽기는 그 이후 읽기들이 앞으로 넘어가지 못하게 막는다. release-acquire 짝이 만나면 happens-before가 성립해 깃발 이전 데이터의 가시성이 보장된다.

> [!question]- sequential consistency가 강력하지만 실제로 잘 안 쓰이는 이유는?
> 모든 스레드가 하나의 전역 순서에 동의하려면 하드웨어가 모든 재정렬을 금지해야 해 비싸다. 그래서 실제는 더 약한(relaxed) 모델에 acquire/release 같은 도구로 필요한 순서만 강제한다.

## 연습문제

> [!example]- 문제: 초기 x=y=0, 아래 실행에서 r1=r2=0이 실제 x86에서 가능한지 판정하고 이유를 설명하라
> ```
> 스레드1: x=1; r1=y        스레드2: y=1; r2=x
> ```
> **풀이**
> 가능하다. x86-TSO는 각 코어의 store buffer 때문에 자기 store(x=1, y=1)를 버퍼에 넣고, 상대 변수(y, x)는 아직 메모리/캐시에 반영되기 전 값을 읽을 수 있다. 즉 store→load 재정렬이 허용되어 두 스레드 모두 상대 쓰기를 못 보고 0을 읽는다. 순차적 인터리빙으로는 설명되지 않는 결과다. 막으려면 두 쓰기와 읽기 사이에 seq_cst 배리어(mfence)가 필요하다.

> [!example]- 문제: 아래 깃발 패턴에서 flag를 relaxed로 지정하면 왜 깨지는지, 올바른 memory_order를 지정하라
> ```
> 생산자: data = 42;  flag.store(true, relaxed)
> 소비자: while(!flag.load(relaxed)); use(data)
> ```
> **풀이**
> relaxed는 원자성만 줄 뿐 순서를 세우지 못한다. 생산자에서 `data=42`가 `flag.store` 뒤로, 소비자에서 `use(data)`가 flag 확인 앞으로 재정렬될 수 있어, 소비자가 flag=true를 봐도 data는 아직 0일 수 있다.
> 수정: 생산자는 `flag.store(true, release)`, 소비자는 `flag.load(acquire)`. release-acquire 짝이 happens-before를 세워 flag=true를 본 순간 data=42 가시성이 보장된다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 재정렬의 세 출처와 단일 스레드가 안전한 이유, (2) happens-before가 부분 순서로 "필요한 순서만" 강제한다는 발상, (3) relaxed < acquire/release < seq_cst의 강도 차이와 깃발 패턴에 왜 release-acquire가 필요한가.

## 연결

- 재정렬·비순차 실행 → computer-architecture/[[cache-coherence]]
- 원자 연산으로 순서 강제 → [[atomics-and-cas]]
- lock-free의 토대 → [[lock-free-structures]]
- 락의 가시성 보장 → os/[[locks]]
- Rust의 컴파일타임 안전 → programming-languages/[[type-systems-advanced]]
- 데이터 레이스 = 미정의 → [[concurrency-vs-parallelism]]
- 데이터 레이스·스레드 기초 → os/[[threads-and-races]]
- 비순차 실행이 만드는 재정렬 → computer-architecture/[[instruction-level-parallelism]]

## 궁금한 것 (나중에)

- [ ] x86-TSO vs ARM/Power 약한 모델 차이
- [ ] 메모리 배리어(fence) 명령 상세
- [ ] C++ memory_order_consume은 왜 폐기 추세
- [ ] 정형 메모리 모델 (herd7, litmus test)

## 출처

- Herlihy & Shavit 3·7장, "C++ Concurrency in Action"(Williams), Java Memory Model(JSR-133)
