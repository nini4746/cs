# 에러 처리 모델 (Error Handling Models)

## 한 줄 요약

오류를 어떻게 표현하고 전파하나. 예외(던지고 잡기), 에러 값(Go의 다중 반환), Option/Result 타입(Rust) 세 계열이 있고, 각각 "오류를 무시하기 쉬운가/어려운가"의 트레이드오프가 다르다.

## 왜 필요한가

- try/catch vs `if err != nil` vs `?` 의 차이
- 왜 Rust는 예외가 없나
- 오류를 놓치는 버그를 언어가 어떻게 막나

## 계열 1: 예외 (exceptions)

오류 시 **던지고(throw)**, 호출 스택을 거슬러 올라가며 **잡는(catch)** 곳을 찾음:

```
try { risky(); }
catch (e) { handle(e); }
```

- **정상 경로가 깨끗함**: 오류 처리 코드가 본 흐름과 분리
- **자동 전파**: 안 잡으면 위로 계속 올라감 (호출 스택 언와인딩 → computer-architecture/[[procedures-and-stack]])
- 언어: Java, Python, C++, C#, JavaScript

단점:
- **보이지 않는 제어 흐름**: 어떤 함수가 뭘 던지는지 시그니처에 안 보임 (Java의 checked exception은 예외)
- **놓치기 쉬움**: catch 안 하면 크래시. 어디서 던지는지 추적 어려움
- 성능: 던질 때 스택 언와인딩 비용 (정상 경로는 보통 공짜)

## 계열 2: 에러 값 (error as value)

오류를 **일반 반환값**으로. Go의 다중 반환:

```go
result, err := doSomething()
if err != nil {
    return err   // 명시적으로 처리하거나 전파
}
```

- **명시적**: 오류가 반환값이라 눈에 보임. 시그니처에 드러남
- **처리 강제 아님**: err를 무시할 수 있음 (`_`로 버림) → 실수 가능
- **장황함**: `if err != nil`이 도처에. Go 비판의 단골
- 언어: Go, C(반환 코드), 옛 스타일

## 계열 3: Option/Result 타입 (대수적)

오류 가능성을 **타입에 인코딩**. Rust:

```rust
fn parse(s: &str) -> Result<i32, Error>   // 성공(Ok) 또는 실패(Err)
Option<T>   // 값(Some) 또는 없음(None) - null 대체
```

- **타입 시스템이 처리 강제**: `Result`를 그냥 못 씀 - 반드시 Ok/Err를 다뤄야 컴파일 ([[type-systems-advanced]]의 대수적 타입)
- **`?` 연산자**: 오류면 자동 조기 반환, 성공이면 값 추출 → Go의 장황함 없이 명시적
- **null 없음**: Option이 "값 없음"을 타입으로 → null 포인터 오류 원천 차단 (Tony Hoare의 "10억 달러 실수")
- 언어: Rust, Haskell(Maybe/Either), Swift(Optional), Kotlin(nullable)

```rust
let x = parse(s)?;   // 실패면 여기서 Err 반환, 성공이면 x에 값
```

## 세 모델 비교

| | 예외 | 에러 값 | Result/Option |
|---|---|---|---|
| 정상 경로 | 깨끗 | 장황 | 중간 (`?`) |
| 오류 가시성 | 숨음 | 보임 | 타입에 보임 |
| 처리 강제 | ✗ (놓침) | ✗ (무시 가능) | ✓ (컴파일러) |
| null 문제 | 있음 | 있음 | 없음 (Option) |
| 예 | Java, Python | Go | Rust, Haskell |

핵심 축: **오류를 놓치기 얼마나 쉬운가.** 예외는 조용히 전파되다 크래시, 에러 값은 무시 가능, Result는 컴파일러가 강제.

## panic vs 복구 가능 오류

대부분 언어가 두 종류를 구분:

- **복구 가능(recoverable)**: 파일 없음, 네트워크 실패 → Result/에러 값/checked exception. 처리 기대
- **복구 불가(panic/abort)**: 배열 범위 초과, 단언 실패, 버그 → Rust panic, Go panic, 언체크 예외. 보통 프로그램 종료
- Rust는 이 구분이 명확 (Result = 복구 가능, panic! = 버그)

## 실무 관점

- **예외 언어**: 예상 못 한 오류에 편하지만, 어디서 던지는지 문서화·주의 필요
- **Go**: 명시적이지만 장황 - 팀이 err 처리 규율 필요
- **Rust/Haskell**: 컴파일러가 강제해 안전하지만 학습 곡선
- 추세: null 없는 Option, Result 타입이 새 언어의 표준 (Swift, Kotlin, Rust) - "10억 달러 실수" 교훈

## 연결

- 대수적 데이터 타입 (Result) → [[type-systems-advanced]]
- 예외의 스택 언와인딩 → computer-architecture/[[procedures-and-stack]]
- 정적 타입이 오류 잡기 → [[static-vs-dynamic-typing]]
- 함수형의 Either → [[functional-programming]]

## 궁금한 것 (나중에)

- [ ] checked vs unchecked exception 논쟁 (Java)
- [ ] Result의 `?`가 into로 에러 변환하는 법
- [ ] 에러 처리와 성능 (예외 vs 분기)
- [ ] 효과 시스템(effect systems) - 오류를 효과로

## 출처

- 각 언어 레퍼런스, Rust Book (에러 처리)
