# 미니 언어 만들기 (Build a Language)

## 한 줄 요약

렉싱부터 실행까지 전 과정을 하나로 잇는 종합 프로젝트. 작은 언어를 처음부터 끝까지 구현하면 컴파일러/인터프리터의 모든 조각이 어떻게 맞물리는지 체득한다.

## 왜 필요한가

- 개별 단계([[lexing]]~[[bytecode-vm]])를 하나로 통합
- "언어가 어떻게 동작하나"를 손으로 증명
- 이론(automata)과 실무(compilers)의 완성

## 전체 파이프라인 복습

지금까지 배운 조각들이 하나로:

```
소스 코드
  ↓ [렉싱: DFA]              → [[lexing]]          (문자 → 토큰)
토큰 스트림
  ↓ [파싱: 재귀 하강/PDA]     → [[parsing]]         (토큰 → AST)
AST
  ↓ [의미 분석: 심볼/타입]    → [[semantic-analysis]] (검증, 스코프 해석)
검증된 AST
  ↓ 실행 경로 선택:
    a) [tree-walking]        → [[ast-and-interpretation]]  (간단, 느림)
    b) [바이트코드 컴파일 → VM] → [[bytecode-vm]]           (빠름)
    c) [IR → 최적화 → 기계어]  → [[codegen-and-optimization]] (최고속)
결과
```

각 단계가 앞 단계 출력을 입력으로. automata의 계층(DFA→PDA→넘어섬)이 렉서→파서→의미분석에 그대로.

## 최소 언어 스펙 (예: 계산기 → 프로그래밍 언어)

단계적으로 키우기:

### 레벨 1: 계산기
- 산술식 (`2 + 3 * 4`) - [[lexing]] + [[parsing]] + tree-walking 평가
- 이 노트 시리즈의 데모들이 이 레벨 (실측한 렉서·파서·VM)

### 레벨 2: 변수와 문장
- 변수 대입, 출력 → 심볼 테이블([[semantic-analysis]]), 환경([[scope-and-closures]])
- `x = 5; print x + 1;`

### 레벨 3: 제어 흐름
- if/while → 조건 분기, 루프 (바이트코드면 점프 명령)
- 블록 스코프

### 레벨 4: 함수
- 함수 정의/호출 → 호출 스택(computer-architecture/[[procedures-and-stack]]), 지역 변수
- 재귀

### 레벨 5: 클로저·일급 함수
- 함수를 값으로, 클로저 → [[scope-and-closures]], upvalue([[bytecode-vm]])

### 레벨 6+: 타입, 클래스, GC
- 타입 검사([[type-systems-advanced]]), 객체([[oop-under-the-hood]]), 가비지 컬렉션([[garbage-collection]])

## 설계 결정들

만들며 마주치는 선택 - 각각 앞 노트와 연결:

| 결정 | 선택지 | 참고 |
|---|---|---|
| 타이핑 | 정적 vs 동적 | [[static-vs-dynamic-typing]] |
| 실행 | tree-walk / 바이트코드 / JIT | [[compiled-vs-interpreted]] |
| 메모리 | GC / 소유권 / 수동 | [[memory-management-models]] |
| 오류 | 예외 / Result | [[error-handling-models]] |
| 값 전달 | 값 / 참조 | [[value-vs-reference]] |
| 스코프 | 렉시컬 (거의 항상) | [[scope-and-closures]] |

작은 언어라도 이 결정들을 내려야 함 → 언어 설계가 트레이드오프의 연속임을 체감.

## 추천 경로: Crafting Interpreters

이 syllabus의 기준 교재. 두 인터프리터를 만듦:

1. **jlox** (Java, tree-walking): 렉싱→파싱→해석. 언어 기능 전체 (변수, 제어, 함수, 클로저, 클래스). [[ast-and-interpretation]] 중심
2. **clox** (C, 바이트코드 VM): 같은 언어를 바이트코드 VM으로. 컴파일러, 스택 VM, 해시 테이블, GC 직접 구현. [[bytecode-vm]] 중심

두 번 만들며 "느리지만 쉬운" vs "빠르지만 복잡한"을 대조 → 실행 모델의 트레이드오프 체득.

## 얻는 것

미니 언어를 완성하면:

- 컴파일러 오류 메시지·동작을 깊이 이해 (디버깅 능력↑)
- 언어 선택의 트레이드오프를 내부에서 앎
- automata 이론이 실제 코드로 (DFA=렉서, PDA=파서, CFG 한계=의미분석)
- DSL·설정 언어·템플릿 엔진을 직접 만들 수 있음
- 메타프로그래밍·매크로 이해

## 연결 (전체 종합)

- 시작: [[lexing]] → [[parsing]] → [[semantic-analysis]]
- 실행: [[ast-and-interpretation]] / [[bytecode-vm]] / [[codegen-and-optimization]]
- 언어 개념: [[static-vs-dynamic-typing]], [[scope-and-closures]], [[garbage-collection]], [[type-systems-advanced]]
- 이론 기반: automata/[[dfa-nfa]], [[cfg-to-parsing]], [[cfl-pumping]], [[turing-machines]]
- 하드웨어: computer-architecture/[[assembly-basics]], [[procedures-and-stack]]

## 궁금한 것 (나중에)

- [ ] Crafting Interpreters 완주 (jlox + clox)
- [ ] 자기 호스팅 컴파일러 (그 언어로 그 언어 컴파일러)
- [ ] 매크로/메타프로그래밍 추가
- [ ] LLVM 백엔드 붙여 네이티브 컴파일 → [[codegen-and-optimization]]

## 출처

- **Crafting Interpreters** (Robert Nystrom, 무료 공개) - 이 과목 전체의 중심
