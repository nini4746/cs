---
title: "web"
---

# 웹 syllabus

기준: MDN + web.dev + 브라우저 내부 문서. 프레임워크 사용법 말고 플랫폼 원리.

## 1. 브라우저 내부

- [ ] [[browser-architecture]] - 멀티 프로세스 구조, 렌더러/메인/컴포지터 스레드
- [ ] [[critical-rendering-path]] - HTML 파싱 → DOM/CSSOM → 레이아웃 → 페인트 → 컴포지팅
- [ ] [[javascript-event-loop]] - 이벤트 루프, 태스크/마이크로태스크 큐, async가 도는 원리
- [ ] [[reflow-repaint]] - 리플로우 유발 요인, transform이 싼 이유 (컴포지터 전용)

## 2. 네트워크 접점

- [ ] [[http-for-web]] - 캐싱 헤더 전략 (ETag, Cache-Control), 압축, 우선순위 → network/http 기반
- [ ] [[cors]] - same-origin policy, preflight, CORS 오류의 정확한 원인
- [ ] [[websockets-sse]] - 실시간 통신 선택지, 폴링 vs SSE vs WebSocket

## 3. 인증·보안

- [ ] [[web-auth]] - 세션 vs JWT, 쿠키 속성 (SameSite, HttpOnly), OAuth2/OIDC 흐름
- [ ] [[web-vulnerabilities]] - XSS/CSRF/클릭재킹 동작 원리와 방어 → security/와 연결

## 4. API 설계

- [ ] [[rest-design]] - REST 제약 조건, 리소스 모델링, 버저닝, 멱등성
- [ ] [[graphql-and-alternatives]] - GraphQL/gRPC/tRPC, REST 대비 트레이드오프

## 5. 성능

- [ ] [[web-performance]] - Core Web Vitals, 번들 분할, 이미지 최적화, 측정 도구
- [ ] [[rendering-strategies]] - CSR/SSR/SSG/ISR, hydration 비용
