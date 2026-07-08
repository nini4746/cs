# WebSocket과 SSE (실시간 통신)

## 한 줄 요약

HTTP의 요청-응답을 넘어 서버가 클라이언트에 실시간으로 밀어주는 방법들. 폴링(반복 요청), SSE(서버→클라이언트 단방향 스트림), WebSocket(양방향 지속 연결). 용도에 따라 선택한다.

## 왜 필요한가

- HTTP는 클라이언트가 물어봐야 응답 → 실시간 푸시가 안 됨
- 채팅·알림·라이브 업데이트를 어떻게 하나
- 폴링 vs SSE vs WebSocket 선택

## 문제: HTTP는 pull

HTTP(network/[[http]])는 **클라이언트가 요청해야 서버가 응답** (pull). 서버가 먼저 못 보냄:

- 새 메시지·알림이 생겨도 클라이언트가 물어봐야 앎
- 실시간(채팅, 주식, 알림)엔 부적합
- 해결책 세 가지:

## 1. 폴링 (polling)

주기적으로 반복 요청 (가장 단순):

### 짧은 폴링 (short polling)

```
setInterval(() => fetch('/updates'), 3000);  // 3초마다 물어봄
```
- 간단하지만 **낭비**: 변화 없어도 계속 요청, 지연(폴링 간격만큼)
- 서버 부하, 대역폭 낭비

### 롱 폴링 (long polling)

```
요청 → 서버가 새 데이터 있을 때까지 응답 보류 → 데이터 생기면 응답 → 즉시 재요청
```
- 변화 없으면 연결 유지(대기) → 즉시성↑, 빈 요청↓
- WebSocket 전 실시간의 표준이었음. 여전히 폴백으로

## 2. SSE (Server-Sent Events)

**서버 → 클라이언트 단방향** 스트림 (HTTP 위):

```js
const es = new EventSource('/stream');
es.onmessage = (e) => console.log(e.data);  // 서버가 밀어주는 데이터
```

- **단방향**: 서버가 클라이언트로만 (클라이언트→서버는 일반 HTTP)
- **HTTP 위**: 일반 HTTP 연결을 열어두고 서버가 계속 씀 → 프록시·방화벽 친화
- **자동 재연결**, 이벤트 ID (끊기면 이어받기)
- **용도**: 알림, 라이브 피드, 진행 상황, 주식 시세 (서버→클라 단방향이면 충분)
- 간단함이 장점 (WebSocket보다 가벼움)

## 3. WebSocket

**양방향 지속 연결**:

```js
const ws = new WebSocket('wss://example.com');
ws.onmessage = (e) => ...;   // 받기
ws.send('hello');            // 보내기 (언제든)
```

- **양방향(full-duplex)**: 양쪽이 언제든 전송
- **지속 연결**: HTTP로 시작(Upgrade 핸드셰이크) 후 프로토콜 전환 → TCP 위 독자 프레이밍 (network/[[tcp-basics]])
- **낮은 오버헤드**: 연결 후 헤더 없이 메시지 (HTTP 헤더 반복 없음)
- **용도**: 채팅, 실시간 게임, 협업 편집, 양방향 필요한 것
- 대가: 상태 유지 연결 관리 (확장 시 복잡 → 여러 서버 간 메시지 라우팅, distributed-systems/[[message-queues]])

## 선택 가이드

| | 폴링 | SSE | WebSocket |
|---|---|---|---|
| 방향 | 요청-응답 | 서버→클라 | 양방향 |
| 연결 | 반복 | 지속 (HTTP) | 지속 (전용) |
| 복잡도 | 낮음 | 중간 | 높음 |
| 오버헤드 | 높음 | 낮음 | 최저 |
| 용도 | 간단·낮은 빈도 | 알림·피드 | 채팅·게임 |

- **서버→클라 단방향이면 SSE** (간단, HTTP 친화)
- **양방향 필요하면 WebSocket** (채팅, 게임)
- **가끔 확인이면 폴링** (오버엔지니어링 회피)

## 실시간의 인프라 문제

지속 연결은 확장 시 어려움:

- **연결 상태**: 각 연결이 서버 리소스 (수만 연결 → os/[[io-multiplexing]]의 C10K)
- **여러 서버 간**: 사용자 A(서버1)가 B(서버2)에게 메시지 → 서버 간 라우팅 필요 (Redis pub/sub, 메시지 큐 → distributed-systems/[[message-queues]])
- **로드 밸런싱**: sticky session 또는 상태 외부화
- 이벤트 루프(os/[[io-multiplexing]], [[javascript-event-loop]])가 많은 연결 처리의 기반

## 연결

- HTTP pull 모델 → network/[[http]]
- TCP 위 WebSocket → network/[[tcp-basics]]
- 많은 연결 처리 → os/[[io-multiplexing]]
- 이벤트 루프 → [[javascript-event-loop]]
- 서버 간 라우팅 → distributed-systems/[[message-queues]]
- 실시간(WebRTC) UDP → network/[[udp]]

## 궁금한 것 (나중에)

- [ ] WebSocket 핸드셰이크 (Upgrade 헤더)
- [ ] WebRTC (P2P 실시간, UDP)
- [ ] Socket.IO 같은 추상화 라이브러리
- [ ] 확장: Redis pub/sub로 서버 간 브로드캐스트

## 출처

- MDN WebSocket/SSE, web.dev
