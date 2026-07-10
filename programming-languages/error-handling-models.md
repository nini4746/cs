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

## 셀프 체크

> [!question]- 세 에러 처리 계열을 가르는 핵심 축은 무엇인가?
> "오류를 놓치기 얼마나 쉬운가"이다. 예외는 안 잡으면 조용히 전파되다 크래시, 에러 값은 `_`로 무시 가능, Result/Option은 컴파일러가 Ok/Err 처리를 강제한다.

> [!question]- Rust에 예외가 없는데도 오류를 안전하게 다루는 방식은?
> 오류 가능성을 Result<T, E>/Option<T> 타입에 인코딩한다. Result를 그냥 값으로 못 쓰고 반드시 Ok/Err를 다뤄야 컴파일되므로 처리가 강제된다. 복구 불가한 버그는 panic!으로 구분한다.

> [!question]- `?` 연산자는 무엇을 하나?
> Result/Option에 대해 성공이면 값을 추출하고, 실패면 그 자리에서 Err/None을 조기 반환한다. Go의 `if err != nil` 장황함 없이 명시적 전파를 표현한다.

> [!question]- recoverable 오류와 panic(abort)의 차이는?
> recoverable은 파일 없음·네트워크 실패처럼 처리가 기대되는 것(Result/에러 값/checked exception)이고, panic은 배열 범위 초과·단언 실패 같은 버그로 보통 프로그램을 종료한다.

## 연습문제

> [!example]- 문제: 아래 Rust 함수 체인을 `?` 없이 match만으로 풀어 쓰고, 두 버전의 제어 흐름을 비교하라.
> 
> ```rust
> fn run(s: &str) -> Result<i32, Error> {
>     let n = parse(s)?;
>     let v = check(n)?;
>     Ok(v * 2)
> }
> ```
> 
> **풀이**
> 
> ```rust
> fn run(s: &str) -> Result<i32, Error> {
>     let n = match parse(s) { Ok(n) => n, Err(e) => return Err(e) };
>     let v = match check(n) { Ok(v) => v, Err(e) => return Err(e) };
>     Ok(v * 2)
> }
> ```
> 
> `?`는 각 단계에서 "성공이면 언랩, 실패면 early return Err"을 축약한 것이다. 의미는 동일하고 `?`가 장황함만 제거한다. (엄밀히 `?`는 Err에 `From::from`을 적용해 에러 타입 변환도 한다.)

> [!example]- 문제: "0으로 나누기"를 예외/에러 값/Result 세 언어로 표현하고, 호출자가 오류를 무시했을 때 각각 어떻게 되는지 비교하라.
> 
> **풀이**
> 
> - 예외(Python): `a/b`가 `ZeroDivisionError`를 던짐. 호출자가 try 없으면 스택을 타고 올라가다 크래시 - 무시가 "조용히" 되지 않고 터진다.
> - 에러 값(Go): `q, err := div(a,b)`; 호출자가 `err`를 `_`로 버리면 잘못된 `q`로 그냥 진행된다 - 무시가 가능하고 위험하다.
> - Result(Rust): `div(a,b) -> Result<i32,E>`; 결과를 안 다루면 unused 경고, 언랩하려면 반드시 Err를 처리해야 해 컴파일러가 강제한다.
> 
> 결론: 같은 오류라도 "무시 난이도"가 계열마다 다르다.

## 파인만

> [!note]- 세 에러 처리 계열을 표로 그리고(정상 경로 깨끗함 / 오류 가시성 / 처리 강제 / null 문제), 각 칸을 남에게 설명하듯 채워보라. 막히면 그 계열만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) 왜 예외는 "숨은 제어 흐름"인가, (2) Option이 어떻게 null을 원천 차단하나, (3) `?`가 Go 대비 무엇을 개선하나.

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
