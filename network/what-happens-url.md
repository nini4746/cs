# URL 치면 일어나는 일 (What Happens When You Type a URL)

## 한 줄 요약

주소창에 URL을 치고 엔터부터 페이지가 뜰 때까지 - DNS 조회, TCP 연결, TLS 핸드셰이크, HTTP 요청, 렌더링까지 네트워크 전 계층이 협력한다. 이 과목의 모든 조각이 한 흐름으로 종합된다.

## 왜 필요한가

- 배운 모든 것을 하나의 흐름으로 통합 (졸업 시험)
- 면접 단골 질문의 정석
- 각 단계가 어느 노트인지 연결

## 전체 흐름

`https://www.example.com/page` 를 치면:

### 0. URL 파싱

브라우저가 URL을 분해: 프로토콜(https) + 호스트(www.example.com) + 경로(/page). compilers/[[lexing]]의 파싱과 같은 원리.

### 1. DNS 조회 → [[dns]]

```
www.example.com → IP 주소?
브라우저 캐시 → OS 캐시 → 리졸버 → 루트 → TLD → 권한 서버
→ 104.20.23.154
```

- 여러 층 캐시 확인 (없으면 계층 조회)
- 결과 IP (실측했던 example.com → 104.20.23.154)

### 2. TCP 연결 → [[tcp-basics]]

```
3-way 핸드셰이크: SYN → SYN-ACK → ACK
→ 연결 수립 (실측 ~28ms, 1 RTT)
```

IP로 소켓([[sockets]]) 연결. 이 패킷들이 라우터를 거쳐 감([[routing]]).

### 3. TLS 핸드셰이크 → [[tls]]

```
https니까: ClientHello → ServerHello + 인증서
→ 키 교환 (대칭 키 합의)
→ 인증서 검증 (CA 체인)
→ 암호화 채널 확립 (1 RTT, TLS 1.3)
```

이제 안전한 채널. HTTP/3면 QUIC이 2,3단계를 통합 ([[quic]]).

### 4. HTTP 요청 → [[http]]

```
GET /page HTTP/2
Host: www.example.com
(쿠키, 헤더...)
```

암호화된 채널로 요청 전송. 서버(또는 CDN 엣지 → [[cdn]])가 받음.

### 5. 서버 처리

- CDN 캐시 히트면 엣지에서 즉시 → [[cdn]]
- 아니면 원본 서버가 처리 (DB 조회 → database/, 앱 로직)
- 응답 생성 (HTML)

### 6. HTTP 응답

```
HTTP/2 200 OK
Content-Type: text/html
(캐싱 헤더, 쿠키...)
<html>...
```

상태 코드([[http]]), 헤더, HTML 바디.

### 7. 브라우저 렌더링 → web/[[critical-rendering-path]]

```
HTML 파싱 → DOM
CSS 파싱 → CSSOM
→ 레이아웃 → 페인트 → 컴포지팅
JS 실행 (이벤트 루프 → web/[[javascript-event-loop]])
추가 리소스(이미지, CSS, JS)마다 1~6 반복
```

여기부턴 web/ 영역. 네트워크가 데이터를 날랐고, 브라우저가 화면을 그림.

## 계층으로 본 종합

각 단계가 계층을 오르내림 ([[internet-overview]]):

```
응용: DNS, HTTP, TLS          ← [[dns]], [[http]], [[tls]]
전송: TCP (또는 QUIC/UDP)      ← [[tcp-basics]], [[quic]]
네트워크: IP, 라우팅           ← [[ip-addressing]], [[routing]]
링크: 이더넷/WiFi, ARP         ← [[ethernet-and-arp]], [[wifi]]
물리: 신호
```

각 패킷이 이 스택을 내려가며 캡슐화([[internet-overview]]), 라우터마다 링크 계층 재작성([[ethernet-and-arp]]의 MAC 바뀜), 목적지에서 올라가며 역캡슐화.

## 성능 관점

이 흐름의 각 단계가 지연 → web/[[web-performance]]:

- DNS 조회 (수십 ms) → prefetch로 완화
- TCP + TLS 핸드셰이크 (2 RTT) → keep-alive, QUIC 0-RTT로 절약
- 서버 처리 (TTFB) → 캐싱, CDN
- 리소스 다운로드 → 압축, HTTP/2 멀티플렉싱, CDN
- 렌더링 → web/[[critical-rendering-path]]

## 무엇이 잘못될 수 있나

각 단계의 실패 → [[icmp-and-tools]]의 진단:

- DNS 실패 → 도메인 못 찾음
- TCP 실패 → 연결 거부/타임아웃 (방화벽, 서버 다운)
- TLS 실패 → 인증서 오류
- HTTP 4xx/5xx → 앱/서버 오류
- 각 단계를 도구로 진단 ([[icmp-and-tools]], [[packet-capture]])

## 셀프 체크

> [!question]- URL을 치고 페이지가 뜰 때까지의 주요 단계를 DNS부터 렌더링까지 순서대로 말할 수 있는가?
> URL 파싱 → DNS 조회로 도메인을 IP로 변환 → TCP 3-way 핸드셰이크로 연결 수립 → (https면) TLS 핸드셰이크로 암호화 채널 확립 → HTTP 요청 전송 → 서버(또는 CDN)가 처리해 응답 생성 → HTTP 응답 수신 → 브라우저가 HTML/CSS 파싱, 레이아웃/페인트로 렌더링. 추가 리소스마다 이 흐름이 반복된다.

> [!question]- 이 흐름을 계층 모델로 보면 각 단계가 어느 계층에 속하는가?
> 응용 계층에 DNS, HTTP, TLS가, 전송 계층에 TCP(또는 QUIC/UDP)가, 네트워크 계층에 IP와 라우팅이, 링크 계층에 이더넷/WiFi와 ARP가 있고 그 아래 물리 계층이 신호를 나른다. 각 패킷은 이 스택을 내려가며 캡슐화되고, 목적지에서 올라가며 역캡슐화된다.

> [!question]- HTTP/3(QUIC)를 쓰면 이 흐름의 어느 단계가 어떻게 바뀌는가?
> QUIC은 UDP 위에서 전송 연결 수립과 TLS 핸드셰이크를 하나로 통합한다. 즉 별도의 TCP 3-way 핸드셰이크 + TLS 핸드셰이크(2단계)가 QUIC 핸드셰이크 하나로 합쳐져 연결 설정 왕복이 줄고, 재방문 시 0-RTT까지 가능해진다.

> [!question]- 라우터를 거칠 때마다 패킷의 어느 부분이 바뀌고 어느 부분이 유지되는가?
> 네트워크 계층의 출발지/목적지 IP는 끝까지 유지되지만, 링크 계층의 MAC 주소는 홉마다 재작성된다. 각 라우터는 다음 홉으로 보내기 위해 링크 계층 프레임을 새로 만든다. 목적지에 도착하면 스택을 올라가며 역캡슐화된다.

## 연습문제

> [!example]- 문제: DNS 20ms, TCP 핸드셰이크 1 RTT, TLS 1.3 핸드셰이크 1 RTT, 서버 처리(TTFB의 서버 몫) 30ms일 때, RTT 40ms 가정으로 첫 바이트가 오기까지의 총 지연을 각 단계로 나눠 계산하라.
> **풀이**
> - DNS 조회: 20ms
> - TCP 3-way 핸드셰이크: 1 RTT = 40ms
> - TLS 1.3 핸드셰이크: 1 RTT = 40ms
> - HTTP 요청 → 서버 처리 → 첫 바이트: 요청 전달 및 응답에 약 1 RTT = 40ms + 서버 처리 30ms
> 합계 ≈ 20 + 40 + 40 + 40 + 30 = 170ms.
> keep-alive로 연결을 재사용하면 TCP+TLS(80ms)를, DNS 캐시가 있으면 20ms를 절약할 수 있어, 재방문 시 지연이 크게 줄어든다.

> [!example]- 문제: 사용자가 "사이트가 안 열린다"고 한다. DNS/TCP/TLS/HTTP 각 단계별로 어떤 증상이 나타나고 어떤 도구로 진단하는지 매핑하라.
> **풀이**
> - DNS 실패: 도메인을 못 찾음(NXDOMAIN). `dig`/`nslookup`으로 조회 확인.
> - TCP 실패: 연결 거부 또는 타임아웃(방화벽, 서버 다운). `ping`/`traceroute`, `telnet`/`nc`로 포트 도달 확인.
> - TLS 실패: 인증서 오류(만료, 도메인 불일치, 체인 문제). 브라우저 경고 또는 `openssl s_client`로 확인.
> - HTTP 4xx/5xx: 서버 도달은 되나 앱/서버 오류. `curl -v`로 상태 코드와 헤더 확인.
> 단계를 위에서 아래로 하나씩 좁히면 어느 계층에서 끊겼는지 특정할 수 있다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1. DNS → TCP → TLS → HTTP → 렌더링의 전체 흐름을 끊김 없이 순서대로 설명할 수 있는가.
> 2. 각 단계가 어느 계층에 속하고, 패킷이 스택을 오르내리며 캡슐화/역캡슐화되는지 그릴 수 있는가.
> 3. 각 단계의 지연 원인과 완화책(캐시, keep-alive, QUIC 0-RTT, CDN)을 연결할 수 있는가.

## 연결 (전체 종합)

- 파싱: compilers/[[lexing]]
- DNS → [[dns]]
- TCP → [[tcp-basics]], [[tcp-reliability]]
- TLS → [[tls]], security/[[tls-deep-dive]]
- HTTP → [[http]]
- IP/라우팅 → [[ip-addressing]], [[routing]]
- 링크 → [[ethernet-and-arp]], [[wifi]]
- 렌더링 → web/[[critical-rendering-path]]
- 성능 → web/[[web-performance]]
- 진단 → [[icmp-and-tools]], [[packet-capture]]

## 궁금한 것 (나중에)

- [ ] HTTP/3면 흐름이 어떻게 달라지나 (QUIC 통합)
- [ ] 서비스 워커·캐시가 중간에 개입하면
- [ ] 각 단계 실측 (Chrome DevTools Network 탭)
- [ ] 브라우저 렌더링 상세 → web/

## 출처

- Kurose & Ross 전체 종합, "What happens when..." (유명 GitHub 문서)
