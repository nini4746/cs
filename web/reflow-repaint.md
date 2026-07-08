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

## 연결

- 렌더링 파이프라인 → [[critical-rendering-path]]
- 컴포지터 스레드 → [[browser-architecture]]
- rAF 타이밍 → [[javascript-event-loop]]
- 성능 지표 → [[web-performance]]

## 궁금한 것 (나중에)

- [ ] 레이어 승격 조건과 비용
- [ ] 어떤 CSS 속성이 어느 단계를 유발하나 (csstriggers.com)
- [ ] contain 속성 (리플로우 격리)
- [ ] 가상 스크롤 구현

## 출처

- web.dev "Rendering performance", MDN
