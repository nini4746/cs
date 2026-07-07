# 조건 변수 (Condition Variables)

## 한 줄 요약

스레드가 "어떤 조건이 참이 될 때까지" 효율적으로 기다리게 하는 도구. 스핀으로 조건을 폴링하는 대신 잠들었다가 다른 스레드가 깨워준다. 반드시 while 루프로 조건을 재검사해야 한다.

## 왜 필요한가

- 락([[locks]])은 상호 배제만. "조건 충족까지 대기"는 다른 문제
- 생산자-소비자 같은 협력 패턴을 어떻게 짜나
- 왜 `if`가 아니라 `while`로 감싸야 하나 (흔한 버그)

## 문제: 조건을 기다려야 할 때

큐가 빌 때까지 소비자가 기다려야 하는 상황. 나쁜 방법 - 스핀:

```c
while (queue_empty()) ;   // CPU를 태우며 폴링 - 낭비
consume();
```

조건이 안 바뀌는 동안 CPU를 헛돎. 조건 변수는 **잠들어 기다리고 신호받아 깨어남**.

## 조건 변수의 사용법

항상 **락 + 조건 변수 + 조건(공유 상태)** 삼종 세트:

```c
// 대기 측
pthread_mutex_lock(&m);
while (!ready)                       // while! (if 아님)
    pthread_cond_wait(&cv, &m);      // 락 놓고 잠듦, 깨면 락 재획득
process();
pthread_mutex_unlock(&m);

// 신호 측
pthread_mutex_lock(&m);
ready = true;
pthread_cond_signal(&cv);            // 대기자 하나 깨움
pthread_mutex_unlock(&m);
```

`cond_wait`의 마법: **원자적으로 락을 놓고 잠듦**, 깨어날 때 **락을 다시 획득**. 락을 쥔 채 잠들면 아무도 조건을 못 바꿔 데드락 → wait이 락을 놓아줘야 함.

## 왜 while인가 (핵심)

`if (!ready) wait()`로 쓰면 버그. 세 이유로 깨어났을 때 조건이 여전히 거짓일 수 있음:

1. **가짜 기상(spurious wakeup)**: 신호 없이도 깨어날 수 있음 (OS 구현상 허용됨)
2. **다른 스레드가 가로챔**: 깨어나 락 얻기 전에 다른 소비자가 항목을 채감
3. **broadcast**: 여러 스레드를 깨웠는데 조건은 하나만 만족

→ **깨어나면 조건을 다시 검사**해야 안전. `while`이 이를 강제. 이건 관용구가 아니라 필수 규칙.

## 생산자-소비자 (bounded buffer)

고전 패턴. 유한 버퍼에 생산자가 넣고 소비자가 뺌:

```c
// 생산자: 가득 차면 대기
lock(&m);
while (count == SIZE) cond_wait(&empty, &m);   // 빈자리 대기
buffer[in++] = item; count++;
cond_signal(&fill);                             // 소비자 깨움
unlock(&m);

// 소비자: 비면 대기
lock(&m);
while (count == 0) cond_wait(&fill, &m);        // 항목 대기
item = buffer[out++]; count--;
cond_signal(&empty);                            // 생산자 깨움
unlock(&m);
```

**조건 변수 2개** 필요: "빈자리 생김"(empty)과 "항목 생김"(fill). 하나로 하면 생산자가 생산자를 깨우는 등 잘못 깨움 발생. 각 방향마다 별도 CV.

## signal vs broadcast

- **signal**: 대기자 하나만 깨움. 깨어난 하나가 조건을 소비 → 효율적
- **broadcast**: 전부 깨움. 어느 대기자가 조건을 만족시킬지 모를 때 (예: 서로 다른 조건을 기다림). 깨어난 다수가 while로 재검사 후 대부분 다시 잠듦 (thundering herd 비용)

확신 없으면 broadcast가 안전(정확성), signal이 효율적. 조건이 하나면 signal.

## 연결

- 상호 배제 기반 → [[locks]]
- 같은 문제를 세마포어로 → [[semaphores]]
- 공유 상태 경쟁 → [[threads-and-races]]
- 스레드 협력 패턴 → [[process-vs-thread]]

## 궁금한 것 (나중에)

- [ ] 가짜 기상이 실제로 왜/언제 일어나나
- [ ] Mesa vs Hoare 시맨틱 (신호 후 누가 먼저 실행)
- [ ] cond_wait 없이 조건을 기다리는 다른 법 (채널, future)
- [ ] Go의 channel은 이걸 어떻게 추상화하나

## 출처

- OSTEP 30장 (조건 변수)
