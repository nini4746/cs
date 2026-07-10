# Paxos 개요 (Paxos Overview)

## 한 줄 요약

최초의 증명된 실용 합의 알고리즘. 두 단계(prepare/accept)와 과반수로 하나의 값에 합의한다. 정확하지만 이해·구현이 어려워 Raft가 대안으로 나왔다. 개념 이해 수준으로.

## 왜 필요한가

- 합의 알고리즘의 원조 (Raft의 뿌리)
- 왜 "이해하기 어렵다"고 유명한가
- Raft와 비교

## Paxos = 합의의 원조

Lamport(1998)의 합의 알고리즘. 오랫동안 유일한 증명된 실용 합의 → Google, Microsoft 등이 사용. 하지만 **악명 높게 이해하기 어려움** → Raft([[raft]])가 "이해 가능성"을 목표로 나온 배경.

이 노트는 **개념 수준** (상세 증명은 어려움 - Raft를 실용 기준으로).

## 역할

세 역할 (한 노드가 여러 역할 겸할 수 있음):

- **Proposer**: 값을 제안
- **Acceptor**: 제안을 수락/거부 (과반이 핵심)
- **Learner**: 결정된 값을 학습

## 두 단계

Basic Paxos - 하나의 값에 합의:

### Phase 1: Prepare

```
Proposer → Acceptor들: "제안번호 n으로 준비" (Prepare(n))
Acceptor: n이 지금까지 본 것보다 크면
  → 약속(promise): "n보다 작은 제안 거부하겠다"
  → 이미 수락한 값 있으면 알려줌
```

### Phase 2: Accept

```
Proposer: 과반의 promise 받으면
  → 값 결정 (이미 수락된 값 있으면 그것, 없으면 자기 값)
  → "이 값을 수락해" (Accept(n, value))
Acceptor: n을 여전히 약속 중이면 수락
과반이 수락 → 값 결정됨
```

- **제안번호(n)**: 순서·최신성 (Raft의 term과 유사 [[raft]])
- **과반수**([[consensus-problem]]): 두 다른 값이 동시에 과반 못 얻음 (교집합) → 안전성
- **이미 수락된 값 존중**: 한 번 결정되면 바뀌지 않음 (안전성 핵심)

## 왜 어려운가

Paxos의 악명:

- **미묘한 불변식**: 왜 안전한지 직관적이지 않음 (증명은 우아하지만 이해 어려움)
- **Basic Paxos는 하나의 값만**: 실제론 여러 값의 연속(로그)이 필요 → **Multi-Paxos** (더 복잡)
- **틈이 많음**: 논문이 세부를 생략 → 구현마다 다르게 채움 ("Paxos Made Live"가 실제 구현의 어려움 토로)
- 리더·최적화를 명시 안 함 → 각자 알아서

이 어려움이 Raft의 존재 이유.

## Multi-Paxos

Basic Paxos는 값 하나 → 로그(연속된 값)엔 **Multi-Paxos**:

- 안정적 리더를 뽑아 Phase 1 생략 (리더가 계속 Phase 2만) → 효율
- Raft의 강한 리더와 비슷한 발상 (하지만 Raft가 더 명확히 구조화)

## Paxos vs Raft

| | Paxos | Raft |
|---|---|---|
| 목표 | 정확성 | 이해 가능성 |
| 구조 | 유연 (틈 많음) | 명확 (리더 중심) |
| 리더 | 암묵/최적화 | 명시적, 강함 |
| 로그 | Multi-Paxos 필요 | 내장 |
| 이해 | 어려움 | 쉬움 |
| 안전성 | 증명됨 | 증명됨 |

- 둘 다 **과반수 + 안전성 보장** (근본 같음)
- Raft가 실용 구현에 선호 (etcd 등 [[raft]])
- Paxos는 여전히 일부 시스템 (Google Chubby, Spanner 기반)

## 핵심 공통 원리

Paxos든 Raft든 합의의 본질은 같음 ([[consensus-problem]]):
- **과반수**로 split-brain 방지
- **순서 번호**(제안번호/term)로 최신성
- **한 번 결정된 값 존중**으로 안전성
- FLP 우회는 타임아웃

## 셀프 체크

> [!question]- Paxos의 세 역할과 두 단계는 무엇인가?
> 역할: Proposer(값 제안), Acceptor(수락/거부 - 과반이 핵심), Learner(결정된 값 학습). 한 노드가 여러 역할을 겸할 수 있다. 두 단계: Phase 1 Prepare(제안번호 n으로 준비 요청 → 과반의 promise 수집), Phase 2 Accept(과반 promise를 받으면 값을 정해 수락 요청 → 과반 수락 시 결정).

> [!question]- Phase 2에서 Proposer가 "자기 값"이 아니라 "이미 수락된 값"을 골라야 하는 이유는?
> 안전성 때문이다. 어떤 값이 이미 결정(과반 수락)됐을 수 있으므로, promise 응답에 담긴 기존 수락 값이 있으면 그것을 제안해야 한다. 이 "이미 수락된 값 존중" 규칙이 "한 번 결정된 값은 바뀌지 않는다"를 보장한다.

> [!question]- 과반수(majority)가 왜 안전성의 핵심인가?
> 두 개의 서로 다른 값이 동시에 각각 과반을 얻는 것은 불가능하다(두 과반은 반드시 교집합이 있어 최소 한 Acceptor가 겹침). 따라서 과반 규칙이 split-brain(두 값 동시 결정)을 막아 하나의 값에만 합의하도록 한다.

> [!question]- Paxos가 "이해하기 어렵다"고 악명 높은 이유 몇 가지는?
> 왜 안전한지 직관적이지 않은 미묘한 불변식, Basic Paxos가 값 하나만 다뤄 실제 로그엔 더 복잡한 Multi-Paxos가 필요, 논문이 리더·최적화 등 세부를 생략해 구현마다 다르게 채워야 함("Paxos Made Live"의 토로). 이 어려움이 Raft가 나온 배경이다.

> [!question]- Basic Paxos와 Multi-Paxos의 차이는?
> Basic Paxos는 하나의 값에 합의한다. 실제 시스템은 연속된 값(로그)이 필요하므로 Multi-Paxos를 쓴다. Multi-Paxos는 안정적 리더를 뽑아 Phase 1을 생략하고 리더가 계속 Phase 2만 수행해 효율을 높인다(Raft의 강한 리더와 유사한 발상).

## 연습문제

> [!example]- 문제: 서로 다른 Proposer가 각각 다른 값을 동시에 제안한다. 왜 결국 하나의 값만 결정되는지 과반수 논리로 추론하라.
> **풀이**
> 1. 값이 결정되려면 어떤 제안번호로 과반의 Acceptor가 Accept해야 한다.
> 2. 두 과반 집합은 반드시 하나 이상의 Acceptor를 공유한다(교집합).
> 3. 그 겹치는 Acceptor는 자신이 promise/accept한 최신 제안번호를 기억하므로 모순되는 두 결정을 동시에 뒷받침할 수 없다.
> 4. 또 나중 Proposer는 Prepare의 promise 응답에서 이미 수락된 값을 보게 되어, 그 값을 제안하도록 강제된다.
> 5. 따라서 한 번 과반으로 결정된 값이 있으면 이후 제안들도 같은 값으로 수렴한다 → 단일 값 합의(안전성).

> [!example]- 문제: 안정적 리더가 있던 Multi-Paxos에서 리더가 죽었다. 이후 어떻게 진행되며 안전성은 어떻게 유지되는지 시나리오를 추론하라.
> **풀이**
> 1. 리더가 죽으면 Phase 1을 생략하던 최적화가 깨지고, 새 Proposer가 더 큰 제안번호로 Phase 1(Prepare)을 다시 시작한다.
> 2. Prepare에 과반이 응답하며, 이미 수락된 값이 있으면 그 값을 알려준다.
> 3. 새 Proposer는 그 기존 수락 값을 Phase 2에서 제안해야 하므로(이미 수락된 값 존중), 리더 교체 중에도 결정된 값이 뒤집히지 않는다.
> 4. 과반 응답을 얻어 새 리더로 자리 잡으면 다시 Phase 1을 생략하고 Phase 2만 반복한다.
> 5. FLP 불가능성은 타임아웃으로 우회한다(리더 실패 감지 → 새 라운드). 안전성은 항상 유지되고 진행성만 지연될 수 있다.

> [!example]- 문제: 합의 알고리즘을 새로 도입하는데 Paxos와 Raft 중 무엇을 쓸지 판정하라. 근거를 대라.
> **풀이**
> 1. 두 알고리즘은 근본이 같다: 과반수로 split-brain 방지, 순서 번호(제안번호/term)로 최신성, 한 번 결정된 값 존중, FLP는 타임아웃으로 우회 - 안전성 모두 증명됨.
> 2. 차이는 목표다: Paxos는 정확성 지향이나 구조에 틈이 많고 리더가 암묵적이며 로그엔 Multi-Paxos가 필요하다. Raft는 이해 가능성을 목표로 명시적 강한 리더와 로그를 내장한다.
> 3. 팀이 새로 구현·운영해야 한다면 이해·구현이 쉬운 Raft를 택한다(etcd 등 실용 구현이 선호).
> 4. 이미 Paxos 기반 시스템(Google Chubby, Spanner 계열)을 확장·연동하는 상황이면 Paxos를 유지한다.
> 5. 판정: 신규 도입은 Raft가 무난, 기존 생태계 정합성이 중요하면 Paxos.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
>
> - 세 역할(Proposer/Acceptor/Learner)과 두 단계(Prepare/Accept)가 어떻게 하나의 값에 합의하는가.
> - 과반수 교집합과 "이미 수락된 값 존중"이 어떻게 안전성(단일 값, 결정 불변)을 보장하는가.
> - Paxos가 어려운 이유와 Multi-Paxos·Raft가 그 한계(값 하나, 틈, 리더 불명확)를 어떻게 보완하는가.

## 연결

- 합의 문제 → [[consensus-problem]]
- 실용 대안 Raft → [[raft]]
- 과반수 → [[consensus-problem]]
- 제안번호 = term → [[clocks]], [[raft]]
- 조율 서비스 → [[coordination-services]]
- 안전성 불변식 증명 → algorithms/[[correctness-proofs]]

## 궁금한 것 (나중에)

- [ ] Basic Paxos 안전성 증명
- [ ] Multi-Paxos 리더 최적화
- [ ] EPaxos (리더 없는 Paxos)
- [ ] "Paxos Made Simple/Live" 논문

## 출처

- Lamport "Paxos Made Simple", "Paxos Made Live" (Google), MIT 6.824
