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

## 셀프 체크

> [!question]- traceroute는 TTL을 어떻게 역이용해 경로의 각 홉을 알아내나?
> TTL은 IP 헤더의 남은 홉 수로, 라우터를 지날 때마다 1 감소하고 0이 되면 라우터가 패킷을 버리며 ICMP 시간 초과를 보낸다. traceroute는 TTL=1부터 하나씩 늘려 보내, 각 TTL에서 패킷을 버리는 라우터가 보내는 ICMP 응답의 출발지로 그 홉의 라우터를 알아낸다.

> [!question]- ping이 응답하지 않는다고 해서 서비스가 죽었다고 단정할 수 없는 이유는?
> 많은 방화벽이 ICMP flood나 스캐닝 악용을 막기 위해 ICMP를 차단한다. 그래서 ping(ICMP echo)은 막혀 있어도 HTTP 같은 상위 서비스는 정상 동작할 수 있다. 도달성 판단은 해당 서비스 포트로 직접 연결(curl/telnet)해 확인해야 한다.

> [!question]- ping이 측정하는 RTT는 어떤 지연 요소들로 구성되나?
> 왕복 지연(RTT)은 전파 지연(신호가 물리적으로 이동), 처리 지연(라우터의 헤더 검사·경로 결정), 큐잉 지연(혼잡 시 버퍼 대기)의 합이다. 이 중 큐잉이 혼잡도에 따라 가변이라 지연 스파이크의 주범이다.

> [!question]- 계층별 진단 사고 흐름에서 ping은 되는데 traceroute가 특정 홉에서 멈추면 무엇을 의심하나?
> ping으로 도달성(링크/네트워크 계층)은 확인됐으니, traceroute가 특정 홉에서 멈추면 그 지점의 라우팅 문제나 해당 라우터가 ICMP 시간 초과 응답을 차단하는 상황을 의심한다. 목적지까지 최종 도달하는지, 특정 구간에서만 응답이 끊기는지로 라우팅 문제 위치를 좁힌다.

## 연습문제

> [!example]- 문제: `traceroute example.com`이 홉 5에서 세 번 모두 `* * *`(무응답)를 찍고, 홉 6부터 다시 정상 응답이 나온다. 목적지에는 정상 도달했다. 홉 5에서 무슨 일이 일어난 것인지 해석하라.
> **풀이**
> 홉 5의 라우터가 TTL 만료 시 ICMP 시간 초과 메시지를 보내지 않도록 설정(ICMP rate limit 또는 응답 차단)되어 있는 경우다. 패킷 자체는 홉 5를 정상적으로 통과했다 - 홉 6 이후가 응답하고 목적지에도 도달했기 때문이다. 즉 홉 5는 "죽은 라우터"가 아니라 "진단 응답만 안 하는 라우터"다. 경로 자체는 정상이므로 문제로 볼 필요 없다.

> [!example]- 문제: 어떤 서버로 `ping`은 성공(RTT 정상)하지만 `curl http://서버:80`은 timeout이 난다. 진단 사고 흐름에 따라 원인 후보를 계층별로 나열하고 다음 확인 단계를 제시하라.
> **풀이**
> ping 성공 → 링크/네트워크 계층 도달성은 정상(IP 라우팅 OK). 문제는 전송/응용 계층에 있다.
> 후보: (1) 80 포트에서 서비스가 안 떠 있음(프로세스 다운), (2) 방화벽이 80 포트만 차단, (3) 서비스는 떴지만 응답 지연/과부하.
> 다음 단계: `telnet 서버 80` 또는 `nc -zv 서버 80`으로 TCP 연결 자체가 되는지 확인 → 연결되면 응용 계층(HTTP) 문제, 연결 거부/timeout이면 포트 차단이나 서비스 다운. 이어 `tcpdump`로 SYN에 대한 SYN-ACK가 오는지 실제 패킷을 관찰해 확정한다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지. (1) ICMP가 IP의 무엇을 보조하는지(오류 보고·진단), ping과 traceroute가 각각 어떤 ICMP 메시지를 쓰는지 말할 수 있나. (2) traceroute의 TTL 역이용 메커니즘을 홉별로 그릴 수 있나. (3) 계층별 진단 흐름(ping→DNS→traceroute→포트→tcpdump)으로 문제 위치를 좁히는 논리를 설명할 수 있나.

## 연결

- IP 위에서 → [[ip-addressing]]
- TTL과 경로 → [[routing]]
- DNS 도구 → [[dns]]
- 연결 상태 = TCP FSM → [[tcp-basics]]
- 패킷 캡처 → [[packet-capture]]
- 계층 진단 → [[internet-overview]]
- ping/traceroute/netstat/tcpdump 진단 도구 → devops/[[linux-debugging]]
- ICMP flood·스캐닝 악용 → security/[[threat-modeling]]

## 궁금한 것 (나중에)

- [ ] PMTU discovery (Path MTU)
- [ ] traceroute가 UDP/ICMP/TCP 중 뭘 쓰나 (OS별)
- [ ] ICMP 기반 공격과 방어
- [ ] mtr로 지속 모니터링

## 출처

- Kurose & Ross 5.6 (ICMP)
