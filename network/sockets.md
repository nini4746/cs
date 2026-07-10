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

## 셀프 체크

> [!question]- 서버가 다루는 리스닝 소켓과 연결 소켓은 어떻게 다른가?
> 리스닝 소켓은 bind/listen으로 만들어 연결 요청을 대기하는 소켓 하나이고, 연결 소켓은 accept()가 새 연결마다 반환하는 클라이언트별 실제 통신용 소켓이다. 리스닝 소켓은 계속 대기하고 통신은 연결 소켓으로 하기 때문에 한 포트로 여러 클라이언트를 동시에 처리할 수 있다.

> [!question]- TCP 서버와 클라이언트의 시스템 콜 호출 순서를 각각 말하라.
> 서버: socket() → bind() → listen() → accept()(블록) → recv()/send() → close(). 클라이언트: socket() → connect()(3-way 핸드셰이크) → send()/recv() → close()(FIN 교환). accept와 connect가 만나는 지점이 핸드셰이크다.

> [!question]- SO_REUSEADDR는 무엇을 해결하나?
> 이전 연결의 TIME_WAIT 소켓이 포트를 붙잡고 있어도 재바인딩을 허용해, 서버 재시작 시 "Address already in use" 오류를 피한다. 사실상 서버의 필수 옵션이다.

> [!question]- 블로킹 소켓과 논블로킹 소켓의 차이, 그리고 논블로킹이 왜 이벤트 루프와 조합되나?
> 블로킹 recv()는 데이터가 올 때까지 스레드를 멈춰 스레드 하나가 한 연결에 묶인다. 논블로킹은 데이터가 없으면 즉시 반환하므로, epoll/kqueue 같은 이벤트 루프가 한 스레드로 여러 소켓을 감시하며 준비된 것만 처리해 고성능 서버를 만든다.

## 연습문제

> [!example]- 문제: "스레드 per 연결" 서버가 동시 10,000 연결에서 왜 무너지고(C10K), 이벤트 루프는 이를 어떻게 해결하는지 소켓 API 관점에서 설명하라.
> **풀이**
> 스레드 per 연결은 연결마다 스레드/프로세스를 하나씩 만들어 각 스레드가 블로킹 recv()로 대기한다. 1만 연결이면 1만 스레드 → 스택 메모리와 컨텍스트 스위칭 비용이 폭발한다. 이벤트 루프(epoll/kqueue)는 소켓을 논블로킹으로 두고 한 스레드가 다수 소켓을 감시하다 준비된 소켓만 recv/send 처리하므로, 연결 수가 늘어도 스레드가 늘지 않는다. nginx/Redis/Node가 이 방식이다.

> [!example]- 문제: 에코 서버에 클라이언트가 connect → send("hello socket") → recv 순으로 요청할 때, 커널 레벨에서 오가는 TCP 이벤트를 소켓 콜과 짝지어 추적하라.
> **풀이**
> connect() → 클라이언트가 SYN 전송, 서버 커널이 SYN-ACK, 클라이언트 ACK로 3-way 핸드셰이크 완료. 이 시점 서버의 accept()가 블록을 풀고 연결 소켓을 반환한다.
> send("hello socket") → 데이터 세그먼트가 서버로 가고 서버 recv()가 이를 읽음, 서버는 ACK로 확인.
> 서버 send("echo: hello socket") → 응답 세그먼트가 클라이언트로, 클라이언트 recv()가 읽고 ACK.
> close() → FIN/ACK를 각 방향으로 교환(4-way)하며 종료. 결과: `server replied: echo: hello socket`.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 소켓이 파일 디스크립터 추상이고 시스템 콜로 커널에 진입한다는 점, (2) 서버/클라이언트 콜 순서와 리스닝 vs 연결 소켓의 구분, (3) 다수 연결 처리에서 스레드 per 연결의 한계와 논블로킹+이벤트 루프의 해법을 설명할 수 있어야 한다.

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
