---
title: "database"
---

# 데이터베이스 syllabus

기준: **CMU 15-445** (Database Systems, 강의 공개) + Silberschatz. 사용법보다 내부 구조 중심.

## 1. 관계형 모델과 SQL

- [x] [[relational-model]] - 관계 대수, 스키마, 키 종류
- [x] [[sql-deep-dive]] - JOIN 종류와 실행 의미, 서브쿼리 vs JOIN, window function
- [x] [[normalization]] - 함수 종속, 1NF~BCNF, 실무에서 역정규화하는 순간

## 2. 저장 구조

- [x] [[db-storage]] - 페이지/슬롯 구조, heap file, row store vs column store
- [x] [[buffer-pool]] - 버퍼 풀 관리, 교체 정책, OS 페이지 캐시 대신 직접 관리하는 이유

## 3. 인덱스

- [x] [[btree-index]] - B+tree 구조, 클러스터드 vs 논클러스터드 → data-structures/b-trees 기반
- [x] [[index-usage]] - 인덱스 타는 조건, 복합 인덱스 순서, 커버링 인덱스, EXPLAIN 읽기
- [x] [[lsm-tree]] - LSM tree vs B+tree, RocksDB/Cassandra 계열의 선택

## 4. 쿼리 처리

- [x] [[query-execution]] - iterator 모델, hash join vs merge join vs nested loop
- [ ] [[query-optimization]] - 비용 기반 최적화, 통계, 플랜이 틀리는 경우

## 5. 트랜잭션

- [ ] [[transactions-acid]] - ACID 각각의 정확한 의미
- [ ] [[concurrency-control]] - 2PL, 격리 수준 4단계 + 이상 현상 (dirty read ~ phantom)
- [ ] [[mvcc]] - MVCC 동작, PostgreSQL vacuum, 스냅샷 격리의 함정 (write skew)
- [ ] [[recovery]] - WAL, ARIES, 체크포인트, crash 후 복구 과정

## 6. 분산·실무

- [ ] [[replication-db]] - 리더-팔로워, 복제 지연, 읽기 일관성 → distributed-systems/와 연결
- [ ] [[partitioning-db]] - 샤딩 전략, 핫스팟, 리밸런싱
- [ ] [[nosql-landscape]] - 문서/KV/그래프/컬럼, 각각 뭘 포기하고 뭘 얻나
