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

## 연결

- 이벤트 루프 원리 → os/[[io-multiplexing]]
- 메인 스레드 병목 → [[browser-architecture]]
- async/await → programming-languages/[[compiled-vs-interpreted]]
- 렌더링과의 관계 → [[critical-rendering-path]], [[reflow-repaint]]

## 궁금한 것 (나중에)

- [ ] Node.js 이벤트 루프 단계 상세
- [ ] requestAnimationFrame의 타이밍 (렌더 전)
- [ ] process.nextTick vs Promise 우선순위
- [ ] 마이크로태스크 기아 방지

## 출처

- MDN "Event loop", Jake Archibald "In The Loop" (유명 발표)
