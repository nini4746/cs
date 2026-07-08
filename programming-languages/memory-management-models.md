# 메모리 관리 모델 (Memory Management Models)

## 한 줄 요약

메모리를 누가 관리하나 - 수동(C: 직접 free), GC(Java/Python: 런타임 자동), 소유권(Rust: 컴파일 타임 추적). 안전성·성능·편의의 삼각 트레이드오프에서 각자 다른 지점을 택한다.

## 왜 필요한가

- C, Java, Rust가 메모리를 근본적으로 다르게 다루는 이유
- Rust가 GC 없이 어떻게 안전한가
- 각 모델의 실제 비용

## 세 모델

### 1. 수동 관리 (manual)

프로그래머가 **직접 할당·해제**:

```c
int* p = malloc(sizeof(int));
free(p);   // 직접 해제, 잊으면 누수, 두 번 하면 크래시
```

- **완전한 제어, 최고 성능** (오버헤드 0, 예측 가능)
- **위험**: use-after-free, double-free, 누수, 버퍼 오버플로 → os/[[memory-allocation]], computer-architecture/[[buffer-overflow]]
- 메모리 안전 버그의 대부분이 여기서 (보안 취약점의 큰 비중 → security/[[memory-safety]])
- 언어: **C, C++** (스마트 포인터로 완화)

### 2. 가비지 컬렉션 (GC)

**런타임이 자동 회수** → [[garbage-collection]]:

```python
p = [1,2,3]   # 할당
# 해제 신경 안 씀 - GC가 도달 불가능해지면 회수
```

- **안전 + 편의**: use-after-free 불가, 신경 안 씀
- **비용**: GC 일시정지(지연 스파이크), 처리량 오버헤드, 메모리 여유 필요
- **비결정적**: 언제 해제될지 모름 (파일 핸들 등 자원 관리엔 별도 필요)
- 언어: **Java, Python, Go, JavaScript, C#**

### 3. 소유권 (ownership) - Rust

**컴파일 타임에 수명을 추적**해 자동으로 정확한 시점에 해제:

```rust
{
    let p = vec![1,2,3];   // p가 소유
}   // 스코프 끝 → 자동 해제 (컴파일러가 삽입)
```

규칙:
- **각 값은 소유자가 하나** (single ownership)
- 소유자가 스코프를 벗어나면 자동 해제 (RAII)
- **빌림(borrow)**: 참조는 소유권 없이 잠깐 접근. **가변 빌림은 하나만, 불변 빌림은 여럿** → aliasing 규칙을 컴파일러가 강제 ([[value-vs-reference]])
- **수명(lifetime)**: 참조가 원본보다 오래 못 살게 검사 → dangling 불가

결과:
- **GC 없이 메모리 안전**: use-after-free/double-free/data race를 **컴파일 타임에** 차단
- **런타임 오버헤드 0**: GC 일시정지 없음, C급 성능
- 대가: **학습 곡선**(빌림 검사기와 싸움), 일부 패턴 표현 어려움

## 삼각 트레이드오프

```
        안전성
        /    \
      GC ---- 소유권
      /          \
  (수동은 성능/제어 꼭짓점)
```

| | 수동 | GC | 소유권 |
|---|---|---|---|
| 안전성 | ✗ | ✓ | ✓ |
| 성능 | 최고 | 오버헤드 | 최고 |
| 편의 | 낮음 | 높음 | 중간 (학습) |
| 지연 예측 | ✓ | ✗ (GC 정지) | ✓ |
| 예 | C | Java, Python | Rust |

전통적으로 **안전 vs 성능**은 양자택일이었음 (GC=안전하지만 느림, 수동=빠르지만 위험). **Rust 소유권이 셋을 동시에** 노림 (안전+성능, 편의는 학습으로 지불).

## 하이브리드·기타

- **C++ 스마트 포인터**: `unique_ptr`(소유권), `shared_ptr`(참조 카운팅 → [[garbage-collection]]). 수동에 안전 레이어
- **Swift ARC**: 자동 참조 카운팅 (컴파일러가 retain/release 삽입). 순환은 weak로
- **아레나/리전**: 한 번에 대량 할당 후 통째 해제 (게임, 컴파일러). 세밀한 free 회피
- **Zig**: 명시적 할당자 전달 (수동인데 구조화)

## 자원 관리 일반화 (RAII)

메모리만이 아니라 **모든 자원**(파일, 락, 소켓)에 확장:

- **RAII**(Resource Acquisition Is Initialization): 객체 수명에 자원 수명을 묶음 (생성=획득, 소멸=해제)
- C++ 소멸자, Rust Drop, Python `with`(context manager)
- 스코프 벗어나면 자동 정리 → 누수·락 안 풂 방지 (os/[[locks]])

## 연결

- 수동 할당 내부 → os/[[memory-allocation]]
- GC 상세 → [[garbage-collection]]
- 소유권과 aliasing → [[value-vs-reference]]
- 메모리 안전 버그 → security/[[memory-safety]], computer-architecture/[[buffer-overflow]]
- RAII와 락 → os/[[locks]]

## 궁금한 것 (나중에)

- [ ] Rust 빌림 검사기가 data race를 컴파일에 막는 법
- [ ] 아레나 할당자 직접 구현
- [ ] Swift ARC의 순환 참조 처리 (weak/unowned)
- [ ] GC와 소유권의 하이브리드 (일부 GC + 일부 수동)

## 출처

- Rust Book (소유권), "The Rust Programming Language"
