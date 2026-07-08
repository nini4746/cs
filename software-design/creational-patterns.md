# 생성 패턴 (Creational Patterns)

## 한 줄 요약

객체 생성을 유연하게 만드는 GoF 패턴들 - 팩토리(생성 로직 분리), 빌더(복잡한 조립), 싱글턴(하나만). 생성 코드를 사용 코드에서 분리해 결합을 낮춘다. 단, 싱글턴은 전역 상태라 신중.

## 왜 필요한가

- 객체 생성을 왜 패턴으로
- 팩토리·빌더가 뭘 해결하나
- 싱글턴이 왜 욕먹나

## 왜 생성 패턴

`new Foo()`를 직접 쓰면 (결합 [[coupling-cohesion]]):
- **구체 클래스에 결합**: 코드가 `new MySQLDatabase()` → DB 바꾸려면 다 수정 (DIP 위반 [[solid]])
- **복잡한 생성**: 인자 많고 조건부 생성이면 지저분
- 생성 패턴 = **생성 로직을 분리·캡슐화**

## 팩토리 (Factory)

객체 생성을 **별도 메서드/클래스로**:

```
직접: db = new MySQLDatabase()      // 구체 결합
팩토리: db = DatabaseFactory.create(config)  // 무엇을 만들지 팩토리가 결정
```

- **팩토리 메서드**: 서브클래스가 어떤 객체 만들지 결정
- **추상 팩토리**: 관련 객체 군을 생성 (같은 계열의 버튼·창)
- 이점: 사용 코드가 **인터페이스에만 의존** (구체 클래스 모름, DIP [[solid]]) → 구현 교체 자유
- 조건부 생성·로직을 한 곳에

## 빌더 (Builder)

**복잡한 객체를 단계별로 조립**:

```
생성자 지옥: new Pizza(true, false, true, false, "large", ...)  // 인자 뭐가 뭔지?
빌더: Pizza.builder().size("large").cheese().build()           // 명확
```

- 인자 많은 생성자(telescoping constructor)를 대체
- **선택적 인자**·불변 객체 조립에 유리
- 가독성 (메서드 이름으로 의미)
- 예: SQL 쿼리 빌더, HTTP 요청 빌더

## 싱글턴 (Singleton)

**인스턴스가 하나만** 존재하도록:

```
Singleton.getInstance()  // 항상 같은 인스턴스
```

- 용도: 설정, 로거, 커넥션 풀 (하나만 있어야/있으면 되는 것)
- 스레드 안전 주의 (동시 생성 → os/[[threads-and-races]], double-checked locking)

### 왜 욕먹나

싱글턴은 **안티패턴 취급**받기도:
- **전역 상태**: 숨은 의존성 (어디서나 접근 → 결합 [[coupling-cohesion]])
- **테스트 어려움**: 목으로 대체 불가 (전역이라, [[testing-strategy]])
- **동시성 위험**: 공유 가변 상태 (os/[[threads-and-races]])
- 대안: **의존성 주입(DI)**으로 하나의 인스턴스를 주입 (전역 아니라 명시적, [[solid]]) → 테스트·유연성

싱글턴이 필요해 보이면 DI로 수명 관리하는 게 대개 나음.

## 기타 생성 패턴

- **프로토타입**: 기존 객체 복제로 생성 (new 대신 clone)
- **오브젝트 풀**: 비싼 객체 재사용 (커넥션 풀 database/[[buffer-pool]] 유사) → os/[[memory-allocation]]의 풀

## 패턴은 도구지 목적 아님

주의 ([[solid]]의 과용 경계):
- 패턴을 위한 패턴 금지 - 간단하면 `new`가 낫다
- 팩토리·빌더는 **실제로 유연성·가독성이 필요할 때**
- 과도한 패턴 = 얕은 모듈 양산 ([[deep-modules]])
- "언어가 이미 제공하면" 패턴 불필요 (일부 패턴은 언어 기능으로 대체)

## 연결

- 결합·DIP → [[coupling-cohesion]], [[solid]]
- 과용 경계 → [[deep-modules]]
- 싱글턴 동시성 → os/[[threads-and-races]]
- 오브젝트 풀 → os/[[memory-allocation]]
- 테스트 (DI) → [[testing-strategy]]
- 다른 패턴 → [[structural-patterns]], [[behavioral-patterns]]

## 궁금한 것 (나중에)

- [ ] DI 컨테이너의 수명 관리 (singleton/scoped/transient)
- [ ] 빌더 + 불변 객체 패턴
- [ ] 언어별 싱글턴 (Kotlin object, 모듈)
- [ ] 팩토리 vs 생성자 트레이드오프

## 출처

- GoF "Design Patterns", "Effective Java" (Bloch)
