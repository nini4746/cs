# 소켓 (Sockets)

## 한 줄 요약

소켓은 네트워크 통신의 프로그래밍 인터페이스 - 파일처럼 읽고 쓰는 추상. 서버는 bind/listen/accept, 클라이언트는 connect로 TCP 연결을 만들고 send/recv로 데이터를 주고받는다.

## 왜 필요한가

- 앱이 실제로 네트워크를 어떻게 쓰나
- TCP 이론([[tcp-basics]])을 코드로
- 서버가 어떻게 여러 연결을 처리하나 → os/[[io-multiplexing]]

## 소켓 = 네트워크의 파일 추상

**소켓**: 통신 종단점. 유닉스 철학대로 **파일 디스크립터**처럼 다룸 (os/[[file-system-basics]]):

- 소켓을 열고(파일처럼) → 읽고/쓰고 → 닫음
- OS가 TCP/IP 스택을 처리, 앱은 소켓 API만
- 시스템 콜로 커널 진입 → os/[[exceptions-and-interrupts]], [[limited-direct-execution]]

## TCP 서버-클라이언트 흐름

```
서버                          클라이언트
socket()   소켓 생성          socket()
bind()     주소:포트 할당
listen()   연결 대기 모드
accept()   연결 수락 (블록) ← connect()  연결 (3-way handshake → [[tcp-basics]])
recv()     데이터 받기    ← send()      데이터 보내기
send()     응답 보내기    → recv()      응답 받기
close()    닫기 (FIN)       close()
```

실측 (에코 서버/클라이언트):
```
클라이언트: connect → send("hello socket") → recv
서버: accept → recv → send("echo: ...")
결과: server replied: echo: hello socket
```

전체 왕복이 소켓 API로. `connect()`가 [[tcp-basics]]의 3-way 핸드셰이크, `close()`가 FIN 교환.

## 핵심 시스템 콜

| 콜 | 역할 |
|---|---|
| `socket()` | 소켓 생성 (TCP/UDP, IPv4/6) |
| `bind()` | 로컬 주소:포트 할당 (서버) |
| `listen()` | 연결 대기 큐 설정 (서버) |
| `accept()` | 대기 중인 연결 수락 → 새 소켓 반환 |
| `connect()` | 서버에 연결 (클라이언트, 핸드셰이크) |
| `send()/recv()` | 데이터 송수신 |
| `close()` | 소켓 닫기 |

- **TCP**: SOCK_STREAM (연결, 신뢰성 → [[tcp-basics]])
- **UDP**: SOCK_DGRAM (비연결, bind 후 sendto/recvfrom → [[udp]])

## accept의 이중 소켓

핵심 포인트: 서버는 **두 종류 소켓**:
- **리스닝 소켓**: 연결 대기 (bind/listen)
- **연결 소켓**: accept가 반환, 각 클라이언트와의 실제 통신

`accept()`가 새 연결마다 새 소켓을 만듦 → 리스닝 소켓은 계속 대기, 연결 소켓으로 통신. 그래서 한 포트로 여러 클라이언트 동시 처리.

## SO_REUSEADDR

실측 코드의 `setsockopt(SO_REUSEADDR)`: TIME_WAIT([[tcp-basics]]) 소켓이 포트를 붙잡고 있어도 재바인딩 허용. 서버 재시작 시 "Address already in use" 회피. 서버 필수 옵션.

## 여러 연결 처리

서버가 수많은 클라이언트를 어떻게? → os/[[io-multiplexing]]:

1. **스레드/프로세스 per 연결**: 연결마다 하나. 간단하지만 수천이면 폭발 (C10K)
2. **이벤트 루프 (epoll/kqueue)**: 한 스레드가 여러 소켓 감시 → nginx/Redis/Node ([[io-multiplexing]])
3. **비동기 (async/await)**: 이벤트 루프 위 추상

소켓 API + 이벤트 루프가 고성능 서버의 기반. os/[[io-multiplexing]]과 직결.

## 블로킹 vs 논블로킹

- **블로킹**: `recv()`가 데이터 올 때까지 멈춤 (기본). 스레드 하나가 한 연결
- **논블로킹**: 데이터 없으면 즉시 반환 → 이벤트 루프와 조합 → os/[[io-multiplexing]]

## 연결

- TCP 연결 → [[tcp-basics]]
- UDP 소켓 → [[udp]]
- 소켓 = 파일 디스크립터 → os/[[file-system-basics]]
- 시스템 콜 → os/[[limited-direct-execution]]
- 여러 연결 처리 → os/[[io-multiplexing]]
- 패킷 관찰 → [[packet-capture]]

## 궁금한 것 (나중에)

- [ ] TCP send 버퍼와 부분 전송 (send가 다 안 보낼 수 있음)
- [ ] 유닉스 도메인 소켓 (로컬 IPC)
- [ ] SO_REUSEPORT (여러 프로세스가 한 포트)
- [ ] 소켓 옵션 (TCP_NODELAY, keepalive)

## 출처

- Kurose & Ross 2.7 (소켓 프로그래밍), "Unix Network Programming" (Stevens)
