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

## 셀프 체크

> [!question]- 바이트코드가 tree-walking보다 빠른 근본 이유는?
> AST를 선형 명령 배열로 컴파일하기 때문. 배열은 연속 메모리라 캐시 친화적이고(트리 순회의 pointer chasing 회피), 명령이 단순·균일해 디스패치가 빠르며, 한 번 컴파일한 뒤 반복 실행하므로 파싱/트리 순회를 반복하지 않는다.

> [!question]- 스택 기반 VM에서 명령들은 어떻게 값을 다루나?
> 피연산자 스택에 값을 쌓고 각 명령이 스택을 조작한다. PUSH는 값을 올리고, ADD/MUL 같은 이항 연산은 스택 top 둘을 pop해 계산한 뒤 결과를 push한다. 컴파일러가 AST를 후위 순회하며 바이트코드를 생성하므로 피연산자가 먼저, 연산이 나중에 온다.

> [!question]- 스택 기반 VM과 레지스터 기반 VM의 트레이드오프는?
> 스택 기반은 피연산자가 암묵적(스택)이라 명령이 작지만 push/pop 때문에 명령 수가 많다. 구현이 단순하고 이식성이 좋다(JVM, CPython, WASM). 레지스터 기반은 피연산자를 레지스터 번호로 명시해 명령이 크지만 명령 수가 적어 디스패치 오버헤드가 낮다(Lua, Dalvik).

> [!question]- VM 디스패치 루프에서 switch가 느릴 수 있는 이유와 개선 기법은?
> switch는 op에 따라 분기하는데 분기 예측이 자주 실패해 느려질 수 있다. computed goto(threaded code)로 각 명령 끝에서 다음 명령 핸들러로 직접 점프하면 분기 예측이 개선된다. CPython 3.11+가 이런 최적화로 크게 빨라졌다.

## 연습문제

> [!example]- 문제: `2 + 3 * 4`를 스택 기반 바이트코드로 컴파일하고, 각 명령 실행 후 스택 상태를 추적해 결과가 14임을 보여라.
> **풀이**
> AST는 `+`(2, `*`(3,4)). 후위 순회 → 바이트코드:
> ```
> PUSH 2
> PUSH 3
> PUSH 4
> MUL
> ADD
> ```
> 스택 추적:
> - PUSH 2 → `[2]`
> - PUSH 3 → `[2, 3]`
> - PUSH 4 → `[2, 3, 4]`
> - MUL → top 둘(3,4) pop, 12 push → `[2, 12]`
> - ADD → top 둘(2,12) pop, 14 push → `[14]`
> 결과 14. 곱셈이 AST에서 더 깊이 묶였기에 MUL이 ADD보다 먼저 방출되고, 스택이 자연스럽게 우선순위를 실행한다.

> [!example]- 문제: 아래 디스패치 루프에 `OP_SUB`(뺄셈) 처리를 추가하고, `10 - 2 - 3`을 바이트코드로 컴파일해 좌결합이 지켜지는지 확인하라.
> ```c
> for (;;) {
>     uint8_t op = *ip++;
>     switch (op) {
>         case OP_PUSH: push(*ip++); break;
>         case OP_ADD:  b=pop(); a=pop(); push(a+b); break;
>     }
> }
> ```
> **풀이**
> 추가: `case OP_SUB: b=pop(); a=pop(); push(a-b); break;` (순서 주의 - 나중에 pop한 a가 왼쪽 피연산자).
> `10-2-3` = `((10-2)-3)`의 바이트코드: `PUSH 10, PUSH 2, SUB, PUSH 3, SUB`.
> 추적: `[10]` → `[10,2]` → SUB: a=10,b=2 → `[8]` → `[8,3]` → SUB: a=8,b=3 → `[5]`. 결과 5. 컴파일러가 좌결합 AST를 후위로 방출하므로 첫 SUB가 먼저 실행되어 좌결합이 스택 순서로 보존된다.

## 파인만

> [!note]- 백지에 "AST를 스택 기반 바이트코드로 바꾸면 왜 빨라지는가, 그리고 디스패치 루프가 왜 VM의 심장인가"를 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 선형 배열이 캐시 친화적이고 재파싱/재순회를 없앤다는 것, (2) 스택 기반 실행이 후위 순회 방출과 어떻게 맞물리는지, (3) 디스패치 최적화(computed goto)가 분기 예측 실패를 줄여 성능을 좌우한다는 것 - 이 셋을 설명할 수 있어야 한다.

## 연결

- tree-walking (느린 이전 방식) → [[ast-and-interpretation]]
- 스택 → data-structures/[[stacks-and-queues]]
- 캐시 친화성 → computer-architecture/[[memory-hierarchy]], [[cache-misses]]
- 디스패치와 분기 예측 → computer-architecture/[[branch-prediction]]
- 명령 포인터 = PC → computer-architecture/[[assembly-basics]]
- JIT로 확장 → [[compiled-vs-interpreted]], [[codegen-and-optimization]]
- 레지스터 기반 VM의 레지스터 개념 → computer-architecture/[[isa-design]]

## 궁금한 것 (나중에)

- [ ] computed goto가 분기 예측을 개선하는 원리
- [ ] 상수 폴딩·피포홀 최적화를 바이트코드에
- [ ] WebAssembly의 스택 머신 설계
- [ ] 레지스터 할당 (레지스터 VM 컴파일)

## 출처

- Crafting Interpreters (clox, 바이트코드 VM 절반 전체)
