# 스코프와 클로저 (Scope and Closures)

## 한 줄 요약

스코프는 이름이 어디서 보이나의 규칙. 렉시컬 스코프(정의된 위치 기준)가 표준이다. 클로저는 함수가 정의 환경의 변수를 붙잡고 다니는 것 - 함수가 값이 되면서 생기는 자연스러운 결과.

## 왜 필요한가

- 변수가 어디서 보이고 어디서 안 보이나
- 클로저가 실제로 뭘 캡처하나 (값? 변수?)
- 루프에서 클로저 만들 때 흔한 버그

## 스코프: 이름의 가시 범위

**스코프** = 어떤 이름(변수)이 유효한 코드 영역. 두 방식:

- **렉시컬 스코프(lexical/static)**: **코드가 작성된 위치**로 결정. 안쪽 함수가 바깥 변수 참조. 거의 모든 현대 언어
- **동적 스코프(dynamic)**: **호출 시점의 콜 스택**으로 결정. 드묾 (일부 Lisp, 셸)

```
렉시컬: 함수를 어디서 정의했나 → 그 바깥 변수 참조
동적: 함수를 어디서 호출했나 → 호출자의 변수 참조
```

렉시컬이 표준인 이유: 코드만 보면 어떤 변수를 참조할지 알 수 있음 (호출 경로 몰라도). 추론·최적화 쉬움.

## 클로저: 환경을 붙잡은 함수

**클로저** = 함수 + 그 함수가 정의된 환경(캡처한 변수들). 함수가 바깥 스코프의 변수를 쓰면, 그 변수를 **붙잡고 다님** (바깥 함수가 끝나도):

```python
def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc      # inc가 count를 붙잡음
```

실측:
```
c1 = make_counter(); c1() c1() c1() → 1 2 3   # count 유지
c2 = make_counter(); c2() → 1                   # 독립된 count!
```

- `make_counter`가 반환된 후에도 `inc`가 `count`에 접근 → count가 살아있음 (스택에서 안 사라짐)
- 호출마다 **독립된 환경** → c1과 c2의 count가 별개
- 클로저 = 상태를 가진 함수. 객체의 원시 형태 (데이터 + 동작)

## 왜 클로저가 생기나

함수가 **일급 값(first-class)**이면 (변수에 담고, 반환하고, 전달) 자연히 클로저가 필요:

- 함수를 반환하면 그 함수의 바깥 변수가 반환 후에도 살아야 함
- → 그 변수를 힙에 유지 (스택 프레임이 사라져도) → computer-architecture/[[procedures-and-stack]]
- 클로저 = "함수가 값이 되는 언어"의 필연

## 캡처: 값인가 변수인가 (핵심 함정)

클로저가 **변수를 캡처**하나, **값을 캡처**하나? 대부분 언어는 **변수(참조)를 캡처** → 나중에 그 변수가 바뀌면 클로저도 바뀐 값을 봄. 유명한 루프 버그:

```python
funcs = [lambda: i for i in range(3)]
[f() for f in funcs]   # → [2, 2, 2]  (0,1,2 아님!)
```

실측대로 `[2, 2, 2]`. 이유:
- 세 람다가 **같은 변수 i를 캡처** (값 아님)
- 루프 끝나면 i=2 → 나중에 호출하니 전부 2를 봄 (**late binding**)

해결 - 각 반복의 값을 붙잡기:
```python
funcs = [lambda i=i: i for i in range(3)]   # 기본값으로 값 캡처
[f() for f in funcs]   # → [0, 1, 2]
```

JavaScript의 `var` vs `let`도 같은 문제 (`var`는 함수 스코프라 공유, `let`은 반복마다 새 바인딩). 클로저를 루프에서 만들 때 항상 주의.

## upvalue와 구현

클로저가 캡처한 변수 = **upvalue**. 구현:

- 스택에 있던 변수가 클로저에 캡처되면 힙으로 옮김(closed upvalue) → compilers/[[bytecode-vm]]
- 여러 클로저가 같은 변수를 공유하면 같은 upvalue 참조 (위 [2,2,2]의 원인)
- Lua/Crafting Interpreters의 upvalue 구현이 대표적

## 어디에 쓰나

- **콜백/이벤트 핸들러**: 컨텍스트를 붙잡은 함수
- **함수 팩토리**: 설정을 캡처한 함수 생성 (make_counter)
- **데이터 은닉**: 클로저로 private 상태 (모듈 패턴)
- **함수형 프로그래밍**: 부분 적용, 커링 → [[functional-programming]]

## 연결

- 함수가 값 → [[functional-programming]]
- 스택→힙 캡처 → computer-architecture/[[procedures-and-stack]]
- upvalue 구현 → compilers/[[bytecode-vm]]
- 스코프 해석 (컴파일러) → compilers/[[semantic-analysis]]
- 값/참조 의미론 → [[value-vs-reference]]

## 궁금한 것 (나중에)

- [ ] closed upvalue로 옮기는 정확한 시점
- [ ] JavaScript let이 반복마다 새 바인딩 만드는 법
- [ ] 클로저와 GC (순환 참조) → [[garbage-collection]]
- [ ] 동적 스코프가 유용한 드문 경우

## 출처

- Crafting Interpreters (클로저, upvalue 장)
