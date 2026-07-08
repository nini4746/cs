# CFG에서 파싱으로 (CFG to Parsing)

## 한 줄 요약

문맥 자유 문법이 실제 파서가 되는 다리. 문법으로부터 파스 트리를 만드는 알고리즘 - 하향식(LL), 상향식(LR), 범용(CYK/Earley)이 있고, 이것이 컴파일러 프론트엔드의 핵심.

## 왜 필요한가

- CFG 이론([[context-free-grammars]])이 실제 컴파일러로 이어지는 지점
- LL vs LR 파서의 차이
- programming-languages/[[parsing]]의 이론 기반

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

- **렉싱**: 정규 언어 = DFA → programming-languages/[[lexing]]
- **파싱**: 문맥 자유 = PDA → programming-languages/[[parsing]]
- **의미 분석**: CFG로 못 하는 것(타입, 스코프, 변수 선언-사용 [[cfl-pumping]]) → programming-languages/[[semantic-analysis]]

계산 이론의 계층이 컴파일러 단계에 그대로 대응. 렉서=DFA, 파서=PDA는 우연이 아님.

## 연결

- CFG 이론 → [[context-free-grammars]]
- 파서 = PDA → [[pushdown-automata]]
- CYK는 DP → algorithms/[[dp-fundamentals]]
- 실전 파서 구현 → programming-languages/[[parsing]]
- 렉싱(DFA) → programming-languages/[[lexing]]
- CFG 한계 → 의미분석 → programming-languages/[[semantic-analysis]]

## 궁금한 것 (나중에)

- [ ] LR 파싱 테이블 구성 (아이템, 클로저)
- [ ] LALR이 LR보다 작은 이유
- [ ] PEG/packrat 파싱 (다른 접근)
- [ ] 파서 콤비네이터

## 출처

- Sipser 2장 연계, "Crafting Interpreters" 파싱 장
