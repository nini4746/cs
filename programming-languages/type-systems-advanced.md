# 타입 시스템 심화 (Advanced Type Systems)

## 한 줄 요약

제네릭(타입 매개변수화)과 대수적 데이터 타입(합/곱 타입)이 핵심. 제네릭은 단형화(복사)냐 소거(공유)냐로 구현이 갈리고, ADT + 패턴 매칭은 불가능한 상태를 표현 불가능하게 만든다.

## 왜 필요한가

- 제네릭이 실제로 어떻게 구현되나 (성능 차이)
- Rust enum / Haskell 타입이 왜 강력한가
- 타입으로 버그를 원천 차단하는 법

## 제네릭 (parametric polymorphism)

타입을 **매개변수화** - 하나의 코드가 여러 타입에 동작:

```
List<T>       // T가 뭐든 리스트
fn max<T: Ord>(a: T, b: T) -> T
```

같은 로직(리스트, 정렬)을 타입마다 재작성 안 함. 타입 안전성 유지하며 재사용. 구현 방식이 두 갈래:

### 단형화 (monomorphization)

각 사용 타입마다 **코드를 복제**해서 특화:

```
List<int>, List<String> → 각각 별도 기계어 생성
```

- **빠름**: 타입별 특화 → 인라인·최적화 완전 (가상 호출 없음, computer-architecture/[[simd]] 벡터화 가능)
- **코드 팽창(bloat)**: 타입 조합마다 복제 → 바이너리 커짐, 컴파일 느림
- 언어: **Rust, C++ 템플릿**

### 타입 소거 (type erasure)

**하나의 코드**로 모든 타입 처리, 타입 정보는 런타임에 지움:

```
List<T> → 런타임엔 List<Object> (타입 정보 없음)
```

- **작은 코드**: 하나만 생성
- **느림**: 박싱(boxing), 가상 디스패치 필요 (computer-architecture/[[branch-prediction]])
- 언어: **Java 제네릭** (런타임에 `List<String>`이 `List`가 됨), TypeScript(컴파일 후 사라짐)

**Rust(단형화, 빠름·큼) vs Java(소거, 느림·작음)** - 같은 "제네릭"이 정반대 트레이드오프.

## 대수적 데이터 타입 (ADT)

타입을 대수적으로 조합. 두 종류:

### 곱 타입 (product): AND

여러 값을 **동시에** 가짐 (구조체, 튜플):

```
struct Point { x: i32, y: i32 }   // x AND y
```

가능한 값 수 = 각 필드 값 수의 **곱** (그래서 "곱 타입").

### 합 타입 (sum): OR

**여럿 중 하나** (Rust enum, Haskell data). 이게 진짜 강력:

```rust
enum Shape {
    Circle(f64),           // 반지름
    Rectangle(f64, f64),   // 너비, 높이
    Triangle(f64, f64, f64),
}
```

- Shape는 셋 **중 하나** → 가능한 값 = 각 변형의 **합**
- 각 변형이 다른 데이터를 담음
- **Option/Result가 이것**: `Option<T> = Some(T) | None`, `Result = Ok(T) | Err(E)` → [[error-handling-models]]

## 패턴 매칭 (pattern matching)

ADT를 분해하며 처리. 각 경우를 명시:

```rust
match shape {
    Circle(r) => 3.14 * r * r,
    Rectangle(w, h) => w * h,
    Triangle(a, b, c) => ...,
}
```

- **완전성 검사(exhaustiveness)**: 모든 변형을 다뤘는지 **컴파일러가 확인**. 하나 빠뜨리면 컴파일 오류
- 새 변형 추가 시 → 처리 안 한 곳 전부 컴파일 오류로 표시 → 안전한 확장
- if/switch보다 강력 (구조 분해 + 완전성)

## "불가능한 상태를 불가능하게"

ADT의 진짜 힘 = **잘못된 상태를 타입으로 배제**:

```
나쁨: struct Conn { connected: bool, error: Option<String>, data: Option<Data> }
     → connected=true인데 error도 있는 모순 상태 표현 가능

좋음: enum Conn { Connected(Data), Failed(String), Disconnected }
     → 모순 상태를 아예 표현 불가
```

타입이 유효한 상태만 허용 → 런타임 검사·버그 감소. "make illegal states unrepresentable" (F#/Rust 커뮤니티 격언).

## 그 밖의 개념

- **트레이트/타입클래스**: 타입에 인터페이스 부여 (Rust trait, Haskell typeclass, ad-hoc 다형성)
- **연관 타입, 고차 타입**: 더 표현력 있는 추상
- **의존 타입**: 값에 의존하는 타입 (배열 길이를 타입에) - Idris, Agda. 증명과 프로그램 통합

## 연결

- 정적 타입 기초 → [[static-vs-dynamic-typing]]
- Result/Option = 합 타입 → [[error-handling-models]]
- 단형화의 최적화 → computer-architecture/[[simd]]
- 소거의 가상 디스패치 → [[oop-under-the-hood]]
- 타입 검사 구현 → compilers/[[semantic-analysis]]

## 궁금한 것 (나중에)

- [ ] Hindley-Milner 타입 추론 → [[static-vs-dynamic-typing]]
- [ ] 트레이트 객체 vs 제네릭 (Rust dyn vs impl)
- [ ] GADT (일반화된 대수적 데이터 타입)
- [ ] 타입 레벨 프로그래밍

## 출처

- "Types and Programming Languages" (Pierce), Rust Book
