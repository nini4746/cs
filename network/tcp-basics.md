# TCP 기초 (TCP Basics)

## 한 줄 요약

신뢰성 있는 연결 기반 전송. 3-way 핸드셰이크로 연결을 열고, 상태 머신으로 관리하며, 종료 시 TIME_WAIT로 지연 패킷을 처리한다. 인터넷 트래픽의 대부분이 TCP.

## 왜 필요한가

- 웹·파일·메일이 기대는 신뢰성의 기반
- 연결 설정/해제가 실제로 어떻게 되나
- TIME_WAIT이 왜 존재하나 (서버 운영 이슈)

## TCP가 주는 것

UDP([[udp]])와 달리 TCP는 **신뢰성 있는 바이트 스트림**:

- **연결 기반**: 통신 전 핸드셰이크
- **신뢰성**: 손실 재전송, 손상 검출 → [[tcp-reliability]]
- **순서 보장**: 시퀀스 번호로 재정렬
- **흐름 제어**: 수신자 속도에 맞춤
- **혼잡 제어**: 네트워크 부하 조절 → [[congestion-control]]

응용은 그냥 "바이트를 쓰고 읽음", TCP가 신뢰성을 처리.

## 3-way 핸드셰이크

연결을 여는 3단계:

```
클라이언트           서버
   SYN     →              "연결하자, 내 시퀀스=x"
           ←   SYN-ACK    "좋아, 내 시퀀스=y, x+1 받음"
   ACK     →              "y+1 받음, 시작"
```

- **왜 3번인가**: 양쪽이 서로의 시퀀스 번호를 알고 확인해야 (양방향 동기화). 2번이면 한쪽만 확인
- 실측: `example.com:80` 연결 = 핸드셰이크 완료까지 **27.9ms** (1 RTT). 로컬 소켓 `10.19.247.131:63486` → 원격 `104.20.23.154:80`
- 이 1 RTT가 연결마다 드는 비용 → HTTP keep-alive([[http]])가 연결 재사용하는 이유

## TCP 상태 머신

TCP 연결은 **상태 머신**으로 관리 (automata/[[dfa-nfa]]의 유한 상태):

```
CLOSED → (SYN 보냄) → SYN_SENT → (SYN-ACK 받음) → ESTABLISHED
                                                      ↓ (닫기)
ESTABLISHED → FIN_WAIT → ... → TIME_WAIT → CLOSED
```

- **LISTEN**: 서버가 연결 대기
- **ESTABLISHED**: 데이터 주고받는 중
- **TIME_WAIT**: 종료 후 대기 (아래)

`netstat`/`ss`로 실제 연결 상태 확인 가능. 프로토콜 상태 머신의 실전 예 → automata/[[dfa-nfa]].

## 연결 종료: 4-way

각 방향을 독립적으로 닫음 (전이중):

```
FIN → / ← ACK    (한쪽이 "더 보낼 것 없음")
← FIN / ACK →    (다른 쪽도 닫음)
```

각 방향에 FIN+ACK → 4번. 실측에서 `s.close()`가 이 FIN 교환.

## TIME_WAIT의 이유

능동적으로 닫은 쪽이 **TIME_WAIT 상태로 일정 시간(보통 2×MSL, ~1분) 대기**:

- **지연 패킷 처리**: 네트워크에 떠도는 옛 패킷이 새 연결에 섞이지 않게
- **마지막 ACK 재전송 보장**: 상대의 FIN에 대한 ACK가 손실되면 재전송

**서버 운영 이슈**: 대량 연결을 열고 닫는 서버는 TIME_WAIT 소켓이 쌓여 포트 고갈 → `SO_REUSEADDR`, keep-alive로 완화. 실무에서 자주 만나는 문제.

## 시퀀스 번호와 ACK

- **시퀀스 번호**: 각 바이트에 번호 → 순서·재전송의 기반
- **ACK 번호**: "여기까지 받았다" (누적 확인)
- 이것으로 신뢰성·순서를 구현 → [[tcp-reliability]]

## 헤드 오브 라인 블로킹

TCP의 순서 보장이 만드는 부작용:
- 패킷 하나 손실 → 뒤 패킷 도착해도 **순서 위해 대기** (앱에 전달 못 함)
- HTTP/2조차 이 TCP 레벨 blocking을 못 피함 → QUIC이 UDP로 우회 ([[http]], [[quic]])

## 연결

- 반대편 UDP → [[udp]]
- 신뢰성 메커니즘 → [[tcp-reliability]]
- 혼잡 제어 → [[congestion-control]]
- 상태 머신 = FSM → automata/[[dfa-nfa]]
- IP 위에서 → [[ip-addressing]]
- keep-alive → [[http]]
- 소켓 API → [[sockets]]

## 궁금한 것 (나중에)

- [ ] SYN flood 공격과 SYN 쿠키 → security/
- [ ] TCP Fast Open (0-RTT 데이터)
- [ ] TIME_WAIT 튜닝 (서버 운영)
- [ ] 시퀀스 번호 초기값 랜덤화 (보안)

## 출처

- Kurose & Ross 3.5 (연결 지향 전송: TCP)
