# Raft

## 한 줄 요약

이해하기 쉽게 설계된 합의 알고리즘. 리더 선출 + 로그 복제 두 부분으로 나누고, 과반수와 term으로 안전성을 보장한다. etcd·Consul의 기반이며 MIT 6.824의 핵심.

## 왜 필요한가

- 합의([[consensus-problem]])를 실제로 어떻게 구현하나
- 리더 선출·로그 복제의 동작
- Paxos보다 이해하기 쉬운 이유

## 설계 목표: 이해 가능성

Paxos([[paxos-overview]])가 정확하지만 이해·구현이 어려움 → Raft는 **이해 가능성(understandability)**을 명시적 목표로:

- 문제를 **분해**: 리더 선출 + 로그 복제 + 안전성
- 강한 리더 (모든 것이 리더 통해)
- 상태를 최소화

## 노드 상태

각 노드는 세 상태 중 하나 (automata/[[dfa-nfa]]의 상태 머신):

```
Follower → (타임아웃) → Candidate → (과반 득표) → Leader
                          ↓ (다른 리더 발견)
                        Follower
```

- **Follower**: 리더의 지시 따름 (기본)
- **Candidate**: 리더 선출 시도 중
- **Leader**: 모든 쓰기 처리, 로그 복제

## term (임기)

**논리적 시간** ([[clocks]]의 논리 시계와 유사):

- 각 term = 한 번의 리더 선출 + 그 리더의 통치 기간
- term 번호가 계속 증가 → "누가 최신인가" 판단
- 오래된 term의 리더는 자동 물러남 (더 높은 term 발견 시)
- split-brain 방지: 한 term엔 최대 한 리더 (과반 득표라 [[consensus-problem]])

## 1. 리더 선출

```
1. Follower가 리더의 heartbeat를 타임아웃 동안 못 받음
   → "리더 죽었나?" → Candidate로
2. term++ 하고 자신에게 투표, 다른 노드에 투표 요청
3. 과반수 득표 → Leader (heartbeat 시작)
4. 다른 Candidate가 이기면 → Follower로
```

- **랜덤 타임아웃**: 여러 Follower가 동시에 Candidate 되는 것 방지 (각자 다른 시점에 시도) → 대개 한 명만
- **과반수**([[consensus-problem]]): 한 term에 한 리더 보장 (과반은 겹치니 두 명 불가)
- 분할되면 소수파는 리더 못 뽑음 (과반 못 채움) → CP ([[cap-theorem]])

## 2. 로그 복제

리더가 정해지면 (database/[[recovery]]의 로그와 유사):

```
1. 클라이언트 요청 → 리더가 로그에 추가 (아직 미커밋)
2. 리더가 Follower들에 로그 복제 (AppendEntries)
3. 과반수가 복제 확인 → 리더가 그 엔트리 commit
4. 커밋된 엔트리를 상태 머신에 적용 → 클라이언트 응답
5. Follower들도 순서대로 적용
```

- **과반수 복제 = 커밋**: 과반이 가지면 안전 (리더 죽어도 과반 중에서 다음 리더 나옴)
- 모든 노드가 **같은 순서로 로그 적용** → 같은 상태 (replicated state machine)

## 안전성 보장

Raft가 절대 틀리지 않는 이유 (안전성 [[consensus-problem]]):

- **선출 제약**: 최신 로그를 가진 후보만 리더 될 수 있음 (뒤처진 노드가 리더 되면 데이터 유실)
- **커밋된 것은 유지**: 과반이 가진 엔트리는 다음 리더도 반드시 가짐 (과반 교집합)
- **로그 일치**: 같은 인덱스·term의 엔트리는 같은 내용 → 로그가 갈라지면 리더 것으로 맞춤

## 장애 내성

- N개 노드 → **과반(N/2+1)**만 살아있으면 동작
- N=5 → 2개 장애 견딤, N=3 → 1개
- 홀수가 효율적 (4개나 5개나 2장애까지 - 5개가 나음)

## 어디에 쓰나

- **etcd**: 쿠버네티스의 상태 저장 (devops/[[kubernetes-basics]])
- **Consul**: 서비스 디스커버리
- **CockroachDB, TiDB**: 분산 SQL (database/[[nosql-landscape]]의 NewSQL)
- **조율 서비스** 일반 → [[coordination-services]]

## 연결

- 합의 문제·FLP → [[consensus-problem]]
- 상태 머신 → automata/[[dfa-nfa]]
- term = 논리 시계 → [[clocks]]
- 로그 복제 → [[replication]], database/[[recovery]]
- CP (분할 시) → [[cap-theorem]]
- Paxos 비교 → [[paxos-overview]]
- 조율 서비스 → [[coordination-services]]
- etcd/k8s → devops/[[kubernetes-basics]]

## 궁금한 것 (나중에)

- [ ] 로그 불일치 복구 상세 (nextIndex 되감기)
- [ ] 스냅샷 (로그 압축)
- [ ] 멤버십 변경 (노드 추가/삭제)
- [ ] MIT 6.824 Raft 구현 (Lab 2)

## 출처

- Raft 논문 (Ongaro & Ousterhout, "In Search of an Understandable..."), MIT 6.824
