# 웹 인증 (Web Authentication)

## 한 줄 요약

HTTP는 무상태([[web-auth]] 아닌 network/[[http]])라 로그인 상태를 유지하려면 별도 수단이 필요하다. 세션(서버 저장)과 JWT(자체 포함 토큰)가 두 축이고, 쿠키 속성과 OAuth가 실무의 핵심.

## 왜 필요한가

- 로그인 상태를 어떻게 유지하나 (HTTP는 무상태)
- 세션 vs JWT 선택
- 쿠키 속성이 왜 보안에 중요한가

## 문제: HTTP는 무상태

HTTP(network/[[http]])는 각 요청이 독립 → 서버가 "이 요청이 로그인한 그 사람"인지 모름. 매 요청에 신원을 증명해야 → 인증 상태 유지 수단 필요.

## 세션 기반 (server-side session)

**서버가 상태 저장**, 클라이언트는 세션 ID만:

```
1. 로그인 → 서버가 세션 생성 (서버 메모리/DB에 사용자 정보)
2. 세션 ID를 쿠키로 클라이언트에
3. 이후 요청마다 쿠키의 세션 ID → 서버가 조회해 사용자 확인
```

- **서버가 진실의 원천**: 로그아웃·강제 만료 즉시 가능 (서버에서 세션 삭제)
- **상태 저장**: 세션 스토어 필요 (Redis 등 → database/[[nosql-landscape]])
- **확장 문제**: 여러 서버면 세션 공유 필요 (sticky session or 공유 스토어 → distributed-systems/[[replication]])

## 토큰 기반 (JWT)

**토큰 자체에 정보를 담음**, 서버는 저장 안 함:

```
JWT = [헤더].[페이로드(사용자 정보)].[서명]
```

- 로그인 시 서버가 JWT 발급 (서명 → security/[[digital-signatures]])
- 클라이언트가 매 요청에 JWT 첨부
- 서버는 **서명만 검증** (저장 조회 없음) → 무상태, 확장 쉬움
- **페이로드는 누구나 읽음** (Base64, 암호화 아님) → 민감 정보 넣지 말 것
- **취소 어려움**: 발급된 JWT는 만료까지 유효 (서버에 상태 없으니 즉시 무효화 불가) → 짧은 만료 + refresh 토큰

## 세션 vs JWT

| | 세션 | JWT |
|---|---|---|
| 상태 | 서버 저장 | 토큰 자체 |
| 확장 | 스토어 공유 필요 | 무상태 (쉬움) |
| 취소 | 즉시 가능 | 어려움 (만료까지) |
| 크기 | 작음 (ID만) | 큼 (정보 포함) |
| 용도 | 전통 웹앱 | API, 마이크로서비스, SPA |

**흔한 오해**: "JWT가 항상 낫다"는 틀림. 취소 필요·단일 서비스면 세션이 단순·안전. JWT는 무상태 확장이 필요할 때.

## 쿠키 속성 (보안 핵심)

세션 ID·토큰을 쿠키로 저장하면 속성이 보안을 좌우:

- **HttpOnly**: JS에서 접근 불가 → XSS로 토큰 탈취 방지 (security/[[xss-csrf]])
- **Secure**: HTTPS에서만 전송 → 평문 도청 방지 (network/[[tls]])
- **SameSite**: 교차 사이트 요청에 쿠키 전송 제어 → **CSRF 방어** (security/[[xss-csrf]])
  - `Strict`: 같은 사이트만
  - `Lax`: 대부분 교차 차단 (기본값), 톱레벨 이동은 허용
  - `None`: 항상 (Secure 필수)
- **Domain/Path**: 쿠키 범위
- **Max-Age/Expires**: 만료

`HttpOnly + Secure + SameSite=Lax`가 세션 쿠키의 기본 안전 조합.

## OAuth2 / OIDC

**"구글로 로그인"** 같은 제3자 인증:

- **OAuth2**: **인가(authorization)** - "이 앱이 내 구글 드라이브 접근 허용" (권한 위임)
- **OIDC(OpenID Connect)**: OAuth2 위 **인증(authentication)** - "이 사람이 누구인지" (신원)
- 흐름 (authorization code):
  ```
  앱 → 구글 로그인 페이지 → 사용자 승인 → 인가 코드 → 앱이 코드를 토큰으로 교환 → 사용자 정보
  ```
- 앱이 비밀번호를 안 봄 (구글이 처리) → 안전
- 복잡하지만 표준 → 직접 구현보다 검증된 라이브러리

## 인증 vs 인가 (용어)

- **인증(authentication)**: 누구인가 (로그인)
- **인가(authorization)**: 무엇을 할 수 있나 (권한) → security/[[authn-authz-failures]]
- 둘은 다름 (로그인했어도 관리자 페이지 권한은 별개)

## 연결

- HTTP 무상태 → network/[[http]]
- 쿠키 속성과 XSS/CSRF → security/[[xss-csrf]]
- JWT 서명 → security/[[digital-signatures]]
- Secure = HTTPS → network/[[tls]]
- 인증/인가 실패 → security/[[authn-authz-failures]]
- 세션 스토어 → database/[[nosql-landscape]]

## 궁금한 것 (나중에)

- [ ] refresh 토큰 회전 (rotation)
- [ ] passkey / WebAuthn (비밀번호 없는 인증)
- [ ] JWT 취소 전략 (블랙리스트, 짧은 만료)
- [ ] OAuth2 PKCE (SPA 보안)

## 출처

- MDN 인증, OAuth2/OIDC 스펙, OWASP
