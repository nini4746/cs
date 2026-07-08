# 행동 패턴 (Behavioral Patterns)

## 한 줄 요약

객체 간 책임 분배와 통신을 다루는 GoF 패턴들 - 전략(알고리즘 교체), 옵서버(이벤트 알림), 커맨드(요청 객체화), 상태(상태별 행동). 알고리즘·행동을 유연하게 바꾸고 결합을 낮춘다.

## 왜 필요한가

- 알고리즘·행동을 런타임에 바꾸는 법 (전략)
- 이벤트 기반 통신 (옵서버)
- 여러 곳에 나온 패턴들의 정리

## 전략 (Strategy)

**알고리즘을 객체로 캡슐화해 교체 가능**:

```
Sorter { SortStrategy s; }  → s를 quicksort/mergesort로 교체
```

- 조합([[composition-over-inheritance]])으로 행동 주입 - 이미 여러 번 나온 핵심
- OCP([[solid]]): 새 알고리즘을 새 전략으로 (기존 코드 안 건드림)
- if/switch 분기를 다형성으로 대체 (programming-languages/[[oop-under-the-hood]])
- 예: 정렬 전략, 결제 방법, 압축 알고리즘, 할인 정책

## 옵서버 (Observer)

**상태 변화를 구독자들에게 자동 알림** (pub/sub):

```
Subject 상태 변경 → 등록된 Observer들에게 notify()
```

- **느슨한 결합**([[coupling-cohesion]]): Subject는 Observer가 누군지 모름 (인터페이스만)
- 이벤트 기반 → [[event-driven-architecture]], distributed-systems/[[message-queues]]의 pub/sub
- 예: UI 이벤트(web/[[javascript-event-loop]]), 반응형(React 상태), 이벤트 리스너
- 주의: 알림 폭주, 순환 알림, 메모리 누수(구독 해제 안 함)

## 커맨드 (Command)

**요청을 객체로** (실행할 동작을 캡슐화):

```
Command { execute(); undo(); }
동작을 객체로 → 저장·큐잉·취소·재실행 가능
```

- **실행 취소(undo)**: 커맨드에 역동작 (data-structures/[[stacks-and-queues]]의 undo 스택)
- **큐잉·로깅**: 커맨드를 큐에 (작업 큐 distributed-systems/[[message-queues]])
- **트랜잭션**: 커맨드 묶음 (database/[[transactions-acid]] 유사)
- 예: 에디터 undo/redo, 작업 큐, 매크로

## 상태 (State)

**상태별로 다른 행동** (상태 머신을 객체로):

```
객체가 상태에 따라 다르게 동작 → 각 상태를 객체로
상태 전이 = 상태 객체 교체
```

- 거대한 if/switch(상태별 분기)를 상태 객체로 → automata/[[dfa-nfa]]의 상태 머신 구현
- 예: TCP 연결 상태(network/[[tcp-basics]]), 주문 상태, 게임 상태
- 전략 패턴과 구조 비슷하나 의도 다름 (전략=알고리즘 선택, 상태=상태 전이)

## 기타 행동 패턴

- **이터레이터(Iterator)**: 컬렉션 순회를 통일 (내부 구조 감춤) → database/[[query-execution]]의 Volcano 모델, 언어 기본 제공
- **템플릿 메서드**: 알고리즘 골격 고정, 일부 단계만 서브클래스가 (상속 기반 - 조합 전략과 대조)
- **책임 연쇄(Chain of Responsibility)**: 요청을 처리기 체인으로 (미들웨어 [[structural-patterns]]의 데코레이터 유사)
- **비지터(Visitor)**: 구조를 안 바꾸고 연산 추가 → programming-languages/compilers/[[ast-and-interpretation]]의 AST 순회
- **메멘토**: 상태 스냅샷 (undo, database/[[mvcc]] 유사)

## 여러 곳에 나온 것들 (종합)

행동 패턴이 CS 전반에:

- **전략** → 정렬·압축·정책 (조합의 대표)
- **옵서버** → 이벤트 루프(web), pub/sub(distsys)
- **상태** → 상태 머신(automata, TCP)
- **이터레이터** → 쿼리 실행(DB), 언어 기본
- **비지터** → 컴파일러 AST(PL)

## 실전 관점

- **전략·옵서버**: 가장 자주 (유연성·이벤트)
- **커맨드**: undo·큐·트랜잭션
- **상태**: 복잡한 상태 전이
- 언어가 기본 제공하는 것 많음 (이터레이터, 함수형이면 전략=고차함수 programming-languages/[[functional-programming]])
- 과용 경계 동일 ([[solid]], [[deep-modules]])

## 연결

- 전략 = 조합 → [[composition-over-inheritance]]
- OCP → [[solid]]
- 옵서버 = pub/sub → [[event-driven-architecture]], distributed-systems/[[message-queues]]
- 상태 머신 → automata/[[dfa-nfa]], network/[[tcp-basics]]
- 비지터 = AST → programming-languages/compilers/[[ast-and-interpretation]]
- 이터레이터 → database/[[query-execution]]
- undo 스택 → data-structures/[[stacks-and-queues]]

## 궁금한 것 (나중에)

- [ ] 함수형에서 패턴이 사라지는 것 (전략=함수, 옵서버=스트림)
- [ ] 비지터와 expression problem
- [ ] 반응형 프로그래밍 (RxJS)와 옵서버
- [ ] 상태 머신 라이브러리 (XState)

## 출처

- GoF "Design Patterns", "Head First Design Patterns"
