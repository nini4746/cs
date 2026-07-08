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

## 연결

- 가상 호출과 분기 예측 → computer-architecture/[[branch-prediction]]
- vtable 접근과 캐시 → computer-architecture/[[cache-misses]]
- 객체 메모리 레이아웃 → computer-architecture/[[data-layout]]
- 조합 선호 → software-design/[[composition-over-inheritance]]
- 제네릭 디스패치 → [[type-systems-advanced]]

## 궁금한 것 (나중에)

- [ ] JIT의 devirtualization과 인라인 캐시
- [ ] Rust의 dyn Trait (동적) vs 제네릭 (정적) 트레이드오프
- [ ] 다중 상속의 vtable 배치
- [ ] 프로토타입 기반 OOP (JavaScript)는 vtable이 없다?

## 출처

- "Inside the C++ Object Model" (Lippman), Crafting Interpreters (클래스 장)
