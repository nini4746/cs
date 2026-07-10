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

## 연결

- 메인 스레드 → [[browser-architecture]]
- HTML 파싱 = 파스 트리 → compilers/[[parsing]]
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
