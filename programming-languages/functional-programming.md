# 함수형 프로그래밍 (Functional Programming)

## 한 줄 요약

불변 데이터와 순수 함수(부작용 없음)를 중심으로 프로그램을 짜는 패러다임. 함수를 값으로 다루고, 상태 변경 대신 변환을 조합한다. 추론·테스트·병렬화가 쉬워진다.

## 왜 필요한가

- 왜 불변성이 좋다고 하나
- map/filter/reduce가 루프보다 나은 경우
- 함수형 아이디어가 주류 언어에 스며든 이유

## 순수 함수 (pure functions)

FP의 핵심. **같은 입력 → 항상 같은 출력, 부작용 없음**:

```
순수: f(x) = x * 2           # 외부 상태 안 건드림, 입력만으로 결정
불순: 전역 변수 수정, I/O, 현재 시간 읽기, 랜덤
```

순수 함수의 이점:
- **추론 가능(referential transparency)**: `f(x)`를 그 결과로 대체 가능 → 수학처럼 논증
- **테스트 쉬움**: 입력→출력만 확인, 상태 설정 불필요
- **캐싱(메모이제이션)**: 같은 입력 결과 재사용 안전 → algorithms/[[dp-fundamentals]]
- **병렬 안전**: 공유 상태 없음 → 경쟁 조건 없음 (os/[[threads-and-races]] 회피)

## 불변성 (immutability)

데이터를 **바꾸지 않고 새 값을 만듦**:

```
가변: list.append(x)       # 원본 수정 → aliasing 위험 ([[value-vs-reference]])
불변: new_list = list + [x]  # 새 리스트, 원본 유지
```

- aliasing 버그 없음 ([[value-vs-reference]]의 함정 회피)
- 스레드 안전 (공유해도 안 바뀜)
- 시간 여행/실행 취소 쉬움 (옛 값 보존)
- 대가: 복사 비용 → **persistent 자료구조**(구조 공유)로 완화 (Clojure, Immutable.js)

## 함수가 일급 값 (first-class functions)

함수를 값처럼 다룸 - 변수에 담고, 전달하고, 반환:

- **고차 함수(higher-order)**: 함수를 받거나 반환하는 함수
- 클로저로 상태 캡처 → [[scope-and-closures]]

### map / filter / reduce

루프 대신 변환 조합:

```
map:    각 원소 변환      [1,2,3] → [2,4,6]
filter: 조건 통과만       [1,2,3,4] → [2,4]
reduce: 하나로 접기       [1,2,3,4] → 10 (합)
```

- **무엇을** 하는지 표현 (how가 아니라 what) → 선언적
- 루프의 인덱스·경계 버그 없음
- 체이닝: `data.filter(...).map(...).reduce(...)`
- 병렬화 자연스러움 (map은 독립 → computer-architecture/[[simd]], 분산 → distributed-systems/)

## 주요 개념

- **커링(currying)**: 다인자 함수를 단인자 함수 체인으로. `add(a)(b)`
- **부분 적용**: 일부 인자만 고정한 새 함수
- **합성(composition)**: `f ∘ g` = f(g(x)). 작은 함수를 조립
- **재귀**: 반복 대신 (불변성과 잘 맞음). 꼬리 재귀 최적화 → computer-architecture/[[procedures-and-stack]]
- **대수적 데이터 타입 + 패턴 매칭**: → [[type-systems-advanced]], [[error-handling-models]]의 Result

## 순수 FP 언어 vs 멀티패러다임

- **순수 FP**: Haskell (부작용을 타입으로 격리 - IO 모나드), 부작용조차 명시적
- **FP 지향**: Clojure, Elm, F#, OCaml, Erlang
- **FP 차용**: 거의 모든 현대 언어가 람다·map/filter·불변 옵션 도입 (JavaScript, Python, Java 8+, Rust, Swift)

FP가 순수하게 승리한 건 아니지만 **아이디어가 주류에 스며듦**: 불변성 선호, 고차 함수, 옵션 타입.

## 트레이드오프

| | 함수형 | 명령형 |
|---|---|---|
| 상태 | 불변, 변환 | 가변, 수정 |
| 추론 | 쉬움 (순수) | 상태 추적 필요 |
| 병렬 | 안전 | 락 필요 |
| 성능 | 복사 오버헤드 | 제자리 수정 빠름 |
| 학습 | 사고 전환 | 친숙 |

- FP: 동시성, 데이터 변환 파이프라인, 정확성 중요
- 명령형: 성능 극한, 상태 기계, 하드웨어 가까움

## 셀프 체크

> [!question]- 순수 함수란 무엇이고 왜 추론이 쉬운가?
> 같은 입력에 항상 같은 출력을 내고 부작용이 없는 함수다. referential transparency(참조 투명성)로 `f(x)`를 그 결과로 대체할 수 있어 수학처럼 논증 가능하고, 상태 설정 없이 입출력만 확인하면 테스트된다.

> [!question]- 불변성이 주는 이점과 그 대가, 그리고 완화책은?
> aliasing 버그가 없고 공유해도 안 바뀌어 스레드 안전하며 옛 값 보존으로 실행 취소가 쉽다. 대가는 매번 새 값을 만드는 복사 비용인데, 구조를 공유하는 persistent 자료구조(Clojure, Immutable.js)로 완화한다.

> [!question]- 일급 함수와 클로저는 어떤 관계인가?
> 함수를 값처럼 변수에 담고 전달·반환할 수 있으면(일급) 고차 함수가 가능하고, 함수가 정의 환경의 변수를 붙잡는 클로저가 자연히 필요해진다.

> [!question]- map/filter/reduce가 루프보다 나은 점은?
> "어떻게(how)"가 아니라 "무엇을(what)"을 표현하는 선언적 코드라 인덱스·경계 버그가 없다. 특히 map은 각 원소가 독립적이라 병렬화가 자연스럽다.

## 연습문제

> [!example]- 문제: 아래 함수들을 순수/불순으로 분류하고 불순한 이유를 대라.
> 
> ```
> a) f(x) = x * 2 + 1
> b) g(x): total += x; return total   # total은 전역
> c) h(lst): lst.sort(); return lst
> d) now(): return current_time()
> ```
> 
> **풀이**
> 
> - a) 순수 - 입력만으로 결정, 부작용 없음.
> - b) 불순 - 전역 total을 수정(부작용)하고 결과가 이전 호출에 의존.
> - c) 불순 - 인자 lst를 제자리 정렬해 원본을 변경(부작용). 순수하려면 정렬된 새 리스트 반환.
> - d) 불순 - 같은 입력에도 호출 시각마다 다른 출력. 외부 상태(시계) 읽음.

> [!example]- 문제: filter와 map을 각각 reduce(fold)만으로 구현하라.
> 
> **풀이**
> 
> ```
> map(f, xs)    = reduce((acc, x) => acc + [f(x)], xs, [])
> filter(p, xs) = reduce((acc, x) => p(x) ? acc + [x] : acc, xs, [])
> ```
> 
> reduce는 초기값(빈 리스트)에서 시작해 원소마다 누적기를 갱신한다. map은 항상 변환값을 추가, filter는 조건 통과 시에만 추가한다. reduce가 셋 중 가장 일반적인 접기 연산임을 보여준다.

## 파인만

> [!note]- "순수 함수 → 불변성 → 일급 함수 → map/filter/reduce"로 이어지는 FP의 뼈대를, 각 개념이 앞 개념에서 왜 따라오는지 남에게 설명하듯 써보라. 막히면 그 고리만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) referential transparency가 왜 병렬·테스트에 유리한가, (2) 불변성의 복사 비용을 어떻게 줄이나, (3) map이 왜 reduce로 표현되나.

## 연결

- 클로저 → [[scope-and-closures]]
- 불변성 vs aliasing → [[value-vs-reference]]
- Result/Either → [[error-handling-models]], [[type-systems-advanced]]
- 순수 함수 병렬 안전 → os/[[threads-and-races]]
- map의 병렬성 → computer-architecture/[[simd]]

## 궁금한 것 (나중에)

- [ ] 모나드가 실제로 뭔가 (IO, Maybe, List)
- [ ] persistent 자료구조 (구조 공유) 구현
- [ ] 꼬리 재귀 최적화가 언어마다 다른 이유
- [ ] 게으른 평가(lazy evaluation)의 장단

## 출처

- SICP, "Why Functional Programming Matters" (Hughes)
