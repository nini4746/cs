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

## 셀프 체크

> [!question]- HTTP가 무상태라는 사실이 왜 인증 수단을 필요하게 만드나?
> HTTP는 각 요청이 독립적이라 서버가 "이 요청이 방금 로그인한 그 사람"인지 스스로 알 수 없다. 그래서 매 요청에 신원을 증명할 수단(세션 ID나 토큰)이 필요하다.

> [!question]- 세션 기반과 JWT 기반의 핵심 차이는? 취소 관점에서 비교하라.
> 세션은 서버가 상태(사용자 정보)를 저장하고 클라이언트는 세션 ID만 갖는다. JWT는 토큰 자체에 정보를 담고 서버는 서명만 검증해 저장하지 않는다. 취소는 세션이 유리 - 서버에서 세션을 삭제하면 즉시 무효화된다. JWT는 서버에 상태가 없어 발급 후 만료까지 유효해 즉시 취소가 어렵다(짧은 만료 + refresh 토큰으로 보완).

> [!question]- JWT 페이로드에 민감 정보를 넣으면 안 되는 이유는?
> JWT 페이로드는 Base64로 인코딩됐을 뿐 암호화가 아니라 누구나 디코딩해 읽을 수 있다. 서명은 위변조를 막을 뿐 내용을 숨기지 않으므로 비밀번호 같은 민감 정보를 넣으면 노출된다.

> [!question]- HttpOnly, Secure, SameSite 쿠키 속성은 각각 무엇을 막나?
> HttpOnly는 JS의 쿠키 접근을 막아 XSS로 인한 토큰 탈취를 방지한다. Secure는 HTTPS에서만 전송해 평문 도청을 막는다. SameSite(Lax/Strict)는 교차 사이트 요청에 쿠키 전송을 제어해 CSRF를 방어한다.

> [!question]- OAuth2와 OIDC의 차이는?
> OAuth2는 인가(authorization) - "이 앱이 내 구글 드라이브에 접근하도록 허용"처럼 권한 위임을 다룬다. OIDC(OpenID Connect)는 OAuth2 위에 인증(authentication)을 얹어 "이 사람이 누구인지"라는 신원을 다룬다.

## 연습문제

> [!example]- SPA + 여러 대의 API 서버로 확장하는 서비스의 인증을 설계하라. 세션과 JWT 중 무엇을 고르고, 쿠키 속성은 어떻게 설정할지 근거와 함께 제시하라.
> **풀이**
> 선택: 여러 서버로 수평 확장하고 무상태가 유리하므로 JWT가 적합하다. 세션을 쓰면 서버 간 세션 스토어 공유(Redis 등)나 sticky session이 필요하다. 다만 취소 요구가 강하면 세션도 고려된다.
> 보완: JWT는 즉시 취소가 어려우니 access 토큰은 짧은 만료로 두고 refresh 토큰으로 갱신한다.
> 쿠키 저장 시 속성: HttpOnly(XSS로 토큰 탈취 방지) + Secure(HTTPS 전용) + SameSite=Lax(CSRF 방어). 토큰을 localStorage에 두면 XSS에 그대로 노출되므로 HttpOnly 쿠키가 더 안전하다.

> [!example]- "JWT가 세션보다 항상 낫다"는 주장에 대해, 세션이 더 나은 구체적 상황을 들어 반박하라.
> **풀이**
> 반박: 항상 낫지는 않다. 단일 서비스이고 로그아웃·강제 만료 같은 즉시 취소가 중요한 전통 웹앱에서는 세션이 더 단순하고 안전하다. 세션은 서버에서 삭제하면 즉시 무효화되지만, JWT는 무상태라 발급 후 만료까지 유효해 탈취 시 즉시 무효화가 어렵고 블랙리스트 같은 추가 장치가 필요하다. 또 세션 ID는 작지만 JWT는 정보를 담아 매 요청 크기가 크다. JWT의 이점(무상태 확장)이 필요 없는 상황이면 세션이 낫다.

## 파인만

> [!note]- 백지에 "로그인 후 사용자가 다음 요청에서 어떻게 인증되나"를 세션 방식과 JWT 방식 두 흐름으로 나눠 남에게 설명하듯 써보라. 막히면 그 단계만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) HTTP 무상태 때문에 인증 상태 유지가 필요하다는 점, (2) 세션 vs JWT의 상태 저장 위치와 취소·확장 트레이드오프, (3) HttpOnly/Secure/SameSite가 각각 막는 공격.

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
