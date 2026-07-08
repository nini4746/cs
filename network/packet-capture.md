# 패킷 캡처 (Packet Capture)

## 한 줄 요약

네트워크를 지나는 실제 패킷을 잡아 계층별로 뜯어보는 것. tcpdump(CLI)와 Wireshark(GUI)가 도구. 이론으로 배운 헤더·핸드셰이크를 눈으로 확인하는 최고의 학습·디버깅 수단.

## 왜 필요한가

- 이론(TCP 핸드셰이크, 캡슐화)을 실제 패킷으로 확인
- 네트워크 문제의 근본 진단 (무슨 일이 실제로 일어났나)
- 프로토콜을 눈으로 이해

## 도구

- **tcpdump**: CLI, 어디서나 (서버). 필터로 캡처, 텍스트 출력
- **Wireshark**: GUI, 강력한 분석 (계층별 트리, 흐름 추적, 통계). 학습에 최고
- **tshark**: Wireshark의 CLI 버전
- 캡처 파일(pcap)로 저장 → 나중에 분석/공유

## 어떻게 잡나

네트워크 인터페이스를 **promiscuous 모드**로 → 자기 것 아닌 패킷도 캡처:

- OS의 패킷 캡처 라이브러리(libpcap) 사용 → os/[[io-devices]]의 드라이버 레벨
- 커널이 네트워크 스택을 지나는 패킷을 복사해 전달
- 스위치 환경([[ethernet-and-arp]])에선 자기/브로드캐스트 트래픽만 (스위치가 격리) → 미러 포트 필요

## 계층별로 뜯어보기

캡처한 패킷 하나 = 캡슐화([[internet-overview]])의 역순으로 해부:

```
프레임: [이더넷: 출발/목적 MAC]        ← 링크 ([[ethernet-and-arp]])
        [IP: 출발/목적 IP, TTL]        ← 네트워크 ([[ip-addressing]])
        [TCP: 포트, 시퀀스, 플래그]    ← 전송 ([[tcp-basics]])
        [HTTP: 메서드, 헤더]           ← 응용 ([[http]])
```

Wireshark가 각 계층을 펼쳐 보여줌 → 캡슐화가 눈에 보임. 지금까지 배운 모든 계층이 한 패킷에.

## 이론을 눈으로 확인

패킷 캡처로 배운 것들을 실제로:

- **3-way 핸드셰이크**([[tcp-basics]]): SYN → SYN-ACK → ACK 패킷 3개가 실제로 보임
- **TCP 시퀀스/ACK 번호**([[tcp-reliability]]): 번호가 증가하고 ACK가 따라오는 것
- **재전송**: 손실 시 같은 시퀀스 재전송
- **DNS 조회**([[dns]]): 질의/응답 패킷, 레코드
- **ARP**([[ethernet-and-arp]]): 브로드캐스트 질의/응답
- **TLS 핸드셰이크**([[tls]]): ClientHello/ServerHello (이후는 암호화라 내용 안 보임)

"SYN 플래그가 켜진 패킷"을 실제로 보면 이론이 구체화됨.

## 필터

관심 트래픽만 (전체는 너무 많음):

```
tcpdump: port 80, host example.com, tcp
Wireshark: http, tcp.port==443, ip.addr==1.2.3.4, tcp.flags.syn==1
```

- **캡처 필터**(잡을 때): 성능 (안 잡음)
- **디스플레이 필터**(볼 때): 유연 (다 잡고 걸러봄)

## 진단 활용

[[icmp-and-tools]]의 계층 진단에서 최종 수단:

- "요청은 나갔나?" → 캡처로 확인
- "응답이 왔나, 무슨 오류?" → 실제 패킷
- "재전송이 많나?" → TCP 문제 진단
- "TLS 핸드셰이크 어디서 실패?" → ClientHello 후 끊김
- 로그로 안 보이는 것을 패킷이 보여줌

## 보안·윤리

- 패킷 캡처 = **남의 통신을 볼 수 있음** → 자기 네트워크/권한 있는 곳에서만
- 평문 프로토콜(HTTP)은 다 보임 → HTTPS([[tls]]) 필요성의 실증
- 암호화된 트래픽(TLS)은 메타데이터(누가-누구, 크기)만 보임, 내용은 안 보임
- 침입 탐지·포렌식에도 사용 (방어 목적)

## 연결

- 캡슐화 → [[internet-overview]]
- 각 계층 → [[ethernet-and-arp]], [[ip-addressing]], [[tcp-basics]], [[http]]
- 드라이버 레벨 캡처 → os/[[io-devices]]
- 계층 진단 → [[icmp-and-tools]]
- 암호화가 내용 숨김 → [[tls]]

## 궁금한 것 (나중에)

- [ ] BPF (Berkeley Packet Filter) - 커널 필터링
- [ ] Wireshark 흐름 그래프와 통계
- [ ] TLS 세션 키로 복호화 (디버깅용)
- [ ] eBPF로 커널 레벨 관측

## 출처

- Kurose & Ross Wireshark 실습, tcpdump/Wireshark 문서
