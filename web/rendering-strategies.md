# 렌더링 전략 (Rendering Strategies)

## 한 줄 요약

HTML을 언제·어디서 만드나 - 클라이언트(CSR), 서버(SSR), 빌드 타임(SSG), 그 사이(ISR). 각각 초기 로딩·상호작용·서버 부하·SEO의 트레이드오프가 다르다. hydration이 SSR의 대가.

## 왜 필요한가

- CSR/SSR/SSG가 뭐가 다른가
- 왜 SPA가 초기 로딩이 느린가
- hydration이 뭔가

## 언제·어디서 HTML을 만드나

렌더링 전략 = **HTML 생성 시점·장소**의 선택:

```
빌드 타임(SSG) ← 서버 요청 시(SSR) ← 클라이언트(CSR)
미리 만듦        요청마다 만듦         브라우저에서 JS로
```

## CSR (Client-Side Rendering)

브라우저가 **JS로 HTML을 만듦** (전통 SPA):

```
서버 → 빈 HTML + JS 번들 → 브라우저가 JS 실행 → 화면 렌더
```

- **초기 로딩 느림**: JS 다운로드+파싱+실행 후에야 콘텐츠 ([[web-performance]]의 LCP 악화)
- **빈 화면(FCP 늦음)**: JS 실행 전엔 아무것도
- **SEO 불리**: 크롤러가 빈 HTML을 봄 (요즘은 JS 실행하지만 불안정)
- **장점**: 이후 상호작용 빠름 (서버 왕복 없이 JS로), 서버 부하 낮음 (정적 파일만)
- React/Vue SPA의 기본

## SSR (Server-Side Rendering)

**서버가 요청마다 HTML을 만들어** 보냄:

```
요청 → 서버가 HTML 생성 (데이터 조회 포함) → 완성된 HTML → 브라우저 즉시 표시 → JS로 hydration
```

- **빠른 첫 렌더**: 완성된 HTML → FCP·LCP 빠름 ([[critical-rendering-path]])
- **SEO 좋음**: 크롤러가 완성 HTML 봄
- **최신 데이터**: 요청 시 생성 → 항상 최신
- **대가**: 서버 부하 (요청마다 렌더링), TTFB 느릴 수 있음 (서버 처리)
- **hydration 필요** (아래)

## SSG (Static Site Generation)

**빌드 타임에 미리** HTML 생성:

```
빌드 시 → 모든 페이지 HTML 생성 → CDN에 정적 파일 → 요청 시 즉시 서빙
```

- **가장 빠름**: 미리 만든 정적 HTML을 CDN(network/[[cdn]])에서 → 서버 처리 0
- **SEO 최고**, 저렴 (정적 호스팅)
- **한계**: 빌드 시 데이터 고정 → 자주 바뀌는 데이터 부적합, 페이지 많으면 빌드 오래
- 블로그, 문서, 마케팅 페이지 (이 CS 노트 사이트가 SSG! Quartz)

## ISR (Incremental Static Regeneration)

SSG + **주기적 재생성** (Next.js):

- 정적으로 서빙하되 일정 시간마다 백그라운드 재생성
- SSG 속도 + 어느 정도 최신성
- 자주 안 바뀌지만 완전 정적은 아닌 것 (상품 페이지 등)

## hydration

SSR/SSG의 핵심 개념·대가:

```
서버가 HTML 보냄 → 브라우저가 즉시 표시 (보이지만 죽어있음)
→ JS 번들 로드 → 이벤트 핸들러 붙임(hydration) → 이제 상호작용 가능
```

- **hydration**: 정적 HTML에 JS로 생명 불어넣기 (이벤트 리스너 연결)
- **대가**: HTML은 빨리 보이지만 **JS 로드 전엔 클릭 안 됨** (INP 나쁠 수 있음 → [[web-performance]])
- 큰 JS = 긴 hydration = "보이는데 안 눌림"
- 개선: **부분 hydration**, **island architecture**(상호작용 부분만), **RSC**(React Server Components, JS 안 보냄), **resumability**(Qwik)

## 비교

| | CSR | SSR | SSG | ISR |
|---|---|---|---|---|
| HTML 생성 | 브라우저 | 요청 시 서버 | 빌드 시 | 빌드+재생성 |
| 첫 렌더 | 느림 | 빠름 | 최고 | 최고 |
| SEO | 불리 | 좋음 | 최고 | 최고 |
| 서버 부하 | 낮음 | 높음 | 없음 | 낮음 |
| 데이터 최신성 | 실시간 | 실시간 | 빌드 시점 | 주기적 |
| 상호작용 준비 | JS 후 | hydration 후 | hydration 후 | hydration 후 |

## 선택 가이드

- **정적 콘텐츠**(블로그, 문서, 마케팅): SSG
- **자주 안 바뀌는 동적**(상품, 목록): ISR
- **매번 최신·개인화**(대시보드, 피드): SSR
- **앱 같은 상호작용 중심**(어드민, 에디터): CSR
- **혼합**: 페이지별로 다른 전략 (Next.js/Nuxt가 지원)

현대 프레임워크(Next.js, Remix, Nuxt)는 이들을 **페이지 단위로 섞음**. 하나만 고르는 게 아님.

## 연결

- 렌더링 파이프라인 → [[critical-rendering-path]]
- 성능 지표 (각 전략의 영향) → [[web-performance]]
- SSG + CDN → network/[[cdn]]
- hydration과 메인 스레드 → [[browser-architecture]], [[javascript-event-loop]]
- SSR 서버 부하 → database/, distributed-systems/

## 궁금한 것 (나중에)

- [ ] React Server Components (RSC) 상세
- [ ] island architecture (Astro)
- [ ] streaming SSR (점진적 HTML)
- [ ] resumability vs hydration (Qwik)

## 출처

- web.dev 렌더링, Next.js/Remix 문서
