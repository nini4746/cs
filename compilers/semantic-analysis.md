# 의미 분석 (Semantic Analysis)

## 한 줄 요약

파싱(구문)이 끝난 뒤 "의미가 맞는가"를 검사하는 단계. 변수 선언-사용 매칭, 타입 검사, 스코프 해석 - 문법(CFG)으로는 못 잡는 것들을 처리한다. 계산 이론의 CFG 한계가 여기서 실무로 드러난다.

## 왜 필요한가

- 구문은 맞는데 의미가 틀린 오류 (선언 안 한 변수, 타입 불일치)
- 왜 파서(CFG)로 이걸 못 하나 → automata/[[cfl-pumping]]
- 컴파일러 프론트엔드의 마지막 검증

## 구문 vs 의미

- **구문(syntax)**: 문법에 맞나 (파서가 검사) → [[parsing]]
- **의미(semantics)**: 말이 되나

```
구문 OK, 의미 오류:
  int x = "hello";     # 타입 불일치
  y = 5;               # y 선언 안 됨
  foo(1, 2);           # foo가 인자 3개 요구
```

파서는 이걸 못 잡음 - 문법적으론 완벽. 의미 분석이 잡음.

## 왜 CFG로 못 하나

핵심: **변수 선언-사용 매칭은 문맥 자유를 넘어섬** → automata/[[cfl-pumping]]:

- "선언된 변수만 사용" = 같은 이름을 매칭 = {ww} 형태 → CFL 아님
- 파서(PDA, 스택 하나)는 무한한 이름 집합을 추적 못 함
- 그래서 **파싱 후 별도 단계**로 처리 (심볼 테이블 사용)

이게 automata/[[cfl-pumping]]에서 "aⁿbⁿcⁿ은 CFL 아님"이 실무로 나타나는 지점. 계산 이론의 계층이 컴파일러 단계를 강제.

## 심볼 테이블 (symbol table)

이름 → 정보(타입, 스코프, 위치) 매핑:

```
심볼 테이블:
  "x" → {type: int, scope: 함수, 선언 위치: 3줄}
  "foo" → {type: 함수(int,int)→int, ...}
```

- **선언**: 심볼 테이블에 추가 (중복 선언 검사)
- **사용**: 테이블 조회 (없으면 "선언 안 됨" 오류)
- data-structures/[[hash-tables]]로 구현 (이름 조회 O(1))

## 스코프 해석 (scope resolution)

각 이름 사용이 **어느 선언을 가리키나** ([[scope-and-closures]]의 렉시컬 스코프):

- 스코프마다 심볼 테이블 (중첩 → 테이블 스택/체인)
- 이름 조회: 현재 스코프 → 바깥 스코프 → ... (렉시컬 체인)
- 섀도잉(안쪽이 바깥 이름 가림), 클로저 캡처 결정 → [[scope-and-closures]]
- **변수 해석 최적화**: 이름을 슬롯 인덱스로 미리 변환 → 런타임 조회를 배열 인덱싱으로 (tree-walking 가속)

## 타입 검사 (type checking)

정적 타입 언어에서 타입 규칙 검증 ([[static-vs-dynamic-typing]]):

- **타입 추론**: 표현식의 타입 계산 (`2 + 3` → int)
- **타입 일치**: 대입·인자·연산의 타입 확인
- **타입 오류**: 불일치를 컴파일 타임에 보고
- 동적 언어는 이 단계 생략 (런타임에 검사)

AST를 순회하며 각 노드의 타입을 아래에서 위로 계산 (bottom-up).

## 그 밖의 의미 검사

- **제어 흐름**: 모든 경로가 값 반환하나, 도달 불가 코드
- **상수성**: const에 대입 안 하나
- **초기화**: 변수를 쓰기 전 초기화했나 (Rust의 엄격한 검사)
- **접근 제어**: private 멤버 접근 규칙
- **빌림 검사**: Rust의 소유권/수명 → [[memory-management-models]]

## 정적 분석의 한계

의미 분석은 **컴파일 타임에 결정 가능한 것만**:

- "이 변수가 null일 수 있나"는 일반적으로 **결정 불가** (정지 문제 → automata/[[decidability]])
- 그래서 보수적 근사 (거짓 양성 허용) 또는 타입 시스템으로 제약 (Option → [[error-handling-models]])
- 완벽한 정적 검사는 원리적으로 불가 → automata/[[decidability]]의 Rice 정리

## 파이프라인 위치

```
소스 → 렉싱 → 파싱 → AST → [의미 분석] → 중간 표현 → 최적화 → 코드 생성
       DFA    PDA           심볼테이블+타입    → [[codegen-and-optimization]]
                            CFG 넘어섬
```

여기까지가 **프론트엔드**(언어 의존). 이후 **백엔드**(타겟 의존) → [[codegen-and-optimization]].

## 연결

- 파싱 (이전 단계) → [[parsing]]
- CFG 한계 (왜 별도 단계) → automata/[[cfl-pumping]]
- 심볼 테이블 → data-structures/[[hash-tables]]
- 스코프 → [[scope-and-closures]]
- 타입 검사 → [[static-vs-dynamic-typing]], [[type-systems-advanced]]
- 정적 분석 한계 → automata/[[decidability]]

## 궁금한 것 (나중에)

- [ ] Hindley-Milner 타입 추론 구현
- [ ] Rust 빌림 검사기의 알고리즘
- [ ] 데이터 흐름 분석 (초기화, 도달성)
- [ ] 추상 해석 (abstract interpretation)

## 출처

- "Dragon Book" 6장, Crafting Interpreters (해석/변수 장)
