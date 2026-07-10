# 조합 우선 (Composition over Inheritance)

## 한 줄 요약

기능 재사용에 상속(is-a)보다 조합(has-a)을 선호하라. 상속은 강한 결합·경직된 계층·취약한 기반 클래스 문제를 낳고, 조합은 유연하고 런타임에 바꿀 수 있다.

## 왜 필요한가

- 상속의 함정 (왜 남용하면 안 되나)
- 조합이 왜 더 유연한가
- programming-languages/[[oop-under-the-hood]]의 실전 지침

## 상속의 문제

상속(inheritance)은 OOP의 기본이지만 남용하면 (programming-languages/[[oop-under-the-hood]]):

### 강한 결합

- 자식이 부모 **구현에 의존** → 부모 변경이 자식 다 깨뜨림 (**취약한 기반 클래스, fragile base class**)
- 부모의 내부를 알아야 (캡슐화 위반, [[deep-modules]])

### 경직된 계층

- 상속은 **컴파일 타임 고정** → 런타임에 못 바꿈
- 다중 특성 조합이 폭발: "나는 새 + 수영하는 것"을 상속으로 하면 클래스 폭발 (조합의 수만큼)
- **다이아몬드 문제**: 다중 상속의 모호성 (C++)

### 잘못된 is-a

- 상속은 "is-a"를 함의 (리스코프 [[solid]]) → 실제론 has-a인데 상속하면 위반
- 예: `Stack extends ArrayList` → Stack이 ArrayList의 모든 메서드 노출 (add(index) 등 - Stack엔 안 맞음)

## 조합 (composition)

기능을 상속받는 대신 **가지고 있음(has-a)**:

```
상속: class Car extends Engine       // Car is-a Engine? 이상
조합: class Car { Engine engine; }    // Car has-a Engine ✓
      Car의 기능은 engine에 위임(delegate)
```

이점:
- **유연**: 런타임에 부품 교체 (다른 Engine 주입 - DI [[solid]])
- **낮은 결합**: 인터페이스로만 소통 (구현 안 앎, [[coupling-cohesion]])
- **조합 자유**: 특성을 자유 조합 (폭발 없음)
- **캡슐화 유지**: 부품 내부 안 노출

## 전략 패턴 = 조합의 대표

행동을 조합으로 (전략 패턴 [[behavioral-patterns]]):

```
상속: FlyingDuck, WalkingDuck, ... (나는/걷는 조합마다 클래스)
조합: Duck { FlyBehavior fly; }  → fly를 런타임에 교체
```

- 행동을 객체로 분리해 주입 → "Head First Design Patterns"의 첫 교훈
- OCP([[solid]]) 구현 (새 행동 추가 시 기존 코드 안 건드림)

## 언제 상속이 맞나

조합 "우선"이지 상속 "금지"는 아님:

- **진짜 is-a + 안정적 계약**: `Square is-a Shape` (리스코프 만족 [[solid]])
- **다형성 필요**: 공통 인터페이스로 다루기 (programming-languages/[[oop-under-the-hood]]의 vtable)
- **얕은 계층**: 1~2단계 (깊은 상속 계층이 문제)
- **프레임워크 확장점**: 정해진 방식으로 확장

인터페이스 상속(계약)은 OK, 구현 상속(코드 재사용)이 위험. "인터페이스는 상속, 구현은 조합".

## 언어별 관점

- **Go**: 상속 없음 - 조합 + 인터페이스만 (embedding)
- **Rust**: 상속 없음 - 트레이트(조합적)
- **Java/C++**: 상속 있지만 조합 권장 추세
- 현대 언어가 구현 상속을 빼는 경향 → 조합이 기본

## trait / mixin

조합과 상속 사이 - 재사용 가능한 행동 단위:

- **trait**(Rust, Scala), **mixin**(Python, Ruby): 여러 클래스에 행동 주입
- 다중 상속의 문제 없이 코드 재사용
- 조합의 편의 + 인터페이스 계약

## 실전 지침

1. **기본은 조합** (has-a로 시작)
2. **인터페이스는 상속** (다형성·계약)
3. **구현 상속은 신중** (진짜 is-a + 얕은 계층)
4. **행동은 전략 패턴** (조합 + 주입)
5. 깊은 상속 계층 발견 → 리팩토링 신호

## 셀프 체크

> [!question]- 취약한 기반 클래스(fragile base class) 문제란 무엇인가?
> 자식이 부모의 구현 세부에 의존하면, 부모를 바꿀 때 자식이 예기치 않게 깨진다. 부모 내부를 알아야 상속을 안전하게 쓸 수 있어 캡슐화가 깨진다.

> [!question]- "인터페이스는 상속, 구현은 조합"이 무슨 뜻인가?
> 다형성·계약을 위해 인터페이스(타입)를 상속하는 건 안전하다. 하지만 코드 재사용을 위해 구현을 상속하면 강결합·경직을 낳으므로, 기능 재사용은 has-a 조합 + 위임으로 하라는 뜻이다.

> [!question]- 조합 "우선"이라도 상속이 맞는 경우는?
> 진짜 is-a이고 리스코프를 만족하며 계약이 안정적일 때, 다형성이 필요할 때, 계층이 얕을 때(1~2단계), 프레임워크가 정한 확장점일 때.

## 연습문제

> [!example]- 문제: `class Stack<T> extends ArrayList<T>`로 스택을 만들었다. 무엇이 문제인지 진단하고 개선하라.
> **풀이**
> 문제: Stack은 ArrayList가 아니다(잘못된 is-a). 상속하면 `add(index, x)`, `remove(index)` 같은 스택에 안 맞는 메서드가 다 노출돼 불변식(LIFO)을 깰 수 있다.
> 개선: 조합으로 바꾼다 → `class Stack<T> { private List<T> items; push/pop만 노출 }`. 내부 리스트를 감춰 캡슐화를 지키고 필요한 연산만 위임한다.

> [!example]- 문제: 오리 게임에 "나는 오리", "걷는 오리", "나는+수영하는 오리"... 조합마다 서브클래스를 만들다 클래스가 폭발했다. 리팩터링하라.
> **풀이**
> 상속으로 특성을 조합하면 조합 수만큼 클래스가 폭발한다.
> 조합 + 전략으로: `Duck { FlyBehavior fly; SwimBehavior swim; }`처럼 행동을 객체로 분리해 주입하고 런타임에 교체한다. 특성 조합이 곱셈이 아니라 덧셈이 되고, 새 행동은 새 전략만 추가한다(OCP).

## 파인만

> [!note]- 백지에 "왜 상속보다 조합인가"를 코드 예시 하나로 설명해보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 상속의 3대 문제(강결합/경직/잘못된 is-a), (2) 조합이 유연·저결합·캡슐화 유지를 주는 이유, (3) 그럼에도 상속이 정당한 조건.

## 연결

- 상속·vtable → programming-languages/[[oop-under-the-hood]]
- 리스코프 (is-a) → [[solid]]
- 결합·캡슐화 → [[coupling-cohesion]], [[deep-modules]]
- 전략 패턴 → [[behavioral-patterns]]
- DI → [[solid]]

## 궁금한 것 (나중에)

- [ ] ECS (Entity-Component-System) - 게임의 극단적 조합
- [ ] mixin의 MRO (Python 다중 상속 순서)
- [ ] delegation 자동화 (Kotlin by)
- [ ] trait vs 인터페이스 차이

## 출처

- "Design Patterns" (GoF, "favor composition"), "Effective Java" (Bloch)
