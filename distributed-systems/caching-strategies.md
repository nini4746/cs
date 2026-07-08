# 캐싱 전략 (Caching Strategies)

## 한 줄 요약

자주 쓰는 데이터를 빠른 저장소에 두어 지연·부하를 줄인다. cache-aside/write-through 등 패턴과 무효화(invalidation)가 핵심이며, 캐시 미스 폭주(thundering herd)와 일관성이 함정이다.

## 왜 필요한가

- 분산 시스템에서 캐시를 어떻게 쓰나
- 캐시 무효화가 왜 "컴퓨터 과학의 두 어려운 문제" 중 하나인가
- thundering herd 방어

## 왜 캐싱

느린 저장소(DB, 네트워크) 앞에 빠른 저장소:

- **지연 감소**: 메모리 캐시(Redis)가 DB보다 훨씬 빠름 (computer-architecture/[[memory-hierarchy]]의 계층)
- **부하 감소**: DB 조회를 캐시가 흡수 → DB 보호
- os/[[page-cache]], network/[[cdn]], computer-architecture/[[memory-hierarchy]]의 캐싱을 분산 계층에

## 캐싱 패턴

### cache-aside (lazy loading) - 가장 흔함

```
읽기: 캐시 확인 → 있으면 반환(히트), 없으면(미스) DB 조회 → 캐시에 저장 → 반환
쓰기: DB 갱신 → 캐시 무효화(삭제)
```

- 앱이 캐시를 직접 관리
- 필요한 것만 캐시 (읽힌 것만)
- 미스 시 DB 조회 (첫 접근 느림)
- Redis + DB의 표준 조합

### write-through

```
쓰기: 캐시와 DB를 동시에 갱신
읽기: 항상 캐시에 있음 (쓸 때 넣었으니)
```

- 캐시가 항상 최신 (일관성↑)
- 쓰기 느림 (둘 다 갱신)

### write-back (write-behind)

```
쓰기: 캐시만 갱신 → 나중에 DB에 일괄 반영
```

- 쓰기 빠름 (os/[[page-cache]]의 write-back)
- 크래시 시 유실 위험 (DB 반영 전)

### write-around

- 쓰기는 DB로 직접 (캐시 우회), 읽기만 캐시
- 한 번 쓰고 안 읽는 데이터에

## 무효화 (invalidation)

**캐시 무효화가 핵심 난제** ("컴퓨터 과학의 두 어려운 것: 캐시 무효화, 이름 짓기"):

- 데이터 바뀌면 캐시를 어떻게 갱신/삭제?
- **TTL**: 시간 지나면 만료 (network/[[dns]], [[cdn]]) - 단순하지만 그 사이 stale
- **명시적 삭제**: 쓰기 시 캐시 삭제 (cache-aside) - 정확하지만 놓치기 쉬움
- **이벤트 기반**: 변경 이벤트로 무효화 ([[message-queues]])
- 트레이드오프: 짧은 TTL(최신 but 부하↑) vs 긴 TTL(빠름 but stale)

## thundering herd (캐시 스탬피드)

캐싱의 대표 함정 - **캐시 미스가 폭주**:

```
인기 키의 캐시 만료 → 동시에 수천 요청이 미스 → 모두 DB로 몰림 → DB 과부하 (죽을 수도)
```

방어:
- **락/single-flight**: 한 요청만 DB 조회, 나머지는 대기 (그 결과 공유)
- **확률적 조기 만료**: 만료 전에 미리 갱신 (일부 요청만)
- **stale-while-revalidate**: 만료돼도 옛 값 주며 백그라운드 갱신 (web/[[http-for-web]])

## 일관성 문제

캐시와 원본이 다를 수 있음 ([[consistency-models]]의 eventual):

- 캐시가 stale (원본 바뀌었는데 캐시 옛 값)
- **cache-aside 경쟁**: 무효화와 읽기가 겹치면 옛 값이 다시 캐시될 수 있음
- 강한 일관성 필요하면 캐시 부적합 (또는 write-through + 신중한 무효화)
- 대부분 앱은 약간의 stale 감수 (성능 위해)

## 캐시 계층

여러 층 (computer-architecture/[[memory-hierarchy]]의 계층 사고):

```
브라우저 캐시 → CDN (network/[[cdn]]) → 앱 캐시(Redis) → DB 버퍼 풀 (database/[[buffer-pool]]) → 디스크
```

각 층이 아래를 캐싱. 가까울수록 빠르고 작음.

## 무엇을 캐싱하나

- **읽기 많고 자주 안 바뀌는 것**: 프로필, 설정, 상품 정보
- **비싼 계산 결과**: 집계, 렌더링
- **세션**: web/[[web-auth]]
- 자주 바뀌거나 일관성 critical한 것은 신중

## 연결

- 캐싱 계층 → computer-architecture/[[memory-hierarchy]]
- OS write-back → os/[[page-cache]]
- CDN → network/[[cdn]]
- DB 버퍼 풀 → database/[[buffer-pool]]
- 이벤트 무효화 → [[message-queues]]
- stale-while-revalidate → web/[[http-for-web]]
- eventual consistency → [[consistency-models]]

## 궁금한 것 (나중에)

- [ ] single-flight 구현 (Go singleflight)
- [ ] 캐시 교체 정책 (LRU/LFU) → os/[[swapping]]
- [ ] Redis 클러스터링·영속성
- [ ] 캐시 워밍 (미리 채우기)

## 출처

- "DDIA", 시스템 디자인 자료, Redis 문서
