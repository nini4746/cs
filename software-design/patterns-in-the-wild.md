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

## 셀프 체크

> [!question]- Norvig의 "디자인 패턴은 언어의 결함을 메우는 것"이라는 말의 뜻은?
> 강력한(함수형·동적) 언어에서는 많은 GoF 패턴이 언어 기능으로 흡수돼 사라진다는 뜻이다. 전략은 일급 함수, 이터레이터는 제너레이터, 데코레이터는 `@` 문법이 대체한다. GoF는 C++/Java 시대에 언어가 부족했던 부분을 패턴으로 메운 산물이다.

> [!question]- 표준 라이브러리에서 데코레이터와 이터레이터가 쓰인 예를 각각 들라.
> 데코레이터: Java I/O의 `BufferedReader(FileReader(...))`, Python `@decorator`. 이터레이터: 모든 언어의 for-each, Python `__iter__`, DB 쿼리 실행의 Volcano 모델.

> [!question]- 흔한 안티패턴 세 가지와 각각의 문제를 들라.
> God object(한 클래스가 다 해 응집도가 낮음), 싱글턴 남발(전역 상태·숨은 결합), 과도한 추상화(구현 하나뿐인 얕은 모듈 양산). 공통적으로 패턴을 위한 패턴이 복잡도를 늘린다.

## 연습문제

> [!example]- 문제: `interface DiscountStrategy { apply(price) }`와 여러 구현 클래스로 할인 정책을 갈아 끼우고 있다. 이 코드에서 어떤 패턴인지 알아보고, 언어 기능으로 더 가볍게 바꿔라.
> **풀이**
> 전략 패턴을 알아본다(알고리즘을 객체로 캡슐화, 조합으로 주입).
> 일급 함수가 있는 언어라면 전략 객체 대신 함수를 넘긴다 → `applyDiscount(price, discountFn)` 또는 `sort(key=fn)`처럼. 클래스 계층이 사라지고 언어 기능이 패턴을 흡수한다. 상태가 없고 단순하면 이 편이 낫다.

> [!example]- 문제: `OrderManager`가 주문 검증·결제·재고·알림·리포트·로그를 모두 처리하는 800줄짜리 클래스다. 무슨 안티패턴이고 어떻게 나누나?
> **풀이**
> God object - 한 클래스가 여러 책임을 져 응집도가 낮고 결합이 높다(SRP 위반).
> 책임별로 클래스 추출: 검증/결제/재고/알림 등으로 분리하고 각각 인터페이스 뒤에 둔다. Manager는 조율만 하거나 없앤다. 각 조각이 하나의 잘 정의된 일을 하게 되어 테스트·변경이 쉬워진다.

## 파인만

> [!note]- 백지에 "패턴을 외우지 말고 알아보라"가 무슨 뜻인지, 그리고 언어가 흡수한 패턴 예를 들어 설명해보라.
> **점검 포인트**: (1) 패턴은 목적이 아니라 소통 어휘·도구라는 점, (2) 함수·모듈 같은 언어 기능이 패턴을 대체하는 사례, (3) 안티패턴과 과용 경계.

## 연결

- 각 패턴 → [[creational-patterns]], [[structural-patterns]], [[behavioral-patterns]]
- 언어 흡수 → programming-languages/[[functional-programming]], [[scope-and-closures]]
- 과용 경계 → [[deep-modules]], [[solid]]
- 실제 사용처 → 전 과목 (위 종합)
- 아키텍처 패턴 → [[layered-architecture]]
- 퍼사드 = 파일 I/O → os/[[file-system-basics]]
- 옵서버 = 이벤트 리스너 → web/[[javascript-event-loop]]

## 궁금한 것 (나중에)

- [ ] 함수형 디자인 패턴 (모나드 등)
- [ ] 동시성 패턴 (액터, 생산자-소비자)
- [ ] 클라우드 패턴 (circuit breaker, bulkhead)
- [ ] 리팩토링으로 패턴 도입 (Fowler)

## 출처

- GoF, Norvig "Design Patterns in Dynamic Languages", "Head First Design Patterns"
