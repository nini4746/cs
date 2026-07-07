# 세마포어 (Semaphores)

## 한 줄 요약

정수 카운터 + 두 원자 연산(wait/post)으로 된 동기화 도구. 하나로 락도, 조건 변수도, 자원 개수 제한도 표현할 수 있는 범용 원시타입이다.

## 왜 필요한가

- 락과 조건 변수를 하나로 통합하는 추상
- "동시에 N개까지만 허용" 같은 자원 제한을 어떻게 표현하나
- reader-writer, 생산자-소비자의 간결한 해법

## 정의

세마포어 = 정수 값 + 두 원자적 연산:

```
wait(s)  (P, down): s--; s<0 이면 블록 (대기)
post(s)  (V, up)  : s++; 대기자 있으면 하나 깨움
```

- 값이 **자원의 개수**를 의미. 음수면 절댓값 = 대기 중인 스레드 수
- 두 연산은 원자적 (내부적으로 락으로 보호)

## 세 가지 용법

### 1. 이진 세마포어 = 락

초기값 1 → 상호 배제 ([[locks]]):

```c
sem_t m; sem_init(&m, 0, 1);   // 초기값 1
sem_wait(&m);                  // 획득 (1→0)
critical_section();
sem_post(&m);                  // 해제 (0→1)
```

값이 1이면 한 스레드 진입(0으로), 다음은 0에서 wait → 블록. 락과 동일.

### 2. 카운팅 세마포어 = 자원 제한

초기값 N → **동시에 N개까지 허용**:

```c
sem_t slots; sem_init(&slots, 0, 5);   // 커넥션 풀 5개
sem_wait(&slots);   // 슬롯 하나 점유 (없으면 대기)
use_connection();
sem_post(&slots);   // 반납
```

DB 커넥션 풀, 스레드 풀, 동시 다운로드 제한 등. "N개 자원"을 자연스럽게 표현 - 락으론 어색한 것.

### 3. 순서 강제 = 조건 변수 대용

초기값 0 → **한 스레드가 다른 스레드를 기다림**:

```c
sem_t done; sem_init(&done, 0, 0);   // 초기값 0
// 스레드A: sem_wait(&done);  // B가 끝날 때까지 대기 (0에서 블록)
// 스레드B: work(); sem_post(&done);  // 완료 신호 (0→1, A 깨움)
```

값 0에서 wait은 블록, post가 깨움 → 조건 변수([[condition-variables]])의 신호/대기와 같은 효과.

## 생산자-소비자 (세마포어 버전)

[[condition-variables]]의 그 문제를 세마포어로 더 간결하게:

```c
sem_t empty; sem_init(&empty, 0, SIZE);  // 빈 슬롯 수
sem_t full;  sem_init(&full, 0, 0);      // 찬 슬롯 수
sem_t mutex; sem_init(&mutex, 0, 1);     // 버퍼 보호

// 생산자
sem_wait(&empty);   // 빈자리 하나 확보 (없으면 대기)
sem_wait(&mutex); buffer_put(item); sem_post(&mutex);
sem_post(&full);    // 항목 하나 알림

// 소비자
sem_wait(&full);    // 항목 하나 확보 (없으면 대기)
sem_wait(&mutex); item=buffer_get(); sem_post(&mutex);
sem_post(&empty);   // 빈자리 하나 알림
```

`empty`/`full`이 슬롯 개수를 카운팅 → while 루프 없이 대기 자동. 조건 변수 버전보다 간결. **wait 순서 주의**: 자원 세마포어(empty/full)를 mutex보다 먼저 - 뒤집으면 데드락 ([[deadlock]]).

## reader-writer 락

읽기는 동시 허용, 쓰기는 배타적. 세마포어로 구현:

- 읽는 중엔 여러 reader 허용 (읽기끼리 충돌 없음)
- writer는 혼자만 (읽기/쓰기 다 배제)
- reader 카운트를 세마포어로 보호, writer용 세마포어로 배타 제어
- 읽기 많은 워크로드에 유리 (락보다 병렬성↑). 단 writer 기아 주의

## 세마포어 vs 다른 도구

| | 세마포어 | 락 | 조건 변수 |
|---|---|---|---|
| 표현력 | 범용 (셋 다 가능) | 상호 배제만 | 조건 대기 |
| 상태 | 정수 카운터 | 이진 | 없음(락에 의존) |
| 함정 | 값 의미 헷갈림, wait/post 짝 실수 | 단순 | while 필수 |

세마포어는 강력하지만 값의 의미를 추적해야 해서 실수하기 쉬움. 현대 코드는 명확성을 위해 락+CV를 선호하기도. 하지만 자원 카운팅엔 세마포어가 자연스러움.

## 연결

- 이진 세마포어 = 락 → [[locks]]
- 순서 강제 = 조건 변수 → [[condition-variables]]
- wait 순서와 데드락 → [[deadlock]]
- 경쟁 조건 기초 → [[threads-and-races]]

## 궁금한 것 (나중에)

- [ ] 세마포어 자체는 어떻게 원자적으로 구현되나 (내부 락)
- [ ] reader-writer의 writer 기아를 막는 법
- [ ] Go/Rust는 세마포어 대신 뭘 쓰나 (channel, Mutex)
- [ ] 이름있는 세마포어(프로세스 간)의 용도

## 출처

- OSTEP 31장 (세마포어)
