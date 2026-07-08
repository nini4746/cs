# 합의 문제 (Consensus Problem)

## 한 줄 요약

여러 노드가 하나의 값에 동의하는 문제. 부분 실패·네트워크 불확실성 때문에 놀랍도록 어렵고, FLP 정리는 비동기 시스템에서 완벽한 합의가 불가능함을 증명한다. 실용 알고리즘은 타임아웃으로 우회한다.

## 왜 필요한가

- 왜 노드들이 값 하나에 동의하는 게 어려운가
- 리더 선출·복제 순서·분산 락의 기반
- FLP 불가능성의 의미

## 합의 = 하나에 동의

여러 노드가 **하나의 값에 합의**:

- **리더 선출**: 누가 리더인가 ([[replication]]의 failover)
- **원자적 브로드캐스트**: 모두가 같은 순서로 메시지 받음
- **분산 락**: 누가 락을 쥐나
- **커밋 결정**: 트랜잭션 커밋하나 ([[distributed-transactions]])

이 모든 게 합의로 환원. 합의를 풀면 이것들이 풀림.

## 합의의 요건

올바른 합의:
- **동의(agreement)**: 모든 정상 노드가 같은 값 결정
- **유효성(validity)**: 결정된 값은 누군가 제안한 값
- **종료(termination)**: 정상 노드는 결국 결정 (진전)

## 왜 어려운가

부분 실패·불확실성([[why-distributed]]) 때문:

- 노드가 **죽었나 느린가** 구별 불가 → "죽었다 치고 진행"했는데 살아있으면?
- 메시지 손실·지연·재정렬 (network/[[tcp-reliability]])
- **split-brain**: 분할로 두 그룹이 각자 리더 선출 → 둘 다 자기가 리더라 믿음 → 재앙 ([[cap-theorem]])
- 동시성 (여러 노드가 동시 제안)

## FLP 불가능성

이론의 핵심 충격 결과 (Fischer-Lynch-Paterson, 1985):

**"비동기 시스템에서, 노드 하나라도 죽을 수 있으면, 항상 종료하는 합의 알고리즘은 존재하지 않는다."**

- **비동기**: 메시지 지연에 상한 없음 (현실 네트워크)
- 문제: "느린 노드"와 "죽은 노드"를 구별 못 함 → 영원히 기다리거나 틀리게 진행
- automata/[[decidability]]의 불가능성 증명과 같은 정신 (특정 문제는 원리적으로 불가)

**함의**: 완벽한 합의는 이론상 불가능. 그럼 실제 시스템은 어떻게?

## FLP 우회: 타임아웃

실용 알고리즘은 FLP를 **타임아웃으로 우회**:

- "일정 시간 응답 없으면 죽은 걸로 간주" (부분 동기 가정)
- 대부분의 경우 종료 (안전성은 항상, 활성은 대개)
- **안전성(safety) vs 활성(liveness)** 분리:
  - **안전성**: 절대 틀린 결정 안 함 (항상 보장) → automata/[[correctness-proofs]]
  - **활성**: 결국 결정함 (대개 보장, 최악엔 지연)
- FLP는 "항상 활성"이 불가능하다는 것 → 안전성은 포기 안 하고, 활성을 "대개"로 완화

## 과반수 (majority / quorum)

합의의 핵심 도구 - **과반수 동의**:

- N개 노드 중 **과반(N/2+1)**이 동의해야 결정
- **split-brain 방지**: 분할되면 과반은 한 쪽에만 가능 → 두 리더 불가
- 소수파는 진행 못 함 (가용성 희생 = CP [[cap-theorem]])
- N=5면 3개 동의, 2개까지 장애 견딤 ([[raft]])

## 실용 합의 알고리즘

FLP에도 불구하고 실제로 동작하는 (타임아웃 + 과반수):

- **Paxos**: 최초의 실용 합의 (Lamport). 정확하지만 이해 어려움 → [[paxos-overview]]
- **Raft**: 이해하기 쉽게 설계 (리더 선출 + 로그 복제) → [[raft]]
- **ZAB**(ZooKeeper), **Viewstamped Replication**

이들이 etcd, ZooKeeper, Consul의 기반 → [[coordination-services]].

## 연결

- 부분 실패 → [[why-distributed]]
- split-brain, CP → [[cap-theorem]]
- 안전성 증명 → algorithms/[[correctness-proofs]]
- 불가능성 (FLP) → automata/[[decidability]]
- Raft/Paxos → [[raft]], [[paxos-overview]]
- 조율 서비스 → [[coordination-services]]
- 분산 커밋 → [[distributed-transactions]]

## 궁금한 것 (나중에)

- [ ] FLP 증명의 직관 (bivalent 상태)
- [ ] 비잔틴 합의 (악의적 노드, BFT) - 블록체인
- [ ] 안전성 vs 활성 형식 정의
- [ ] 왜 과반수가 split-brain을 막나 (교집합)

## 출처

- FLP (1985), MIT 6.824, "DDIA" 9장
