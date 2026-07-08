# CAP 정리 (CAP Theorem)

## 한 줄 요약

네트워크 분할(P)이 일어나면 일관성(C)과 가용성(A) 중 하나만 택할 수 있다. "셋 중 둘"이라는 흔한 설명은 오해 - 분할은 선택이 아니라 현실이므로 실제 선택은 C냐 A냐다.

## 왜 필요한가

- CAP의 정확한 의미 (흔한 오해 바로잡기)
- 분할 시 무엇을 포기하나
- 시스템 선택의 프레임

## CAP 세 속성

- **C (Consistency)**: 모든 노드가 같은 최신 데이터 (여기선 linearizable [[consistency-models]])
- **A (Availability)**: 모든 요청이 (성공/실패) 응답받음 (죽지 않음)
- **P (Partition tolerance)**: 네트워크 분할(노드 간 통신 끊김)에도 동작

## 흔한 오해: "셋 중 둘"

"CAP = 셋 중 둘 고르기"는 **부정확**. 진실:

- **네트워크 분할(P)은 선택이 아니라 현실**: 분산 시스템에서 네트워크는 언젠가 끊김 ([[why-distributed]]의 오류 1번). P를 "포기"할 수 없음
- 따라서 실제 선택은 **분할이 일어났을 때 C냐 A냐**:

```
분할 발생 → 노드들이 서로 못 봄
  선택 1 (CP): 일관성 유지 → 일부 노드가 응답 거부 (가용성 포기)
  선택 2 (AP): 가용성 유지 → 각자 응답하되 값이 다를 수 있음 (일관성 포기)
```

**CAP = 분할 시 C와 A 중 택일**. 분할 없을 땐 둘 다 가능.

## CP vs AP

### CP (일관성 우선)

분할 시 **일관성 유지, 가용성 희생**:
- 최신 데이터를 보장 못 하면 **응답 거부** (에러)
- 예: 은행 잔액 - 틀린 값 주느니 에러
- 합의 기반 시스템 (etcd, ZooKeeper, [[consensus-problem]]), 강한 일관성 DB
- 소수파(minority) 노드는 응답 안 함 (과반만 진행)

### AP (가용성 우선)

분할 시 **가용성 유지, 일관성 희생**:
- 최신 아닐 수 있어도 **응답함** (stale 가능)
- 나중에 수렴 (eventual consistency [[consistency-models]])
- 예: 소셜 피드, 장바구니 - 잠깐 틀려도 응답이 중요
- Cassandra, DynamoDB ([[replication]]의 리더리스)

## PACELC: CAP의 확장

CAP는 분할 시만 다룸 → **PACELC**가 정상 시도:

```
if Partition:  C vs A  (CAP)
Else:          Latency vs Consistency
```

- **정상 시에도** 일관성과 지연의 트레이드오프 존재
- 강한 일관성 = 노드 조율 = 지연↑ (분할 없어도)
- 예: Spanner는 PC/EC (일관성 우선, 지연 감수), Dynamo는 PA/EL (가용성·저지연)
- CAP보다 완전한 그림 (대부분 시간은 분할 없으니 EL/EC가 실제로 더 중요)

## 오해 정리

- **"NoSQL은 AP, SQL은 CP"** → 틀림. 설정 가능한 것 많음 (quorum [[replication]])
- **"CAP 중 둘"** → 분할 시 C/A 택일이 정확
- **"C = ACID의 C"** → 다름 (CAP의 C는 linearizability, ACID의 C는 무결성 database/[[transactions-acid]])
- **분할 없을 땐** C와 A 둘 다 (CAP는 분할 시에만)

## 실무 함의

- **분할은 드물지만 반드시 일어남** → 그때 어떻게 동작할지 미리 결정
- **부분적 선택**: 시스템 전체가 아니라 연산별로 (결제는 CP, 조회는 AP)
- **대부분 시간(정상)**: PACELC의 지연-일관성이 더 자주 문제
- 요구사항(일관성 필수? 가용성 필수?)이 선택을 정함

## 연결

- 분할은 현실 → [[why-distributed]]
- 일관성 수준 → [[consistency-models]]
- 리더리스 quorum (AP 조절) → [[replication]]
- CP는 합의 → [[consensus-problem]]
- ACID의 C와 다름 → database/[[transactions-acid]]

## 궁금한 것 (나중에)

- [ ] Spanner가 CAP를 "우회"하는 법 (TrueTime + 고가용 네트워크)
- [ ] PACELC로 실제 시스템 분류
- [ ] 분할을 실제로 감지·처리하는 법
- [ ] Harvest and Yield (부분 응답)

## 출처

- Brewer CAP (2000), Gilbert-Lynch 증명, Abadi PACELC
