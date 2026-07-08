# 배포 전략 (Deployment Strategies)

## 한 줄 요약

새 버전을 프로덕션에 내보내는 방법들 - 롤링(하나씩 교체), 블루그린(전체 복제 후 전환), 카나리(일부만 먼저 노출). 핵심 절충은 **위험 vs 비용/속도**이며, 어떤 전략이든 빠른 롤백 능력이 가장 중요하다.

## 왜 필요한가

- 무중단으로 새 버전 배포하는 법
- 문제 생겼을 때 빠르게 되돌리는 법
- 위험을 줄이며 배포하는 법

## 왜 전략이 필요한가

```
순진한 방법: 다 끄고 → 새 버전 켜기
문제: 다운타임, 문제 생기면 전부 영향
```

목표: **무중단** + **위험 최소** + **빠른 롤백**.

## 롤링 (rolling update)

**Pod/인스턴스를 하나씩(또는 몇 개씩) 교체** ([[kubernetes-basics]]의 Deployment 기본):

```
[v1][v1][v1][v1]
[v2][v1][v1][v1]   ← 하나 교체
[v2][v2][v1][v1]   ← 계속
[v2][v2][v2][v2]   ← 완료
```

- **장점**: 추가 자원 거의 없음, 무중단, k8s 기본
- **단점**: 배포 중 v1·v2 **공존** (API 호환성 필요), 롤백이 다시 롤링(느림)
- `maxSurge`(초과 허용), `maxUnavailable`(최대 중단) 파라미터로 속도·안전 조절

## 블루그린 (blue-green)

**전체 환경을 복제**, 준비되면 트래픽 한 번에 전환:

```
blue(v1) ← 라우터가 여기로   green(v2) 준비 중
              ↓ 전환
blue(v1) 대기               green(v2) ← 라우터가 여기로
```

- **장점**: 즉시 전환, **즉시 롤백**(라우터만 blue로), 배포 중 버전 안 섞임
- **단점**: **자원 2배** (두 환경 동시), DB 스키마 공유 문제 (아래)
- 전환은 network/[[load-balancing]]이나 Service 대상 변경으로

## 카나리 (canary)

**소수 사용자에게 먼저** 노출, 문제없으면 점진 확대:

```
v2에 5% 트래픽 → 지표 관찰 → 25% → 50% → 100%
                    ↑ 나쁘면 여기서 롤백 (5%만 영향)
```

- **장점**: 실제 트래픽으로 검증, **폭발 반경 최소** (문제 시 소수만)
- **단점**: 관측 필수 ([[observability]]의 지표로 판단), 오래 걸림, 복잡
- 광부의 카나리(위험 조기 경보)에서 이름
- 자동 카나리: 지표 나쁘면 자동 롤백 (progressive delivery)

## 비교

| 전략 | 자원 | 롤백 속도 | 버전 공존 | 위험 |
|------|------|-----------|-----------|------|
| 롤링 | 적음 | 느림 | 있음 | 중 |
| 블루그린 | 2배 | 즉시 | 없음 | 낮음(전환 후 관찰) |
| 카나리 | 조금+ | 빠름 | 있음 | 최저(점진) |

## 공통: 롤백이 핵심

어떤 전략이든 **빠른 롤백 능력**이 제일 중요:

- 문제는 반드시 생김 → 얼마나 빨리 되돌리나가 관건 ([[observability]]로 감지)
- MTTR(복구 시간) 단축이 DORA 핵심 지표 ([[ci-cd-principles]])
- **작은 배포**([[git-workflows]])일수록 롤백 쉬움 (뭐가 문제인지 명확)

## 어려운 문제: 하위 호환

배포 중 버전 공존(롤링·카나리) → **호환성 설계** 필요:

- **DB 스키마**: v1·v2 둘 다 동작하는 스키마 (컬럼 추가는 OK, 삭제는 단계적)
- **API**: v2가 v1 요청도 처리 (하위 호환)
- **expand-contract 패턴**: 먼저 확장(둘 다 지원) → 마이그레이션 → 축소(구버전 제거)
- 이게 distributed-systems/의 롤링 업그레이드 문제와 같음 (database/[[schema-migration]])

## 기타 기법

- **feature flag**: 코드 배포와 기능 활성화 분리 (배포는 조용히, 켜기는 따로) → [[git-workflows]]의 trunk-based와 짝
- **shadow(다크 런치)**: v2에 트래픽 복제만 (응답 버림) → 부하·정확성 검증

## 연결

- 롤링 = Deployment 기본 → [[kubernetes-basics]]
- 트래픽 전환·분배 → network/[[load-balancing]]
- 지표로 카나리 판단·문제 감지 → [[observability]]
- 롤백·MTTR·작은 배포 → [[ci-cd-principles]], [[git-workflows]]
- 스키마 하위 호환 → database/[[schema-migration]]

## 궁금한 것 (나중에)

- [ ] progressive delivery (Argo Rollouts, Flagger)
- [ ] feature flag 플랫폼 (LaunchDarkly)
- [ ] A/B 테스트 vs 카나리 (목적 차이)
- [ ] DB 마이그레이션 무중단 실전

## 출처

- "Continuous Delivery", Google SRE, Martin Fowler (BlueGreenDeployment, CanaryRelease)
