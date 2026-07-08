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

## 연결

- 재정렬·비순차 실행 → computer-architecture/[[cache-coherence]]
- 원자 연산으로 순서 강제 → [[atomics-and-cas]]
- lock-free의 토대 → [[lock-free-structures]]
- 락의 가시성 보장 → os/[[locks]]
- Rust의 컴파일타임 안전 → programming-languages/[[type-systems-advanced]]
- 데이터 레이스 = 미정의 → [[concurrency-vs-parallelism]]

## 궁금한 것 (나중에)

- [ ] x86-TSO vs ARM/Power 약한 모델 차이
- [ ] 메모리 배리어(fence) 명령 상세
- [ ] C++ memory_order_consume은 왜 폐기 추세
- [ ] 정형 메모리 모델 (herd7, litmus test)

## 출처

- Herlihy & Shavit 3·7장, "C++ Concurrency in Action"(Williams), Java Memory Model(JSR-133)
