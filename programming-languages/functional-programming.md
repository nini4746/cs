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
