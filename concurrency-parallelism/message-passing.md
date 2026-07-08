# 메시지 전달 (Message Passing)

## 한 줄 요약

공유 메모리를 락으로 지키는 대신 **아예 공유하지 않고 메시지로 통신**하는 동시성 모델. Actor(Erlang/Akka)는 독립 상태를 가진 액터가 비동기 메시지를 주고받고, CSP(Go 채널)는 채널로 스레드를 동기화한다. "메모리 공유로 통신하지 말고, 통신으로 메모리를 공유하라" - race의 근원인 공유 가변 상태를 제거하는 접근.

## 왜 필요한가

- 락 없이 공유 상태 문제를 어떻게 없애나
- Actor vs CSP 차이
- 왜 Erlang·Go가 동시성에 강한가

## 핵심 발상: 공유하지 않기

race의 근원은 **공유 가변 상태**([[concurrency-vs-parallelism]]):

```
공유 메모리 + 락:  상태를 공유하고 락으로 보호 (실수하면 race/deadlock)
메시지 전달:      상태를 공유 안 함, 메시지로만 소통 (race 원천 차단)
```

- Go 격언: **"Don't communicate by sharing memory; share memory by communicating"**
- 각 실행 단위가 **자기 상태만** 소유 → 동시 접근 자체가 없음 → 락 불필요
- 함수형 불변성(programming-languages/[[functional-programming]])과 같은 정신 (공유 가변 제거)

## Actor 모델 (Erlang, Akka)

**독립 액터 + 비동기 메시지**:

```
액터 = 자기 상태 + 메일박스 + 동작
- 다른 액터에 비동기 메시지 전송 (fire-and-forget)
- 한 번에 메시지 하나 처리 (내부는 순차 → 액터 내 락 불필요)
- 상태는 완전 격리 (다른 액터가 직접 못 만짐)
```

- **위치 투명성**: 액터가 같은 머신이든 다른 서버든 메시지는 같은 방식 → 분산으로 자연 확장 (distributed-systems/[[rpc]])
- **감독 트리(supervision)**: 액터 죽으면 부모가 재시작 - "let it crash" 철학 → 내결함성
- Erlang이 통신 교환기(99.9999999% 가용성)에 쓰인 이유
- 대가: 비동기라 흐름 추적 어려움, 메일박스 넘침 주의

## CSP 모델 (Go, occam)

**채널로 통신 + 동기화**:

```
고루틴(경량 스레드) + 채널(channel)
ch <- v    // 채널에 전송
v := <-ch  // 채널에서 수신
```

- **채널이 동기점**: 무버퍼 채널은 송신·수신이 만나야 진행 (rendezvous) → 동기화가 통신에 내장
- Actor와 차이: Actor는 액터에 이름(주소), CSP는 **채널에 이름** (익명 프로세스가 채널로)
- `select`로 여러 채널 대기 (다중화)
- Go의 고루틴은 수백만 개 가능 (경량, [[async-and-coroutines]]의 협력 스케줄링)

## Actor vs CSP

```
Actor: 비동기, 액터 주소로 전송, 메일박스 버퍼, 분산 친화 (Erlang/Akka)
CSP:   동기(기본), 채널로 전송, rendezvous, 단일 프로세스 내 주로 (Go)
```

- 둘 다 "공유 안 함"이지만 결합 방식이 다름 (액터 주소 vs 채널)
- Go는 실용적 절충 (채널 + 필요시 공유 메모리+뮤텍스도 허용)

## 장점과 한계

장점:
- **race/deadlock 원천 감소**: 공유 상태 없음 (락 실수 불가)
- **확장·분산**: 메시지는 프로세스·머신 경계 넘기 쉬움 (distributed-systems/)
- **내결함성**: 격리된 상태 → 하나 죽어도 격리 (Actor 감독)
- **추론 용이**: 각 단위가 순차적 (내부엔 동시성 없음)

한계:
- **성능 오버헤드**: 메시지 복사·큐잉 (공유 메모리 직접 접근보다 느릴 수 있음)
- **교착 가능**: 채널 순환 대기, 메일박스 넘침 (형태만 다른 deadlock)
- **전역 일관성 어려움**: 여러 액터에 걸친 원자적 작업은 여전히 복잡 (distributed-systems/[[distributed-transactions]])

## 왜 중요한가

- **동시성의 대안 패러다임**: 락과 근본적으로 다른 접근 (공유 회피 vs 공유 보호)
- **분산 시스템의 자연스러운 모델**: 메시지 전달이 곧 네트워크 통신 (distributed-systems/[[rpc]], [[message-queues]])
- **현대 언어 채택**: Go(CSP), Erlang/Elixir·Akka·Rust(actor 계열) → 실무 확산

## 연결

- 공유 가변 상태가 문제 → [[concurrency-vs-parallelism]]
- 불변성·공유 회피 → programming-languages/[[functional-programming]]
- 경량 스레드·협력 스케줄링 → [[async-and-coroutines]]
- 위치 투명성·분산 → distributed-systems/[[rpc]], [[message-queues]]
- 분산 원자성 한계 → distributed-systems/[[distributed-transactions]]

## 궁금한 것 (나중에)

- [ ] Erlang 감독 트리·핫 코드 스와핑 상세
- [ ] Go 채널 구현 (런타임 스케줄러)
- [ ] actor 모델의 형식 의미론 (Hewitt)
- [ ] CSP 대수 (Hoare, 정형 검증)

## 출처

- Hoare "CSP"(1978), Hewitt actor model, "Programming Erlang"(Armstrong), Go 문서
