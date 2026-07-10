# 리플로우와 리페인트 (Reflow and Repaint)

## 한 줄 요약

DOM/스타일 변경이 렌더링 파이프라인을 어디까지 되돌리나. 레이아웃 변경(리플로우)이 가장 비싸고, 페인트가 다음, transform/opacity(컴포지팅만)가 가장 싸다. 이걸 알면 부드러운 애니메이션을 만든다.

## 왜 필요한가

- 왜 어떤 CSS 변경은 버벅이고 어떤 건 부드러운가
- transform이 왜 애니메이션에 권장되나
- 레이아웃 스래싱이 뭔가

## 변경의 비용 계층

DOM/스타일 변경 시 렌더링 파이프라인([[critical-rendering-path]])을 되돌리는 정도:

```
레이아웃 변경 → 레이아웃 + 페인트 + 컴포지팅 (전부 다시)  ← 가장 비쌈
색상 변경    → 페인트 + 컴포지팅
transform/opacity → 컴포지팅만                          ← 가장 쌈
```

되돌리는 단계가 많을수록 비쌈. 애니메이션(60fps = 16ms 예산)에선 이 차이가 결정적.

## 리플로우 (reflow/layout)

**기하(위치·크기)가 바뀌면** → 레이아웃 재계산:

유발:
- width/height, top/left, margin/padding 변경
- 요소 추가/삭제
- 폰트 크기, 텍스트 내용
- **레이아웃 값 읽기**도 (offsetHeight, getComputedStyle) → 강제 동기 레이아웃

비용:
- 한 요소 리플로우가 **다른 요소에 전파** (부모·형제·자식 위치 재계산)
- 전체 문서 리플로우는 매우 비쌈
- 이후 페인트+컴포지팅도 뒤따름

## 리페인트 (repaint)

**모양(색, 배경, 그림자)이 바뀌지만 레이아웃은 그대로** → 페인트만:

- color, background, visibility, box-shadow
- 레이아웃보다 싸지만 여전히 픽셀 다시 그림
- 큰 영역 리페인트는 부담

## 컴포지팅만 (가장 싸다)

**transform, opacity**는 레이아웃·페인트 없이 **컴포지팅만**:

- 이미 그려진 레이어를 GPU가 이동/투명도 조절 ([[browser-architecture]]의 컴포지터 스레드)
- 메인 스레드 안 씀 → 부드러움 (JS 바빠도 애니메이션 유지)
- **애니메이션은 transform/opacity로**: `left: 100px` (리플로우) 대신 `transform: translateX(100px)` (컴포지팅)

```css
/* 나쁨: 매 프레임 리플로우 */
@keyframes bad { to { left: 300px; } }
/* 좋음: 컴포지팅만 */
@keyframes good { to { transform: translateX(300px); } }
```

## 레이아웃 스래싱 (layout thrashing)

흔한 성능 버그 - **읽기와 쓰기를 번갈아** 하면 강제 리플로우 반복:

```js
// 나쁨: 읽기-쓰기 번갈아 → 매번 강제 리플로우
for (el of elements) {
    el.style.width = el.offsetWidth + 10 + 'px';  // 읽기(offsetWidth)가 쓰기 반영 위해 리플로우 강제
}
// 좋음: 읽기 모아서 → 쓰기 모아서
const widths = elements.map(el => el.offsetWidth);  // 읽기 배치
elements.forEach((el, i) => el.style.width = widths[i] + 10 + 'px');  // 쓰기 배치
```

- 브라우저는 변경을 **배치(batch)**해 한 번에 리플로우하려 함
- 하지만 레이아웃 값을 **읽으면** 최신 값 위해 즉시 리플로우 강제 → 배치 깨짐
- 읽기/쓰기를 분리하면 리플로우 1회

## 최적화 기법

1. **transform/opacity로 애니메이션** (컴포지팅만)
2. **읽기/쓰기 분리** (레이아웃 스래싱 방지)
3. **will-change**: 레이어 미리 승격 (GPU에 힌트) - 남용 주의 (메모리)
4. **DocumentFragment**: DOM 변경을 모아 한 번에 삽입
5. **requestAnimationFrame**: 렌더 직전에 변경 (프레임 맞춤 → [[javascript-event-loop]])
6. **가상화**: 화면에 보이는 것만 렌더 (긴 리스트)

## 셀프 체크

> [!question]- 리플로우·리페인트·컴포지팅만, 셋의 비용 순서와 각각을 유발하는 변경은?
> 리플로우(가장 비쌈)는 기하가 바뀔 때 - width/height, top/left, margin, 요소 추가/삭제, 폰트 크기. 리페인트(중간)는 모양만 바뀔 때 - color, background, box-shadow. 컴포지팅만(가장 쌈)은 transform, opacity. 되돌리는 파이프라인 단계가 많을수록 비싸다.

> [!question]- 애니메이션에 left 대신 transform: translateX를 권장하는 이유는?
> left 변경은 리플로우+페인트+컴포지팅을 매 프레임 유발한다. transform은 이미 그려진 레이어를 GPU가 이동시키는 컴포지팅만이라 메인 스레드를 안 쓴다. 그래서 JS가 바빠도 60fps 애니메이션을 유지할 수 있다.

> [!question]- 레이아웃 값을 "읽기"만 하는데 왜 리플로우가 강제되나?
> offsetHeight·getComputedStyle 같은 레이아웃 값을 읽으면 브라우저가 최신 값을 주기 위해 그때까지 쌓인 변경을 즉시 반영(강제 동기 레이아웃)해야 한다. 배치하려던 리플로우를 강제로 앞당긴다.

> [!question]- 레이아웃 스래싱(layout thrashing)이란?
> 반복문 안에서 레이아웃 값 읽기와 스타일 쓰기를 번갈아 하면, 읽을 때마다 강제 리플로우가 일어나 매 반복마다 리플로우가 발생하는 성능 버그다. 읽기를 모으고 쓰기를 모아 분리하면 리플로우를 1회로 줄인다.

## 연습문제

> [!example]- 리스트의 각 항목 너비를 현재 너비 + 10px로 바꾸는 코드가 항목이 많을수록 급격히 느려진다. 원인을 진단하고 고쳐라.
> **풀이**
> 느린 코드: 반복문에서 el.style.width = el.offsetWidth + 10 + 'px'를 항목마다 한다. offsetWidth를 읽는 순간(읽기) 직전의 쓰기를 반영하려 강제 리플로우가 걸리고, 이게 매 반복마다 반복돼 레이아웃 스래싱이 발생한다.
> 진단: DevTools Performance에서 "Forced reflow" 경고와 보라색 Layout 막대가 반복적으로 잡힌다.
> 고침: 읽기와 쓰기를 분리한다. 먼저 모든 offsetWidth를 배열로 읽고(읽기 배치), 그다음 모든 요소에 새 width를 쓴다(쓰기 배치). 그러면 리플로우가 1회로 줄어든다.

> [!example]- 요소를 화면에서 부드럽게 움직이는 애니메이션이 저사양 기기에서 뚝뚝 끊긴다. CSS 관점에서 원인과 개선책을 제시하라.
> **풀이**
> 원인: 애니메이션이 left/top이나 width 같은 레이아웃 속성을 바꿔 매 프레임 리플로우+페인트가 일어난다. 60fps는 프레임당 16ms 예산인데 리플로우 비용이 이를 초과해 프레임을 놓친다.
> 개선: 이동은 transform: translate, 페이드는 opacity로 바꾼다. 둘은 컴포지팅만 유발해 GPU가 처리하므로 메인 스레드 부담이 없다. 필요하면 will-change로 레이어를 미리 승격(단 남용은 메모리 부담)하고, 변경을 requestAnimationFrame으로 프레임에 맞춘다.

## 파인만

> [!note]- 백지에 "DOM/스타일을 바꿨을 때 렌더링 파이프라인을 어디까지 되돌리나"를 비용 계층으로 그려 남에게 설명하듯 써보라. 막히면 그 계층만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) 리플로우/리페인트/컴포지팅만의 비용 순서와 유발 속성, (2) transform/opacity가 왜 싼지(컴포지터 스레드·GPU), (3) 레이아웃 스래싱의 원인과 읽기/쓰기 분리 해법.

## 연결

- 렌더링 파이프라인 → [[critical-rendering-path]]
- 컴포지터 스레드 → [[browser-architecture]]
- rAF 타이밍 → [[javascript-event-loop]]
- 성능 지표 → [[web-performance]]
- GPU 레이어 합성 → concurrency-parallelism/[[gpu-computing]]

## 궁금한 것 (나중에)

- [ ] 레이어 승격 조건과 비용
- [ ] 어떤 CSS 속성이 어느 단계를 유발하나 (csstriggers.com)
- [ ] contain 속성 (리플로우 격리)
- [ ] 가상 스크롤 구현

## 출처

- web.dev "Rendering performance", MDN
