# 구조적 동시성 (Structured Concurrency)

## 한 줄 요약

동시 작업의 수명을 코드 블록(스코프)에 묶어, 블록을 벗어나기 전에 모든 자식 작업이 끝나도록 강제하는 원칙. 제어 흐름이 없이 백그라운드로 새는 "go문"을 goto에 비유하며, 스코프로 취소·에러·정리를 자동 전파한다. 최신 동시성 API(Kotlin, Swift, Java, Trio)의 설계 방향.

## 왜 필요한가

- 시작한 비동기 작업이 어디서 끝나는지 왜 놓치나
- "go문이 goto다"는 무슨 뜻인가
- 취소·에러 전파를 어떻게 자동화하나

## 문제: 새는 동시성

전통 방식은 작업을 띄우면 **수명이 코드 구조와 분리됨**:

```
go doWork()        // Go: 고루틴 띄움 → 언제 끝나나? 에러는? 취소는? (아무도 모름)
executor.submit(f) // Java: 스레드풀에 던짐 → 부모는 그냥 진행
```

- **부모가 자식보다 먼저 끝남**: 함수가 반환됐는데 띄운 작업은 백그라운드에 남음
- **에러 유실**: 백그라운드 작업의 예외가 아무 데도 안 잡힘 (조용히 사라짐)
- **취소 누락**: 부모가 취소돼도 자식은 계속 (자원 누수)
- **정리 어려움**: 어떤 작업이 아직 도는지 추적 불가

## "go문은 goto다" (Nathaniel Smith)

구조적 프로그래밍이 goto를 없앤 것과 같은 논리:

```
goto: 제어가 아무 데로나 점프 → 흐름 추적 불가 → if/while/함수로 구조화 (Dijkstra)
go문: 동시 작업이 아무 데로나 샘 → 수명 추적 불가 → 스코프로 구조화
```

- 함수 호출이 **반드시 반환**하듯, 동시 작업도 **반드시 스코프 안에서 완료**되게
- "black box rule": 함수를 호출하면 그 안에서 띄운 모든 작업이 반환 전에 끝남 (밖으로 안 샘)

## 핵심 원칙: 스코프에 수명 묶기

```
nursery/scope 블록 {
    spawn task1
    spawn task2
}  // ← 이 지점에서 task1, task2가 모두 끝날 때까지 대기 (자동)
```

- 블록을 벗어나려면 **모든 자식이 완료**돼야 함 (fork-join의 강제 버전, [[parallel-patterns]])
- 부모-자식 수명이 **중첩(nested)** → 트리 구조 (제어 흐름처럼)

## 자동 전파 (3가지)

스코프가 있으면 공짜로 얻는 것:

- **에러 전파**: 자식 하나가 실패 → 스코프가 잡아서 부모로 (유실 없음). 보통 형제도 취소
- **취소 전파**: 부모 취소 → 모든 자식에 취소 신호 자동 전파 → 자원 정리
- **정리 보장**: 스코프 종료 = 모든 자식 종료 (누수 없음, RAII처럼)

```
자식 A 실패 → 스코프가 감지 → 형제 B 취소 → 부모로 에러 전파 → 정리
```

## 취소 (cancellation)

구조적 동시성의 핵심 난제를 다룸:

- **협력적 취소**: 취소는 신호일 뿐, 작업이 체크포인트에서 확인하고 정리 ([[async-and-coroutines]]의 협력 스케줄링)
- **취소 지점**: `await`·I/O 지점에서 취소 확인 (강제 중단은 상태 오염 위험)
- 타임아웃도 취소의 일종 (스코프에 시한)

## 언어별 채택

```
Python Trio:   nursery (구조적 동시성의 원조 구현)
Kotlin:        coroutineScope, structured concurrency 기본
Swift:         async let, task group (Swift 5.5+)
Java:          StructuredTaskScope (Java 21+ 프리뷰)
Go:            errgroup (부분적, 언어 기본은 아직 비구조적 go)
```

- 최신 언어일수록 **기본으로 구조적** (Kotlin/Swift) → 비구조적 실수 방지

## 왜 중요한가

- **동시성 버그 예방**: 누수·유실 에러·좀비 작업을 구조로 원천 차단 (규율이 아니라 설계로)
- **추론 가능**: 함수를 보면 그 안 동시성이 밖으로 안 샘 → 지역적 추론 (software-design/의 캡슐화)
- **동시성의 성숙**: 락→메시지→async를 거쳐 "수명 관리"까지 - 동시성 추상의 최신 진화
- 취소·타임아웃이 일급 시민 (실무 견고성)

## 연결

- fork-join의 강제 버전 → [[parallel-patterns]]
- 협력적 취소·async → [[async-and-coroutines]]
- 공유 회피와 함께 안전한 동시성 → [[message-passing]]
- 동시성 버그 → [[concurrency-vs-parallelism]]
- 지역적 추론·캡슐화 → software-design/[[coupling-cohesion]]

## 궁금한 것 (나중에)

- [ ] Trio의 nursery 상세 설계
- [ ] 취소 안전성 (cancellation safety) 패턴
- [ ] 구조적 동시성 + actor 모델 결합
- [ ] Go가 왜 아직 비구조적 go를 유지하나 (논쟁)

## 출처

- Nathaniel Smith "Notes on structured concurrency, or: Go statement considered harmful"(2018), Kotlin/Swift 문서
