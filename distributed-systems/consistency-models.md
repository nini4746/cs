# 일관성 모델 (Consistency Models)

## 한 줄 요약

복제된 데이터에서 "어떤 값을 볼 수 있나"의 보장 수준. 강한 순서(linearizable)부터 약한(eventual)까지 스펙트럼이며, 강할수록 이해 쉽지만 느리고 가용성이 낮다.

## 왜 필요한가

- "eventual consistency"가 정확히 뭔가
- linearizable이 왜 비싼가
- 어떤 일관성을 선택하나

## 문제: 복제본이 다를 수 있다

복제([[replication]])하면 노드마다 값이 다를 수 있음 (지연, 충돌). "클라이언트가 무엇을 볼 수 있나"의 보장 = 일관성 모델. **강함(엄격) ↔ 약함(느슨)** 스펙트럼.

## Linearizability (선형성) - 가장 강함

**모든 연산이 하나의 시간선에 있는 것처럼**:

- 쓰기가 완료되면 → 이후 모든 읽기가 그 값(또는 더 최신)을 봄
- 마치 데이터가 **한 대에 있는 것처럼** 동작 (복제가 안 보임)
- "실시간 순서" 보장 - a가 b보다 실제로 먼저 끝났으면 모두가 그 순서로 봄

대가:
- **비쌈**: 노드 간 조율 필요 (모두가 최신 동의) → 지연↑
- **가용성 희생**: 네트워크 분할 시 일부 노드는 응답 못 함 ([[cap-theorem]]의 CP)
- 합의([[consensus-problem]])가 필요한 수준

## Sequential Consistency (순차 일관성)

- 모든 노드가 **같은 순서**로 연산을 봄 (하지만 실시간 순서는 아닐 수도)
- linearizable보다 약함 (실시간 제약 없음)

## Causal Consistency (인과 일관성)

**인과 관계 있는 것만 순서 보장** ([[clocks]]의 happened-before):

- a → b (인과)면 모두가 a를 b보다 먼저 봄
- **동시(concurrent) 연산은 순서 자유** (노드마다 다르게 봐도 됨)
- 예: 댓글(질문 → 답변)은 순서 보장, 무관한 두 글은 자유
- linearizable보다 **약하지만 훨씬 쌈** (동시 연산 조율 불필요) → 많은 경우 충분

## Eventual Consistency (최종 일관성) - 가장 약함

**쓰기가 멈추면 결국 모든 노드가 수렴**:

- "결국(eventually)" 같아짐 - 하지만 **언제인지 보장 없음**
- 그 사이 노드마다 다른 값 볼 수 있음 (stale read)
- database/[[replication-db]]의 복제 지연이 이것
- **매우 쌈·고가용성**: 노드 간 조율 최소 → 빠름, 분할에도 응답 ([[cap-theorem]]의 AP)
- 예: DNS(network/[[dns]] TTL), Cassandra 기본, 소셜 피드

이상 현상:
- **read-your-writes**: 내가 쓴 걸 못 읽음 (database/[[replication-db]])
- **monotonic reads**: 새로고침하니 옛날 값
- 세션 보장으로 완화

## 스펙트럼

```
강함 ←──────────────────────────────→ 약함
linearizable > sequential > causal > eventual
느림·저가용성                        빠름·고가용성
이해 쉬움                            이상 현상 주의
```

## 선택: 강 vs 약

- **강한 일관성**: 은행 잔액, 재고, 유일성 제약 - 틀리면 안 되는 것. 대가로 지연·가용성
- **약한 일관성**: 좋아요 수, 피드, 캐시 - 잠깐 틀려도 OK. 빠름·고가용
- **인과 일관성**: 많은 경우의 실용적 중간 (대화, 협업)

CAP([[cap-theorem]])의 트레이드오프가 구체화 - 강함=CP, 약함=AP.

## 트랜잭션 격리 vs 일관성 모델

혼동 주의:
- **격리 수준**(database/[[concurrency-control]]): 트랜잭션 간 (serializable 등)
- **일관성 모델**(이 노트): 복제본 간 (linearizable 등)
- 둘은 다른 축 (하나는 동시성, 하나는 복제). "consistency"라는 단어가 겹쳐 헷갈림
- **strict serializable** = serializable + linearizable (둘 다 최강)

## 연결

- 복제 → [[replication]], database/[[replication-db]]
- 인과성 → [[clocks]]
- CAP 트레이드오프 → [[cap-theorem]]
- 강한 일관성 = 합의 → [[consensus-problem]]
- 격리 수준 (다른 축) → database/[[concurrency-control]]
- eventual 예 (DNS) → network/[[dns]]

## 궁금한 것 (나중에)

- [ ] 세션 보장 (read-your-writes 등) 구현
- [ ] CRDT와 강한 최종 일관성
- [ ] linearizability 검증 (Jepsen 테스트)
- [ ] 일관성 모델 계층 지도 (jepsen.io)

## 출처

- MIT 6.824, "DDIA" 9장, Jepsen
