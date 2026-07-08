---
title: "distributed-systems"
---

# 분산 시스템 syllabus

기준: **MIT 6.824** (강의 공개) + **DDIA** (Designing Data-Intensive Applications). 선행: os/, network/, database/ 트랜잭션.

## 1. 기초

- [x] [[why-distributed]] - 분산의 이유와 근본 비용, fallacies of distributed computing
- [x] [[rpc]] - RPC 의미론 (at-least/at-most/exactly once), 부분 실패 처리
- [x] [[clocks]] - 물리 시계의 한계, Lamport 시계, 벡터 시계, happened-before

## 2. 일관성과 복제

- [x] [[replication]] - 단일 리더/멀티 리더/리더리스, 복제 지연 이상 현상
- [x] [[consistency-models]] - linearizability, sequential, causal, eventual - 정확한 정의
- [x] [[cap-theorem]] - CAP의 정확한 의미와 흔한 오해, PACELC

## 3. 합의

- [x] [[consensus-problem]] - 왜 어려운가, FLP 불가능성
- [x] [[raft]] - 리더 선출, 로그 복제, 안전성 논증 (6.824 핵심)
- [x] [[paxos-overview]] - Paxos 기본, Raft와 비교
- [x] [[coordination-services]] - ZooKeeper/etcd, 분산 락의 함정

## 4. 트랜잭션과 파티셔닝

- [x] [[distributed-transactions]] - 2PC, saga 패턴, exactly-once의 실체
- [ ] [[partitioning]] - consistent hashing, 리밸런싱, 핫스팟 → database/partitioning-db와 연결

## 5. 실무 패턴

- [ ] [[message-queues]] - Kafka 구조 (파티션, 오프셋, 컨슈머 그룹), at-least-once 처리
- [ ] [[caching-strategies]] - cache-aside/write-through, 무효화, thundering herd
- [ ] [[idempotency]] - 멱등성 설계, 재시도 안전성, 중복 제거
- [ ] [[observability-basics]] - 분산 추적, 왜 로그만으로 부족한가 → devops/와 연결
