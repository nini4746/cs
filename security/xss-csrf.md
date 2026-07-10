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

## 셀프 체크

> [!question]- 출력 이스케이프에서 "컨텍스트를 알아야 한다"는 말의 의미는?
> 입력을 넣는 위치(HTML 본문/속성/JS/URL/CSS)마다 올바른 이스케이프 규칙이 다르기 때문. 잘못된 컨텍스트의 이스케이프는 XSS를 못 막는다. 그래서 프레임워크의 컨텍스트 인식 자동 이스케이프를 쓰고 직접 innerHTML 조작을 피한다.

> [!question]- CSP가 XSS의 2차 방어망인 이유와 nonce의 역할은?
> 이스케이프가 뚫려 스크립트가 주입돼도 CSP가 "허용된 것만 실행"으로 실행 자체를 막기 때문. nonce는 서버가 매 요청 랜덤 값을 정당한 스크립트에만 부여하고 공격자는 이를 모르므로, 주입된 인라인 스크립트가 실행되지 못한다.

> [!question]- HttpOnly 쿠키가 XSS 상황에서 지키는 것은?
> 세션 쿠키를 JS가 못 읽게 해, XSS가 발생해도 세션 쿠키 탈취를 막는다. XSS를 없애진 못하지만 세션 하이재킹이라는 피해를 차단하는 계층.

> [!question]- SameSite 쿠키가 CSRF를 막는 원리는?
> 교차 사이트 요청에는 쿠키를 보내지 않기 때문. 공격자 사이트에서 온 요청엔 세션 쿠키가 붙지 않아 위조 요청이 인증되지 못한다. `Lax`는 톱레벨 이동만 허용, `Strict`는 전부 차단.

> [!question]- CSRF 토큰이 왜 유효한 방어인가?
> 공격자가 교차 출처에서 서버가 심은 예측 불가 토큰을 읽을 수 없기 때문(CORS로 응답 읽기 차단). 토큰이 없거나 틀린 위조 요청은 검증에서 실패한다.

## 연습문제

> [!example]- 사용자 댓글을 그대로 `element.innerHTML = comment` 로 렌더링하는 코드가 있다. 취약점과 다층 방어를 설계하라.
> **풀이**
> 저장형 XSS: 댓글에 스크립트를 넣으면 다른 사용자 브라우저에서 실행된다. 다층 방어: (1) 1차 - innerHTML 대신 textContent나 프레임워크의 자동 이스케이프 사용(직접 sink 금지), 리치 텍스트가 필요하면 검증된 sanitizer, (2) 2차 - nonce 기반 엄격한 CSP로 주입 스크립트 실행 차단, (3) HttpOnly 쿠키로 세션 탈취 방지, (4) 최신 브라우저면 Trusted Types로 위험 sink에 문자열 직접 삽입을 타입 강제로 금지. 하나가 뚫려도 나머지가 막는 심층 방어.

> [!example]- 상태를 바꾸는 `POST /transfer` 엔드포인트의 CSRF 방어를 우선순위대로 설계하라.
> **풀이**
> (1) 세션 쿠키에 `SameSite=Lax`(민감 작업은 Strict) - 현대 기본으로 대부분의 교차 사이트 위조를 차단, (2) CSRF 토큰(synchronizer 또는 double-submit)을 요청에 요구해 검증, (3) AJAX면 커스텀 헤더 요구(교차 출처 폼은 preflight 없이 못 붙임), (4) 이체 같은 민감 작업은 재인증/2FA. 여러 계층을 겹쳐 SameSite 미지원 브라우저나 우회 상황도 커버.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) XSS 방어 계층(이스케이프→CSP→HttpOnly→Trusted Types)과 각 역할, (2) CSRF 방어(SameSite·토큰·커스텀 헤더)의 원리, (3) 왜 단일 방어가 아니라 심층 방어인가.

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
