# 스키마 마이그레이션 (Schema Migration)

## 한 줄 요약

운영 중인 DB의 스키마를 무중단으로 바꾸는 것. 핵심은 **expand-contract**(확장→이행→축소) 패턴 - 구·신 코드가 동시에 도는 배포 창 동안 스키마가 양쪽 모두와 호환돼야 한다. 마이그레이션은 버전 관리되는 순방향 스크립트로, 되도록 하위 호환되게, 큰 테이블엔 잠금 없이 진행한다.

## 왜 필요한가

- 서비스 죽이지 않고 스키마를 어떻게 바꾸나
- 왜 컬럼 하나 지우는 게 위험한가
- 배포와 스키마 변경의 관계 (devops/[[deployment-strategies]])

## 왜 어려운가

```
스키마 = 코드와 데이터의 계약
바꾸면: 기존 코드가 깨질 수 있고, 기존 데이터를 옮겨야 하고,
        큰 테이블은 변경 자체가 오래·잠금 위험
```

- 무중단 배포([[deployment-strategies]])에선 **구·신 버전이 동시에** DB를 씀 → 스키마가 둘 다 만족해야
- 대형 테이블 `ALTER`는 락·전체 재작성 → 다운타임 위험

## 마이그레이션 관리

- **버전 관리 스크립트**: 각 변경을 순번 파일로 (`001_add_col.sql`, `002_...`) → git에 ([[git-internals]], devops/[[iac]]의 재현성)
- **순방향 위주**: 롤백 스크립트는 실무에서 위험 (데이터 손실) → 되도록 하위 호환 순방향, 롤백은 새 순방향으로
- **도구**: Flyway, Liquibase, Rails/Django migrations, Alembic
- **멱등·자동**: 배포 파이프라인에서 자동 적용 (devops/[[ci-cd-principles]])

## expand-contract 패턴 (핵심)

파괴적 변경을 **여러 안전한 단계**로 쪼갬:

```
1. Expand(확장): 새 구조 추가 (구 구조 유지) - 하위 호환
2. Migrate(이행): 데이터 복사 + 신·구 코드 공존 배포
3. Contract(축소): 구 구조 제거 (모두 신 구조 쓸 때)
```

### 예: 컬럼 이름 변경 (`name` → `full_name`)

순진하게 `RENAME`하면 → 배포 창에서 구 코드가 `name` 못 찾아 터짐. 대신:

```
1. Expand:  full_name 컬럼 추가 (name 유지)
2. 코드가 양쪽에 쓰기 (dual write), name→full_name 백필
3. 코드를 full_name만 읽게 배포 (구 코드 다 사라질 때까지 대기)
4. Contract: name 컬럼 제거
```

- 각 단계가 **하위 호환** → 언제 롤백해도 안전
- devops/[[deployment-strategies]]의 롤링·카나리와 정확히 맞물림 (버전 공존)

## 안전 규칙

- **추가는 안전, 제거·변경은 위험**: 컬럼/테이블 추가는 구 코드 영향 없음. 제거·타입변경·NOT NULL 추가가 위험
- **NOT NULL 추가**: 기본값 없이 하면 기존 행 위반 → 먼저 nullable + 백필 → 나중에 제약
- **큰 테이블 잠금 회피**:
  - 온라인 DDL (MySQL 5.6+, PostgreSQL 다수 ALTER는 이제 짧은 락)
  - `pt-online-schema-change`, `gh-ost`: 그림자 테이블에 복사 후 스왑 (락 최소)
  - 인덱스는 `CREATE INDEX CONCURRENTLY` (PostgreSQL, 락 없이)
- **백필은 배치로**: 수백만 행 UPDATE를 한 트랜잭션에 하면 → 긴 락·복제 지연([[replication-db]]). 작은 배치로 나눠

## 데이터 이행 주의

- **긴 트랜잭션 금지**: MVCC 부하([[mvcc]]), 복제 지연, 롤백 비용 → 배치로 쪼개기
- **복제 지연**([[replication-db]]): 대량 변경이 팔로워에 밀림 → 읽기 일관성 영향
- **되돌릴 수 없는 것 주의**: DROP은 데이터 소멸 (백업·유예 기간)

## 왜 중요한가

- **무중단 배포의 전제**: 스키마 변경이 다운타임 내면 CD 무의미 (devops/[[ci-cd-principles]])
- **데이터는 코드보다 무겁다**: 코드는 롤백 즉시, 데이터는 못 되돌림 → 신중·단계적
- distributed-systems의 롤링 업그레이드 호환성 문제와 동형 (프로토콜 진화)

## 연결

- 배포 중 버전 공존 → devops/[[deployment-strategies]]
- 자동 적용·재현성 → devops/[[ci-cd-principles]], [[iac]]
- 버전 관리 → devops/[[git-internals]]
- 큰 UPDATE와 락·MVCC → [[mvcc]], [[concurrency-control]]
- 복제 지연 → [[replication-db]]
- 스키마 설계 자체 → [[normalization]]

## 궁금한 것 (나중에)

- [ ] gh-ost/pt-osc 내부 동작 (트리거 vs binlog)
- [ ] PostgreSQL 각 ALTER의 락 수준 상세
- [ ] 이벤트 소싱에서의 스키마 진화 (software-design/[[event-driven-architecture]])
- [ ] 무중단 대형 백필 전략

## 출처

- "Database Reliability Engineering", "Refactoring Databases" (Ambler & Sadalage), gh-ost 문서
