# 웹 취약점 (Web Vulnerabilities)

## 한 줄 요약

웹의 대표 공격 - XSS(악성 스크립트 주입), CSRF(사용자 권한 도용), 클릭재킹(투명 프레임 속임). 원리를 알면 방어(CSP, 토큰, 이스케이프)가 자연스럽다. 상세 방어는 security/에서.

## 왜 필요한가

- 웹 앱을 어떻게 공격하나 (방어하려면 알아야)
- XSS/CSRF가 정확히 뭔가
- 브라우저 보안 모델의 실전

## XSS (Cross-Site Scripting)

**악성 스크립트를 웹페이지에 주입**해 다른 사용자 브라우저에서 실행:

```
공격자가 댓글에: <script>steal(document.cookie)</script>
→ 다른 사용자가 그 댓글 보면 스크립트 실행 → 쿠키(세션) 탈취
```

세 종류:
- **저장형(stored)**: 서버에 저장 (댓글, 프로필) → 보는 모두 감염. 가장 위험
- **반사형(reflected)**: URL 파라미터가 그대로 페이지에 → 악성 링크 클릭 시
- **DOM 기반**: JS가 사용자 입력을 DOM에 안전하지 않게 삽입

피해: 세션 쿠키 탈취([[web-auth]]), 키로깅, 피싱, 계정 탈취.

### XSS 방어

- **출력 이스케이프**: 사용자 입력을 HTML로 렌더 시 `<`→`&lt;` 등 (프레임워크가 기본으로 - React JSX 등)
- **CSP(Content Security Policy)**: 허용된 출처의 스크립트만 실행 (인라인 스크립트 차단)
- **HttpOnly 쿠키**: JS가 쿠키 못 읽음 → 탈취 방지 ([[web-auth]])
- **입력 검증**: 하지만 이스케이프가 근본 (입력은 저장, 출력 시 이스케이프)

## CSRF (Cross-Site Request Forgery)

**사용자의 로그인 상태를 악용**해 원치 않는 요청 실행:

```
사용자가 bank.com 로그인 상태
→ evil.com 방문 → 숨은 form이 bank.com/transfer 자동 제출
→ 브라우저가 bank.com 쿠키를 자동 첨부 → 이체 실행!
```

- 브라우저가 **쿠키를 자동으로 보냄** (교차 사이트 요청에도) → 공격자가 사용자 권한으로 요청
- same-origin([[cors]])은 **읽기**를 막지만 form 제출 같은 **요청**은 막지 않음 → CSRF의 틈

### CSRF 방어

- **CSRF 토큰**: 폼에 예측 불가 토큰 → 서버가 검증. 공격자는 토큰 모름
- **SameSite 쿠키**([[web-auth]]): `Lax`/`Strict`로 교차 사이트 요청에 쿠키 안 보냄 → 현대 기본 방어
- **재인증**: 민감 작업에 비밀번호 재확인
- CORS는 CSRF를 직접 못 막음 ([[cors]]의 혼동 주의)

## 클릭재킹 (clickjacking)

**투명한 프레임으로 사용자 클릭을 가로챔**:

```
공격자가 자기 페이지에 투명 iframe으로 bank.com 삽입
→ 사용자는 "무료 상품" 버튼 누르는 줄 알지만 실제론 iframe의 "이체" 버튼
```

### 방어

- **X-Frame-Options: DENY/SAMEORIGIN**: 내 페이지를 iframe에 못 넣게
- **CSP frame-ancestors**: 어느 페이지가 프레임 가능한지 제어

## 기타 흔한 취약점 (OWASP)

- **SQL 인젝션**: DB 쿼리 조작 → security/[[injection]] (prepared statement로 방어)
- **인증/인가 실패**: 권한 우회, 세션 하이재킹 → security/[[authn-authz-failures]]
- **민감 데이터 노출**: HTTPS 미사용, 평문 저장
- **SSRF**: 서버가 공격자 지정 URL 요청
- **의존성 취약점**: 오래된 라이브러리 → security/[[supply-chain]]

## 방어의 원칙

- **입력을 믿지 마라**: 모든 사용자 입력은 잠재적 공격
- **이스케이프/파라미터화**: 데이터와 코드 분리 (XSS 이스케이프, SQL prepared)
- **최소 권한**: 필요한 것만 (security/[[least-privilege]])
- **심층 방어**: 여러 계층 (CSP + HttpOnly + SameSite)
- **프레임워크 기본값 활용**: 현대 프레임워크가 대부분 기본 방어 (직접 만들지 말 것)

## 셀프 체크

> [!question]- XSS의 세 종류와 근본 방어책은?
> 저장형(서버에 저장돼 보는 모두 감염, 가장 위험), 반사형(URL 파라미터가 그대로 페이지에 반영), DOM 기반(JS가 사용자 입력을 안전하지 않게 DOM에 삽입). 근본 방어는 출력 이스케이프 - 사용자 입력을 HTML로 렌더할 때 <를 &lt; 등으로 바꾼다. 추가로 CSP, HttpOnly 쿠키.

> [!question]- CSRF 공격이 성립하는 브라우저 동작은 무엇인가?
> 브라우저가 교차 사이트 요청에도 대상 사이트의 쿠키를 자동으로 첨부한다는 점이다. 사용자가 bank.com에 로그인한 상태에서 evil.com의 숨은 form이 bank.com으로 요청을 보내면 브라우저가 쿠키를 붙여 사용자 권한으로 실행된다.

> [!question]- same-origin policy는 CSRF를 막지 못하는데 왜인가?
> same-origin은 교차 출처 응답 "읽기"를 막을 뿐, form 제출 같은 교차 출처 "요청" 자체는 막지 않기 때문이다. CSRF는 응답을 읽을 필요 없이 요청이 실행되기만 하면 되므로 same-origin으로 막히지 않는다.

> [!question]- 클릭재킹은 어떻게 이뤄지고 무엇으로 막나?
> 공격자가 자기 페이지에 투명 iframe으로 대상 사이트를 겹쳐, 사용자가 보이는 버튼을 누르는 줄 알지만 실제로는 iframe의 위험한 버튼을 누르게 한다. X-Frame-Options: DENY/SAMEORIGIN이나 CSP frame-ancestors로 내 페이지가 iframe에 들어가지 못하게 막는다.

## 연습문제

> [!example]- 댓글 기능에서 사용자가 <script>로 다른 사람의 세션 쿠키를 훔칠 수 있었다. 어떤 XSS이고, 다층 방어를 설계하라.
> **풀이**
> 종류: 댓글이 서버에 저장돼 보는 모두에게 실행되므로 저장형(stored) XSS. 가장 위험하다.
> 다층 방어(심층 방어): (1) 출력 이스케이프 - 댓글을 렌더할 때 <를 &lt; 등으로 변환(React JSX 등 프레임워크 기본값 활용)해 스크립트로 실행되지 않게 한다. 이게 근본. (2) CSP로 허용된 출처의 스크립트만 실행하고 인라인 스크립트를 차단해 주입돼도 실행을 막는다. (3) 세션 쿠키에 HttpOnly를 줘 JS가 쿠키를 못 읽게 해 탈취 자체를 차단한다. 입력 저장 시가 아니라 출력 시 이스케이프하는 게 원칙이다.

> [!example]- 은행 앱의 이체 엔드포인트가 CSRF로 악용될 수 있다. 방어 방법을 두 가지 이상 제시하고 각 원리를 설명하라.
> **풀이**
> (1) SameSite 쿠키: 세션 쿠키에 SameSite=Lax/Strict를 줘 교차 사이트 요청에는 쿠키를 안 보낸다. evil.com에서 온 이체 요청에 세션 쿠키가 빠져 인증되지 않는다. 현대 기본 방어.
> (2) CSRF 토큰: 폼에 예측 불가능한 토큰을 심고 서버가 요청 시 검증한다. 공격자는 토큰 값을 모르므로 위조 요청이 거부된다.
> (3) 민감 작업 재인증: 이체 같은 작업에 비밀번호 재확인을 요구한다.
> 참고: CORS는 요청을 막지 못해 CSRF 방어가 안 된다(흔한 혼동).

## 파인만

> [!note]- 백지에 XSS와 CSRF를 "공격자가 무엇을 노리나 - 어떤 브라우저 동작을 악용하나 - 무엇으로 막나"로 나눠 비교하며 남에게 설명하듯 써보라. 막히면 그 항목만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) XSS 세 종류와 출력 이스케이프가 근본 방어인 이유, (2) CSRF가 쿠키 자동 첨부를 악용하며 SameSite/토큰으로 막힌다는 점, (3) same-origin·CORS가 CSRF를 왜 못 막는지.

## 연결

- 쿠키 방어 → [[web-auth]]
- same-origin/CORS → [[cors]]
- SQL 인젝션 상세 → security/[[injection]]
- XSS/CSRF 심화 → security/[[xss-csrf]]
- 인증/인가 실패 → security/[[authn-authz-failures]]
- 최소 권한 → security/[[least-privilege]]

## 궁금한 것 (나중에)

- [ ] CSP 세밀 설정 (nonce, hash)
- [ ] DOM XSS의 sink/source
- [ ] SameSite=Lax의 정확한 예외
- [ ] Trusted Types (DOM XSS 방어)

## 출처

- OWASP Top 10, MDN 웹 보안
