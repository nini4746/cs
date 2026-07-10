# 코드 생성과 최적화 (Codegen and Optimization)

## 한 줄 요약

컴파일러 백엔드 - 중간 표현(IR)을 최적화하고 기계어를 생성한다. SSA 형식이 최적화를 쉽게 하고, 상수 폴딩부터 레지스터 할당까지 여러 패스를 거친다. LLVM이 이 백엔드를 공용화했다.

## 왜 필요한가

- 소스가 어떻게 최적화된 기계어가 되나
- computer-architecture에서 본 최적화(상수 폴딩, 인라인)가 어디서 일어나나
- LLVM이 왜 중요한가

## 프론트엔드 vs 백엔드

```
소스 → [프론트엔드]        → IR → [백엔드]              → 기계어
       렉싱/파싱/의미분석         최적화/코드생성
       (언어 의존)               (타겟 의존)
```

- **프론트엔드**: 언어별 ([[lexing]]~[[semantic-analysis]])
- **백엔드**: 타겟(x86/ARM)별 - 여기가 이 노트
- **IR(중간 표현)**: 둘 사이의 공통 언어. 프론트엔드는 IR 생성, 백엔드는 IR 최적화·코드 생성

## 중간 표현 (IR)

소스보다 낮고 기계어보다 높은 표현. AST를 IR로 낮춤(lowering):

- **선형 IR / 3-주소 코드**: `t1 = a + b` 형태
- **제어 흐름 그래프(CFG)**: 기본 블록(basic block)들의 그래프. 분기 없는 명령 열 = 블록, 블록 간 점프
- 최적화·분석의 작업 대상

## SSA (Static Single Assignment)

현대 최적화의 핵심 IR 형식: **각 변수가 정확히 한 번만 대입**됨:

```
일반:  x = 1; x = x + 1; y = x
SSA:   x1 = 1; x2 = x1 + 1; y1 = x2   ← 각 이름 한 번만
```

- 각 값의 정의가 유일 → **데이터 흐름 분석이 쉬움** (이 값이 어디서 왔나 명확)
- 분기 합류점에 **φ(phi) 함수**: 어느 경로로 왔는지에 따라 값 선택
- LLVM IR, 대부분 현대 컴파일러가 SSA. 최적화를 단순·강력하게

## 최적화 패스

IR을 반복 변환. computer-architecture에서 결과를 본 것들:

| 최적화 | 하는 일 |
|---|---|
| **상수 폴딩** | `2+3` → `5` 컴파일 타임 계산 (computer-architecture/[[bits-and-integers]]에서 목격) |
| **상수 전파** | 상수 값을 사용처로 |
| **죽은 코드 제거(DCE)** | 안 쓰는 계산 제거 |
| **공통 부분식 제거(CSE)** | 같은 계산 재사용 |
| **인라인(inlining)** | 함수 호출을 본문으로 (computer-architecture/[[procedures-and-stack]]에서 목격) |
| **루프 최적화** | 루프 불변 이동, 언롤링 (computer-architecture/[[instruction-level-parallelism]]) |
| **강도 감소** | `*2` → `<<1` (computer-architecture/[[assembly-basics]]에서 목격) |

이 패스들이 computer-architecture 노트에서 어셈블리로 관찰한 최적화의 정체. aliasing 등이 이걸 막음 → computer-architecture/[[compiler-optimization-limits]].

## 코드 생성

최적화된 IR → 타겟 기계어 (computer-architecture/[[assembly-basics]]):

### 명령 선택 (instruction selection)

IR 연산을 타겟 명령으로 매핑. `a*4` → `lsl` (ARM) 등. 타겟 ISA별 → computer-architecture/[[isa-design]].

### 레지스터 할당 (register allocation)

IR의 무한한 가상 레지스터를 **유한한 실제 레지스터**로 배정:

- 레지스터가 부족하면 **스필(spill)**: 일부를 스택(메모리)으로
- **그래프 색칠 문제**: 동시에 살아있는 값들이 다른 레지스터 필요 = 그래프 색칠 (NP-hard, 휴리스틱) → algorithms/[[p-vs-np]], [[graph-traversal]]
- 좋은 할당이 성능에 큼 (레지스터 vs 메모리 접근, computer-architecture/[[memory-hierarchy]])

### 명령 스케줄링

명령 순서를 재배열해 파이프라인 활용 (해저드 회피) → computer-architecture/[[hazards]], [[instruction-level-parallelism]].

## LLVM: 공용 백엔드

**LLVM**이 백엔드를 표준화:

```
여러 언어 프론트엔드 → LLVM IR → LLVM 백엔드 → 여러 타겟
(C/Rust/Swift...)                              (x86/ARM/...)
```

- 언어 하나 만들면 LLVM IR만 생성하면 됨 → 최적화·코드생성·다중 타겟 공짜
- Clang(C/C++), Rust, Swift, Julia 등이 LLVM 백엔드 사용
- SSA 기반 IR, 수백 개 최적화 패스
- 컴파일러 제작의 진입 장벽을 크게 낮춤

## JIT에서도

JIT([[compiled-vs-interpreted]])도 같은 백엔드 기술을 **런타임에**:
- 바이트코드 → IR → 최적화 → 기계어 (실행 중)
- 런타임 정보(실제 타입, 뜨거운 경로)로 추가 최적화
- V8 TurboFan, JVM C2가 이런 최적화 컴파일러

## 셀프 체크

> [!question]- 프론트엔드와 백엔드를 IR로 나누면 무엇이 좋은가?
> IR(중간 표현)이 둘 사이의 공통 언어가 되어, 프론트엔드는 언어별로 IR을 생성하고 백엔드는 타겟(x86/ARM)별로 IR을 최적화·코드생성한다. 언어 M개와 타겟 N개를 M×N이 아닌 M+N 조합으로 처리할 수 있어, LLVM처럼 백엔드를 여러 언어가 공유할 수 있다.

> [!question]- SSA 형식이란 무엇이고 왜 최적화를 쉽게 만드나?
> Static Single Assignment - 각 변수가 정확히 한 번만 대입되는 형식이다. `x=1; x=x+1`은 `x1=1; x2=x1+1`처럼 이름을 새로 붙인다. 각 값의 정의가 유일해 "이 값이 어디서 왔나"가 명확하므로 데이터 흐름 분석이 단순해진다. 분기 합류점에서는 φ(phi) 함수로 어느 경로 값인지 선택한다.

> [!question]- 상수 폴딩, 죽은 코드 제거(DCE), 공통 부분식 제거(CSE)는 각각 무엇을 하나?
> 상수 폴딩은 `2+3`을 컴파일 타임에 `5`로 계산한다. DCE는 결과가 쓰이지 않는 계산을 제거한다. CSE는 동일한 계산이 여러 번 나오면 한 번만 계산해 재사용한다. 모두 IR을 반복 변환하는 최적화 패스다.

> [!question]- 레지스터 할당이 왜 그래프 색칠 문제이고 왜 어려운가?
> 동시에 살아있는(live) 값들은 서로 다른 레지스터가 필요하므로, 값을 노드로 간섭 관계를 간선으로 두면 그래프 색칠 문제가 된다(색 = 물리 레지스터). 이는 NP-hard라 휴리스틱을 쓴다. 레지스터가 부족하면 일부 값을 스택으로 내리는 스필(spill)이 발생한다.

> [!question]- JIT는 이 백엔드 기술을 어떻게 활용하나?
> 같은 백엔드 기술(바이트코드→IR→최적화→기계어)을 런타임에 적용한다. 추가로 런타임 정보(실제 타입, 뜨거운 경로)를 활용해 정적 컴파일러가 못 하는 추가 최적화를 한다. V8 TurboFan, JVM C2가 그 예다.

## 연습문제

> [!example]- 문제: 아래 코드를 SSA로 변환하고, 이어서 상수 폴딩·상수 전파·죽은 코드 제거를 순서대로 적용해 최종 IR을 구하라.
> ```
> a = 2 + 3
> b = a * 1
> c = a + b
> ```
> **풀이**
> SSA 변환(각 이름 한 번):
> ```
> a1 = 2 + 3
> b1 = a1 * 1
> c1 = a1 + b1
> ```
> - 상수 폴딩: `a1 = 2+3` → `a1 = 5`
> - 상수 전파 + 강도 감소: `b1 = a1*1` → `b1 = 5*1` → `b1 = 5` (또는 `*1`은 항등원 제거)
> - 상수 전파: `c1 = a1 + b1` → `c1 = 5 + 5` → 폴딩 → `c1 = 10`
> - DCE: `c1`이 최종 결과가 아니고 어디서도 안 쓰이면 `a1,b1,c1` 전부 죽은 코드로 제거 가능. 만약 `c1`이 반환값이면 `c1 = 10`만 남는다.
> SSA의 유일 정의 덕분에 각 값의 출처가 명확해 전파·폴딩이 안전하게 연쇄된다.

> [!example]- 문제: 값 `a, b, c`의 생존 구간(live range)이 아래와 같을 때 간섭 그래프를 그리고, 2개의 물리 레지스터로 색칠 가능한지 판정하라. a: 1~3줄, b: 2~4줄, c: 4~5줄.
> **풀이**
> 동시에 살아있는 쌍을 찾는다:
> - 2~3줄: a와 b가 겹침 → 간섭 간선 a-b
> - 4줄: b와 c가 겹침 → 간섭 간선 b-c
> - a와 c는 구간(1~3 vs 4~5)이 안 겹침 → 간섭 없음
> 간섭 그래프: `a — b — c` (경로 그래프).
> 2-색칠: a=R1, b=R2, c=R1 (c는 a와 간섭 없으니 R1 재사용 가능). 충돌 없음 → **2개 레지스터로 할당 가능, 스필 불필요**. 만약 세 값이 서로 다 겹쳐 삼각형이 됐다면 3색이 필요해 레지스터 하나를 스필해야 한다.

## 파인만

> [!note]- 백지에 "소스가 어떻게 최적화된 기계어가 되는가"를 IR·SSA·최적화 패스·코드생성 순서로 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) IR이 프론트엔드/백엔드를 분리해 M+N 조합을 가능케 한다는 것, (2) SSA의 유일 정의가 데이터 흐름 분석과 최적화를 단순하게 만든다는 것, (3) 레지스터 할당이 그래프 색칠(NP-hard)이며 부족하면 스필한다는 것 - 이 셋을 설명할 수 있어야 한다.

## 연결

- 프론트엔드 → [[lexing]], [[parsing]], [[semantic-analysis]]
- 최적화 결과 관찰 → computer-architecture/[[assembly-basics]], [[bits-and-integers]]
- 최적화 방해물 → computer-architecture/[[compiler-optimization-limits]]
- 레지스터 할당 = 그래프 색칠 → algorithms/[[graph-traversal]], [[p-vs-np]]
- 명령 스케줄링 → computer-architecture/[[hazards]]
- JIT → [[compiled-vs-interpreted]]
- 명령 선택 (IR→타겟 ISA) → computer-architecture/[[isa-design]]
- 루프 언롤링·스케줄링이 노리는 것 → computer-architecture/[[instruction-level-parallelism]]

## 궁금한 것 (나중에)

- [ ] SSA 구성 알고리즘 (φ 함수 배치)
- [ ] 그래프 색칠 레지스터 할당 (Chaitin) vs 선형 스캔
- [ ] LLVM 패스 파이프라인 구조
- [ ] 자동 벡터화 구현 → computer-architecture/[[simd]]

## 출처

- "Dragon Book" 8-9장, LLVM 문서
