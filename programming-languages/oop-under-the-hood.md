# OOP 내부 (OOP Under the Hood)

## 한 줄 요약

객체 지향의 핵심 메커니즘 - 다형성은 vtable(가상 함수 테이블)로 구현된다. 동적 디스패치는 함수 포인터를 한 번 더 거치는 비용이 있고, 상속보다 조합이 권장되는 이유가 여기 있다.

## 왜 필요한가

- 다형성(같은 호출, 다른 동작)이 실제로 어떻게 되나
- 가상 함수가 왜 성능 비용이 있나
- "상속보다 조합"의 근거

## 다형성과 동적 디스패치

OOP의 핵심: 같은 인터페이스 호출이 **실제 타입에 따라 다르게** 동작:

```cpp
Animal* a = getDog();  // 또는 Cat
a->sound();            // "woof" 또는 "meow" - 실행 시점에 결정
```

컴파일 타임엔 `a`가 Dog인지 Cat인지 모름 → **런타임에 올바른 함수 선택** = 동적 디스패치(dynamic dispatch). 이걸 어떻게 구현?

## vtable (가상 함수 테이블)

각 클래스마다 **가상 함수들의 주소 테이블**을 만들고, 각 객체가 자기 클래스의 vtable을 가리키는 포인터(**vptr**)를 가짐:

```
Dog vtable: [ &Dog::sound, &Dog::~Dog, ... ]
Cat vtable: [ &Cat::sound, &Cat::~Cat, ... ]

객체 dog: [vptr → Dog vtable][데이터...]
```

`a->sound()` 실행:
```
1. a의 vptr을 읽음 → 그 객체의 vtable
2. vtable에서 sound의 슬롯 주소를 읽음
3. 그 주소로 호출 (간접 호출)
```

실측 (C++):
```
woof / meow           ← 같은 호출, 실제 타입대로 디스패치
sizeof(Dog)=8         ← 데이터 멤버 없어도 8바이트 = vptr 하나
```

빈 클래스인데 8바이트 = **vptr이 객체에 숨어있음**. 가상 함수가 있으면 객체마다 이 포인터 오버헤드.

## 동적 디스패치 비용

정적 호출 vs 가상 호출:

- **정적(비가상)**: 컴파일 타임에 주소 확정 → 직접 호출. 인라인 가능
- **가상**: vptr 읽기 → vtable 조회 → 간접 호출. **포인터를 두 번 더 따라감** + 인라인 불가 + 분기 예측 어려움 (computer-architecture/[[branch-prediction]])

비용:
- 간접 호출 자체는 작음 (몇 사이클)
- **진짜 비용은 인라인 못 함** → 최적화 기회 상실 (작은 함수를 못 펼침)
- 캐시: vtable 접근이 캐시 미스 유발 가능 (computer-architecture/[[cache-misses]])

대부분 상황에서 무시할 만하지만, 뜨거운 루프의 가상 호출은 성능 병목이 될 수 있음.

## 언어별 구현

- **C++**: vtable (가상 함수만, 명시적 `virtual`). 비가상은 정적 → 제로 오버헤드 선택 가능
- **Java**: 모든 메서드가 기본 가상 (final 아니면). JIT가 단일 구현이면 devirtualize(정적화)
- **Python/JS**: 더 동적 - 메서드를 딕셔너리에서 조회 (더 유연, 더 느림). 속성 조회가 해시 룩업
- **Rust/Go**: 인터페이스 = 명시적 vtable (fat pointer: 데이터+vtable). 정적 디스패치(제네릭)도 선택 가능

## 상속 vs 조합

OOP의 전통적 상속(inheritance)의 문제 → "조합을 선호(favor composition over inheritance)":

- **깊은 상속 계층**: 취약 (부모 변경이 자식 다 깨뜨림 - fragile base class)
- **다이아몬드 문제**: 다중 상속의 모호성
- **강한 결합**: 자식이 부모 구현에 묶임
- **is-a 강제**: 실제론 has-a가 맞는 경우

**조합**: 기능을 상속받는 대신 **가지고 있음**:
```
상속: class Car extends Engine   // Car is-a Engine? 이상함
조합: class Car { Engine engine; }  // Car has-a Engine ✓
```

- 유연 (런타임에 교체), 결합 낮음
- 인터페이스 + 조합이 현대 설계 표준 → software-design/[[composition-over-inheritance]]

## 캡슐화·다형성·상속

OOP 3요소:
- **캡슐화**: 데이터+동작 묶고 내부 숨김 (private) → software-design/[[deep-modules]]
- **다형성**: 위 vtable 메커니즘
- **상속**: 재사용 - 하지만 조합이 종종 나음

## 셀프 체크

> [!question]- `a->sound()` 같은 가상 호출이 vtable로 디스패치되는 3단계는?
> (1) 객체의 vptr을 읽어 그 클래스의 vtable을 찾고, (2) vtable에서 sound의 슬롯 주소를 읽고, (3) 그 주소로 간접 호출한다. 실제 타입(Dog/Cat)에 따라 vptr이 다른 vtable을 가리켜 다른 함수가 불린다.

> [!question]- 가상 호출의 "진짜 비용"은 간접 점프 자체가 아니라 무엇인가?
> 인라인을 못 하는 것이다. 간접 호출 자체는 몇 사이클로 작지만, 컴파일 타임에 대상이 확정되지 않아 작은 함수를 펼쳐 넣을 수 없어 최적화 기회를 잃는다. vtable 접근이 캐시 미스를 유발할 수도 있다.

> [!question]- 빈 클래스인데 sizeof가 8인 이유는?
> 가상 함수가 있으면 객체마다 자기 클래스 vtable을 가리키는 vptr(포인터 하나 = 8바이트)이 숨어 들어간다. 데이터 멤버가 없어도 이 vptr 오버헤드가 존재한다.

> [!question]- "상속보다 조합"이 권장되는 근거는?
> 깊은 상속은 fragile base class(부모 변경이 자식들을 깨뜨림), 다이아몬드 문제, 강한 결합, 억지 is-a를 낳는다. 조합은 기능을 has-a로 가져 런타임 교체가 가능하고 결합이 낮다.

## 연습문제

> [!example]- 문제: 정적(비가상) 호출과 가상 호출을 비용 관점에서 나란히 추적하고, 어느 쪽이 인라인 가능한지 판정하라.
> 
> ```cpp
> a->staticMethod();   // 비가상
> a->virtualMethod();  // 가상
> ```
> 
> **풀이**
> 
> - staticMethod: 컴파일 타임에 `a`의 정적 타입으로 대상 주소가 확정 → 직접 호출. 작은 함수면 인라인 가능, 이후 상수 폴딩 등 추가 최적화도 열림.
> - virtualMethod: vptr 로드 → vtable 슬롯 로드 → 간접 호출(포인터 두 번 추적). 대상이 런타임에야 정해져 인라인 불가, 분기 예측도 어렵다.
> 
> 결론: 성능 차이의 핵심은 간접 점프 몇 사이클이 아니라 인라인/후속 최적화의 유무다.

> [!example]- 문제: C++·Java·Python이 같은 메서드 호출을 어떻게 디스패치하는지 의미론을 비교하라.
> 
> **풀이**
> 
> - C++: `virtual` 붙은 것만 vtable 경유, 비가상은 정적 → "제로 오버헤드 선택" 가능.
> - Java: 모든 메서드가 기본 가상(final 제외). 단 JIT가 단일 구현임을 확인하면 devirtualize해 정적화·인라인.
> - Python: 메서드를 객체/클래스의 딕셔너리에서 이름으로 조회(해시 룩업) → 가장 유연하지만 가장 느림.
> 
> 유연성이 높을수록 디스패치 비용이 커진다는 축을 보여준다.

## 파인만

> [!note]- Dog/Cat vtable과 객체의 vptr을 그림으로 그리고, `Animal* a = getDog(); a->sound();`가 "woof"를 부르기까지의 경로를 남에게 설명하듯 써보라. 이어서 왜 이 구조가 인라인을 막는지 덧붙여라.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) vptr과 vtable의 역할 구분, (2) 가상 호출 비용의 진짜 원인, (3) 상속의 어떤 문제를 조합이 푸나.

## 연결

- 가상 호출과 분기 예측 → computer-architecture/[[branch-prediction]]
- vtable 접근과 캐시 → computer-architecture/[[cache-misses]]
- 객체 메모리 레이아웃 → computer-architecture/[[data-layout]]
- 조합 선호 → software-design/[[composition-over-inheritance]]
- 제네릭 디스패치 → [[type-systems-advanced]]
- 동적 디스패치 = 간접 함수 호출 → computer-architecture/[[procedures-and-stack]]

## 궁금한 것 (나중에)

- [ ] JIT의 devirtualization과 인라인 캐시
- [ ] Rust의 dyn Trait (동적) vs 제네릭 (정적) 트레이드오프
- [ ] 다중 상속의 vtable 배치
- [ ] 프로토타입 기반 OOP (JavaScript)는 vtable이 없다?

## 출처

- "Inside the C++ Object Model" (Lippman), Crafting Interpreters (클래스 장)
