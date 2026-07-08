# 바이트코드 VM (Bytecode VM)

## 한 줄 요약

AST를 선형 바이트코드 명령 배열로 컴파일하고, 가상 머신이 그걸 실행한다. 트리 순회의 캐시 비효율을 없애 tree-walking보다 훨씬 빠르다. 스택 기반 VM이 흔하다.

## 왜 필요한가

- tree-walking([[ast-and-interpretation]])이 느린 문제 해결
- CPython/JVM의 실행 방식
- JIT로 가기 전 단계 → [[compiled-vs-interpreted]]

## 왜 바이트코드인가

Tree-walking 인터프리터의 문제 ([[ast-and-interpretation]]):
- 트리 순회 = pointer chasing → 캐시 미스 (computer-architecture/[[cache-misses]])
- 매 노드 타입 디스패치
- 반복 실행마다 트리 재순회

**바이트코드**: AST를 **선형 명령 배열**로 컴파일:
- 배열 = 연속 메모리 → 캐시 친화 (computer-architecture/[[memory-hierarchy]])
- 명령이 단순·균일 → 빠른 디스패치
- 한 번 컴파일 후 반복 실행 (파싱/트리순회 안 반복)

## 스택 기반 VM

가장 흔한 VM 구조. **피연산자 스택**에 값을 쌓고 명령이 스택을 조작:

```
2 + 3 * 4  를 바이트코드로:
  PUSH 2
  PUSH 3
  PUSH 4
  MUL       # 스택 top 둘 곱함
  ADD       # 스택 top 둘 더함
```

실측 (스택 변화):
```
after PUSH: [2]
after PUSH: [2, 3]
after PUSH: [2, 3, 4]
after MUL : [2, 12]     ← 3*4
after ADD : [14]        ← 2+12
결과: 14
```

- 각 명령이 스택에서 pop, 계산, push
- 컴파일러가 AST를 후위 순회하며 바이트코드 생성 (피연산자 먼저, 연산 나중 = 후위 표기)
- data-structures/[[stacks-and-queues]]의 스택

## 스택 기반 vs 레지스터 기반

| | 스택 기반 | 레지스터 기반 |
|---|---|---|
| 피연산자 | 암묵적 (스택) | 명시적 (레지스터 번호) |
| 명령 크기 | 작음 (피연산자 없음) | 큼 (레지스터 지정) |
| 명령 수 | 많음 (push/pop) | 적음 |
| 구현 | 단순 | 복잡 |
| 예 | JVM, CPython, WASM | Lua VM, Dalvik(안드로이드) |

- **스택 기반**: 컴파일·구현 단순, 이식성 좋음 (JVM, CPython, WebAssembly)
- **레지스터 기반**: 명령 수 적어 디스패치 오버헤드↓ (Lua가 유명). computer-architecture/[[isa-design]]의 레지스터 개념

## VM 실행 루프

VM의 심장 = **디스패치 루프**:

```c
for (;;) {
    uint8_t op = *ip++;        // 다음 명령 (instruction pointer)
    switch (op) {
        case OP_PUSH: push(*ip++); break;
        case OP_ADD:  b=pop(); a=pop(); push(a+b); break;
        ...
    }
}
```

- **명령 포인터(ip)**: 바이트코드 배열을 순회 (computer-architecture/[[assembly-basics]]의 PC와 유사)
- **디스패치**: op로 분기 → switch, computed goto, 또는 threaded code
- 이 루프 최적화가 VM 성능의 핵심

## 디스패치 최적화

switch가 분기 예측(computer-architecture/[[branch-prediction]]) 실패로 느림 → 기법들:

- **computed goto (threaded code)**: 각 명령 끝에서 다음 명령으로 직접 점프 (라벨 주소 테이블) → 분기 예측 개선
- **direct threading**: 바이트코드에 핸들러 주소를 직접
- CPython 3.11+가 이런 최적화로 크게 빨라짐

## 성능: tree-walking과 비교

- 바이트코드 VM은 tree-walking보다 보통 **수 배 빠름**
- 선형 명령 배열(캐시 친화) + 컴파일된 형태(재파싱 없음)
- 여전히 네이티브(AOT)보다는 느림 → JIT가 그 격차를 메움 ([[compiled-vs-interpreted]])

## 파이프라인 위치

```
AST → [바이트코드 컴파일러] → 바이트코드 → [VM 실행]
                                        ↓ 뜨거우면
                                       [JIT: 기계어] → [[codegen-and-optimization]]
```

CPython은 여기서 멈춤(바이트코드 VM), JVM/V8은 JIT까지 → [[compiled-vs-interpreted]].

## 연결

- tree-walking (느린 이전 방식) → [[ast-and-interpretation]]
- 스택 → data-structures/[[stacks-and-queues]]
- 캐시 친화성 → computer-architecture/[[memory-hierarchy]], [[cache-misses]]
- 디스패치와 분기 예측 → computer-architecture/[[branch-prediction]]
- 명령 포인터 = PC → computer-architecture/[[assembly-basics]]
- JIT로 확장 → [[compiled-vs-interpreted]], [[codegen-and-optimization]]

## 궁금한 것 (나중에)

- [ ] computed goto가 분기 예측을 개선하는 원리
- [ ] 상수 폴딩·피포홀 최적화를 바이트코드에
- [ ] WebAssembly의 스택 머신 설계
- [ ] 레지스터 할당 (레지스터 VM 컴파일)

## 출처

- Crafting Interpreters (clox, 바이트코드 VM 절반 전체)
