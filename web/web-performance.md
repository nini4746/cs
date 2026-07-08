# 웹 성능 (Web Performance)

## 한 줄 요약

웹 성능은 Core Web Vitals(LCP·INP·CLS)로 측정하고, 로딩·렌더링·상호작용 각 단계를 최적화한다. 네트워크·브라우저·JS의 모든 앞선 지식이 여기서 성능으로 종합된다.

## 왜 필요한가

- 페이지를 빠르게 만드는 법 (전 과목 종합)
- 무엇을 측정하나 (Core Web Vitals)
- 어디를 최적화하나

## Core Web Vitals

구글이 정한 사용자 체감 지표 3가지:

- **LCP (Largest Contentful Paint)**: 주요 콘텐츠가 뜨는 시간 (로딩 체감). <2.5초 목표
- **INP (Interaction to Next Paint)**: 상호작용 반응 속도 (이전 FID 대체). <200ms
- **CLS (Cumulative Layout Shift)**: 레이아웃 흔들림 (시각 안정성). <0.1

각각 로딩·상호작용·안정성을 대표. 실제 사용자 데이터(RUM)로 측정.

## 최적화: 로딩 (LCP)

주요 콘텐츠를 빨리 → network + 브라우저 지식 종합:

- **네트워크 줄이기**:
  - CDN으로 지연 감소 (network/[[cdn]])
  - HTTP/2·3 멀티플렉싱 (network/[[http]], [[quic]])
  - 캐싱 (버전 URL, [[http-for-web]])
  - 압축 (gzip/brotli, [[http-for-web]])
  - preconnect/preload (network/[[what-happens-url]])
- **렌더 블로킹 줄이기**:
  - critical CSS 인라인, 나머지 지연 ([[critical-rendering-path]])
  - JS async/defer ([[critical-rendering-path]])
- **이미지 최적화**:
  - WebP/AVIF (작은 포맷)
  - 반응형 이미지 (화면 크기별)
  - lazy loading (화면 밖 이미지 나중에)

## 최적화: 상호작용 (INP)

반응성 → JS·메인 스레드 지식:

- **메인 스레드 안 막기** ([[browser-architecture]]의 병목):
  - 긴 작업 분할 (yield, [[javascript-event-loop]])
  - Web Worker로 무거운 계산 (별도 스레드)
- **JS 줄이기**: 번들 크기 감소 (아래)
- **불필요한 리렌더 방지** (프레임워크)

## 최적화: 안정성 (CLS)

레이아웃 흔들림 방지 → 렌더링 지식:

- **크기 예약**: 이미지·광고에 width/height 지정 → 로드 후 안 밀림
- **동적 콘텐츠**: 위에 삽입 안 함 (아래로)
- **폰트**: FOUT/FOIT 관리 (폰트 로드 시 흔들림)
- [[reflow-repaint]]의 레이아웃 이해

## 번들 최적화 (JS/CSS)

전송·실행할 코드 줄이기:

- **코드 분할(code splitting)**: 필요한 것만 로드 (라우트별, 지연 로드)
- **트리 셰이킹(tree shaking)**: 안 쓰는 코드 제거 (programming-languages/compilers/[[codegen-and-optimization]]의 DCE)
- **미니피케이션**: 공백·이름 축약
- **압축**: gzip/brotli
- 큰 JS = 다운로드 + 파싱 + 실행 전부 비용 (INP·LCP 악화)

## 측정 도구

추측 말고 측정:

- **Lighthouse**: 종합 감사 (Chrome DevTools)
- **DevTools Performance**: 메인 스레드·렌더링 프로파일 ([[browser-architecture]])
- **Network 탭**: 요청 폭포수 (network/[[what-happens-url]])
- **RUM(Real User Monitoring)**: 실제 사용자 데이터 (합성보다 정확)
- **WebPageTest**: 다양한 조건 테스트

## 렌더링 전략의 영향

성능은 렌더링 방식에 크게 의존 → [[rendering-strategies]]:
- CSR: JS 다운로드·실행 후 렌더 → LCP 늦을 수 있음
- SSR/SSG: 서버가 HTML → 빠른 첫 렌더
- 전략 선택이 성능 지표 좌우

## 종합: 전 과목이 여기 모임

웹 성능 = 앞선 모든 지식의 종합:

```
네트워크: DNS/TCP/TLS/HTTP/CDN → 데이터 빨리 나르기
브라우저: 렌더링 파이프라인 → 화면 빨리 그리기
JS: 이벤트 루프/메인 스레드 → 반응 유지
컴파일러: 번들 최적화 (DCE, 미니피케이션)
캐싱: 계층 캐싱 (브라우저/CDN)
```

network/[[what-happens-url]]의 각 단계 지연을 줄이는 것이 웹 성능.

## 연결

- 렌더링 파이프라인 → [[critical-rendering-path]], [[reflow-repaint]]
- 메인 스레드·이벤트 루프 → [[browser-architecture]], [[javascript-event-loop]]
- 캐싱·압축 → [[http-for-web]]
- CDN·HTTP → network/[[cdn]], [[http]], [[what-happens-url]]
- 번들 최적화 → programming-languages/compilers/[[codegen-and-optimization]]
- 렌더링 전략 → [[rendering-strategies]]

## 궁금한 것 (나중에)

- [ ] INP 디버깅 (긴 작업 찾기)
- [ ] 폰트 로딩 전략 (font-display)
- [ ] 우선순위 힌트 (fetchpriority)
- [ ] 성능 예산 (budget) 설정

## 출처

- web.dev Core Web Vitals, Lighthouse
