# SOLID 원칙 (SOLID Principles)

## 한 줄 요약

객체 지향 설계의 다섯 원칙 - 단일 책임, 개방-폐쇄, 리스코프 치환, 인터페이스 분리, 의존성 역전. 변경에 강한 코드를 위한 지침이지만, 과용하면 오히려 복잡해진다.

## 왜 필요한가

- 변경에 강한 코드를 어떻게 설계하나
- SOLID 각 원칙의 의미
- 언제 적용하고 언제 과한가

## S - 단일 책임 (Single Responsibility)

**한 클래스는 하나의 이유로만 변경**:

- 클래스가 하는 일이 하나 (하나의 책임)
- 여러 이유로 바뀌면 → 쪼개라
- 예: `User`가 데이터 + 이메일 발송 + DB 저장 다 하면 → 셋 다른 이유로 바뀜 → 분리
- 응집도↑ 결합도↓ ([[coupling-cohesion]])

## O - 개방-폐쇄 (Open-Closed)

**확장에는 열려, 수정에는 닫혀**:

- 새 기능 추가 시 **기존 코드 수정 없이 확장**
- 예: 새 도형 추가 시 `if type == ...` 늘리지 말고, 인터페이스 구현으로 (다형성 [[oop-under-the-hood]])
- 전략 패턴([[behavioral-patterns]])이 이걸 구현
- 기존 코드 안 건드리면 버그 안 생김

## L - 리스코프 치환 (Liskov Substitution)

**하위 타입은 상위 타입을 대체 가능해야**:

- `Rectangle`을 쓰는 곳에 `Square`(하위)를 넣어도 동작해야
- **위반 예**: Square가 Rectangle 상속인데 width/height가 연동되면 → Rectangle 가정 깨짐
- 상속이 "is-a"를 진짜 만족해야 (아니면 조합 [[composition-over-inheritance]])
- programming-languages/[[type-systems-advanced]]의 서브타이핑

## I - 인터페이스 분리 (Interface Segregation)

**안 쓰는 메서드에 의존하지 마라**:

- 큰 인터페이스보다 **작고 구체적인 여러 인터페이스**
- 예: `Worker`에 `eat()` + `work()` → 로봇은 eat 불필요 → 분리
- 클라이언트가 필요한 것만 의존 → 변경 영향 축소

## D - 의존성 역전 (Dependency Inversion)

**추상에 의존하고 구체에 의존하지 마라**:

- 고수준 모듈이 저수준 구체 클래스가 아니라 **인터페이스(추상)**에 의존
- 예: `OrderService`가 `MySQLDatabase`(구체) 아니라 `Database`(인터페이스)에 의존 → DB 교체 자유
- **의존성 주입(DI)**: 의존을 외부에서 주입 → 테스트 쉬움([[testing-strategy]]의 목), 유연
- 결합도↓ ([[coupling-cohesion]])

## SOLID의 목표

전부 **변경에 강한 코드**:
- 요구사항 변경 시 영향 최소화
- 테스트·재사용·확장 쉽게
- 결합도↓ 응집도↑ ([[coupling-cohesion]])

## 과용 주의 (중요)

SOLID를 맹목적으로 적용하면 **오히려 복잡**:

- 작은 프로그램에 인터페이스·추상 계층 남발 → 불필요한 복잡도 (Ousterhout의 "얕은 모듈" [[deep-modules]])
- 추상화가 이득보다 비용이 크면 → 안 함 (YAGNI)
- **변경이 실제로 일어나는 곳**에만 유연성 (미래 예측 과신 금지)
- 원칙은 도구지 목적 아님 → 실용적 판단

균형: SOLID를 알되 상황에 맞게. 과도한 추상화도 나쁜 설계.

## 연결

- 결합도·응집도 → [[coupling-cohesion]]
- 깊은 모듈 (과용 경계) → [[deep-modules]]
- 조합 (LSP) → [[composition-over-inheritance]]
- 다형성 (OCP) → programming-languages/[[oop-under-the-hood]]
- 서브타이핑 (LSP) → programming-languages/[[type-systems-advanced]]
- 전략 패턴 (OCP) → [[behavioral-patterns]]
- DI와 테스트 → [[testing-strategy]]

## 궁금한 것 (나중에)

- [ ] SOLID vs 함수형 설계 (programming-languages/[[functional-programming]])
- [ ] DI 프레임워크 (Spring 등)
- [ ] SOLID 비판론
- [ ] GRASP 원칙 (다른 OO 원칙)

## 출처

- Robert Martin (SOLID), "Clean Architecture"
