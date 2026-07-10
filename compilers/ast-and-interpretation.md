# AST와 인터프리테이션 (AST and Interpretation)

## 한 줄 요약

파서가 만든 추상 구문 트리(AST)를 순회하며 직접 실행하는 것이 tree-walking 인터프리터. 만들기 쉽지만 느리다. AST는 컴파일러 이후 모든 단계의 중심 자료구조다.

## 왜 필요한가

- 파스 트리와 AST의 차이
- 가장 간단한 인터프리터 (tree-walking)
- 왜 이게 느린가 → 바이트코드 VM으로 가는 동기

## 파스 트리 vs AST

- **파스 트리(구체 구문 트리)**: 문법 규칙을 그대로 반영. 괄호 노드, 중간 규칙 등 전부 포함 → automata/[[context-free-grammars]]
- **AST(추상 구문 트리)**: **의미에 필요한 것만**. 괄호는 트리 구조에 이미 반영되니 노드 불필요

```
"(2+3)": 파스 트리는 ( expr ) 노드까지
         AST는 그냥  + (2,3)   ← 괄호 사라짐 (구조가 우선순위 표현)
```

AST가 컴파일러 뒷단계(의미 분석, 최적화, 코드 생성)의 작업 대상.

## AST 노드 설계

각 언어 구성요소가 노드 타입:

```
Expr = Number(value)
     | BinOp(op, left, right)
     | Var(name)
     | Call(func, args)
Stmt = Assign(name, expr)
     | If(cond, then, else)
     | While(cond, body)
     ...
```

- 합 타입(sum type)이 자연스러움 → [[type-systems-advanced]]의 ADT
- 각 노드가 하위 노드를 가리킴 (트리)

## Tree-Walking 인터프리터

AST를 **재귀적으로 순회하며 즉시 실행**:

```python
def eval(node):
    if node is Number: return node.value
    if node is BinOp:
        l = eval(node.left)      # 재귀로 하위 평가
        r = eval(node.right)
        return apply(node.op, l, r)
    if node is Var: return env[node.name]   # 환경에서 변수 조회
    ...
```

- **가장 간단한 실행 방식**: AST가 있으면 바로 실행 가능
- [[parsing]]에서 만든 파서에 eval을 붙이면 계산기·인터프리터 완성
- **환경(environment)**: 변수→값 매핑. 스코프([[scope-and-closures]])를 환경 체인으로 표현

## 왜 느린가

Tree-walking은 만들기 쉽지만 **느림**:

- 각 노드 방문마다 **타입 검사·디스패치** (이 노드가 뭐지?) → 가상 호출/분기 (computer-architecture/[[branch-prediction]])
- **포인터 추적**: 트리 순회 = pointer chasing → 캐시 미스 (data-structures/[[linked-lists]], computer-architecture/[[cache-misses]])
- 반복 실행(루프)마다 같은 트리를 **매번 다시 순회**
- 스택 프레임 오버헤드 (재귀)

그래서 성능이 중요하면 **바이트코드로 컴파일** → 선형 명령 배열을 VM이 실행 → [[bytecode-vm]] (트리 순회 회피, 캐시 친화).

## 어디에 쓰나

Tree-walking이 적합한 경우:
- 학습·프로토타입 (Crafting Interpreters의 jlox)
- 성능 덜 중요한 DSL, 설정 언어, 템플릿 엔진
- 초기 버전 (나중에 바이트코드로 최적화)

Ruby(초기 MRI), 많은 스크립트 언어가 tree-walking으로 시작 후 바이트코드/JIT로 진화 → [[compiled-vs-interpreted]].

## 방문자 패턴 (visitor)

AST 순회를 구조화하는 흔한 패턴:
- 각 연산(평가, 출력, 타입검사)을 방문자로 분리
- AST 노드는 데이터, 방문자가 동작 → 노드 추가 vs 연산 추가의 트레이드오프 (expression problem)
- software-design/[[behavioral-patterns]]의 visitor

## AST는 중심 자료구조

파싱 이후 모든 단계가 AST 위에서:

```
파싱 → AST → [의미 분석: 타입 검사]  → compilers/[[semantic-analysis]]
           → [최적화: AST 변환]
           → [코드 생성: AST → 바이트코드/기계어]  → [[bytecode-vm]], [[codegen-and-optimization]]
```

## 셀프 체크

> [!question]- 파스 트리와 AST의 차이는? `(2+3)`은 각각 어떻게 표현되나?
> 파스 트리(구체 구문 트리)는 문법 규칙을 그대로 반영해 괄호 노드나 중간 규칙 노드까지 전부 포함한다. AST는 의미에 필요한 것만 남긴다. `(2+3)`은 파스 트리에서 `( expr )` 노드까지 있지만, AST는 `+`(2,3)뿐이다 - 괄호는 트리 구조 자체가 우선순위를 표현하므로 노드가 필요 없다.

> [!question]- Tree-walking 인터프리터가 값을 계산하는 기본 동작은?
> AST를 재귀적으로 순회하며 각 노드를 즉시 평가한다. Number면 값을 반환하고, BinOp면 왼쪽·오른쪽 하위 노드를 재귀로 평가한 뒤 연산자를 적용하고, Var면 환경에서 변수를 조회한다. 파서에 eval을 붙이면 바로 인터프리터가 된다.

> [!question]- Tree-walking이 느린 이유를 셋 이상 대라.
> (1) 노드 방문마다 타입 검사·디스패치(이 노드가 뭐지?)로 가상 호출/분기 발생, (2) 트리 순회 = pointer chasing이라 캐시 미스가 잦음, (3) 루프처럼 반복 실행하면 같은 트리를 매번 다시 순회, (4) 재귀에 따른 스택 프레임 오버헤드. 그래서 성능이 중요하면 선형 바이트코드로 컴파일한다.

> [!question]- 방문자 패턴(visitor)은 AST에서 무엇을 해결하나?
> 평가·출력·타입검사 같은 각 연산을 별도 방문자로 분리해, AST 노드는 데이터로만 두고 동작은 방문자가 담당한다. 이는 노드 타입 추가와 연산 추가 사이의 트레이드오프(expression problem)를 드러낸다.

## 연습문제

> [!example]- 문제: `BinOp('+', Number(2), BinOp('*', Number(3), Number(4)))` AST에 대해 `eval(node)`가 재귀 호출되는 순서와 각 반환값을 추적하라.
> **풀이**
> - `eval(BinOp +)`: BinOp이므로 왼쪽부터
>   - `eval(Number 2)` → 2 반환
>   - `eval(BinOp *)`: BinOp이므로
>     - `eval(Number 3)` → 3
>     - `eval(Number 4)` → 4
>     - `apply('*', 3, 4)` → 12 반환
>   - `apply('+', 2, 12)` → 14 반환
> 최종 결과 14. 재귀가 트리의 잎(leaf)부터 값을 올려보내고, 각 BinOp에서 하위 결과를 합쳐 위로 전달한다(bottom-up).

> [!example]- 문제: `Assign('x', Number(5))`와 `BinOp('+', Var('x'), Number(1))` 두 문장을 순서대로 실행하도록 `eval`에 환경(env) 처리를 더한 의사코드를 쓰고, 결과가 6임을 보여라.
> **풀이**
> ```
> env = {}
> def eval(node):
>     if node is Number: return node.value
>     if node is Var:    return env[node.name]   # 조회
>     if node is Assign: env[node.name] = eval(node.expr); return
>     if node is BinOp:  return apply(node.op, eval(node.left), eval(node.right))
> ```
> 추적: `eval(Assign x, Number 5)` → `env["x"] = 5`. 다음 `eval(BinOp +, Var x, Number 1)` → `eval(Var x)`가 `env["x"]=5`, `eval(Number 1)=1`, `apply('+',5,1)=6`. 환경이 변수→값 매핑을 유지해 두 문장을 잇는다. 스코프 중첩은 이 환경을 체인으로 만들어 표현한다.

## 파인만

> [!note]- 백지에 "AST가 왜 컴파일러 뒷단계 전체의 중심 자료구조인가, 그리고 tree-walking은 왜 쉽지만 느린가"를 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) AST는 의미에 필요한 구조만 남긴 형태이고 의미분석·최적화·코드생성이 모두 이 위에서 일어난다는 것, (2) tree-walking = 재귀 순회 즉시 실행이라 만들기 쉽다는 것, (3) pointer chasing과 반복 재순회 때문에 느려서 바이트코드로 넘어간다는 것 - 이 셋을 설명할 수 있어야 한다.

## 연결

- 이전 단계 파싱 → [[parsing]]
- AST = 합 타입 → [[type-systems-advanced]]
- 환경과 스코프 → [[scope-and-closures]]
- 느린 이유 (캐시) → computer-architecture/[[cache-misses]], data-structures/[[linked-lists]]
- 빠르게: 바이트코드 → [[bytecode-vm]]
- 다음: 의미 분석 → [[semantic-analysis]]
- 순회 구조화 = visitor → software-design/[[behavioral-patterns]]
- 노드 디스패치의 분기 비용 → computer-architecture/[[branch-prediction]]

## 궁금한 것 (나중에)

- [ ] visitor 패턴 vs 패턴 매칭 (expression problem)
- [ ] AST를 IR로 낮추는 과정
- [ ] tree-walking을 얼마나 빠르게 만들 수 있나 (인라인 캐시)
- [ ] 환경을 배열로 (변수 해석 후 슬롯 인덱스)

## 출처

- Crafting Interpreters (평가 장, jlox)
