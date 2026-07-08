# 파티셔닝 (Partitioning)

## 한 줄 요약

데이터를 여러 노드에 나누는 것 (database/[[partitioning-db]]의 분산 시스템 관점). consistent hashing으로 노드 변경 시 최소 재배치를 하고, 라우팅으로 "어느 노드에 있나"를 찾는다.

## 왜 필요한가

- database/[[partitioning-db]]의 분산 일반화
- consistent hashing이 왜 중요한가
- 요청을 어느 노드로 보내나 (라우팅)

## 복습: 왜 파티셔닝

database/[[partitioning-db]]: 데이터를 노드에 나눠 용량·쓰기 확장. 복제([[replication]])와 두 축. 이 노트는 **분산 시스템 메커니즘**에 집중 (consistent hashing, 라우팅, 리밸런싱).

## consistent hashing 상세

database/[[partitioning-db]]에서 소개한 것을 심화. 일반 해시(`% N`)의 문제:

```
node = hash(key) % N
N이 바뀌면 (노드 추가/삭제) → 거의 모든 키의 node가 바뀜 → 대량 재배치!
```

**consistent hashing**: 노드 변경 시 최소 재배치:

```
1. 해시 공간을 링(원)으로 (0 ~ 2^k)
2. 노드들을 링에 배치 (hash(노드id))
3. 키도 링에 배치 (hash(key))
4. 키는 링에서 시계방향 다음 노드에 저장
```

- 노드 추가 → 그 노드와 이전 노드 사이 키만 이동 (나머지 무관)
- 노드 삭제 → 그 노드의 키만 다음 노드로
- **재배치가 1/N로 제한** (전체 아님) → 확장 유연

### 가상 노드 (virtual nodes)

문제: 노드가 링에 균등 분포 안 되면 → 부하 불균형 (핫스팟 [[partitioning-db]])

해결: **각 물리 노드를 링에 여러 지점(가상 노드)으로**:
- 물리 노드 하나 = 링의 여러 위치
- 더 고른 분포, 노드 제거 시 부하가 여러 노드로 분산
- Cassandra, DynamoDB가 사용

## 라우팅: 어느 노드?

클라이언트가 "이 키가 어느 노드에 있나"를 찾는 법:

1. **클라이언트가 앎**: 클라이언트가 파티션 맵 보유 → 직접 라우팅 (Cassandra)
2. **라우팅 계층**: 프록시/코디네이터가 라우팅 (중간 계층)
3. **아무 노드에 요청 → 전달**: 받은 노드가 올바른 노드로 (gossip으로 맵 공유)

파티션 맵(어느 키 범위가 어느 노드)을 어떻게 최신으로 유지 → 조율 서비스([[coordination-services]])나 gossip.

## 리밸런싱

노드 추가/제거 시 재분배 (database/[[partitioning-db]]):

- **고정 파티션 수**: 파티션을 미리 많이(예: 1000개) 만들고 노드에 할당 → 노드 변경 시 파티션 통째 이동 (재해시 없음). Elasticsearch
- **consistent hashing**: 위 링 방식
- **온라인**: 서비스 중단 없이 (읽기/쓰기 계속하며 이동)
- 목표: 이동 최소 + 균등 유지

## 파티셔닝 + 복제

실무는 **둘을 조합** ([[replication]], database/[[partitioning-db]]):

```
각 파티션을 여러 노드에 복제:
  파티션1 → 노드A(리더), B, C(복제본)
  파티션2 → 노드B(리더), C, D
  ...
```

- 파티셔닝: 확장 (다른 데이터를 다른 노드)
- 복제: 가용성 (같은 파티션을 여러 노드)
- 각 파티션이 자기 리더·복제본 → 리더 분산 (부하 분산)

## 보조 인덱스 파티셔닝

파티션 키 외 다른 열로 검색 시 (database/[[index-usage]]):

- **로컬 인덱스**: 각 파티션이 자기 데이터의 인덱스 → 검색 시 모든 파티션 조회 (scatter-gather)
- **글로벌 인덱스**: 인덱스 자체를 파티셔닝 → 검색은 빠르지만 쓰기가 여러 파티션 갱신
- 트레이드오프 (읽기 vs 쓰기)

## 연결

- DB 파티셔닝 → database/[[partitioning-db]]
- 복제 (짝) → [[replication]]
- 해시 → data-structures/[[hash-tables]]
- 파티션 맵 조율 → [[coordination-services]]
- 리더 분산 → [[replication]]
- 보조 인덱스 → database/[[index-usage]]

## 궁금한 것 (나중에)

- [ ] gossip 프로토콜 (맵 전파)
- [ ] scatter-gather 쿼리 최적화
- [ ] 재파티셔닝(파티션 키 변경)의 어려움
- [ ] range vs hash 파티셔닝 실전 선택

## 출처

- MIT 6.824, "DDIA" 6장, Dynamo 논문 (consistent hashing)
