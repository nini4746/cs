# 브라우저 아키텍처 (Browser Architecture)

## 한 줄 요약

현대 브라우저는 멀티 프로세스 - 탭·렌더러·GPU·네트워크를 프로세스로 격리한다. 한 탭이 죽어도 전체가 안 죽고, 보안 샌드박스로 악성 사이트를 가둔다. 렌더러 안에서 메인 스레드가 JS와 렌더링을 처리한다.

## 왜 필요한가

- 브라우저가 실제로 어떻게 구성되나
- 왜 탭이 프로세스로 나뉘나 (크롬)
- 렌더링·JS가 어느 스레드에서 도나

## 멀티 프로세스 구조

크롬이 도입한 프로세스 분리 (os/[[virtualization-and-containers]]의 격리 발상):

```
브라우저 프로세스 (UI, 주소창, 조율)
├─ 렌더러 프로세스 (탭/사이트마다) - HTML/CSS/JS 처리
├─ GPU 프로세스 - 그래픽 가속
├─ 네트워크 프로세스 - HTTP/소켓 (network/[[sockets]])
└─ 플러그인/유틸리티 프로세스
```

왜 나누나:
- **안정성**: 한 탭(렌더러) 크래시 → 그 탭만 죽고 브라우저·다른 탭 생존 (os/[[process-vs-thread]]의 프로세스 격리)
- **보안**: 렌더러를 **샌드박스**에 가둠 → 악성 사이트가 시스템 접근 못 함. site isolation으로 사이트별 프로세스 (Spectre 방어 → computer-architecture/[[branch-prediction]])
- **병렬성**: 여러 탭이 여러 코어에 (os/[[multicore-and-numa]])

대가: 프로세스마다 메모리 오버헤드 (크롬이 메모리 많이 쓰는 이유).

## 렌더러 프로세스 내부

한 탭의 렌더러 안 스레드들:

- **메인 스레드**: HTML 파싱, DOM 구성, 스타일 계산, 레이아웃, JS 실행 → 여기가 병목 (아래)
- **컴포지터 스레드**: 레이어 합성, 스크롤 (메인과 별개 → 부드러운 스크롤)
- **래스터 스레드**: 타일을 픽셀로
- **워커 스레드**: Web Worker (JS를 별도 스레드에)

## 메인 스레드가 병목

핵심 문제: **JS와 렌더링이 같은 메인 스레드**:

- JS가 오래 돌면 → 렌더링·입력 처리 못 함 → **버벅임(jank)**, 응답 없음
- JS는 싱글 스레드(이벤트 루프 → [[javascript-event-loop]]) → 무거운 계산이 UI를 멈춤
- 그래서: 무거운 작업을 Web Worker(별도 스레드)로, 또는 잘게 쪼개 (yield)

os/[[io-multiplexing]]의 이벤트 루프가 브라우저 메인 스레드의 모델 → [[javascript-event-loop]].

## 렌더링 파이프라인 (개요)

메인 스레드가 HTML→화면으로 (상세는 [[critical-rendering-path]]):

```
HTML → DOM
CSS → CSSOM
DOM+CSSOM → 렌더 트리 → 레이아웃 → 페인트 → 컴포지팅 → 화면
```

각 단계가 메인 스레드 (컴포지팅은 컴포지터 스레드). → [[critical-rendering-path]]

## 브라우저의 주요 부품

- **렌더링 엔진**: HTML/CSS → 화면 (Blink=크롬, WebKit=사파리, Gecko=파이어폭스)
- **JS 엔진**: JS 실행 (V8=크롬/노드, JavaScriptCore=사파리, SpiderMonkey=파이어폭스). JIT → programming-languages/[[compiled-vs-interpreted]]
- **네트워크 스택**: HTTP, TLS, 소켓 → network/
- **스토리지**: 쿠키, localStorage, IndexedDB

## site isolation과 보안

각 사이트(출처)를 별도 프로세스로:
- 악성 사이트가 다른 사이트 메모리를 못 봄
- Spectre 같은 투기 실행 공격(computer-architecture/[[branch-prediction]]) 방어 - 프로세스 경계로 메모리 격리
- same-origin policy를 프로세스 레벨로 강화 → [[cors]]

## 연결

- 프로세스 격리 → os/[[process-vs-thread]], [[virtualization-and-containers]]
- 렌더링 파이프라인 → [[critical-rendering-path]]
- 이벤트 루프 → [[javascript-event-loop]]
- JS 엔진 JIT → programming-languages/[[compiled-vs-interpreted]]
- 네트워크 → network/[[what-happens-url]], [[sockets]]
- Spectre 격리 → computer-architecture/[[branch-prediction]]

## 궁금한 것 (나중에)

- [ ] site isolation의 정확한 경계 (출처 vs 사이트)
- [ ] 프로세스 vs 스레드 모델 (파이어폭스 vs 크롬)
- [ ] BFCache (뒤로가기 캐시)
- [ ] Web Worker vs Service Worker vs Worklet

## 출처

- Chrome "Inside look at modern web browser" 시리즈, web.dev
