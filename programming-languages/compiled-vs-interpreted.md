# 컴파일 vs 인터프리트 (Compiled vs Interpreted)

## 한 줄 요약

언어가 실행되는 방식은 스펙트럼이다. AOT 컴파일(실행 전 기계어)부터 순수 인터프리터(한 줄씩 실행)까지, 그 사이에 바이트코드 VM과 JIT(실행 중 컴파일)가 있다. "컴파일 언어 vs 인터프리터 언어"는 정확하지 않다.

## 왜 필요한가

- C는 빠르고 Python은 느린 이유
- JVM/V8이 실제로 뭘 하나 (인터프리터? 컴파일러?)
- JIT가 어떻게 동적 언어를 빠르게 만드나

## 스펙트럼

"컴파일이냐 인터프리트냐"는 이분법이 아니라 스펙트럼:

```
AOT 컴파일 → 바이트코드+VM → JIT → 순수 인터프리터
(빠름)                                    (유연/느림)
```

같은 언어도 여러 구현 가능 (C 인터프리터, Python 컴파일러도 존재). **언어가 아니라 구현의 속성**.

## AOT 컴파일 (Ahead-of-Time)

실행 **전에** 소스를 기계어로 완전 번역 → computer-architecture/[[assembly-basics]]:

```
소스 → [컴파일러] → 기계어 실행 파일 → 직접 실행
```

- **빠름**: CPU가 네이티브 명령 직접 실행, 최적화 완료
- 실행 전 전체 분석 → 공격적 최적화 (computer-architecture/[[compiler-optimization-limits]])
- 배포에 런타임 불필요 (자족)
- 느린 빌드, 플랫폼별 컴파일 필요
- 언어: **C, C++, Rust, Go**

## 순수 인터프리터

소스(또는 AST)를 **실행 시점에 한 줄씩 해석**:

```
소스 → [파싱 → AST] → 트리 순회하며 즉시 실행
```

- **유연**: 즉시 실행, 동적 기능(eval), 빠른 반복
- **느림**: 매번 해석 오버헤드 (같은 코드도 반복 해석)
- 플랫폼 독립 (인터프리터만 있으면)
- tree-walking 인터프리터 → compilers/[[ast-and-interpretation]]

## 바이트코드 + VM

절충: 소스를 **바이트코드**(가상 명령)로 컴파일 후, VM이 바이트코드를 실행:

```
소스 → [컴파일] → 바이트코드 → [VM이 해석/실행]
```

- 바이트코드는 기계어보다 고수준, 소스보다 저수준 → 파싱 반복 회피, 플랫폼 독립
- **CPython**: `.pyc`가 바이트코드. **Java**: `.class` → JVM
- 스택 기반 VM이 흔함 → compilers/[[bytecode-vm]]
- 순수 인터프리터보다 빠름 (파싱 안 반복), AOT보다 느림 (VM 해석 오버헤드)

## JIT (Just-In-Time)

**실행 중에** 뜨거운 코드를 기계어로 컴파일:

```
바이트코드 해석 시작 → 자주 실행되는 부분(hot) 감지 → 그 부분만 기계어로 컴파일 → 이후 네이티브 실행
```

- **관찰 후 최적화**: 실행 중 실제 타입·경로를 보고 특화 (동적 언어의 타입을 런타임에 확정)
- **동적 언어를 빠르게**: JavaScript(V8), Java(HotSpot), C#, PyPy
- 워밍업 필요 (처음엔 해석, 뜨거워지면 컴파일)
- **inline cache**: 동적 디스패치([[oop-under-the-hood]])를 관찰된 타입으로 특화
- **devirtualization, speculative optimization**: 가정하고 컴파일, 틀리면 되돌림(deopt)

JIT이 AOT에 근접하거나 때론 능가 (런타임 정보 활용 - AOT는 못 보는 실제 실행 패턴).

## 비교

| | AOT | 바이트코드 VM | JIT | 인터프리터 |
|---|---|---|---|---|
| 실행 속도 | 최고 | 중간 | 높음 (워밍업 후) | 낮음 |
| 시작 속도 | 빠름 | 빠름 | 느림 (워밍업) | 빠름 |
| 유연성 | 낮음 | 중간 | 높음 | 최고 |
| 예 | C, Rust, Go | CPython | V8, JVM | 옛 스크립트 |

## 실제는 혼합

현대 런타임은 여러 단계를 섞음:

- **JVM**: 바이트코드 인터프리터 + JIT (C1 빠른 컴파일, C2 최적화). 계층형(tiered)
- **V8**: 인터프리터(Ignition) + JIT(TurboFan). 뜨거우면 최적화, 가정 깨지면 deopt
- **Python**: 바이트코드 인터프리터 (CPython), PyPy는 JIT
- 순수한 한 방식은 드물고 스펙트럼을 오감

## 셀프 체크

> [!question]- "컴파일 언어 vs 인터프리터 언어"라는 이분법이 왜 부정확한가?
> 컴파일/인터프리트는 언어가 아니라 구현의 속성이다. 같은 언어도 C 인터프리터, Python 컴파일러처럼 여러 방식으로 구현될 수 있고, 실제 실행 방식은 AOT부터 순수 인터프리터까지의 스펙트럼이며 현대 런타임은 여러 단계를 섞는다.

> [!question]- JIT가 동적 언어를 빠르게 만드는 핵심 원리는?
> 실행 중 자주 실행되는 hot 코드를 감지해 기계어로 컴파일하고, 런타임에 관찰한 실제 타입·경로로 특화한다. AOT가 못 보는 실제 실행 패턴을 활용하기에 때론 AOT를 능가하며, inline cache로 동적 디스패치를 관찰된 타입에 특화한다.

> [!question]- 바이트코드 VM이 순수 인터프리터보다 빠른 이유는?
> 소스를 한 번 바이트코드로 컴파일해두면 매 실행마다 파싱을 반복하지 않고, 바이트코드는 소스보다 저수준이라 해석이 단순하다. 다만 VM 해석 오버헤드가 있어 AOT보다는 느리다.

> [!question]- deoptimization(deopt)은 언제 발생하나?
> JIT가 특정 타입·경로를 가정해 speculative하게 컴파일한 뒤, 실행 중 그 가정이 깨지면 최적화된 코드를 버리고 인터프리터/저수준 코드로 되돌린다.

## 연습문제

> [!example]- 문제: 아래 JS 함수가 V8에서 최초 호출부터 반복·타입 변화까지 어떤 실행 단계를 거치는지 추적하라.
> 
> ```js
> function add(a, b) { return a + b; }
> for (let i = 0; i < 1e6; i++) add(i, i);   // 정수만
> add("x", "y");                              // 갑자기 문자열
> ```
> 
> **풀이**
> 
> 1. 최초: Ignition 인터프리터가 바이트코드로 해석. 아직 타입 정보 없음.
> 2. 루프가 add를 반복 호출 → hot 감지. inline cache에 "a,b는 정수"가 기록됨.
> 3. TurboFan이 정수 덧셈으로 speculative 컴파일 → 네이티브 실행, 빠름.
> 4. `add("x","y")`에서 가정(정수)이 깨짐 → deopt 발생, 최적화 코드 폐기하고 인터프리터로 되돌아감. IC는 다형성(polymorphic) 상태로 갱신.

> [!example]- 문제: "AOT는 항상 JIT보다 빠르다"가 틀린 이유를 반례로 설명하라.
> 
> **풀이**
> 
> AOT는 컴파일 시점에 실제 실행 패턴을 모른다. 예를 들어 가상 호출의 실제 타입이 런타임에 거의 항상 하나뿐이어도 AOT는 보수적으로 간접 호출을 남긴다. JIT는 실행 중 이를 관찰해 devirtualize + 인라인할 수 있어 hot path에서 AOT보다 빠른 코드를 낼 수 있다. 대가는 워밍업 지연이다.

## 파인만

> [!note]- 백지에 실행 방식 스펙트럼(AOT → 바이트코드 VM → JIT → 인터프리터)을 그리고, 각 단계가 속도/시작/유연성에서 어디에 위치하는지 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) 왜 언어가 아니라 구현의 속성인가, (2) 바이트코드가 파싱 반복을 어떻게 없애나, (3) JIT의 관찰-특화-deopt 사이클.

## 연결

- 기계어 → computer-architecture/[[assembly-basics]]
- AOT 최적화 한계 → computer-architecture/[[compiler-optimization-limits]]
- 바이트코드 VM 구현 → compilers/[[bytecode-vm]]
- tree-walking → compilers/[[ast-and-interpretation]]
- 네이티브 코드 생성 → compilers/[[codegen-and-optimization]]
- 인라인 캐시와 디스패치 → [[oop-under-the-hood]]

## 궁금한 것 (나중에)

- [ ] V8의 hidden class와 inline cache
- [ ] tiered compilation의 승격 기준
- [ ] deoptimization이 실제로 어떻게 되돌리나
- [ ] AOT vs JIT 논쟁 (시작 지연 vs 최고 성능)

## 출처

- Crafting Interpreters (인터프리터 vs 컴파일러), "Crafting a Compiler"
