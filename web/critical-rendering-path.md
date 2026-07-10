# 임계 렌더링 경로 (Critical Rendering Path)

## 한 줄 요약

HTML/CSS/JS가 화면 픽셀이 되는 과정 - DOM/CSSOM 구성 → 렌더 트리 → 레이아웃 → 페인트 → 컴포지팅. 이 경로를 이해하면 왜 페이지가 늦게 뜨는지, 어떻게 빠르게 하는지 보인다.

## 왜 필요한가

- HTML이 어떻게 화면이 되나
- 왜 CSS/JS가 렌더링을 막나 (블로킹)
- 성능 최적화의 기반 → [[web-performance]]

## 파이프라인 단계

브라우저 메인 스레드([[browser-architecture]])가 순서대로:

```
HTML → 파싱 → DOM
CSS → 파싱 → CSSOM
DOM + CSSOM → 렌더 트리 (보이는 것만)
→ 레이아웃 (위치·크기 계산)
→ 페인트 (픽셀 그리기)
→ 컴포지팅 (레이어 합성) → 화면
```

### 1. DOM 구성

HTML 파싱 → **DOM 트리** (문서 구조). compilers/[[parsing]]의 파스 트리와 같은 발상 - 토큰→트리:
- 점진적: HTML을 받는 대로 파싱 (스트리밍)
- `<script>`가 파싱을 막을 수 있음 (아래)

### 2. CSSOM 구성

CSS 파싱 → **CSSOM 트리** (스타일 규칙):
- **렌더 블로킹**: CSSOM이 완성돼야 렌더 트리를 만듦 → CSS가 첫 렌더를 막음
- CSS를 빨리·작게 (critical CSS 인라인)

### 3. 렌더 트리

DOM + CSSOM 결합, **보이는 노드만** (`display:none`은 제외):
- 각 노드에 계산된 스타일

### 4. 레이아웃 (layout/reflow)

각 요소의 **위치·크기 계산** (기하):
- 뷰포트 기준 좌표
- **리플로우**: 레이아웃 재계산 (비쌈) → [[reflow-repaint]]

### 5. 페인트 (paint)

각 요소를 **픽셀로** 그림 (색, 텍스트, 이미지):
- 여러 레이어로

### 6. 컴포지팅 (compositing)

레이어들을 **합성** → 최종 화면 (컴포지터 스레드, [[browser-architecture]]):
- GPU 가속 → 부드러운 애니메이션

## 블로킹: CSS와 JS

첫 페인트를 늦추는 주범:

### CSS는 렌더 블로킹

- CSSOM 완성 전엔 렌더 트리 못 만듦 → CSS 다운로드·파싱이 첫 렌더 막음
- 해결: critical CSS 인라인, 나머지 지연 로드

### JS는 파서 블로킹

- `<script>` 만나면 HTML 파싱 **중단**하고 JS 실행 (JS가 DOM 바꿀 수 있으니)
- JS가 CSSOM도 기다림 (JS가 스타일 읽을 수 있으니)
- 해결: `async`(다운로드 병렬, 준비되면 실행), `defer`(파싱 후 실행), 스크립트를 body 끝에

```html
<script async>   <!-- 다운로드 병렬, 준비 즉시 실행 (순서 X) -->
<script defer>   <!-- 다운로드 병렬, 파싱 완료 후 순서대로 -->
```

## 성능 지표와 연결

이 경로의 각 단계가 지연 → [[web-performance]]:
- **FCP**(First Contentful Paint): 첫 픽셀
- **LCP**(Largest Contentful Paint): 주요 콘텐츠
- 렌더 블로킹 리소스를 줄이면 이 지표 개선

## 리소스마다 반복

HTML의 각 리소스(CSS, JS, 이미지)가 추가 네트워크 요청(network/[[what-happens-url]]):
- 우선순위: CSS·중요 JS 먼저
- HTTP/2 멀티플렉싱으로 병렬 (network/[[http]])
- 이미지는 렌더 안 막음 (나중에 채움)

## 셀프 체크

> [!question]- 임계 렌더링 경로의 단계를 순서대로 나열하라.
> HTML→DOM 구성, CSS→CSSOM 구성, DOM+CSSOM→렌더 트리(보이는 노드만), 레이아웃(위치·크기 계산), 페인트(픽셀 그리기), 컴포지팅(레이어 합성)→화면. 마지막 컴포지팅만 컴포지터 스레드에서, 나머지는 메인 스레드에서 돈다.

> [!question]- CSS가 "렌더 블로킹"인 이유는?
> 렌더 트리는 DOM과 CSSOM을 결합해 만드는데, CSSOM이 완성돼야 렌더 트리를 만들 수 있다. 따라서 CSS 다운로드·파싱이 끝날 때까지 첫 렌더가 막힌다. critical CSS를 인라인하고 나머지를 지연 로드하면 완화된다.

> [!question]- async와 defer의 차이는?
> 둘 다 스크립트를 병렬로 다운로드해 파서 블로킹을 피한다. async는 다운로드가 끝나는 즉시 실행해 순서가 보장되지 않고, defer는 HTML 파싱이 끝난 뒤 문서 순서대로 실행한다. 순서 의존이 있으면 defer.

> [!question]- 왜 <script>는 기본적으로 HTML 파싱을 멈추게 하나?
> 스크립트가 DOM을 바꿀 수 있어서 파싱을 중단하고 JS를 먼저 실행한다(파서 블로킹). 또 JS가 스타일을 읽을 수 있어 CSSOM 완성도 기다린다. 그래서 스크립트를 body 끝에 두거나 async/defer를 쓴다.

## 연습문제

> [!example]- 페이지가 몇 초간 빈 흰 화면이다가 갑자기 콘텐츠가 뜬다. head 안에 큰 CSS 파일과 동기 <script>가 있다. 첫 렌더가 늦는 경로를 진단하고 개선하라.
> **풀이**
> 진단: (1) head의 큰 CSS가 렌더 블로킹 - CSSOM 완성 전엔 렌더 트리를 못 만들어 첫 페인트가 막힌다. (2) head의 동기 script가 파서 블로킹 - HTML 파싱을 멈추고 JS를 실행하며, 그 JS가 CSSOM까지 기다린다. 두 리소스가 직렬로 첫 렌더를 지연시킨다.
> 개선: critical CSS(첫 화면에 필요한 최소 CSS)를 인라인하고 나머지 CSS는 지연 로드. script는 defer를 붙이거나 body 끝으로 옮겨 파싱을 막지 않게 한다. 결과적으로 DOM·CSSOM이 빨리 준비돼 FCP·LCP가 개선된다.

> [!example]- 이미지가 많은 페이지인데 이미지는 첫 렌더를 막지 않는다. 왜 그런지, 대신 무엇이 첫 렌더를 막는지 설명하라.
> **풀이**
> 이미지는 렌더 트리 구성에 필수가 아니라 브라우저가 이미지를 기다리지 않고 먼저 렌더한 뒤 이미지가 도착하면 채운다(렌더 블로킹 아님). 첫 렌더를 막는 것은 CSS(렌더 블로킹 - CSSOM 필요)와 동기 JS(파서 블로킹)다. 따라서 성능 개선은 이미지보다 CSS·JS의 블로킹을 먼저 줄여야 한다. 단, 이미지가 LCP 요소면 로딩 속도 자체는 LCP 지표에 영향을 준다.

## 파인만

> [!note]- 백지에 "HTML/CSS/JS가 화면 픽셀이 되기까지의 파이프라인"을 그림과 함께 남에게 설명하듯 써보라. 막히면 그 단계만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) DOM→CSSOM→렌더 트리→레이아웃→페인트→컴포지팅 순서와 각 단계가 하는 일, (2) CSS가 렌더 블로킹이고 JS가 파서 블로킹인 이유, (3) async/defer가 각각 블로킹을 어떻게 푸는지.

## 연결

- 메인 스레드 → [[browser-architecture]]
- HTML 파싱 = 파스 트리 → compilers/[[parsing]]
- HTML 토큰화 → compilers/[[lexing]]
- 리플로우 상세 → [[reflow-repaint]]
- 성능 최적화 → [[web-performance]]
- 리소스 로딩 → network/[[what-happens-url]], [[http]]
- 렌더링 전략 → [[rendering-strategies]]

## 궁금한 것 (나중에)

- [ ] preload/prefetch/preconnect 힌트
- [ ] critical CSS 추출 자동화
- [ ] 레이어 승격 (will-change) → [[reflow-repaint]]
- [ ] 스트리밍 HTML 파싱과 조기 렌더

## 출처

- web.dev "Critical Rendering Path", MDN
