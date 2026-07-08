# 버퍼 풀 (Buffer Pool)

## 한 줄 요약

디스크 페이지를 메모리에 캐싱하는 DB의 자체 캐시. OS 페이지 캐시가 있는데도 DB가 직접 관리하는 이유는 접근 패턴을 더 잘 알고 트랜잭션·로깅과 통합해야 하기 때문이다.

## 왜 필요한가

- DB가 디스크 접근을 어떻게 줄이나
- 왜 OS 페이지 캐시를 안 믿고 자체 캐시를 두나
- 캐시 교체·flush가 트랜잭션과 어떻게 얽히나

## 역할: 페이지 캐시

DB의 버퍼 풀 = **디스크 페이지([[db-storage]])를 담는 메모리 캐시**:

```
쿼리가 페이지 요청
  → 버퍼 풀에 있나? (히트) → 메모리에서 즉시
  → 없으면 (미스) → 디스크에서 로드, 버퍼 풀에 넣고 반환
```

os/[[page-cache]], computer-architecture/[[memory-hierarchy]]의 캐싱과 같은 발상 - 느린 디스크 접근을 메모리로 흡수. 대부분 워크로드가 버퍼 풀에 자주 쓰는 페이지가 있어 디스크 안 감.

## 왜 OS 페이지 캐시를 안 쓰나

OS가 이미 파일을 캐싱하는데([[page-cache]]) 왜 DB가 또? → **DB가 더 잘 안다**:

1. **접근 패턴 지식**: DB는 쿼리 계획([[query-optimization]])을 알아 어떤 페이지를 곧 쓸지 예측. OS는 모름
2. **교체 정책 제어**: OS의 LRU는 DB에 안 맞음 (예: 큰 순차 스캔이 캐시를 다 밀어냄 - DB는 스캔 페이지를 곧 안 쓸 걸 앎)
3. **트랜잭션 통합**: dirty 페이지를 언제 flush할지 WAL([[recovery]])과 조율해야 (내구성)
4. **이중 캐싱 회피**: 종종 `O_DIRECT`로 OS 캐시 우회 → os/[[page-cache]]의 direct I/O
5. **정확한 제어**: 버퍼 풀 크기·핀·flush를 DB가 결정

DB는 자기 데이터에 대해 OS보다 많이 알아서 자체 관리가 유리.

## 페이지 교체

버퍼 풀이 꽉 차면 하나를 내보내야 (os/[[swapping]]의 교체와 유사):

- **LRU**: 가장 오래 안 쓴 페이지. 기본이지만 순차 스캔에 약함 (스캔이 hot 페이지를 밀어냄)
- **LRU-K**: K번째 최근 접근 기준 → 일회성 스캔 페이지를 덜 우대
- **Clock**: LRU 근사 (os/[[swapping]]의 clock)
- **스캔 저항**: 큰 스캔 페이지를 캐시 오염 안 시키게 특별 처리

## dirty 페이지와 flush

수정된 페이지(dirty)를 디스크에 언제 쓰나 → 트랜잭션 내구성과 직결:

- **핀(pin)**: 사용 중 페이지는 교체 못 하게 고정
- **dirty 표시**: 수정되면 디스크와 다름 → 언젠가 flush 필요
- **flush 타이밍**: WAL 규칙([[recovery]]) - 로그를 먼저 쓰고(write-ahead), 데이터 페이지는 나중에. os/[[crash-consistency]]의 저널링과 같은 원리
- **체크포인트**: 주기적으로 dirty 페이지를 디스크에 → 복구 시간 단축 ([[recovery]])

버퍼 풀의 flush 정책이 성능(자주 flush = 느림)과 내구성(안 flush = 크래시 위험)의 균형.

## 버퍼 풀 크기

- 클수록 캐시 히트↑ → DB 성능의 최대 튜닝 포인트
- 보통 사용 가능 RAM의 큰 비중을 버퍼 풀에 (PostgreSQL shared_buffers, MySQL innodb_buffer_pool_size)
- 너무 크면 OS·다른 프로세스 압박 → 균형

## 연결

- 페이지·저장 → [[db-storage]]
- OS 페이지 캐시 (안 쓰는 이유) → os/[[page-cache]]
- 캐싱 계층 → computer-architecture/[[memory-hierarchy]]
- 교체 정책 → os/[[swapping]]
- flush와 WAL → [[recovery]], os/[[crash-consistency]]
- 쿼리 계획 지식 → [[query-optimization]]

## 궁금한 것 (나중에)

- [ ] LRU-K 구체적 동작
- [ ] 버퍼 풀 크기 튜닝 실전
- [ ] O_DIRECT vs OS 캐시 벤치마크
- [ ] 압축된 버퍼 풀 (더 많이 캐싱)

## 출처

- CMU 15-445 버퍼 풀
