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

## 연결

- 합의 문제 → [[consensus-problem]]
- 실용 대안 Raft → [[raft]]
- 과반수 → [[consensus-problem]]
- 제안번호 = term → [[clocks]], [[raft]]
- 조율 서비스 → [[coordination-services]]

## 궁금한 것 (나중에)

- [ ] Basic Paxos 안전성 증명
- [ ] Multi-Paxos 리더 최적화
- [ ] EPaxos (리더 없는 Paxos)
- [ ] "Paxos Made Simple/Live" 논문

## 출처

- Lamport "Paxos Made Simple", "Paxos Made Live" (Google), MIT 6.824
