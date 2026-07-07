# I/O 멀티플렉싱 (I/O Multiplexing)

## 한 줄 요약

한 스레드가 수천 개의 연결을 동시에 다루는 법. 블로킹 I/O는 연결당 스레드가 필요하지만, epoll/kqueue는 "준비된 것만 알려줘" 방식으로 이벤트 루프 하나가 전부를 처리한다. 고성능 서버의 심장.

## 왜 필요한가

- 서버가 수만 연결을 어떻게 한 프로세스로 다루나 (C10K 문제)
- Node.js/nginx/Redis가 스레드 없이 어떻게 동시성을 내나
- async/await가 아래에서 뭘 하나

## 문제: 블로킹 I/O는 연결당 스레드

전통 방식: 연결마다 스레드, 각자 블로킹 `read`:

```c
// 스레드 하나가 한 연결 담당
char buf[N];
read(sock, buf, N);   // 데이터 올 때까지 이 스레드 블록
```

- 연결 10000개 = 스레드 10000개
- 스레드마다 스택(MB)·컨텍스트 스위치([[limited-direct-execution]]) 비용 → 수천 개면 메모리·스케줄링 폭발
- 대부분 스레드가 I/O 대기로 놀며 자원만 점유 = **C10K 문제**

## 해법: 이벤트 기반 (준비된 것만)

한 스레드가 **여러 fd를 감시**하다가 준비된 것만 처리:

```c
while (1) {
    준비된_fd들 = wait_for_ready(모든_fd);   // 하나라도 준비되면 반환
    for (fd in 준비된_fd들)
        handle(fd);   // 블록 안 함 - 준비된 것만
}
```

이게 **이벤트 루프**. 스레드 하나가 수천 fd를 순회. 블로킹 대기 대신 "누가 준비됐나"만 물음.

## select → poll → epoll/kqueue

준비 여부를 묻는 API의 진화:

| API | 방식 | 문제 |
|---|---|---|
| **select** | fd 집합을 매번 통째 전달, 커널이 전부 스캔 | fd 수에 O(n), fd 1024개 제한 |
| **poll** | 배열로 전달, 제한 없음 | 여전히 매 호출 O(n) 스캔 |
| **epoll**(리눅스)/**kqueue**(BSD/macOS) | 관심 fd를 커널에 **등록**해두고, 준비된 것만 반환 | O(준비된 수). 확장성 ✓ |

epoll/kqueue의 핵심: 매번 전체 목록을 스캔하지 않고 **커널이 준비된 fd만 콕 집어** 알려줌 → fd가 10만 개여도 준비된 몇 개만 처리. C10K 해결의 열쇠.

```
epoll_create → epoll_ctl(등록) → epoll_wait(준비된 것만 받기)
```

## 논블로킹 소켓과 짝

이벤트 루프는 **논블로킹 fd**와 함께 씀:

- fd를 논블로킹으로 설정 → `read`가 데이터 없으면 블록 대신 즉시 `EAGAIN` 반환
- epoll이 "읽기 준비됨" 알린 fd만 read → 블록 안 함
- 한 핸들러가 절대 블록 안 하는 게 규칙 (블록하면 이벤트 루프 전체 멈춤)

## 실제 아키텍처

- **nginx**: 워커 프로세스마다 이벤트 루프 하나로 수천 연결
- **Redis**: 단일 스레드 이벤트 루프 (그래서 명령이 원자적, 락 불필요 → [[threads-and-races]] 회피)
- **Node.js**: libuv 이벤트 루프. JS는 싱글 스레드, I/O는 논블로킹 → [[javascript-event-loop]]
- 보통 **이벤트 루프 + 코어 수만큼 프로세스/스레드** 조합 (멀티코어 활용 + 각자 이벤트 루프)

## async/await와의 관계

현대 언어의 `async/await`는 이 위의 추상:

- `await`은 "여기서 논블로킹 I/O 걸고 완료되면 재개" → 이벤트 루프에 등록하고 양보
- 겉보기 동기 코드가 내부적으로 이벤트 루프 콜백으로 변환
- 스레드 없이 동시성 (스레드보다 훨씬 가벼움) → [[process-vs-thread]]의 경량 스레드와 다른 접근
- 코루틴/Go goroutine은 이걸 런타임이 자동으로 (goroutine이 블로킹 I/O하면 런타임이 이벤트 루프로 변환)

## io_uring (최신)

epoll도 여전히 시스템 콜이 잦음. **io_uring**(리눅스)은 커널-유저 공유 링 버퍼로 I/O 요청/완료를 배치 → 시스템 콜 오버헤드([[limited-direct-execution]])까지 최소화. 고성능 I/O의 최신 방향.

## 연결

- 컨텍스트 스위치·시스템 콜 비용 → [[limited-direct-execution]]
- 스레드 모델 대안 → [[process-vs-thread]]
- 단일 스레드 이벤트 루프가 경쟁 회피 → [[threads-and-races]]
- 브라우저/JS 이벤트 루프 → web/[[javascript-event-loop]]
- 소켓 → network/[[sockets]]

## 궁금한 것 (나중에)

- [ ] epoll의 edge-triggered vs level-triggered
- [ ] io_uring이 실제로 얼마나 빠른가
- [ ] Go 런타임이 goroutine 블로킹을 이벤트 루프로 바꾸는 법 (netpoller)
- [ ] 이벤트 루프 + 멀티코어의 부하 분산 (SO_REUSEPORT)

## 출처

- OSTEP 이벤트 기반 동시성 (33장)
- "The C10K problem" (Dan Kegel)
