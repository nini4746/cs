# XSS와 CSRF 심화 (XSS and CSRF)

## 한 줄 요약

web/[[web-vulnerabilities]]의 XSS·CSRF를 방어 설계 관점에서 심화. XSS는 CSP·이스케이프·Trusted Types로, CSRF는 SameSite·토큰으로 계층 방어한다. 원리는 web/에서, 방어 구현은 여기서.

## 왜 필요한가

- XSS/CSRF를 어떻게 체계적으로 방어하나
- CSP를 어떻게 설정하나
- 방어의 우선순위

## XSS 방어 계층

web/[[web-vulnerabilities]]의 XSS(악성 스크립트 주입)를 막는 계층들:

### 1. 출력 이스케이프 (1차 방어)

컨텍스트별로 이스케이프 - **어디에 넣나에 따라 다름**:

- **HTML 본문**: `<` → `&lt;`, `>` → `&gt;` 등
- **HTML 속성**: 따옴표 이스케이프
- **JS 컨텍스트**: JS 문자열 이스케이프 (더 위험 - 피하는 게 나음)
- **URL**: URL 인코딩
- **CSS**: CSS 이스케이프

핵심: **컨텍스트를 알아야** 올바른 이스케이프. 프레임워크(React JSX, 템플릿 엔진)가 자동으로 → 직접 innerHTML 조작이 위험.

### 2. CSP (Content Security Policy)

브라우저에 "허용된 것만 실행"을 지시하는 헤더:

```
Content-Security-Policy:
  default-src 'self';              # 같은 출처만
  script-src 'self' 'nonce-xyz';   # 이 nonce 있는 스크립트만
  object-src 'none';               # 플러그인 금지
```

- **인라인 스크립트 차단**: `<script>alert()</script>` 실행 안 됨 (nonce/hash 없으면)
- XSS가 스크립트를 주입해도 CSP가 실행을 막음 → 2차 방어망
- **nonce**: 서버가 매 요청 랜덤 nonce → 정당한 스크립트에만 부여 (공격자는 모름)
- 엄격한 CSP가 XSS 영향을 크게 줄임

### 3. HttpOnly 쿠키

세션 쿠키를 JS가 못 읽게 → XSS로 세션 탈취 방지 (web/[[web-auth]]). XSS 나도 쿠키는 못 훔침.

### 4. Trusted Types

DOM XSS의 근본 방어 - 위험한 sink(innerHTML 등)에 문자열 직접 못 넣게 타입 강제 (최신 브라우저).

## CSRF 방어 계층

web/[[web-vulnerabilities]]의 CSRF(사용자 권한 도용)를 막는:

### 1. SameSite 쿠키 (현대 기본)

```
Set-Cookie: session=...; SameSite=Lax
```

- 교차 사이트 요청에 쿠키를 **안 보냄** → 공격자 사이트의 요청엔 세션 쿠키 없음 → 실패
- `Lax`(기본): 대부분 교차 차단, 톱레벨 이동은 허용
- `Strict`: 전부 차단 (더 안전, 일부 UX 불편)
- web/[[web-auth]]의 쿠키 속성

### 2. CSRF 토큰

폼/요청에 **예측 불가 토큰**:

```
서버가 폼에 랜덤 토큰 심음 → 제출 시 검증
공격자는 토큰 모름 (교차 출처라 읽기 불가, CORS web/[[cors]]) → 위조 실패
```

- **double submit**: 쿠키 + 헤더에 같은 토큰 (서버 상태 없이)
- **synchronizer token**: 서버가 세션에 토큰 저장

### 3. 커스텀 헤더 요구

- AJAX 요청에 커스텀 헤더 요구 → 교차 출처 폼은 커스텀 헤더 못 붙임 (preflight 필요, web/[[cors]])

## 방어 우선순위

XSS:
1. **프레임워크 자동 이스케이프 사용** (직접 innerHTML 금지)
2. **엄격한 CSP** (nonce 기반)
3. **HttpOnly 쿠키** (세션 보호)

CSRF:
1. **SameSite=Lax 쿠키** (현대 기본, 대부분 커버)
2. **CSRF 토큰** (상태 변경 폼)
3. 민감 작업 재인증

## 심층 방어 (defense in depth)

하나에 의존하지 않고 **여러 계층**:
- XSS: 이스케이프 실패해도 CSP가, CSP 뚫려도 HttpOnly가 세션 보호
- 각 계층이 다른 각도 → 하나 뚫려도 나머지가 방어
- web/[[web-vulnerabilities]]의 원칙

## 연결

- XSS/CSRF 원리 → web/[[web-vulnerabilities]]
- 쿠키 속성 → web/[[web-auth]]
- CORS와 CSRF → web/[[cors]]
- 인젝션 일반 → [[injection]]
- 최소 권한 → [[least-privilege]]

## 궁금한 것 (나중에)

- [ ] CSP 리포트 모드와 점진 배포
- [ ] SameSite=Lax의 정확한 예외 (GET 톱레벨)
- [ ] DOM XSS sink/source 전체
- [ ] SameSite 없는 옛 브라우저 대응

## 출처

- OWASP XSS/CSRF Cheat Sheets, web/[[web-vulnerabilities]]
