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

## 연결

- 이전 단계 파싱 → [[parsing]]
- AST = 합 타입 → [[type-systems-advanced]]
- 환경과 스코프 → [[scope-and-closures]]
- 느린 이유 (캐시) → computer-architecture/[[cache-misses]], data-structures/[[linked-lists]]
- 빠르게: 바이트코드 → [[bytecode-vm]]
- 다음: 의미 분석 → [[semantic-analysis]]

## 궁금한 것 (나중에)

- [ ] visitor 패턴 vs 패턴 매칭 (expression problem)
- [ ] AST를 IR로 낮추는 과정
- [ ] tree-walking을 얼마나 빠르게 만들 수 있나 (인라인 캐시)
- [ ] 환경을 배열로 (변수 해석 후 슬롯 인덱스)

## 출처

- Crafting Interpreters (평가 장, jlox)
