# 조율 서비스 (Coordination Services)

## 한 줄 요약

ZooKeeper·etcd 같은 조율 서비스는 합의(Raft/Paxos)를 내장해 분산 락·리더 선출·설정 저장·서비스 디스커버리를 제공한다. 합의를 직접 구현하지 말고 이들에 위임하는 게 실무.

## 왜 필요한가

- 합의([[raft]])를 앱마다 구현 안 하고 재사용
- 분산 락·리더 선출을 어떻게 하나
- ZooKeeper/etcd의 용도

## 왜 조율 서비스인가

합의([[consensus-problem]], [[raft]])는 어렵고 미묘함 → **직접 구현하지 말고 검증된 서비스에 위임**:

- 조율 서비스가 합의를 내장 (Raft/Paxos 기반)
- 앱은 간단한 API로 조율 기능 사용
- security/[[crypto-basics]]의 "직접 만들지 마라"와 같은 정신

## 제공 기능

### 분산 락 (distributed lock)

여러 노드가 공유 자원에 접근 시 상호 배제 (os/[[locks]]의 분산 버전):

```
노드가 락 획득 시도 → 조율 서비스가 하나만 허용 → 그 노드만 진행
```

- 합의로 "누가 락을 쥐나" 동의
- **함정**: 락 쥔 노드가 죽으면? → TTL/세션으로 자동 해제. 하지만 GC 멈춤 등으로 락 만료 후에도 작업 중일 수 있음 → **fencing token**(단조 증가 번호)으로 방어

### 리더 선출 (leader election)

앱의 리더를 조율 서비스가 선출 ([[replication]]의 failover):
- 여러 노드가 후보 → 조율 서비스가 하나 선택
- 리더 죽으면 재선출
- 합의를 앱이 아니라 서비스가 처리

### 설정 저장 (configuration)

- 클러스터 설정을 중앙 저장 (일관된 뷰)
- 변경 시 모든 노드에 알림 (watch)

### 서비스 디스커버리 (service discovery)

- 어떤 서비스가 어디(IP:포트)에 있나 등록·조회
- 노드 추가/삭제 시 자동 갱신 → 마이크로서비스에 필수
- network/[[dns]]의 동적 버전

### 멤버십·헬스

- 클러스터에 누가 살아있나 (membership)
- 세션·heartbeat로 죽은 노드 감지

## ZooKeeper vs etcd

| | ZooKeeper | etcd |
|---|---|---|
| 합의 | ZAB | Raft ([[raft]]) |
| 모델 | 계층적 znode (파일시스템 유사) | 키-값 |
| 생태계 | Hadoop, Kafka | 쿠버네티스 (devops/[[kubernetes-basics]]) |
| API | 복잡 | 단순 (gRPC) |

- **etcd**: 쿠버네티스의 상태 저장소 → k8s의 모든 상태가 여기 (devops/[[kubernetes-basics]])
- **ZooKeeper**: Kafka([[message-queues]]), Hadoop 등 빅데이터 생태계
- **Consul**: 서비스 디스커버리 특화

## 데이터 모델 (etcd 예)

- **키-값** + watch (변경 알림)
- **강한 일관성**(linearizable [[consistency-models]]): 합의 기반이라 CP ([[cap-theorem]])
- **작은 데이터**: 설정·메타데이터용 (대량 데이터 저장소 아님)
- **TTL/lease**: 세션 만료로 자동 정리 (락·멤버십)

## 사용 원칙

- **직접 합의 구현 금지**: etcd/ZooKeeper 사용
- **작은 메타데이터만**: 설정·락·선출 (앱 데이터는 DB에)
- **일관성 우선(CP)**: 분할 시 소수파는 응답 안 함 ([[cap-theorem]]) → 조율은 정확성이 중요
- **fencing token**: 분산 락의 안전한 사용

## 연결

- 합의 기반 → [[consensus-problem]], [[raft]], [[paxos-overview]]
- 분산 락 (OS 락의 분산) → os/[[locks]]
- 리더 선출 → [[replication]]
- 강한 일관성 CP → [[consistency-models]], [[cap-theorem]]
- etcd/k8s → devops/[[kubernetes-basics]]
- 서비스 디스커버리 = 동적 DNS → network/[[dns]]
- Kafka와 ZooKeeper → [[message-queues]]

## 궁금한 것 (나중에)

- [ ] fencing token으로 분산 락 안전하게 (Kleppmann의 Redlock 비판)
- [ ] etcd watch 메커니즘
- [ ] ZooKeeper znode 종류 (ephemeral, sequential)
- [ ] 조율 서비스 없이 하는 법 (gossip)

## 출처

- MIT 6.824, "DDIA" 8-9장, etcd/ZooKeeper 문서
