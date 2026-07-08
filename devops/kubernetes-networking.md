# 쿠버네티스 네트워킹 (Kubernetes Networking)

## 한 줄 요약

k8s의 최난관. 규칙은 단순 - "모든 Pod가 NAT 없이 서로 직접 통신"하는 평평한 네트워크. 하지만 Pod IP는 계속 바뀌므로 Service(안정 IP+LB)와 DNS로 추상화하고, 외부 진입은 Ingress로, 실제 구현은 CNI 플러그인이 맡는다.

## 왜 필요한가

- Pod IP가 계속 바뀌는데 어떻게 서로 찾나
- 외부 트래픽이 클러스터로 어떻게 들어오나
- 왜 k8s에서 네트워크가 제일 어렵다고 하나

## k8s 네트워크 모델 (규칙)

k8s가 요구하는 근본 규칙 - **평평한(flat) 네트워크**:

```
1. 모든 Pod는 고유 IP
2. 모든 Pod가 NAT 없이 서로 통신 (노드 넘어도)
3. 노드도 Pod와 NAT 없이 통신
```

- 도커 기본(각 호스트가 별도 브리지, NAT)과 다름
- "클러스터 전체가 하나의 평평한 네트워크인 척"
- **이 추상을 실제로 만드는 게 CNI** (아래)

## 계층별로

### Pod 내부

- 한 Pod의 컨테이너들은 **같은 네트워크 namespace** (os/[[virtualization-and-containers]])
- 서로 `localhost:포트`로 통신 ([[kubernetes-basics]]의 Pod)

### Pod ↔ Pod

- 각 Pod 고유 IP → 직접 통신
- **문제**: Pod는 일회용, IP가 계속 바뀜 → 직접 IP 의존 불가 → Service 필요

### Service - 안정된 추상

```
Service (ClusterIP, 고정) → label 셀렉터로 Pod 집합 → LB
```

동작 원리 (kube-proxy):
- Service는 가상 IP. 실제 Pod로 가려면 **패킷 리라이트** 필요
- **kube-proxy**가 각 노드에 iptables/IPVS 규칙 설치 → ClusterIP로 온 패킷을 실제 Pod IP로 DNAT
- 커널 레벨 로드밸런싱 (network/[[load-balancing]])

Service 종류:
- **ClusterIP**: 클러스터 내부 전용 (기본)
- **NodePort**: 각 노드의 특정 포트로 외부 노출 (30000~)
- **LoadBalancer**: 클라우드 LB 프로비저닝 (외부 IP)
- **headless**: ClusterIP 없이 Pod IP 직접 (StatefulSet용)

### DNS - 이름으로 찾기

IP 아니라 **이름으로 Service 발견** (network/[[dns]]):

```
web-service.default.svc.cluster.local → ClusterIP
같은 namespace면 그냥 `web-service`
```

- **CoreDNS**가 클러스터 내부 DNS 제공
- Service 만들면 자동으로 DNS 레코드 생성
- 서비스 디스커버리의 핵심 (distributed-systems/[[coordination-services]] 개념)

### Ingress - 외부 HTTP 진입

```
인터넷 → Ingress (L7 라우팅) → 여러 Service
  example.com/api  → api-service
  example.com/web  → web-service
```

- **L7(HTTP) 라우팅**: 호스트·경로 기반 (network/[[http]])
- Service별로 LoadBalancer 만들면 비쌈 → Ingress 하나로 여러 Service 라우팅
- **Ingress Controller**(nginx, traefik 등)가 실제 구현 - Ingress 리소스는 규칙 선언일 뿐
- TLS 종료도 여기서 (network/[[tls]])

## CNI - 실제 구현

**Container Network Interface** - Pod 네트워크를 실제로 만드는 플러그인:

- k8s는 네트워크 모델(규칙)만 정의, **구현은 CNI에 위임**
- Calico, Cilium, Flannel 등
- 노드 간 Pod 통신을 오버레이(VXLAN 등) 또는 라우팅으로 실현
- **Cilium은 eBPF 기반** ([[linux-debugging]]의 eBPF) - kube-proxy 대체도
- NetworkPolicy(방화벽 규칙)도 CNI가 강제

## 왜 네트워크가 최난관인가

- **계층이 많음**: Pod → Service → DNS → Ingress → CNI, 어디서 끊겼는지 추적 어려움
- **추상 위 추상**: 가상 IP가 실제 어디로 가는지 안 보임 (iptables 규칙 수백 개)
- **CNI마다 다름**: 구현체별 동작·디버깅 상이
- **DNS 문제 흔함**: 서비스 못 찾음의 상당수가 DNS
- 진단은 계층적으로 ([[linux-debugging]], network/[[icmp-and-tools]]): Pod→Service→DNS→Ingress 순 확인

## 연결

- 안정 IP 필요 이유 (Pod 일회용) → [[kubernetes-basics]]
- Pod 네트워크 namespace → os/[[virtualization-and-containers]]
- Service LB → network/[[load-balancing]]
- 이름 해석 → network/[[dns]]
- Ingress L7·TLS → network/[[http]], [[tls]]
- CNI eBPF → [[linux-debugging]]
- 계층적 진단 → network/[[icmp-and-tools]]

## 궁금한 것 (나중에)

- [ ] iptables vs IPVS vs eBPF 모드 kube-proxy
- [ ] NetworkPolicy 상세 (마이크로세그멘테이션)
- [ ] 서비스 메시 (Istio, Linkerd) - 사이드카 프록시
- [ ] 오버레이 vs 네이티브 라우팅 CNI

## 출처

- Kubernetes 공식 문서 (Services, Networking), CNI 스펙
