# 쿠버네티스 기초 (Kubernetes Basics)

## 한 줄 요약

컨테이너를 여러 머신에 걸쳐 자동 배치·복구·확장하는 오케스트레이터. 핵심은 **선언적 상태 조정 루프** - "원하는 상태"를 선언하면 컨트롤러가 현재 상태를 계속 그쪽으로 밀어붙인다. Pod가 실행 단위, Deployment가 관리자, Service가 안정된 주소.

## 왜 필요한가

- 컨테이너 하나는 `docker run`이면 끝. 수백 개를 여러 서버에?
- 죽으면 누가 다시 띄우나, 트래픽 늘면 누가 복제하나
- 롤아웃·롤백·서비스 디스커버리를 손으로?

Docker([[docker-internals]])는 컨테이너 하나. k8s는 **여러 컨테이너를 여러 노드에** 관리.

## 선언적 조정 루프 (핵심 사상)

k8s의 근본 원리 - 명령형 아니라 **선언형**:

```
명령형: "컨테이너 3개 띄워" (어떻게)
선언형: "replicas=3이 원하는 상태" (무엇)
        → 컨트롤러가 현재 상태 관찰 → 3개 아니면 조정
```

**reconciliation loop** (조정 루프):
```
while true:
    desired = 원하는 상태 (etcd에 저장된 선언)
    current = 실제 상태 (클러스터 관찰)
    if current != desired:
        조정 (Pod 생성/삭제)
```

- 노드 죽어 Pod 2개 됨 → 루프가 감지 → 1개 새로 띄움 (자가 치유)
- 이게 distributed-systems/[[consensus-and-consistency]]의 상태 수렴과 같은 발상
- **제어 이론의 피드백 루프** - 목표값과 현재값 차이를 계속 좁힘

## 기본 오브젝트

### Pod - 실행 단위

```
Pod = 함께 스케줄되는 컨테이너 1개 이상 + 공유 네트워크·스토리지
```

- **최소 배포 단위** (컨테이너 아니라 Pod)
- 같은 Pod 컨테이너는 `localhost`로 통신, 볼륨 공유
- 보통 컨테이너 1개 = Pod 1개, 가끔 사이드카(로그 수집기 등) 추가
- **Pod는 일회용(ephemeral)**: 죽으면 되살리지 않고 **새 Pod 생성** (IP도 바뀜) → 그래서 Service 필요

### Deployment - Pod 관리자

```
Deployment → ReplicaSet → Pod들
"nginx Pod 3개 유지해라"
```

- **원하는 replica 수 유지** (죽으면 새로 띄움)
- **롤링 업데이트**: 이미지 버전 바꾸면 Pod 하나씩 교체 ([[deployment-strategies]])
- **롤백**: 이전 ReplicaSet으로 되돌림
- 대부분 워크로드는 Deployment로 관리

### Service - 안정된 주소

Pod IP는 계속 바뀜 → **고정 가상 IP + 로드밸런싱**:

```
Service (ClusterIP 10.0.0.5) → Pod들(바뀌는 IP) 자동 라우팅
```

- Pod가 죽고 새로 떠도 Service 주소는 그대로
- 요청을 여러 Pod로 분산 (network/[[load-balancing]])
- 셀렉터(label)로 대상 Pod 선택 → 상세는 [[kubernetes-networking]]

### 기타

- **Namespace**: 논리적 격리 (팀·환경 분리)
- **ConfigMap/Secret**: 설정·비밀 주입 (이미지 밖에서, security/[[secrets-management]])
- **Ingress**: 외부 HTTP 트래픽 진입 ([[kubernetes-networking]])

## 아키텍처

```
[컨트롤 플레인]                    [워커 노드들]
 - API Server (모든 요청 관문)      - kubelet (노드 에이전트)
 - etcd (상태 저장, 유일 진실원)     - 컨테이너 런타임 (containerd)
 - Scheduler (Pod를 노드에 배치)     - kube-proxy (Service 라우팅)
 - Controller Manager (조정 루프)
```

- **API Server**: 모든 것의 중심. `kubectl`도 여기 REST 호출
- **etcd**: 클러스터 상태 전부 저장 (분산 KV, Raft 합의 distributed-systems/[[consensus-and-consistency]]). 유일한 진실의 원천
- **Scheduler**: 새 Pod를 어느 노드에? (자원·제약 고려, os/[[cpu-scheduling]]의 스케줄링과 유사 문제)
- **kubelet**: 각 노드에서 "내 Pod들 살아있나" 확인, 컨테이너 런타임에 지시

## 선언 예 (YAML)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3              # 원하는 상태
  selector:
    matchLabels: {app: web}
  template:
    metadata:
      labels: {app: web}
    spec:
      containers:
      - name: web
        image: nginx:1.25   # 버전 고정 ([[dockerfile-best-practices]])
```

`kubectl apply -f` → API Server가 etcd에 저장 → 컨트롤러가 3개로 조정.

## 왜 이 모델이 강력한가

- **자가 치유**: 노드·Pod 죽어도 자동 복구 (조정 루프)
- **선언적 = 멱등**: 같은 YAML 여러 번 적용해도 결과 같음 ([[iac]]의 정신)
- **수평 확장**: replicas 늘리면 됨 (HPA로 자동)
- **이식성**: 어느 클라우드든 같은 API (벤더 락인 완화)
- **롤아웃 안전**: 롤링·롤백 내장 ([[deployment-strategies]])

## 왜 어려운가

- **복잡도**: 개념·오브젝트 많음, 러닝커브 가파름
- **네트워킹이 최난관**: Service/Ingress/DNS/CNI ([[kubernetes-networking]])
- **작은 규모엔 과함**: 컨테이너 몇 개면 불필요 (그냥 docker나 관리형 서비스)
- **디버깅**: 계층 많아 어디서 막혔는지 추적 (kubectl describe/logs, [[observability]])

## 연결

- 컨테이너 = 관리 대상 → [[docker-internals]]
- 조정 루프·etcd 합의 → distributed-systems/[[consensus-and-consistency]]
- Service 로드밸런싱·네트워킹 → [[kubernetes-networking]], network/[[load-balancing]]
- 롤링·롤백 → [[deployment-strategies]]
- 선언적·멱등 → [[iac]]
- Pod 스케줄링 → os/[[cpu-scheduling]]
- 설정·비밀 주입 → security/[[secrets-management]]
- 진단·관측 → [[observability]]

## 궁금한 것 (나중에)

- [ ] HPA (수평 오토스케일링) 동작
- [ ] StatefulSet vs Deployment (상태 있는 앱)
- [ ] Operator 패턴 (커스텀 컨트롤러로 조정 루프 확장)
- [ ] CRD (커스텀 리소스)
- [ ] Helm (패키지 매니저)

## 출처

- Kubernetes 공식 문서 (Concepts), "Kubernetes Up & Running"
