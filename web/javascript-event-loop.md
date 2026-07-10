# JS 이벤트 루프 (JavaScript Event Loop)

## 한 줄 요약

JS는 싱글 스레드지만 이벤트 루프로 동시성을 낸다. 콜 스택이 비면 마이크로태스크(Promise)를 먼저, 그다음 매크로태스크(setTimeout)를 처리한다. async/await가 이 위에 세워졌다.

## 왜 필요한가

- 싱글 스레드 JS가 어떻게 비동기를 하나
- Promise와 setTimeout 실행 순서
- async/await가 아래에서 뭘 하나

## 싱글 스레드 + 이벤트 루프

JS는 **싱글 스레드** (메인 스레드, [[browser-architecture]]) - 한 번에 하나만 실행:

- 그런데 비동기(네트워크, 타이머, 이벤트)를 어떻게? → **이벤트 루프**
- os/[[io-multiplexing]]의 이벤트 루프가 JS의 동시성 모델
- 블로킹 대신 콜백/Promise로 "나중에 실행"

```
콜 스택(실행 중) 비면 → 큐에서 다음 작업 꺼내 실행 → 반복
```

## 구성 요소

```
콜 스택(call stack): 지금 실행 중인 함수들 (동기)
마이크로태스크 큐: Promise 콜백, queueMicrotask
매크로태스크 큐: setTimeout, 이벤트, I/O
Web API: 타이머·네트워크 (브라우저/노드가 제공, JS 밖)
```

이벤트 루프: **콜 스택이 비면** → 마이크로태스크 전부 → 매크로태스크 하나 → 렌더링 → 반복.

## 실행 순서 (핵심) - 실측

우선순위: **동기 → 마이크로태스크 → 매크로태스크**:

```js
console.log("1: sync start");
setTimeout(() => console.log("5: setTimeout"), 0);
Promise.resolve().then(() => console.log("3: promise"));
Promise.resolve().then(() => console.log("4: promise2"));
console.log("2: sync end");
```

실측 출력:
```
1: sync start        ← 동기 먼저 (콜 스택)
2: sync end          ← 동기
3: promise           ← 마이크로태스크 (스택 비면 먼저)
4: promise2          ← 마이크로태스크
5: setTimeout        ← 매크로태스크 (마이크로 다 끝나고)
```

핵심: **setTimeout(0)인데도 Promise보다 나중**. 이벤트 루프가 매크로태스크 하나 처리 전에 **마이크로태스크를 전부 비움**. 이 순서를 모르면 비동기 버그.

## 마이크로 vs 매크로

| | 마이크로태스크 | 매크로태스크 |
|---|---|---|
| 예 | Promise.then, queueMicrotask, await | setTimeout, 이벤트, I/O |
| 처리 | 스택 비면 **전부** | 한 번에 **하나** |
| 우선순위 | 높음 | 낮음 |

- 매크로태스크 하나 후 → 마이크로태스크 **전부** → 렌더링 → 다음 매크로태스크
- 마이크로태스크가 계속 새 마이크로태스크를 큐에 넣으면 → 렌더링·매크로태스크 굶음 (주의)

## async/await

Promise + 이벤트 루프 위의 문법 설탕 → programming-languages/[[compiled-vs-interpreted]]의 async와 같은 발상:

```js
async function f() {
    console.log("a");
    await something();     // 여기서 양보, 나머지는 마이크로태스크로
    console.log("b");      // something 완료 후 마이크로태스크로 재개
}
```

- `await`은 "여기서 멈추고 Promise 완료되면 재개" → 겉보기 동기, 실제 비동기
- `await` 이후 코드 = Promise.then 콜백 = 마이크로태스크
- 콜백 지옥을 동기처럼 → 가독성 (os/[[io-multiplexing]]의 async와 동일 원리)

## 왜 블로킹이 위험한가

싱글 스레드라 **긴 동기 작업이 전부 막음**:

```js
while (true) {}   // 이벤트 루프 영영 멈춤 - UI, 타이머, 모든 것 정지
```

- 무거운 계산이 렌더링·입력을 막음 ([[browser-architecture]]의 메인 스레드 병목)
- 해결: **Web Worker**(별도 스레드, [[websockets-sse]] 아님), 작업 분할(setTimeout으로 yield), 비동기 API

## Node.js의 이벤트 루프

브라우저와 유사하나 단계(phase)가 더 세분 (libuv):
- timers, pending, poll, check, close 단계
- setImmediate vs setTimeout, process.nextTick 우선순위
- os/[[io-multiplexing]]의 epoll/kqueue를 libuv가 감쌈

## 셀프 체크

> [!question]- 이벤트 루프의 처리 순서를 한 사이클 기준으로 설명하라.
> 콜 스택이 비면 마이크로태스크 큐를 전부 비우고, 그다음 매크로태스크 하나를 처리한 뒤 렌더링, 다시 반복한다. 우선순위는 동기(콜 스택) → 마이크로태스크 → 매크로태스크 순이다.

> [!question]- setTimeout(fn, 0)이 Promise.then보다 나중에 실행되는 이유는?
> setTimeout은 매크로태스크, Promise.then은 마이크로태스크다. 이벤트 루프는 매크로태스크를 하나 처리하기 전에 마이크로태스크 큐를 전부 비운다. 그래서 지연 0이어도 Promise 콜백이 먼저 실행된다.

> [!question]- await 이후의 코드는 어떤 태스크로 실행되나?
> await은 그 지점에서 함수를 멈추고 제어를 양보한다. 기다리던 Promise가 완료되면 await 이후 코드가 Promise.then 콜백처럼 마이크로태스크로 큐에 들어가 재개된다. 겉보기 동기지만 실제로는 비동기다.

> [!question]- 마이크로태스크 기아(starvation)란 무엇인가?
> 마이크로태스크가 계속 새 마이크로태스크를 큐에 넣으면 이벤트 루프가 마이크로태스크 큐를 비우지 못해 렌더링과 매크로태스크가 영영 실행되지 못하는 상태다. 무한 재귀 Promise 체인 등이 원인.

## 연습문제

> [!example]- 다음 코드의 출력 순서를 예측하고 이유를 설명하라. `console.log('A'); setTimeout(()=>console.log('B'),0); Promise.resolve().then(()=>console.log('C')); console.log('D');`
> **풀이**
> 출력: A, D, C, B.
> 이유: A와 D는 동기 코드라 콜 스택에서 먼저 순서대로 실행된다. 콜 스택이 비면 마이크로태스크 큐를 전부 비우므로 Promise.then의 C가 실행된다. 마지막으로 매크로태스크인 setTimeout의 B가 실행된다. setTimeout(0)이라도 마이크로태스크(C)보다 뒤라는 게 핵심.

> [!example]- 버튼 클릭 시 큰 배열을 정렬·집계하는 동안 스피너 애니메이션이 멈추고 다른 클릭도 안 먹는다. 원인을 진단하고 두 가지 이상 해결책을 제시하라.
> **풀이**
> 원인: 정렬·집계가 메인 스레드에서 긴 동기 작업으로 돌아 이벤트 루프를 점유했다. JS는 싱글 스레드라 이 동안 렌더링(애니메이션)·입력(클릭) 처리가 모두 막힌다.
> 해결책: (1) 작업을 잘게 쪼개 setTimeout이나 스케줄러로 중간중간 yield해 이벤트 루프가 렌더·입력을 처리할 틈을 준다. (2) 계산을 Web Worker(별도 스레드)로 옮겨 메인 스레드를 비운다. 애니메이션은 requestAnimationFrame으로 프레임에 맞추면 더 부드럽다.

## 파인만

> [!note]- 백지에 "콜 스택, 마이크로태스크 큐, 매크로태스크 큐, Web API"를 그리고 setTimeout+Promise가 섞인 코드가 어떻게 흘러가는지 남에게 설명하듯 써보라. 막히면 그 큐만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) 동기→마이크로태스크(전부)→매크로태스크(하나) 순서, (2) setTimeout(0)이 Promise보다 늦는 이유, (3) 긴 동기 작업이 왜 UI를 멈추고 어떻게 푸는지.

## 연결

- 이벤트 루프 원리 → os/[[io-multiplexing]]
- 메인 스레드 병목 → [[browser-architecture]]
- async/await → programming-languages/[[compiled-vs-interpreted]]
- 렌더링과의 관계 → [[critical-rendering-path]], [[reflow-repaint]]
- async/await 코루틴 → concurrency-parallelism/[[async-and-coroutines]]
- 싱글 스레드 동시성 → concurrency-parallelism/[[concurrency-vs-parallelism]]

## 궁금한 것 (나중에)

- [ ] Node.js 이벤트 루프 단계 상세
- [ ] requestAnimationFrame의 타이밍 (렌더 전)
- [ ] process.nextTick vs Promise 우선순위
- [ ] 마이크로태스크 기아 방지

## 출처

- MDN "Event loop", Jake Archibald "In The Loop" (유명 발표)
