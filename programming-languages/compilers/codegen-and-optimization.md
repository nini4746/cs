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

## 연결

- 프론트엔드 → [[lexing]], [[parsing]], [[semantic-analysis]]
- 최적화 결과 관찰 → computer-architecture/[[assembly-basics]], [[bits-and-integers]]
- 최적화 방해물 → computer-architecture/[[compiler-optimization-limits]]
- 레지스터 할당 = 그래프 색칠 → algorithms/[[graph-traversal]], [[p-vs-np]]
- 명령 스케줄링 → computer-architecture/[[hazards]]
- JIT → [[compiled-vs-interpreted]]

## 궁금한 것 (나중에)

- [ ] SSA 구성 알고리즘 (φ 함수 배치)
- [ ] 그래프 색칠 레지스터 할당 (Chaitin) vs 선형 스캔
- [ ] LLVM 패스 파이프라인 구조
- [ ] 자동 벡터화 구현 → computer-architecture/[[simd]]

## 출처

- "Dragon Book" 8-9장, LLVM 문서
