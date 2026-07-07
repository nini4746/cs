# 페이지 캐시 (Page Cache)

## 한 줄 요약

OS는 디스크에서 읽은 파일 데이터를 남는 RAM에 캐싱한다. RAM을 디스크의 캐시로 쓰는 것. 이 덕에 반복 파일 접근이 빠르고, 쓰기는 모아서 나중에(write-back) 처리한다.

## 왜 필요한가

- 같은 파일을 두 번째 읽으면 왜 빠른가
- "메모리를 다 쓰는데 왜 여유가 있다고 하나" (캐시가 먹은 것)
- mmap이 어떻게 파일을 메모리처럼 다루나
- write-back과 fsync의 관계 ([[crash-consistency]])

## RAM = 디스크의 캐시

[[memory-hierarchy]]의 계층 사고: 각 층은 아래 층의 캐시. RAM은 디스크의 캐시. **페이지 캐시** = 디스크 블록을 담아두는 RAM 영역.

- 파일 읽기: 디스크에서 읽은 페이지를 캐시에 보관 → 다음 접근은 RAM에서 (디스크 안 감)
- **남는 RAM을 전부 캐시로** 활용 → "빈 RAM은 낭비된 RAM". free 메모리가 적어 보여도 캐시라 필요하면 즉시 회수 가능

## 읽기: 캐시 히트/미스

```
read(file):
  페이지 캐시에 있나?
    있으면(히트) → RAM에서 즉시 반환 (~100ns, [[memory-hierarchy]])
    없으면(미스) → 디스크에서 로드(~100μs~ms), 캐시에 넣고 반환
```

첫 읽기는 느리고(cold), 두 번째부터 빠름. `cat bigfile; cat bigfile` 두 번째가 훨씬 빠른 이유. 캐시 교체는 LRU 근사([[swapping]]의 clock과 같은 원리).

### 프리페치 (readahead)

순차 읽기를 감지하면 **다음 블록을 미리** 캐시에 로드 → 앱이 요청하기 전에 준비. [[memory-hierarchy]] 하드웨어 프리페처의 파일 버전. 순차 파일 접근이 빠른 이유.

## 쓰기: write-back

쓰기는 보통 즉시 디스크로 안 감. **페이지 캐시에 쓰고(더티 표시) 나중에 일괄 반영**:

```
write(file):
  페이지 캐시에 쓰고 dirty 표시 → 즉시 반환 (빠름)
  나중에(주기적/압박 시) 백그라운드로 디스크에 flush
```

장점:
- **쓰기 지연 숨김**: 앱은 캐시에 쓰고 바로 진행
- **병합**: 같은 블록 여러 번 쓰면 마지막 것만 디스크로
- **스케줄링**: 여러 쓰기를 모아 효율적으로 (순차화)

대가: **크래시 시 아직 flush 안 된 더티 데이터 유실**. 그래서 [[crash-consistency]]의 fsync가 필요 - "지금 확실히 디스크에".

## mmap: 파일을 메모리로

`mmap`은 파일을 프로세스 주소 공간에 직접 매핑 → 파일을 배열처럼 접근:

```c
char *p = mmap(NULL, size, PROT_READ, MAP_SHARED, fd, 0);
char c = p[1000];   // read() 없이 파일 1000번째 바이트
```

- 접근하면 페이지 폴트([[virtual-memory]]) → OS가 해당 페이지를 캐시로 로드 → 매핑
- read/write 시스템 콜 오버헤드 없음, 페이지 캐시와 직접 연동
- 같은 파일을 여러 프로세스가 mmap하면 **페이지 캐시를 공유** (물리 페이지 한 벌)
- 용도: 대용량 파일 랜덤 접근, 공유 메모리, 실행 파일 로딩([[linking]]의 동적 라이브러리 매핑)

## 통합 캐시

현대 OS는 페이지 캐시와 가상 메모리를 **통합**:

- 파일 캐시와 프로세스 익명 페이지(힙/스택)가 같은 물리 페이지 풀을 두고 경쟁
- 메모리 압박 시 OS가 판단: 더티 캐시 flush + 클린 캐시 버림 vs 익명 페이지 스왑([[swapping]])
- 그래서 파일 I/O 많으면 캐시가 커지고, 메모리 압박이면 줄어듦

## 관찰

```bash
# macOS: 메모리 압박/캐시
vm_stat
# 두 번 읽기로 캐시 효과 체감
time cat bigfile   # 첫 번째 (디스크)
time cat bigfile   # 두 번째 (캐시, 훨씬 빠름)
# 캐시 비우기(리눅스): echo 3 > /proc/sys/vm/drop_caches
```

## 연결

- RAM=디스크 캐시의 계층 사고 → [[memory-hierarchy]], [[swapping]]
- write-back의 크래시 위험과 fsync → [[crash-consistency]]
- mmap과 페이지 폴트 → [[virtual-memory]], [[address-spaces]]
- 파일시스템 블록 → [[file-system-basics]]

## 궁금한 것 (나중에)

- [ ] direct I/O (O_DIRECT) - 캐시를 우회하는 이유 (DB가 자체 캐시 → [[buffer-pool]])
- [ ] 페이지 캐시 vs 버퍼 캐시의 역사적 통합
- [ ] dirty 페이지 flush 주기와 튜닝 (vm.dirty_ratio)
- [ ] mmap vs read의 실제 성능 비교

## 출처

- OSTEP 페이지 캐시 관련, CS:APP 9.8 (mmap)
