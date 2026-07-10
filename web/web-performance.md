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
- **트리 셰이킹(tree shaking)**: 안 쓰는 코드 제거 (compilers/[[codegen-and-optimization]]의 DCE)
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

## 셀프 체크

> [!question]- Core Web Vitals 세 지표는 각각 무엇을 재고 목표값은?
> LCP(Largest Contentful Paint)는 주요 콘텐츠가 뜨는 시간으로 로딩 체감을 재며 2.5초 미만이 목표. INP(Interaction to Next Paint)는 상호작용 반응 속도로 200ms 미만. CLS(Cumulative Layout Shift)는 레이아웃 흔들림으로 시각 안정성을 재며 0.1 미만. 각각 로딩·상호작용·안정성을 대표한다.

> [!question]- LCP를 개선하는 대표적 방법들은?
> 네트워크 줄이기(CDN, HTTP/2·3, 캐싱, 압축, preconnect/preload), 렌더 블로킹 줄이기(critical CSS 인라인, JS async/defer), 이미지 최적화(WebP/AVIF, 반응형 이미지, lazy loading). 주요 콘텐츠를 최대한 빨리 표시하는 게 목표다.

> [!question]- INP(상호작용 반응성)를 나쁘게 만드는 주범과 해결책은?
> 메인 스레드를 오래 점유하는 긴 JS 작업이 주범이다. 입력에 대한 반응이 지연된다. 해결은 긴 작업을 잘게 쪼개 yield하거나 무거운 계산을 Web Worker로 옮기고, JS 번들 크기를 줄이며 불필요한 리렌더를 막는 것이다.

> [!question]- CLS(레이아웃 흔들림)를 줄이는 방법은?
> 이미지·광고에 width/height를 지정해 공간을 미리 예약하면 로드 후 콘텐츠가 밀리지 않는다. 동적 콘텐츠를 기존 콘텐츠 위에 삽입하지 않고, 폰트 로딩 시 FOUT/FOIT로 인한 흔들림을 관리한다.

## 연습문제

> [!example]- Lighthouse에서 LCP 4.5초, INP 350ms, CLS 0.25로 세 지표 모두 나쁘다. 각 지표별로 원인 가설과 개선책을 하나씩 제시하라.
> **풀이**
> LCP 4.5초: 주요 이미지/텍스트가 늦게 뜬다. 렌더 블로킹 CSS·JS(critical CSS 인라인, defer)와 큰 이미지(WebP/AVIF 변환, preload)를 개선하고 CDN·압축·캐싱으로 네트워크 지연을 줄인다.
> INP 350ms: 클릭 후 긴 JS 작업이 메인 스레드를 막는다. 긴 작업을 분할·yield하거나 Web Worker로 옮기고 번들을 줄인다.
> CLS 0.25: 이미지/광고/폰트가 로드되며 레이아웃이 밀린다. 미디어에 크기를 예약하고 동적 콘텐츠를 위에 삽입하지 않으며 font-display를 관리한다.
> 공통: 추측 말고 DevTools Performance·RUM으로 실제 병목을 측정한 뒤 고친다.

> [!example]- 초기 JS 번들이 3MB라 첫 화면이 느리다. 번들을 줄이는 기법 네 가지를 들고 각각이 어떤 지표를 개선하는지 연결하라.
> **풀이**
> (1) 코드 분할(code splitting): 라우트별로 필요한 것만 로드해 초기 다운로드량을 줄인다 → LCP·INP 개선.
> (2) 트리 셰이킹(tree shaking): 안 쓰는 코드를 제거(DCE)해 번들 크기를 줄인다 → LCP·INP.
> (3) 미니피케이션: 공백·이름 축약으로 전송량을 줄인다 → LCP.
> (4) 압축(gzip/brotli): 전송 바이트를 줄인다 → LCP.
> 큰 JS는 다운로드+파싱+실행 모두가 비용이라 INP(실행 시 메인 스레드 점유)와 LCP(로드 지연)를 함께 악화시키므로, 번들 축소가 두 지표를 같이 개선한다.

## 파인만

> [!note]- 백지에 "웹 성능을 어디서 재고(3대 지표), 어디를 최적화하나(로딩·상호작용·안정성)"를 네트워크·브라우저·JS 지식과 연결해 남에게 설명하듯 써보라. 막히면 그 축만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) LCP·INP·CLS가 각각 무엇을 재는지, (2) 각 지표를 개선하는 대표 기법(로딩/메인 스레드/크기 예약), (3) 웹 성능이 네트워크·렌더링·JS·번들 최적화의 종합이라는 점.

## 연결

- 렌더링 파이프라인 → [[critical-rendering-path]], [[reflow-repaint]]
- 메인 스레드·이벤트 루프 → [[browser-architecture]], [[javascript-event-loop]]
- 캐싱·압축 → [[http-for-web]]
- CDN·HTTP → network/[[cdn]], [[http]], [[what-happens-url]]
- 번들 최적화 → compilers/[[codegen-and-optimization]]
- 렌더링 전략 → [[rendering-strategies]]

## 궁금한 것 (나중에)

- [ ] INP 디버깅 (긴 작업 찾기)
- [ ] 폰트 로딩 전략 (font-display)
- [ ] 우선순위 힌트 (fetchpriority)
- [ ] 성능 예산 (budget) 설정

## 출처

- web.dev Core Web Vitals, Lighthouse
