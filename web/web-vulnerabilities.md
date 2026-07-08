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
