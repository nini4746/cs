# 클라우드 기초 (Cloud Basics)

## 한 줄 요약

남의 컴퓨터를 필요할 때 빌려 쓰는 것 - 컴퓨트(CPU)/스토리지(디스크)/네트워크가 3대 기본 블록이고, 이 위에 관리형 서비스(DB, 큐 등)가 쌓인다. 핵심 가치는 **탄력성**(필요한 만큼 즉시)과 **사용량 과금**(쓴 만큼)이며, 요금은 대개 이 블록들의 사용량에서 나온다.

## 왜 필요한가

- 클라우드가 실제로 뭘 파는가
- 요금이 어디서 나오나 (비용 구조)
- IaaS/PaaS/SaaS 차이

## 3대 기본 블록

모든 클라우드 서비스의 토대:

### 컴퓨트 (compute)

- **가상 머신**(EC2 등): CPU+메모리를 빌림 (os/[[virtualization-and-containers]]의 VM)
- **컨테이너**(ECS, Cloud Run): [[docker-internals]] 실행
- **서버리스**(Lambda): 함수만, 서버 관리 없음 (요청당 과금)
- 과금: 실행 시간 × 크기 (vCPU·메모리)

### 스토리지 (storage)

- **오브젝트**(S3): 파일을 키-값으로 (무한 확장, 정적 사이트·백업). network/[[cdn]]의 오리진
- **블록**(EBS): VM에 붙는 가상 디스크 (os/[[file-system-basics]]의 블록 디바이스)
- **파일**(EFS): 네트워크 파일시스템
- 과금: 저장량(GB) + 요청 수 + **송신 트래픽**(egress, 아래)

### 네트워크 (network)

- **VPC**: 가상 사설 네트워크 (격리된 내 네트워크 공간)
- **로드밸런서**: 트래픽 분산 (network/[[load-balancing]])
- **egress 요금**: 클라우드 **밖으로** 나가는 트래픽에 과금 (들어오는 건 대개 무료) → 큰 비용원·락인 요인

## 관리형 서비스 (위에 쌓임)

3대 블록 위에 클라우드가 운영을 대신:

- **관리형 DB**(RDS, DynamoDB): DB 설치·백업·패치를 클라우드가 (database/)
- **큐·스트림**(SQS, Kafka): 비동기 메시징 (distributed-systems/[[message-queues]])
- **관리형 k8s**(EKS, GKE): [[kubernetes-basics]] 컨트롤 플레인 대행
- 이 노트 사이트의 GitHub Pages도 관리형 정적 호스팅 ([[github-actions]])

## IaaS / PaaS / SaaS

**얼마나 클라우드가 대신하나**의 스펙트럼:

```
IaaS: VM·스토리지·네트워크만 (내가 OS 위 전부)   - EC2
PaaS: 플랫폼 제공 (내 코드만 올림)              - App Engine, Heroku
SaaS: 완성 소프트웨어 (그냥 사용)               - Gmail, Notion
      ← 관리 부담↓, 통제력↓, 락인↑ →
```

서버리스(FaaS)는 PaaS의 극단 - 함수만.

## 핵심 가치

- **탄력성(elasticity)**: 필요한 만큼 즉시 늘리고 줄임 (트래픽 급증 대응, 오토스케일링)
- **사용량 과금(pay-as-you-go)**: 쓴 만큼 (선투자 없음, capex→opex)
- **관리 위임**: 하드웨어·데이터센터·운영을 클라우드가
- **글로벌**: 여러 리전에 즉시 배포 (network/[[cdn]])

## 비용 구조 (요금이 나오는 곳)

무엇이 청구되나 이해가 중요:

- **컴퓨트 시간**: VM/함수 실행 (제일 큼)
- **스토리지**: 저장량 + 요청 수
- **egress 네트워크**: 밖으로 나가는 트래픽 (놓치기 쉬운 큰 비용)
- **관리형 서비스 프리미엄**: 편함의 대가
- 함정: 안 끈 리소스, 과대 프로비저닝, egress, 리전 간 전송
- FinOps: 비용 관측·최적화 ([[observability]]의 사고를 비용에)

## 절충

- **편함 vs 통제**: 관리형일수록 편하지만 통제·이식성↓
- **벤더 락인**: 관리형 서비스·egress 요금이 이동을 어렵게 → 멀티클라우드·표준(k8s, [[iac]])로 완화
- **비용 vs 속도**: 클라우드는 빠르지만 규모 크면 자체 운영이 쌀 수도

## 연결

- VM·컨테이너 → os/[[virtualization-and-containers]], [[docker-internals]]
- 오브젝트 스토리지·CDN 오리진 → network/[[cdn]]
- 로드밸런서 → network/[[load-balancing]]
- 관리형 k8s → [[kubernetes-basics]]
- 프로비저닝 (코드로) → [[iac]]
- 관리형 정적 호스팅 → [[github-actions]]
- 큐 → distributed-systems/[[message-queues]]
- 비용 관측 → [[observability]]

## 궁금한 것 (나중에)

- [ ] 리전·가용 영역(AZ) 설계 (고가용성)
- [ ] 스팟/예약 인스턴스 (비용 최적화)
- [ ] CDN·엣지 컴퓨팅 (network/[[cdn]])
- [ ] 서버리스 콜드 스타트 문제

## 출처

- AWS/GCP 공식 문서, "Cloud FinOps"
