# 리눅스 디버깅 (Linux Debugging)

## 한 줄 요약

프로덕션 문제를 진단하는 도구들 - strace(시스템 콜 추적), lsof(열린 파일), /proc(커널 상태), top/iostat(리소스 병목). 계층적으로 좁혀가며 병목·오류를 찾는다.

## 왜 필요한가

- 서버가 느리거나 죽을 때 진단
- os/ 개념(시스템 콜·프로세스)을 관찰
- 로그로 안 보이는 문제 찾기

## 진단 사고: 어느 자원이 병목인가

성능 문제는 네 자원 중 하나 (computer-architecture/[[memory-hierarchy]], os/):

```
CPU?  → top, htop (CPU 사용률)
메모리? → free, top (메모리·스왑 os/[[swapping]])
디스크 I/O? → iostat, iotop
네트워크? → ss, iftop (network/[[icmp-and-tools]])
```

USE 방법(Utilization/Saturation/Errors): 각 자원의 활용률·포화·오류 확인.

## strace: 시스템 콜 추적

프로세스의 **시스템 콜을 실시간 관찰** (os/[[exceptions-and-interrupts]]의 트랩):

```
strace -p PID       # 실행 중 프로세스
strace ./program    # 새로 실행하며
```

- 프로그램이 커널에 뭘 요청하나 (파일 열기, 네트워크, 등)
- **어디서 막히나**: 특정 시스템 콜에서 대기 (파일 없음, 네트워크 타임아웃)
- "왜 이 프로그램이 느리지/실패하지" → 시스템 콜 레벨에서 (os/[[limited-direct-execution]]의 비싼 트랩도 여기 보임)
- 예: 설정 파일을 엉뚱한 경로에서 찾는 것 발견

## lsof: 열린 파일

**어떤 프로세스가 무슨 파일·소켓을 열었나** (os/[[file-system-basics]]의 fd):

```
lsof -p PID         # 프로세스가 연 것
lsof /path/file     # 이 파일을 누가?
lsof -i :8080       # 이 포트를 누가? (network/[[sockets]])
```

- **"파일 삭제했는데 디스크 안 빔"**: 프로세스가 아직 열고 있음 (os/[[file-system-basics]]의 링크 수 - fd가 참조 유지)
- **"포트 이미 사용 중"**: 누가 그 포트 쓰나 (network/[[tcp-basics]]의 TIME_WAIT)
- fd 누수 진단

## /proc: 커널·프로세스 정보

**가상 파일시스템**으로 커널 상태 노출 ([[linux-essentials]]의 "모든 것은 파일"):

```
/proc/PID/status    # 프로세스 상태·메모리
/proc/PID/fd/       # 열린 fd
/proc/PID/maps      # 메모리 매핑 (os/[[virtual-memory]])
/proc/meminfo       # 시스템 메모리
/proc/cpuinfo       # CPU
```

- 파일 읽듯이 커널 정보 조회
- 모니터링 도구가 이걸 읽음 (top 등)

## 리소스 도구

- **top/htop**: 프로세스별 CPU·메모리 (os/[[cpu-scheduling]])
- **free**: 메모리·스왑 (os/[[swapping]], [[page-cache]] - buff/cache가 페이지 캐시)
- **iostat**: 디스크 I/O (os/[[ssd-internals]])
- **vmstat**: 메모리·CPU·I/O 종합
- **ss/netstat**: 네트워크 연결 (network/[[tcp-basics]]의 상태)
- **dmesg**: 커널 로그 (OOM killer os/[[swapping]], 하드웨어 오류)

## 로그

- **/var/log/**: 시스템 로그 ([[linux-essentials]])
- **journalctl**: systemd 로그
- **tail -f**: 실시간 로그 추적
- 분산이면 중앙 수집 (distributed-systems/[[observability-basics]])

## 계층적 진단

network/[[icmp-and-tools]]의 계층 진단과 같은 사고:

```
1. 증상 파악 (느림? 죽음? 오류?)
2. 자원 확인 (top/free/iostat - 어디 병목?)
3. 프로세스 좁히기 (어느 프로세스?)
4. 시스템 콜 (strace - 뭘 하다 막힘?)
5. 파일·소켓 (lsof - 뭘 열었나?)
6. 로그 (왜?)
```

넓게 → 좁게. 추측 말고 측정 (software-design/[[testing-strategy]]의 정신).

## 고급: eBPF

현대 관측 - **커널에 안전한 코드를 실행**해 관측:
- bcc, bpftrace 도구
- strace보다 저오버헤드, 커널 내부 깊이
- 프로덕션 관측의 최신 (distributed-systems/[[observability-basics]])

## 연결

- 시스템 콜 → os/[[exceptions-and-interrupts]], [[limited-direct-execution]]
- 열린 파일·fd → os/[[file-system-basics]]
- 메모리·스왑 → os/[[swapping]], [[page-cache]], [[virtual-memory]]
- 자원 병목 → computer-architecture/[[memory-hierarchy]]
- 네트워크 진단 → network/[[icmp-and-tools]], [[tcp-basics]]
- 계층 진단 → network/[[icmp-and-tools]]
- 관측성 → distributed-systems/[[observability-basics]]

## 궁금한 것 (나중에)

- [ ] eBPF/bpftrace 실전
- [ ] perf로 CPU 프로파일 (computer-architecture/[[cache-misses]]의 perf)
- [ ] 코어 덤프 분석 (gdb)
- [ ] 컨테이너 안 프로세스 디버깅

## 출처

- Brendan Gregg "Systems Performance", "BPF Performance Tools"
