# 모놀리스 vs 마이크로서비스 (Monolith vs Microservices)

## 한 줄 요약

하나의 배포 단위(모놀리스)냐 독립 배포되는 여러 서비스(마이크로서비스)냐. 마이크로서비스는 독립 확장·배포를 주지만 분산 시스템의 모든 복잡도를 떠안는다. 대부분은 모놀리스로 시작해야 한다.

## 왜 필요한가

- 시스템을 하나로 vs 여러 서비스로
- 마이크로서비스의 숨은 비용
- 언제 나누나

## 모놀리스 (monolith)

**하나의 배포 단위**에 전체 앱:

```
[UI + 비즈니스 로직 + 데이터 접근] → 하나로 빌드·배포
내부는 계층/모듈로 구조화 ([[layered-architecture]])
```

- **단순**: 하나 배포, 로컬 함수 호출 (네트워크 없음), 단일 DB 트랜잭션(database/[[transactions-acid]])
- **디버깅 쉬움**: 한 프로세스, 스택 추적 (분산 추적 불필요)
- **성능**: 함수 호출 (네트워크 지연 없음)
- 단점: 전체 재배포 (작은 변경도), 기술 스택 고정, 큰 팀엔 충돌, 부분 확장 불가

## 마이크로서비스 (microservices)

**독립 배포되는 여러 작은 서비스**:

```
[주문 서비스] [결제 서비스] [재고 서비스] ... 각자 배포·DB·확장
서비스 간 네트워크 통신 (distributed-systems/[[rpc]], [[message-queues]])
```

- **독립 배포**: 서비스별 배포 (다른 것 영향 없음)
- **독립 확장**: 병목 서비스만 확장 (database/[[partitioning-db]] 발상)
- **기술 다양성**: 서비스마다 다른 언어·DB
- **팀 자율**: 팀별 서비스 소유 (Conway의 법칙)

## 마이크로서비스의 숨은 비용 (중요)

"마이크로서비스 = 분산 시스템" → distributed-systems의 **모든 복잡도를 떠안음**:

- **네트워크**: 함수 호출이 네트워크 호출로 → 지연·실패([[why-distributed]] 아니 distributed-systems/[[why-distributed]]), 부분 실패
- **분산 트랜잭션**: 단일 DB 트랜잭션 불가 → saga·보상(distributed-systems/[[distributed-transactions]])
- **일관성**: eventual consistency(distributed-systems/[[consistency-models]])
- **관측성**: 분산 추적 필요(distributed-systems/[[observability-basics]]) - 로그가 흩어짐
- **운영 복잡도**: 서비스마다 배포·모니터링·장애 (devops/[[kubernetes-basics]])
- **테스트**: 통합 테스트 어려움([[testing-strategy]])
- **데이터**: 서비스별 DB → 조인 불가, 데이터 중복

로컬에서 간단하던 게 전부 분산 문제가 됨. **공짜가 아니라 큰 비용**.

## 언제 무엇을

### 모놀리스로 시작 (기본)

- **대부분의 프로젝트**: 스타트업, 초기, 소규모 팀
- 도메인 경계가 아직 불명확 (잘못 나누면 재앙)
- distributed-systems/[[why-distributed]]의 "되도록 분산 피하기"
- **모듈러 모놀리스**: 내부를 잘 나눈 모놀리스 → 나중에 쪼갤 수 있게

### 마이크로서비스로 (정당화될 때)

- **큰 조직**: 여러 팀이 독립적으로 (배포 충돌)
- **부분 확장 필요**: 특정 기능만 트래픽 폭주
- **명확한 도메인 경계**: 잘 나뉘는 게 검증됨
- **모놀리스가 한계**: 배포·확장·팀이 실제로 막힘

## 흔한 실수

- **조기 마이크로서비스**: 작은 팀이 처음부터 → 분산 복잡도만 떠안고 이득 없음 (distributed monolith - 최악)
- **잘못된 경계**: 서비스 간 chatty(수다스러운) 통신 → 결합 높은 분산 ([[coupling-cohesion]])
- **분산 모놀리스**: 나눴는데 서로 강결합 → 마이크로서비스 비용 + 모놀리스 단점

## 경계 설정

나눈다면 **도메인 경계로** (DDD [[ddd-basics]]):
- bounded context 단위로 서비스
- 함께 바뀌는 것은 함께 (응집 [[coupling-cohesion]])
- 서비스 간 통신 최소화 (결합↓)

## 연결

- 모놀리스 내부 구조 → [[layered-architecture]]
- 분산 복잡도 → distributed-systems/[[why-distributed]], [[distributed-transactions]], [[consistency-models]]
- 서비스 통신 → distributed-systems/[[rpc]], [[message-queues]]
- 관측성 → distributed-systems/[[observability-basics]]
- 운영 → devops/[[kubernetes-basics]]
- 경계 (DDD) → [[ddd-basics]]
- 결합 → [[coupling-cohesion]]

## 궁금한 것 (나중에)

- [ ] 모듈러 모놀리스 실전
- [ ] 마이크로서비스 분해 전략 (strangler fig)
- [ ] 서비스 메시 (Istio)
- [ ] 이벤트 기반 마이크로서비스 → [[event-driven-architecture]]

## 출처

- "Building Microservices" (Newman), "Monolith First" (Fowler)
