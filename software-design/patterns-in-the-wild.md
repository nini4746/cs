# 실전의 패턴 (Patterns in the Wild)

## 한 줄 요약

디자인 패턴은 표준 라이브러리·프레임워크·이 노트 저장소 곳곳에 이미 쓰이고 있다. 패턴을 외우기보다 실제 코드에서 알아보는 게 목적이며, 언어 기능이 많은 패턴을 흡수했다.

## 왜 필요한가

- 패턴을 실제 코드에서 알아보기 (암기 아니라 인식)
- 언어가 패턴을 어떻게 흡수했나
- 패턴 남용 경계

## 표준 라이브러리의 패턴

이미 쓰고 있던 패턴들:

- **이터레이터**([[behavioral-patterns]]): 모든 언어의 `for-each`, Python `__iter__`
- **데코레이터**([[structural-patterns]]): Java I/O (`BufferedReader(FileReader)`), Python `@decorator`
- **팩토리**([[creational-patterns]]): `Integer.valueOf()`, `List.of()`
- **빌더**([[creational-patterns]]): `StringBuilder`, SQL/HTTP 빌더
- **옵서버**([[behavioral-patterns]]): 이벤트 리스너, `addEventListener` (web/[[javascript-event-loop]])
- **싱글턴**([[creational-patterns]]): 런타임 객체, 로거
- **프록시**([[structural-patterns]]): ORM 지연 로딩, 동적 프록시

## 프레임워크의 패턴

- **전략**([[behavioral-patterns]]): Spring의 정책 주입, 정렬 comparator
- **DI/팩토리**: Spring 컨테이너 ([[solid]]의 DIP)
- **템플릿 메서드**: 프레임워크 훅 (확장점)
- **MVC**: 관심사 분리 → [[layered-architecture]]
- **미들웨어**([[structural-patterns]]의 데코레이터/책임연쇄): Express·Django 미들웨어
- **옵서버**: React 상태·리덕스, Vue 반응형

## 이 노트 저장소의 패턴 (종합)

이 CS 노트들에서 만난 패턴들:

- **상태 머신**([[behavioral-patterns]]): TCP(network/[[tcp-basics]]), Raft(distributed-systems/[[raft]]), DFA(automata/[[dfa-nfa]])
- **비지터**: 컴파일러 AST(compilers/[[ast-and-interpretation]])
- **이터레이터**: 쿼리 실행 Volcano(database/[[query-execution]])
- **프록시/캐싱**: CDN(network/[[cdn]]), 캐싱 전략(distributed-systems/[[caching-strategies]])
- **pub/sub**(옵서버): 메시지 큐(distributed-systems/[[message-queues]])
- **오브젝트 풀**: 커넥션 풀(database/[[buffer-pool]]), 메모리 할당자(os/[[memory-allocation]])
- **퍼사드**(깊은 모듈): 파일 I/O(os/[[file-system-basics]]), 시스템 콜(computer-architecture/[[exceptions-and-interrupts]])

패턴은 추상적 GoF가 아니라 **실제 시스템의 반복되는 해법**.

## 언어가 패턴을 흡수

많은 GoF 패턴이 **언어 기능으로 흡수**됨 (그럼 패턴 불필요):

- **전략** → **일급 함수**(programming-languages/[[functional-programming]]): 전략 객체 대신 함수 전달. `sort(key=fn)`
- **옵서버** → 반응형 스트림, 이벤트
- **커맨드** → 클로저·함수(programming-languages/[[scope-and-closures]])
- **이터레이터** → 언어 내장 (제너레이터, `yield`)
- **싱글턴** → 모듈(Python), `object`(Kotlin)
- **데코레이터** → 언어 문법(`@`)

Peter Norvig: "디자인 패턴은 언어의 결함을 메우는 것" - 강력한 언어(함수형·동적)에선 많은 패턴이 언어 기능으로 사라짐. GoF는 C++/Java 시대 산물.

## 안티패턴 (anti-patterns)

패턴 남용·오용도 흔함:

- **God object**: 한 클래스가 다 함 (응집도↓ [[coupling-cohesion]])
- **싱글턴 남발**: 전역 상태 ([[creational-patterns]])
- **과도한 추상화**: 얕은 모듈 양산 ([[deep-modules]], [[solid]] 과용)
- **패턴을 위한 패턴**: 간단한 걸 복잡하게
- **spaghetti / 큰 진흙덩이(big ball of mud)**: 구조 없음

## 실전 교훈

1. **패턴을 알아보기**: 코드 읽을 때 "이건 전략이네" - 소통 어휘
2. **언어 기능 우선**: 함수·모듈이 패턴 대체하면 그걸로
3. **필요할 때만**: 패턴이 복잡도를 줄일 때 ([[deep-modules]])
4. **이름으로 소통**: "여기 어댑터 쓰자" - 팀 공통 언어
5. 패턴은 **목적이 아니라 도구·어휘**

## 연결

- 각 패턴 → [[creational-patterns]], [[structural-patterns]], [[behavioral-patterns]]
- 언어 흡수 → programming-languages/[[functional-programming]], [[scope-and-closures]]
- 과용 경계 → [[deep-modules]], [[solid]]
- 실제 사용처 → 전 과목 (위 종합)
- 아키텍처 패턴 → [[layered-architecture]]

## 궁금한 것 (나중에)

- [ ] 함수형 디자인 패턴 (모나드 등)
- [ ] 동시성 패턴 (액터, 생산자-소비자)
- [ ] 클라우드 패턴 (circuit breaker, bulkhead)
- [ ] 리팩토링으로 패턴 도입 (Fowler)

## 출처

- GoF, Norvig "Design Patterns in Dynamic Languages", "Head First Design Patterns"
