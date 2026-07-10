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

## 셀프 체크

> [!question]- 소스 코드가 결과가 되기까지의 전체 파이프라인 단계를 순서대로 대라.
> 소스 → 렉싱(DFA, 문자→토큰) → 파싱(재귀 하강/PDA, 토큰→AST) → 의미 분석(심볼 테이블/타입, 검증·스코프 해석) → 실행. 실행 경로는 tree-walking(간단·느림), 바이트코드 컴파일 후 VM(빠름), IR→최적화→기계어(최고속) 중 선택한다. 각 단계는 앞 단계의 출력을 입력으로 받는다.

> [!question]- automata의 계층(DFA→PDA→넘어섬)이 컴파일러 프론트엔드에 어떻게 대응되나?
> DFA = 렉서(정규 언어 토큰 인식), PDA = 파서(문맥 자유 문법 인식), CFG를 넘어서는 부분 = 의미 분석(변수 선언-사용 매칭 등 심볼 테이블 필요). 계산 이론의 계층이 렉서→파서→의미분석이라는 실무 단계를 그대로 강제한다.

> [!question]- Crafting Interpreters가 jlox와 clox 두 인터프리터를 만들게 하는 이유는?
> jlox(Java, tree-walking)로 "느리지만 쉬운" 실행을, clox(C, 바이트코드 VM)로 "빠르지만 복잡한" 실행을 같은 언어에 대해 두 번 구현하게 해, 실행 모델의 트레이드오프를 직접 대조·체득하게 한다.

> [!question]- 작은 언어라도 반드시 내려야 하는 설계 결정을 셋 이상 대라.
> 타이핑(정적 vs 동적), 실행 모델(tree-walk/바이트코드/JIT), 메모리 관리(GC/소유권/수동), 오류 처리(예외/Result), 값 전달(값/참조), 스코프(거의 항상 렉시컬). 각 결정이 트레이드오프이며, 언어 설계가 선택의 연속임을 보여준다.

## 연습문제

> [!example]- 문제: `x = 5; print x + 1;`(레벨 2)를 처리하려면 레벨 1 계산기에 무엇을 추가해야 하는지, 파이프라인 각 단계별로 필요한 확장을 나열하라.
> **풀이**
> - 렉싱: 식별자 토큰(`x`), 대입 연산자(`=`), 키워드(`print`), 문장 구분자(`;`) 인식 추가
> - 파싱: 표현식만 있던 문법에 문장(statement) 규칙 추가 - 대입문 `IDENT '=' expr ';'`, print문 `'print' expr ';'`, 프로그램 = 문장들의 나열
> - 의미 분석: 심볼 테이블 도입 - `x` 선언을 등록하고 `x` 사용 시 조회(미선언 검사)
> - 실행: 환경(env, 변수→값 매핑)을 tree-walking에 추가 - Assign 노드는 env에 쓰고 Var 노드는 env에서 읽음. print는 평가 결과를 출력
> 추적: `x=5`로 `env={x:5}`, `print x+1` → `eval(x)=5, +1 = 6` 출력. 단일 표현식 계산기에서 상태(변수)와 문장 시퀀스로 확장되는 지점이다.

> [!example]- 문제: 함수 정의/호출(레벨 4)을 tree-walking 인터프리터에 더할 때, 호출 스택과 지역 변수를 어떻게 다뤄야 하는지 재귀 함수 `fact(n)` 실행을 예로 설명하라.
> **풀이**
> - AST: `FuncDef('fact', ['n'], body)`, `Call('fact', [args])`
> - 호출 시: 새 환경(프레임)을 만들어 매개변수 `n`을 인자 값에 바인딩하고, 함수 정의가 선언된 스코프를 부모로 연결(렉시컬 스코프 체인). 이 프레임 스택이 호출 스택 역할
> - `fact(3)` 실행: 프레임1 `{n:3}` → body가 `n * fact(n-1)` 평가 → `fact(2)` 호출로 프레임2 `{n:2}` → ... → `fact(1)`이 기저값 1 반환 → 각 프레임이 곱을 위로 반환 → 3*2*1 = 6
> - 각 프레임의 지역 변수는 그 프레임 환경에만 존재하고 반환 시 사라진다. 재귀는 프레임이 스택처럼 쌓였다 풀리는 것으로 자연스럽게 처리된다. 하드웨어 호출 스택 개념과 대응된다.

## 파인만

> [!note]- 백지에 "작은 언어를 처음부터 끝까지 만들면 무엇을 얻는가, 그리고 이론(automata)이 실제 코드 어디에 나타나는가"를 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 렉싱→파싱→의미분석→실행의 각 단계가 앞 출력을 입력으로 맞물린다는 것, (2) DFA=렉서, PDA=파서, CFG 한계=의미분석이라는 이론-실무 대응, (3) 언어 설계가 타이핑·실행·메모리 등 트레이드오프의 연속이라는 것 - 이 셋을 설명할 수 있어야 한다.

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
