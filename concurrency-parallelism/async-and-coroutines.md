# 비동기와 코루틴 (Async and Coroutines)

## 한 줄 요약

I/O 대기 중에 스레드를 놀리지 않고 다른 일을 하는 동시성 - 코루틴은 자발적으로 멈췄다 재개하는 함수이고, async/await는 그걸 문법으로 감싼 것. OS 스레드보다 훨씬 가벼워(수백만 개) I/O 병목 작업의 처리량을 극대화한다. 협력적 스케줄링이라 CPU 바운드엔 부적합.

## 왜 필요한가

- I/O 대기를 어떻게 낭비 없이 다루나
- async/await가 실제로 뭘 하나
- 왜 스레드 대신 코루틴인가 (C10K 문제)

## 문제: I/O 대기 낭비

```
동기 블로킹: 요청 → [네트워크/디스크 대기 100ms 놀고 있음] → 응답
스레드 하나가 대기 중 → 그 스레드 자원 낭비
동시 요청 1만 개 → 스레드 1만 개? (스택·스위칭 비용 폭발 - C10K 문제)
```

- I/O 바운드(대기 많음)에서 **대기 시간에 다른 일** 하면 처리량↑
- OS 스레드는 무겁다(스택 MB, 커널 스위칭) → 수만 개는 비쌈 (os/[[process-vs-thread]])

## 코루틴 (핵심)

**자발적으로 멈추고(suspend) 재개(resume)하는 함수**:

```
일반 함수: 호출 → 실행 → 반환 (한 번, 스택 소멸)
코루틴:    호출 → 실행 → 중단점에서 멈춤(상태 보존) → 나중에 재개
```

- **협력적(cooperative)**: 스스로 양보(`await`/`yield`)할 때만 중단 (OS가 강제 선점 안 함)
- 중단 시 **자기 상태를 힙에 보존** → 스택 하나로 수많은 코루틴 (경량)
- **스택풀(stackful)**: Go 고루틴·자체 스택 vs **스택리스(stackless)**: async/await·상태머신 변환

## async/await

코루틴을 문법으로 - **비동기 코드를 동기처럼**:

```python
async def fetch(url):
    data = await http_get(url)   # 여기서 중단, I/O 대기 동안 다른 코루틴 실행
    return process(data)          # I/O 끝나면 여기서 재개
```

- `await`: "여기서 멈춰도 됨, 결과 오면 재개해줘" → 이벤트 루프에 제어 양보
- 컴파일러가 async 함수를 **상태 기계**로 변환 (중단점마다 상태 저장) - 콜백 지옥을 문법으로 해결
- **동기처럼 읽히지만 논블로킹**: 콜백보다 읽기 쉬움

## 이벤트 루프

코루틴들을 굴리는 단일 스레드 스케줄러:

```
while 할 일 있음:
    준비된 코루틴 실행 → await 만나면 중단·등록 → 다음 준비된 것
    I/O 완료 이벤트(epoll/kqueue) → 해당 코루틴 재개 준비
```

- **단일 스레드로 수만 동시 연결**: JS 런타임, Python asyncio, Nginx가 이 모델
- OS의 I/O 다중화(epoll, os/[[io-multiplexing]]) 위에 구축
- web/[[javascript-event-loop]]이 바로 이것 (마이크로태스크·매크로태스크)

## 동시성 ≠ 병렬성 (여기 명확)

```
async/이벤트루프: 단일 스레드 동시성 (I/O 대기 겹침, 진짜 동시 실행 X)
멀티스레드:      진짜 병렬 (여러 코어)
```

- async는 **I/O 바운드**에 강함 (대기 겹치기), **CPU 바운드엔 무의미**(단일 스레드라 계산은 순차) → [[concurrency-vs-parallelism]]
- CPU 바운드는 스레드/프로세스/병렬([[parallel-patterns]]), I/O 바운드는 async
- 협력적이라 **한 코루틴이 양보 안 하면**(무거운 계산) 전체 멈춤 (이벤트 루프 블로킹 - web/의 흔한 버그)

## 코루틴 vs 스레드

```
OS 스레드: 선점형, 무거움(MB 스택), 커널 스위칭, 진짜 병렬 가능
코루틴:   협력형, 경량(KB 이하), 유저공간 스위칭, 단일 스레드(기본)
```

- Go는 둘을 결합: 고루틴(코루틴)을 여러 OS 스레드에 M:N 매핑 → 경량 + 병렬 ([[message-passing]])
- 수백만 고루틴/코루틴 가능 (스레드는 수만이 한계)

## 왜 중요한가

- **고동시성 서버**: 웹서버·API가 I/O 바운드 → async로 적은 자원에 많은 연결 (C10K/C10M)
- **현대 언어 표준**: JS·Python·Rust·Kotlin·C#이 async/await 채택
- **UI 반응성**: 메인 스레드 블로킹 없이 (web/, 모바일)

## 연결

- 동시성≠병렬성 → [[concurrency-vs-parallelism]]
- 스레드와 비교 → os/[[process-vs-thread]]
- I/O 다중화 기반 → os/[[io-multiplexing]]
- 브라우저 이벤트 루프 → web/[[javascript-event-loop]]
- 고루틴 M:N·채널 → [[message-passing]]
- CPU 바운드는 병렬로 → [[parallel-patterns]]

## 궁금한 것 (나중에)

- [ ] stackful vs stackless 코루틴 트레이드오프
- [ ] async 런타임 내부 (Tokio, 작업 훔치기)
- [ ] 함수 색칠 문제 (async 전염성)
- [ ] 구조적 동시성으로 취소 다루기 → [[structured-concurrency]]

## 출처

- "Concurrency in Go"(Cox-Buday), Python asyncio 문서, web/[[javascript-event-loop]]
