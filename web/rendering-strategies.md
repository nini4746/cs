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

## 셀프 체크

> [!question]- CSR, SSR, SSG는 HTML을 언제·어디서 만드나?
> CSR은 브라우저에서 JS로(런타임), SSR은 서버가 요청마다, SSG는 빌드 타임에 미리 만든다. 만드는 시점이 이를수록(SSG) 첫 렌더가 빠르고 데이터 최신성은 떨어지며, 늦을수록(CSR) 첫 렌더는 느리지만 이후 상호작용이 빠르다.

> [!question]- SPA(CSR)의 초기 로딩이 느린 이유는?
> 서버가 빈 HTML과 JS 번들만 주고, 브라우저가 JS를 다운로드·파싱·실행한 뒤에야 콘텐츠를 렌더하기 때문이다. 그 전까지 빈 화면이라 FCP·LCP가 늦고, 크롤러가 빈 HTML을 봐 SEO에도 불리하다.

> [!question]- hydration이란 무엇이고 어떤 대가가 있나?
> SSR/SSG가 보낸 정적 HTML에 JS로 이벤트 핸들러를 붙여 상호작용 가능하게 만드는 과정이다. 대가는 HTML은 빨리 보이지만 JS 번들 로드·hydration 전까지는 클릭이 안 먹는다는 것("보이는데 안 눌림", INP 악화). 큰 JS일수록 이 구간이 길다.

> [!question]- SSG가 자주 바뀌는 데이터에 부적합한 이유와, 이를 보완하는 전략은?
> SSG는 빌드 타임에 데이터를 고정해 HTML을 만들므로 이후 데이터가 바뀌어도 반영되지 않고, 페이지가 많으면 빌드가 오래 걸린다. ISR(Incremental Static Regeneration)이 정적으로 서빙하되 일정 시간마다 백그라운드로 재생성해 SSG 속도와 어느 정도의 최신성을 함께 얻는다.

## 연습문제

> [!example]- (1) 마케팅 랜딩 페이지, (2) 매 요청 개인화되는 대시보드, (3) 자주는 아니지만 하루 몇 번 바뀌는 상품 상세 페이지. 각각 어떤 렌더링 전략이 적합한지 근거와 함께 고르라.
> **풀이**
> (1) 랜딩 페이지 → SSG. 내용이 거의 안 바뀌고 SEO·속도가 중요하다. 빌드 시 정적 HTML을 만들어 CDN에서 서빙하면 가장 빠르고 저렴하다.
> (2) 개인화 대시보드 → SSR. 요청마다 사용자별 최신 데이터가 필요해 서버가 요청 시 HTML을 생성해야 한다(또는 CSR도 가능). 정적 캐싱은 부적합.
> (3) 상품 상세 → ISR. 완전 정적은 아니지만 매 요청 렌더할 만큼 자주 바뀌지도 않는다. 정적으로 서빙하며 주기적 재생성으로 몇 번의 갱신을 반영한다.

> [!example]- SSR 페이지가 "콘텐츠는 즉시 보이는데 버튼을 눌러도 몇 초간 반응이 없다"는 제보를 받았다. 원인을 진단하고 개선 방향을 제시하라.
> **풀이**
> 원인: SSR이 완성 HTML을 빨리 보내 FCP는 빠르지만, 상호작용은 JS 번들이 로드되고 hydration이 끝나야 가능하다. 번들이 크면 "보이는데 안 눌리는" 구간이 길어져 INP가 나빠진다.
> 개선: JS 번들을 줄인다(코드 분할, 불필요 의존성 제거). 상호작용이 필요한 부분만 부분 hydration하거나 island architecture로 나눈다. React Server Components처럼 클라이언트로 JS를 아예 안 보내는 방식이나 streaming SSR로 점진적 hydration을 검토한다.

## 파인만

> [!note]- 백지에 CSR/SSR/SSG/ISR을 "HTML 생성 시점 - 첫 렌더 - SEO - 서버 부하 - 데이터 최신성" 축으로 비교표를 그려 남에게 설명하듯 써보라. 막히면 그 칸만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) 각 전략이 HTML을 언제·어디서 만드는지와 그 트레이드오프, (2) hydration이 무엇이고 왜 "보이는데 안 눌림"이 생기는지, (3) 현대 프레임워크가 페이지 단위로 전략을 섞는다는 점.

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
