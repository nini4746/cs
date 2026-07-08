# 가비지 컬렉션 (Garbage Collection)

## 한 줄 요약

더 이상 도달 못 하는 메모리를 자동으로 회수한다. 참조 카운팅(즉시, 순환 못 잡음)과 추적 GC(mark-sweep, 순환 잡음, 일시정지) 두 계열. 세대별 GC가 실전 표준.

## 왜 필요한가

- 수동 메모리 관리(malloc/free → os/[[memory-allocation]])의 대안
- GC 일시정지(stop-the-world)가 왜 생기나
- 왜 Python은 순환 참조에 별도 처리가 필요한가

## 문제: 언제 메모리를 해제하나

객체를 할당했는데 언제 해제? 수동(C의 free)은 실수 위험 (use-after-free, 누수 → os/[[memory-allocation]]). GC = **도달 불가능한 객체를 자동 회수**.

핵심 개념: **도달 가능성(reachability)**. 루트(전역, 스택, 레지스터)에서 참조를 따라 도달할 수 있으면 살아있음, 없으면 쓰레기.

## 계열 1: 참조 카운팅

각 객체가 **자신을 가리키는 참조 수**를 셈:

```
참조 생기면 count++, 사라지면 count--
count == 0 → 즉시 해제
```

- **즉시 회수**: 0 되는 순간 해제. 예측 가능한 타이밍
- **분산**: 전체 정지 없이 조금씩
- **치명적 약점: 순환 참조 못 잡음**. A→B, B→A면 서로 count 1 유지 → 아무도 안 쓰는데 count≠0 → 누수

```python
a = Node(); b = Node()
a.next = b; b.next = a   # 순환 - 참조 카운팅만으론 누수
```

- 오버헤드: 참조 갱신마다 count 조작 (멀티스레드면 원자 연산 → computer-architecture/[[cache-coherence]])
- 사용: Python(참조 카운팅 + 순환 감지 백업), Swift(ARC), C++ shared_ptr

## 계열 2: 추적 GC (tracing)

주기적으로 **루트에서 도달 가능한 것을 표시**하고 나머지 회수:

### mark-sweep

```
1. Mark: 루트에서 참조 따라가며 도달 가능한 객체 표시
2. Sweep: 표시 안 된 객체 전부 회수
```

- **순환 참조 잡음**: 순환이라도 루트에서 도달 못 하면 회수 (도달 가능성 기준)
- **stop-the-world**: mark 중 객체 그래프가 바뀌면 안 됨 → 프로그램 정지 → **GC 일시정지**
- sweep 후 단편화 → **mark-compact**(살아있는 것을 모아 압축)로 해결

### 왜 일시정지가 문제인가

- mark-sweep이 전체 힙을 훑는 동안 프로그램 멈춤 → 지연 스파이크
- 실시간·게임·웹서버에 치명 (수십~수백 ms 멈춤)
- 완화: 동시(concurrent) GC, 증분(incremental) GC → 정지를 잘게 쪼갬

## 세대별 GC (generational) - 실전 표준

관찰: **대부분 객체는 금방 죽는다**(generational hypothesis). 임시 객체(루프 변수, 중간 결과)가 대다수.

```
Young 세대: 새 객체. 자주, 빠르게 GC (대부분 여기서 죽음)
Old 세대: 오래 산 객체. 가끔 GC (비쌈)
Young에서 살아남으면 Old로 승격
```

- Young GC(minor)는 작고 빠름 → 대부분의 쓰레기를 싸게 회수
- Old GC(major)는 드물게
- JVM(G1, ZGC), .NET, V8이 이 방식. 일시정지를 크게 줄임

## GC vs 수동 관리

| | GC | 수동 (malloc/free) |
|---|---|---|
| 안전성 | use-after-free 없음 | 위험 |
| 편의 | 자동 | 수동 추적 |
| 성능 | 오버헤드 + 일시정지 | 예측 가능, 빠름 |
| 지연 | GC 스파이크 | 없음 |
| 제어 | 적음 | 완전 |

- GC: 대부분 앱 (안전·생산성). Java, Python, Go, JS
- 수동/소유권: 시스템·실시간 (C, C++, Rust) → [[memory-management-models]]

## 최신 GC

- **ZGC/Shenandoah** (JVM): 동시 GC로 일시정지 <1ms (거대 힙도)
- **Go GC**: 낮은 지연 목표, 동시 mark-sweep
- **V8**: 세대별 + 증분 + 동시
- 추세: 처리량보다 **지연(일시정지) 최소화**

## 연결

- 수동 할당 → os/[[memory-allocation]]
- 도달성과 참조 → [[value-vs-reference]]
- 참조 카운팅 원자 연산 → computer-architecture/[[cache-coherence]]
- 소유권 (GC 없는 안전) → [[memory-management-models]]
- 클로저와 GC → [[scope-and-closures]]

## 궁금한 것 (나중에)

- [ ] tri-color marking (동시 GC의 기반)
- [ ] write barrier (동시 GC가 변경을 추적하는 법)
- [ ] Python의 순환 감지 알고리즘
- [ ] bump allocation이 GC 언어에서 빠른 이유 → os/[[memory-allocation]]

## 출처

- Crafting Interpreters (GC 장), "The Garbage Collection Handbook"
