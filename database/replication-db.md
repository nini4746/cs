# DB 복제 (Replication)

## 한 줄 요약

같은 데이터를 여러 서버에 복사해 가용성·읽기 성능·내구성을 높인다. 리더-팔로워가 기본이며, 복제 지연(lag)과 동기/비동기 트레이드오프가 핵심 문제다.

## 왜 필요한가

- 왜 데이터를 여러 서버에 복사하나
- 복제 지연이 왜 문제이고 어떤 이상을 낳나
- 동기 vs 비동기 복제 선택

## 왜 복제하나

한 서버의 한계를 넘기:

1. **가용성**: 한 서버 죽어도 복제본으로 계속 (fault tolerance) → distributed-systems/
2. **읽기 확장**: 읽기를 여러 복제본에 분산 (읽기 많은 웹)
3. **지리적 근접**: 사용자 가까운 복제본 (지연↓, [[cdn]]의 발상)
4. **내구성/백업**: 여러 사본으로 데이터 손실 방지

## 리더-팔로워 (leader-follower)

가장 흔한 구조 (master-slave, primary-replica):

```
쓰기 → 리더(leader) → 로그(WAL, [[recovery]])를 팔로워에 전송
                       ↓
읽기 ← 팔로워1, 팔로워2, ... (복제본)
```

- **쓰기는 리더만** (단일 지점 → 일관성 단순)
- **읽기는 아무 곳이나** (팔로워 분산 → 읽기 확장)
- 리더의 **로그([[recovery]])를 팔로워가 재생** → 복제. WAL이 복제의 기반
- 리더 죽으면 팔로워 중 하나를 승격(failover) → distributed-systems/[[consensus-problem]]

## 복제 지연 (replication lag)

핵심 문제: 팔로워가 리더보다 **뒤처짐**:

- 리더에 쓴 게 팔로워에 반영되기까지 시간차
- 사용자가 쓰고 바로 읽으면(다른 팔로워) → **자기가 쓴 게 안 보임** (read-your-writes 위반)
- distributed-systems/[[consistency-models]]의 eventual consistency 문제

이상 현상 (복제 지연이 낳는):
- **read-your-writes 위반**: 내가 쓴 걸 못 읽음
- **monotonic read 위반**: 새로고침하니 옛 데이터 (더 뒤처진 팔로워)
- 해결: 방금 쓴 사용자는 리더에서 읽기, 세션 고정 등

## 동기 vs 비동기 복제

리더가 팔로워 확인을 기다리나:

| | 동기(sync) | 비동기(async) |
|---|---|---|
| 커밋 | 팔로워 확인 후 | 즉시 (리더만) |
| 지연 | 느림 (대기) | 빠름 |
| 데이터 손실 | 없음 | 리더 죽으면 안 간 것 유실 |
| 가용성 | 팔로워 죽으면 막힘 | 계속 |

- **동기**: 안전하지만 느림, 팔로워 장애에 취약
- **비동기**: 빠르지만 리더 크래시 시 최근 쓰기 유실 가능
- **반동기(semi-sync)**: 하나만 동기 확인 (타협). 대부분 실무
- distributed-systems/[[cap-theorem]]의 일관성-가용성 트레이드오프가 여기 구체화

## 멀티 리더 / 리더리스

- **멀티 리더**: 여러 리더가 쓰기 받음 (다중 지역). **쓰기 충돌** 해결 필요 (같은 데이터를 두 리더에) → distributed-systems/[[replication]]
- **리더리스(Dynamo 스타일)**: 리더 없이 여러 노드에 쓰고 읽음, quorum으로 일관성 → Cassandra, DynamoDB → distributed-systems/[[consistency-models]]

복잡도↑ 하지만 다중 지역 쓰기·고가용성. 대부분 앱은 리더-팔로워로 충분.

## 실무 관점

- **읽기 확장**: 팔로워 추가로 읽기 부하 분산. 쓰기는 리더 한계
- **복제 지연 인지**: 쓰고 바로 읽는 UX는 리더 읽기나 지연 처리 필요
- **failover 자동화**: 리더 장애 감지·승격 (하지만 split-brain 주의 → distributed-systems/[[consensus-problem]])
- 분산 시스템 영역과 겹침 → distributed-systems/[[replication]]

## 연결

- 로그 기반 복제 → [[recovery]]
- 파티셔닝 (짝) → [[partitioning-db]]
- 일관성 모델 → distributed-systems/[[consistency-models]]
- CAP 트레이드오프 → distributed-systems/[[cap-theorem]]
- failover 합의 → distributed-systems/[[consensus-problem]]
- 지리적 근접 → [[cdn]]

## 궁금한 것 (나중에)

- [ ] 논리 복제 vs 물리 복제
- [ ] split-brain과 fencing
- [ ] 멀티 리더 충돌 해결 (LWW, CRDT)
- [ ] quorum 읽기/쓰기 (R+W>N) → distributed-systems/

## 출처

- CMU 15-445, "DDIA" 5장 (복제)
