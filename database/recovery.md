# 복구 (Recovery)

## 한 줄 요약

크래시 후 DB를 일관된 상태로 되돌리는 것. WAL(로그를 먼저 쓰기)로 원자성·내구성을 보장하고, ARIES 알고리즘이 분석·redo·undo 3단계로 복구한다. 커밋된 것은 살리고 안 된 것은 지운다.

## 왜 필요한가

- ACID의 원자성·내구성([[transactions-acid]])을 어떻게 구현하나
- 크래시 후 DB가 어떻게 스스로 복구하나
- WAL이 뭐고 왜 성능·안전의 핵심인가

## 문제: 크래시 시점

트랜잭션 중 크래시:
- 커밋된 트랜잭션이 아직 디스크에 안 갔을 수 있음 (버퍼 풀에만, [[buffer-pool]]) → **내구성 위협**
- 커밋 안 된 트랜잭션이 일부 디스크에 갔을 수 있음 → **원자성 위협**

복구 = "커밋된 것은 반드시 반영(redo), 안 된 것은 반드시 제거(undo)".

## WAL (Write-Ahead Logging)

핵심 원칙: **데이터 페이지를 쓰기 전에 로그를 먼저 쓴다** (os/[[crash-consistency]]의 저널링과 같은 발상):

```
1. 변경을 로그에 기록 (undo/redo 정보)
2. 로그를 디스크에 강제(fsync) - 커밋 시
3. 데이터 페이지는 나중에 여유롭게 flush
```

- **로그가 먼저 = write-ahead**: 크래시 나도 로그로 복구 가능
- **커밋 = 로그가 디스크에 도달** (데이터 페이지는 아직 버퍼에 있어도 OK) → 내구성. 로그만 fsync하면 되니 빠름 (데이터 페이지 랜덤 쓰기 대신 로그 순차 쓰기)
- 로그 레코드: (트랜잭션ID, 페이지, 이전 값, 새 값)

WAL이 성능(순차 로그)과 안전(복구 가능)을 동시에. os/[[crash-consistency]]의 파일시스템 저널링과 정확히 같은 원리.

## redo vs undo

로그의 두 정보:

- **redo**: 새 값 → 커밋됐는데 디스크에 안 간 변경을 다시 적용 (내구성)
- **undo**: 이전 값 → 커밋 안 됐는데 디스크에 간 변경을 되돌림 (원자성)

로그에 둘 다 기록 → 복구 시 필요한 방향으로.

## ARIES 알고리즘

표준 복구 알고리즘. 크래시 후 **3단계**:

```
1. 분석(Analysis): 로그를 읽어 크래시 시점 상태 파악
   - 어떤 트랜잭션이 커밋됐나/진행 중이었나
   - 어떤 페이지가 dirty였나
2. Redo: 마지막 체크포인트부터 모든 변경 재적용
   - 커밋 여부 무관하게 일단 다 재현 (로그 상태 복원)
3. Undo: 커밋 안 된 트랜잭션의 변경 되돌림
   - 진행 중이던(loser) 트랜잭션 취소
```

결과: 커밋된 것만 남고, 진행 중이던 것은 사라짐 → 일관된 상태.

원칙:
- **redo 먼저, undo 나중** (로그 상태를 먼저 복원 후 정리)
- **멱등성**(distributed-systems/[[idempotency]]): redo/undo를 여러 번 해도 안전 (복구 중 또 크래시나도 OK) → LSN으로 중복 방지

## 체크포인트 (checkpoint)

로그가 무한정 길면 복구가 느림 → 주기적 **체크포인트**:

- 그 시점까지 dirty 페이지를 디스크에 flush + 로그에 표시
- 복구는 마지막 체크포인트부터만 하면 됨 → 복구 시간 단축
- os/[[crash-consistency]]의 저널 체크포인트와 같음
- 트레이드오프: 자주 = 복구 빠름 but 런타임 오버헤드

## 로그의 다른 용도

WAL이 복구 외에도:

- **복제**([[replication-db]]): 로그를 팔로워에 보내 재생 → 복제본 동기화. 스트리밍 복제의 기반
- **MVCC undo**([[mvcc]]): InnoDB는 undo 로그로 옛 버전 재구성
- **CDC**(Change Data Capture): 로그를 읽어 변경 스트림 추출 → distributed-systems/[[message-queues]]
- **PITR**(Point-In-Time Recovery): 로그 재생으로 특정 시점 복원

로그가 DB의 중심 자료구조 - "로그가 진실의 원천".

## 연결

- ACID 원자성·내구성 → [[transactions-acid]]
- 저널링 (같은 원리) → os/[[crash-consistency]]
- 버퍼 풀 flush → [[buffer-pool]]
- 멱등성 (redo/undo) → distributed-systems/[[idempotency]]
- 로그 기반 복제 → [[replication-db]]
- MVCC undo → [[mvcc]]

## 궁금한 것 (나중에)

- [ ] LSN (Log Sequence Number)과 멱등 복구
- [ ] fuzzy checkpoint (논블로킹)
- [ ] group commit (여러 커밋을 한 fsync로)
- [ ] 물리 vs 논리 로깅

## 출처

- CMU 15-445 복구, ARIES (Mohan et al. 1992)
