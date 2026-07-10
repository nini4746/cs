# CFG에서 파싱으로 (CFG to Parsing)

## 한 줄 요약

문맥 자유 문법이 실제 파서가 되는 다리. 문법으로부터 파스 트리를 만드는 알고리즘 - 하향식(LL), 상향식(LR), 범용(CYK/Earley)이 있고, 이것이 컴파일러 프론트엔드의 핵심.

## 왜 필요한가

- CFG 이론([[context-free-grammars]])이 실제 컴파일러로 이어지는 지점
- LL vs LR 파서의 차이
- compilers/[[parsing]]의 이론 기반

## 파싱 = 파스 트리 만들기

파싱: 입력 문자열 + 문법 → **파스 트리**(또는 실패). "이 문자열이 이 문법으로 생성되나, 어떻게?"

- 인식(recognition): 생성 가능한가 (예/아니오)
- 파싱(parsing): 어떻게 생성됐나 (구조 = 트리)

컴파일러는 구조가 필요 (의미 해석) → 파싱.

## 두 방향: 하향식 vs 상향식

### 하향식 (top-down): LL 파서

**시작 변수에서 출발해 입력에 맞게 규칙 확장**:

```
E → E + T | T 로 "num+num" 파싱:
  E에서 시작 → 어떤 규칙? 입력 보고 결정 → 확장 → ... → 잎이 입력과 일치
```

- **재귀 하강 파서(recursive descent)**: 각 변수 = 함수. 직관적, 손으로 짜기 쉬움
- **LL(k)**: 왼쪽에서 오른쪽 읽고(L), 최좌측 유도(L), k개 미리보기(lookahead)
- 제약: **좌재귀 불가** (E→E+T가 무한 재귀), 문법 변형 필요
- 예: 많은 손수 짠 파서, ANTLR

### 상향식 (bottom-up): LR 파서

**입력에서 출발해 규칙을 거꾸로 적용, 시작 변수로 환원**:

```
"num+num" → num을 T로, T를 E로, ... → 최종 E로 환원(reduce)
```

- **shift-reduce**: 입력을 스택에 밀고(shift), 규칙 오른쪽이 스택 top에 모이면 왼쪽으로 환원(reduce) → PDA의 스택 ([[pushdown-automata]])
- **LR(k), LALR**: 더 많은 문법 처리 (좌재귀 OK), 강력
- 손으로 짜기 어려워 **파서 생성기** 사용: yacc/bison, 대부분 언어 문법
- 결정적 PDA에 대응 → [[pushdown-automata]]

## LL vs LR

| | LL (하향식) | LR (상향식) |
|---|---|---|
| 방향 | 시작→입력 | 입력→시작 |
| 유도 | 최좌측 | 최우측 (역순) |
| 좌재귀 | ✗ | ✓ |
| 문법 범위 | 좁음 | 넓음 |
| 구현 | 손으로 쉬움 | 생성기 필요 |
| 예 | 재귀하강, ANTLR | yacc, bison |

**LR ⊃ LL** (LR이 더 많은 문법 처리). 하지만 LL이 이해·디버깅 쉬워 손수 파서에 인기.

## 범용 파서: CYK, Earley

임의 CFG(모호해도) 파싱:

- **CYK**: DP 기반 ([[dp-fundamentals]]). CNF 문법 필요. O(n³). 모든 파스 트리
- **Earley**: 임의 CFG, O(n³) 최악, 애매하지 않으면 빠름
- 자연어 처리(모호성 많음)나 임의 문법에 사용. 프로그래밍 언어는 LL/LR로 충분(빠름)

## 파싱의 위치: 컴파일러 프론트엔드

```
소스 → [렉싱: 정규→토큰] → [파싱: CFG→파스트리/AST] → [의미분석] → ...
        DFA (automata)      PDA (automata)          CFG 넘어섬
```

- **렉싱**: 정규 언어 = DFA → compilers/[[lexing]]
- **파싱**: 문맥 자유 = PDA → compilers/[[parsing]]
- **의미 분석**: CFG로 못 하는 것(타입, 스코프, 변수 선언-사용 [[cfl-pumping]]) → compilers/[[semantic-analysis]]

계산 이론의 계층이 컴파일러 단계에 그대로 대응. 렉서=DFA, 파서=PDA는 우연이 아님.

## 셀프 체크

> [!question]- 하향식(LL)과 상향식(LR) 파싱은 각각 어느 방향으로 트리를 만드는가?
> 하향식(LL)은 시작 변수에서 출발해 입력에 맞게 규칙을 확장하며 잎으로 내려간다. 상향식(LR)은 입력에서 출발해 규칙을 거꾸로 적용(reduce)하며 시작 변수로 환원한다.

> [!question]- LL 파서가 좌재귀 문법을 직접 처리하지 못하는 이유는?
> E→E+T 같은 규칙에서 하향식은 E를 확장하려 다시 E부터 시작하므로 입력을 소비하지 않고 무한 재귀에 빠진다. 그래서 좌재귀를 우재귀로 변형해야 한다. LR은 shift로 입력을 먼저 쌓으므로 좌재귀가 문제없다.

> [!question]- LR과 LL의 표현 범위 관계는? 그럼에도 LL을 손수 파서에 쓰는 이유는?
> LR ⊃ LL로 LR이 더 많은 문법을 처리한다. 그래도 LL(재귀 하강)은 각 변수가 함수라 이해·디버깅이 쉬워 손으로 짜기 좋다.

> [!question]- CYK 파서가 요구하는 문법 형태와 시간 복잡도는?
> 촘스키 표준형(CNF)을 요구하며 DP 기반으로 O(n³)이다. 임의 CFG(모호해도)를 파싱할 수 있어 자연어처럼 모호성이 많은 경우에 쓰인다.

## 연습문제

> [!example]- 문제: 좌재귀 문법 `E → E + T | T`를 재귀 하강(LL)이 쓸 수 있도록 우재귀로 변환하라.
> **풀이**
> 좌재귀 A→Aα|β를 일반 변환하면 A→βA', A'→αA'|ε.
> 여기서 A=E, α=`+ T`, β=`T`이므로:
> E  → T E'
> E' → + T E' | ε
> 이제 E는 먼저 T를 파싱한 뒤 E'로 `+ T`를 0번 이상 반복한다. 좌재귀가 사라져 재귀 하강 함수 parseE가 무한 재귀 없이 동작하며, 반복 구조라 좌결합도 코드에서 처리 가능하다.

> [!example]- 문제: 문법 E→E+T | T, T→num에 대해 입력 `num+num`을 shift-reduce(LR)로 파싱하는 스택 동작을 추적하라.
> **풀이** (스택 | 남은 입력 | 동작)
> - `` | num+num | shift num
> - num | +num | reduce T→num
> - T | +num | reduce E→T
> - E | +num | shift +
> - E+ | num | shift num
> - E+num | (끝) | reduce T→num
> - E+T | (끝) | reduce E→E+T
> - E | (끝) | accept
> 입력을 스택에 밀고(shift), 규칙 오른쪽이 top에 모이면 왼쪽으로 환원(reduce)한다. 이 스택이 곧 PDA의 스택이다.

## 파인만

> [!note]- 백지에 컴파일러 프론트엔드 파이프라인(렉싱→파싱→의미분석)을 그리고, 각 단계가 어떤 계산 이론 모델(DFA / PDA / CFG 너머)에 대응하는지 설명하라. 막히면 그 단계만 다시.
> **점검 포인트**: (1) 렉서=DFA, 파서=PDA 대응이 우연이 아님을 설명할 수 있는가, (2) LL의 좌재귀 제약과 LR의 좌재귀 허용을 대비할 수 있는가, (3) shift-reduce의 스택이 PDA 스택임을 연결할 수 있는가.

## 연결

- CFG 이론 → [[context-free-grammars]]
- 파서 = PDA → [[pushdown-automata]]
- CYK는 DP → algorithms/[[dp-fundamentals]]
- 실전 파서 구현 → compilers/[[parsing]]
- 렉싱(DFA) → compilers/[[lexing]]
- CFG 한계 → 의미분석 → compilers/[[semantic-analysis]]

## 궁금한 것 (나중에)

- [ ] LR 파싱 테이블 구성 (아이템, 클로저)
- [ ] LALR이 LR보다 작은 이유
- [ ] PEG/packrat 파싱 (다른 접근)
- [ ] 파서 콤비네이터

## 출처

- Sipser 2장 연계, "Crafting Interpreters" 파싱 장
