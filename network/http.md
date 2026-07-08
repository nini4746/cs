# HTTP

## 한 줄 요약

웹의 요청-응답 프로토콜. 텍스트 기반 메서드/헤더/바디로 시작해, HTTP/2의 멀티플렉싱, HTTP/3의 QUIC로 진화했다. 무상태(stateless)라 쿠키·캐싱으로 상태와 성능을 보완한다.

## 왜 필요한가

- 웹의 근간 - 브라우저와 서버의 대화
- HTTP/1.1 → 2 → 3 진화의 이유
- 캐싱·쿠키가 왜 필요한가

## 요청-응답 구조

HTTP는 클라이언트가 요청, 서버가 응답:

```
요청:
  GET /index.html HTTP/1.1        ← 메서드 경로 버전
  Host: example.com               ← 헤더들
  User-Agent: ...
                                  ← 빈 줄
  (바디, POST 등)

응답:
  HTTP/1.1 200 OK                 ← 버전 상태코드
  Content-Type: text/html         ← 헤더들
  Content-Length: 1234
                                  ← 빈 줄
  <html>...                       ← 바디
```

텍스트 기반(HTTP/1.1) → 사람이 읽을 수 있음. 전송 계층 TCP 위에 얹힘 → [[tcp-basics]].

## 메서드

| 메서드 | 용도 | 멱등? | 안전? |
|---|---|---|---|
| GET | 조회 | ✓ | ✓ (변경 없음) |
| POST | 생성/제출 | ✗ | ✗ |
| PUT | 전체 교체 | ✓ | ✗ |
| PATCH | 부분 수정 | ✗ | ✗ |
| DELETE | 삭제 | ✓ | ✗ |

- **안전(safe)**: 서버 상태 안 바꿈 (GET)
- **멱등(idempotent)**: 여러 번 해도 결과 같음 (재시도 안전) → web/[[rest-design]], distributed-systems/[[idempotency]]

## 상태 코드

- **1xx**: 정보
- **2xx**: 성공 (200 OK, 201 Created, 204 No Content)
- **3xx**: 리다이렉트 (301 영구, 302 임시, 304 Not Modified - 캐시)
- **4xx**: 클라이언트 오류 (400 잘못된 요청, 401 인증 필요, 403 금지, 404 없음, 429 너무 많음)
- **5xx**: 서버 오류 (500 내부 오류, 502 게이트웨이, 503 사용 불가)

## 무상태 (stateless)

HTTP는 **각 요청이 독립** - 서버가 이전 요청을 기억 안 함:
- 장점: 서버 확장 쉬움 (어느 서버가 받아도 됨 → distributed-systems/)
- 단점: 로그인 상태 등을 유지하려면 별도 수단 → **쿠키**, 세션, 토큰 → web/[[web-auth]]

## HTTP 진화

### HTTP/1.1

- **keep-alive**: 한 TCP 연결 재사용 (연결마다 핸드셰이크 회피 → [[tcp-basics]])
- 문제: **head-of-line blocking** - 한 연결에서 요청을 순서대로 처리, 앞 응답이 느리면 뒤가 막힘
- 브라우저가 병렬로 여러 연결(보통 6개)로 완화

### HTTP/2

- **멀티플렉싱**: 한 연결에서 여러 요청/응답을 **동시에** (스트림으로 인터리빙) → HTTP 레벨 HOL blocking 해결
- **헤더 압축(HPACK)**: 반복 헤더 압축
- **서버 푸시**: 요청 전에 리소스 미리 (거의 안 씀, deprecated)
- **바이너리 프레이밍**: 텍스트 아닌 바이너리 (효율)
- 여전히 TCP 위 → TCP 레벨 HOL blocking은 남음 (패킷 손실 시)

### HTTP/3

- **QUIC 위에서 동작** (TCP 아닌 UDP 기반) → [[quic]]
- **TCP HOL blocking 완전 해결**: QUIC 스트림이 독립 → 한 스트림 패킷 손실이 다른 스트림 안 막음
- 연결 설정 빠름 (0-RTT), 연결 마이그레이션 (IP 바뀌어도 유지)

## 캐싱

같은 리소스 재요청을 피해 성능·대역폭 개선 → web/[[http-for-web]]:

- **Cache-Control**: `max-age`(유효 시간), `no-cache`, `private/public`
- **ETag**: 리소스 버전 태그 → 바뀌었나 확인 (조건부 요청)
- **304 Not Modified**: "안 바뀜, 캐시 쓰세요" (바디 없이) → 대역폭 절약
- CDN이 이걸 활용해 엣지에서 캐싱 → [[cdn]]

## 연결

- TCP 위에서 동작 → [[tcp-basics]]
- HTTP/3의 QUIC → [[quic]]
- 도메인 해석 → [[dns]]
- 캐싱 상세 → web/[[http-for-web]]
- 인증/쿠키 → web/[[web-auth]]
- CDN → [[cdn]]

## 궁금한 것 (나중에)

- [ ] HPACK 헤더 압축 동작
- [ ] HTTP/2 스트림 우선순위
- [ ] 0-RTT의 보안 위험 (replay)
- [ ] REST API 설계 → web/[[rest-design]]

## 출처

- Kurose & Ross 2.2 (웹과 HTTP), RFC 9110/9113/9114
