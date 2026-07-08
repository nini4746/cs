# ICMP와 네트워크 도구 (ICMP and Tools)

## 한 줄 요약

ICMP는 IP의 오류 보고·진단 프로토콜. ping은 ICMP echo로 도달성·지연을 재고, traceroute는 TTL을 증가시키며 경로의 각 홉을 알아낸다. 네트워크 디버깅의 기본 도구.

## 왜 필요한가

- ping/traceroute가 실제로 어떻게 동작하나
- 네트워크 문제를 어떻게 진단하나
- TTL의 영리한 활용

## ICMP

**ICMP(Internet Control Message Protocol)**: IP([[ip-addressing]])의 보조 - 오류 보고와 진단:

- IP는 오류 나도 조용히 버림 → ICMP가 "왜 실패했나" 알림
- 예: **목적지 도달 불가**, **시간 초과(TTL 만료)**, **echo 요청/응답**(ping)
- IP 위에 얹히지만 상위 프로토콜은 아님 (제어용)

## ping: 도달성과 지연

**ICMP echo 요청/응답**으로 "거기 있나? 얼마나 걸리나":

```
1. ICMP echo 요청 전송
2. 대상이 ICMP echo 응답
3. 왕복 시간(RTT) 측정
```

실측 (`ping example.com`):
```
3 packets transmitted, 3 received, 0.0% loss
RTT min/avg/max = 4.927/5.323/5.754 ms
```

- **도달성**: 응답 오면 살아있음 (단, ICMP 차단하는 곳도 많음)
- **RTT**: 왕복 지연 (5.3ms) → [[internet-overview]]의 전파+처리+큐잉
- **손실률**: 패킷 손실 비율 (네트워크 품질)

## traceroute: 경로 추적

**TTL(Time To Live)을 영리하게 이용**해 경로의 각 홉을 알아냄:

TTL = IP 헤더의 "남은 홉 수". 라우터를 지날 때마다 1 감소, 0되면 라우터가 패킷을 버리고 **ICMP 시간 초과**를 보냄. traceroute는 이걸 역이용:

```
TTL=1로 보냄 → 첫 라우터가 버리고 ICMP 응답 → 1번 홉 정체 파악
TTL=2로 보냄 → 두 번째 라우터가 응답 → 2번 홉
TTL=3, 4, ... 목적지 도달까지 반복
```

실측 (`traceroute example.com`):
```
1  uwir-ads-1...washington.edu (10.18.0.2)  91ms
2  uwcr-ads-2...washington.edu (10.132.5.15) 10ms
...
7  icar-sttl2...pnw-gigapop.net (209.124.180.158) 5ms
```

각 홉의 라우터 이름·IP·지연이 드러남. 워싱턴대 내부망 → 지역 기가팝 → ... 경로가 보임 → [[routing]]의 실제 경로. TTL이 원래 목적(무한 루프 방지)과 다르게 진단에 쓰임.

## 다른 진단 도구

| 도구 | 용도 |
|---|---|
| **ping** | 도달성, RTT, 손실 |
| **traceroute** | 경로의 각 홉 |
| **dig/nslookup** | DNS 조회 → [[dns]] |
| **netstat/ss** | 연결 상태 (TCP 상태 머신 → [[tcp-basics]]) |
| **tcpdump/Wireshark** | 패킷 캡처 → [[packet-capture]] |
| **mtr** | ping + traceroute 결합 (연속) |
| **curl -v** | HTTP 요청 상세 → [[http]] |

## 진단 사고 흐름

네트워크 문제를 계층으로 진단 ([[internet-overview]]):

```
1. ping IP → 도달성? (링크/네트워크 계층)
2. ping 도메인 → DNS 되나? ([[dns]])
3. traceroute → 어디서 끊기나? (라우팅)
4. curl/telnet 포트 → 서비스 살아있나? (전송/응용)
5. tcpdump → 실제 패킷은? ([[packet-capture]])
```

계층별로 좁혀가며 문제 위치 파악.

## ICMP의 양면

- **유용**: 진단, PMTU 발견 (경로 최대 패킷 크기)
- **악용**: ICMP flood(DDoS), 스캐닝 → 많은 방화벽이 ICMP 차단 → ping 안 되지만 서비스는 살아있을 수 있음
- Smurf 공격 등 역사적 남용 → security/

## 연결

- IP 위에서 → [[ip-addressing]]
- TTL과 경로 → [[routing]]
- DNS 도구 → [[dns]]
- 연결 상태 = TCP FSM → [[tcp-basics]]
- 패킷 캡처 → [[packet-capture]]
- 계층 진단 → [[internet-overview]]

## 궁금한 것 (나중에)

- [ ] PMTU discovery (Path MTU)
- [ ] traceroute가 UDP/ICMP/TCP 중 뭘 쓰나 (OS별)
- [ ] ICMP 기반 공격과 방어
- [ ] mtr로 지속 모니터링

## 출처

- Kurose & Ross 5.6 (ICMP)
