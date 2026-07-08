# 라우팅 (Routing)

## 한 줄 요약

패킷이 출발지에서 목적지까지 라우터를 거쳐 가는 경로를 정하는 것. 내부(OSPF)는 최단 경로, 인터넷 전체(BGP)는 정책과 자율 시스템 간 협상으로 결정된다. BGP가 인터넷을 하나로 묶는다.

## 왜 필요한가

- 패킷이 어떻게 전 세계를 가로지르나
- 인터넷이 어떻게 하나로 연결되나 (수만 개 네트워크)
- OSPF vs BGP의 차이

## 라우팅 vs 포워딩

- **포워딩(forwarding)**: 패킷 하나를 라우팅 테이블 보고 다음 홉으로 (즉각, 하드웨어)
- **라우팅(routing)**: 라우팅 테이블 자체를 만드는 것 (경로 계산, 프로토콜)

라우터가 목적 IP([[ip-addressing]])를 **longest prefix match**로 조회 → 다음 홉 결정. 이 조회가 radix tree (data-structures/[[tries]]).

## 두 계층: 내부 vs 외부

인터넷 = **자율 시스템(AS, Autonomous System)**들의 연결. 각 AS = 한 조직의 네트워크 (ISP, 회사, 대학):

- **내부 라우팅(intra-AS)**: AS 안에서 - OSPF, IS-IS. 목표 = **최단 경로**
- **외부 라우팅(inter-AS)**: AS 사이 - BGP. 목표 = **정책** (누구와 거래하나)

## 내부: OSPF (최단 경로)

AS 내부에서 최단 경로 계산:

- 각 라우터가 링크 상태(비용)를 전체에 광고 → 모두가 전체 지도를 앎
- **다익스트라**([[shortest-paths]] - algorithms의 그것!)로 최단 경로 계산
- 링크 비용(대역폭 등) 기반
- 변화(링크 다운) 시 재계산

algorithms/[[shortest-paths]]의 다익스트라가 실제 라우터에서 도는 곳.

## 외부: BGP (정책)

AS 사이 - 인터넷을 하나로 묶는 프로토콜:

- 각 AS가 "내가 도달 가능한 네트워크(IP 대역)"를 이웃 AS에 광고
- 경로 = AS 경로 (거쳐 갈 AS들의 목록)
- **최단이 아니라 정책 기반**: "이 이웃과 거래(peering)하나, 돈 내고 통과(transit)하나"

### 왜 정책인가

BGP는 최단 경로가 아님 - **비즈니스 관계**가 지배:

- **transit**: 돈 내고 상위 ISP를 통해 인터넷 접속
- **peering**: 대등한 AS끼리 무료로 트래픽 교환
- AS는 "돈 안 드는 경로 선호", "고객 트래픽 우선" 등 정책으로 경로 선택
- 그래서 지리적 최단이 아닐 수 있음 (서울→도쿄가 미국 경유하기도)

## BGP의 취약성

BGP는 **신뢰 기반**(email처럼 [[email-protocols]]) - 검증이 약함:

- **BGP 하이재킹**: 남의 IP 대역을 자기 것이라 광고 → 트래픽 탈취/차단
- 실제 사고: 파키스탄이 유튜브를 실수로 전 세계에서 차단(2008), 여러 하이재킹 사건
- **RPKI**로 광고 검증 추가 중 (느린 도입)
- 인터넷의 근간인데 보안이 나중에 덧붙여짐

## 라우팅 테이블

각 라우터의 테이블: `목적 대역 → 다음 홉`:

```
목적           다음 홉      인터페이스
10.0.0.0/8     10.1.1.1     eth0
0.0.0.0/0      203.0.113.1  eth1     ← 기본 경로 (default)
```

- **longest prefix match**: 가장 구체적인(긴 프리픽스) 매칭 선택 → data-structures/[[tries]] radix tree로 O(주소 길이)
- 인터넷 코어 라우터는 ~100만 개 경로 (BGP 전체 테이블) → 조회 최적화 중요

## 계층 요약

```
BGP (AS 간, 정책)
  ↕
OSPF/IS-IS (AS 내, 최단경로 = 다익스트라)
  ↕
포워딩 (패킷별, longest prefix match = radix tree)
```

## 연결

- IP 주소와 CIDR → [[ip-addressing]]
- 다익스트라 (OSPF) → algorithms/[[shortest-paths]]
- longest prefix match → data-structures/[[tries]]
- 신뢰 기반 취약성 → [[email-protocols]]
- traceroute로 경로 관찰 → [[icmp-and-tools]]

## 궁금한 것 (나중에)

- [ ] BGP 경로 선택 알고리즘 (local pref, AS path length)
- [ ] RPKI와 BGP 보안
- [ ] MPLS (레이블 스위칭)
- [ ] SDN (소프트웨어 정의 네트워킹)

## 출처

- Kurose & Ross 5.3-5.4 (라우팅 알고리즘, 인터넷 라우팅)
