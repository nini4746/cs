# CORS

## 한 줄 요약

브라우저의 same-origin policy는 한 출처의 스크립트가 다른 출처 리소스에 접근하는 걸 막는다. CORS는 서버가 "이 출처는 허용"이라고 명시적으로 열어주는 메커니즘. CORS 오류는 대부분 서버 헤더 누락.

## 왜 필요한가

- "CORS 오류"가 정확히 뭔가 (가장 흔한 웹 개발 좌절)
- same-origin policy가 뭘 막나
- preflight 요청이 왜 뜨나

## Same-Origin Policy

브라우저의 기본 보안 정책: **한 출처의 스크립트는 다른 출처 리소스에 접근 불가**:

**출처(origin)** = 프로토콜 + 호스트 + 포트:
```
https://example.com:443
  ↑        ↑         ↑
프로토콜  호스트    포트
```

셋 중 하나라도 다르면 다른 출처:
```
https://example.com  vs  http://example.com   (프로토콜 다름)
https://example.com  vs  https://api.example.com  (호스트 다름)
https://example.com  vs  https://example.com:8080  (포트 다름)
```

왜: `evil.com`의 스크립트가 `bank.com`의 데이터를 마음대로 읽으면 → 재앙. same-origin이 격리 (security/[[web-vulnerabilities]]의 CSRF·데이터 탈취 방어).

## CORS: 명시적으로 열기

same-origin이 기본 차단인데, 정당한 교차 출처 요청(API 호출 등)은 필요 → **CORS(Cross-Origin Resource Sharing)**: 서버가 "이 출처는 허용"이라고 응답 헤더로 명시:

```
서버 응답:
Access-Control-Allow-Origin: https://example.com   # 이 출처 허용
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true              # 쿠키 허용
```

- 브라우저가 응답의 이 헤더를 확인 → 허용 출처면 JS가 응답에 접근, 아니면 차단
- **핵심: 차단은 브라우저가** (서버는 응답을 보냄, 브라우저가 JS의 접근을 막음)

## preflight 요청

일부 요청은 실제 요청 전 **OPTIONS로 미리 물어봄**:

```
브라우저: OPTIONS /api (preflight) - "POST에 이 헤더 써도 되나?"
서버: Access-Control-Allow-* 응답
브라우저: 허용되면 → 실제 요청 전송
```

- **단순 요청(simple)**: GET, POST(기본 헤더) → preflight 없음
- **복잡 요청**: PUT/DELETE, 커스텀 헤더, JSON Content-Type → preflight 있음
- 네트워크 탭에 OPTIONS가 하나 더 뜨는 이유

## "CORS 오류"의 정체

가장 흔한 웹 좌절:

```
Access to fetch at 'https://api.other.com' from origin
'https://myapp.com' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present
```

- **원인**: 서버가 `Access-Control-Allow-Origin` 헤더를 안 보냄
- **해결**: **서버**에서 CORS 헤더 추가 (클라이언트로는 못 고침 - 브라우저 정책)
- 흔한 오해: 프론트엔드 문제 아님 → 서버(백엔드) 설정
- 개발 중엔 프록시로 우회하기도 (같은 출처로 만들어)

## 무엇이 same-origin에 안 걸리나

- `<img>`, `<script src>`, `<link>` CSS: 교차 출처 **로드**는 허용 (읽기는 제한) - 옛날 웹 호환
- `<form>` 제출: 교차 출처 가능 (CSRF의 근원 → security/[[xss-csrf]])
- 이 예외들이 보안 취약점의 틈 → security/

## CORS vs CSRF (혼동 주의)

- **CORS**: 교차 출처 **읽기**를 제어 (JS가 응답 읽기)
- **CSRF**: 교차 출처 **요청**이 사용자 권한으로 실행되는 공격 (form 제출 등) → security/[[xss-csrf]]
- CORS는 CSRF를 직접 막지 않음 (별개 문제)

## 연결

- 출처와 보안 → security/[[web-vulnerabilities]], [[xss-csrf]]
- 인증·쿠키 → [[web-auth]]
- HTTP 헤더 → network/[[http]]
- API 설계 → [[rest-design]]

## 궁금한 것 (나중에)

- [ ] credentials 모드와 쿠키 (Allow-Credentials + 구체적 출처)
- [ ] CORS 프록시의 원리와 위험
- [ ] CSP와 CORS의 차이
- [ ] preflight 캐싱 (Access-Control-Max-Age)

## 출처

- MDN CORS, same-origin policy
