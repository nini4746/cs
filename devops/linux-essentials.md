# 리눅스 필수 (Linux Essentials)

## 한 줄 요약

리눅스는 서버의 표준 OS. 파일시스템 계층, 권한 모델(rwx), 프로세스·시그널, "모든 것은 파일"이라는 철학을 알면 시스템을 다룰 수 있다. os/ 개념의 실전 인터페이스.

## 왜 필요한가

- 서버가 대부분 리눅스 (배포·운영의 기반)
- 권한·프로세스가 실전에서 어떻게
- os/ 이론의 실제 사용

## 모든 것은 파일

유닉스 철학의 핵심 - **거의 모든 것이 파일**:

- 일반 파일, 디렉토리, 장치(`/dev/`), 소켓, 파이프 (os/[[io-devices]], [[file-system-basics]])
- 프로세스 정보도 파일 (`/proc/`)
- 파일 인터페이스(open/read/write/close)로 통일 → 깊은 모듈 (software-design/[[deep-modules]])
- 파일 디스크립터(os/[[file-system-basics]])로 다룸

## 파일시스템 계층

표준 디렉토리 구조 (FHS):

```
/         루트
/bin /usr/bin   실행 파일 (명령어)
/etc      설정 파일
/var      가변 데이터 (로그 /var/log, DB)
/home     사용자 홈
/tmp      임시 (재부팅 시 삭제)
/proc /sys  커널·프로세스 정보 (가상 파일시스템)
/dev      장치 파일
```

## 권한 모델

파일마다 **소유자/그룹/기타 × 읽기(r)/쓰기(w)/실행(x)**:

```
-rwxr-xr--  owner group other
 rwx = 소유자 읽기·쓰기·실행
 r-x = 그룹 읽기·실행
 r-- = 기타 읽기만
```

- **숫자 표기**: rwx = 4+2+1 = 7 → `chmod 755` (rwxr-xr-x)
- **chmod**(권한), **chown**(소유자), **chgrp**(그룹)
- **실행 권한(x)**: 디렉토리에선 "진입 가능" 의미
- **root(uid 0)**: 모든 권한 (최소 권한 원칙 security/[[least-privilege]] → sudo로 필요시만)
- **setuid/setgid**: 실행 시 소유자 권한으로 (security 주의)

## 프로세스와 시그널

os/[[process]]의 실전:

- **ps, top, htop**: 프로세스 조회
- **PID**: 프로세스 ID (os/[[process]])
- **시그널**: 프로세스에 신호 (os/[[exceptions-and-interrupts]]의 인터럽트와 유사)
  - `SIGTERM`(15): 정상 종료 요청 (정리 후 종료)
  - `SIGKILL`(9): 강제 종료 (무시 불가 - 최후 수단)
  - `SIGINT`(2): Ctrl+C
  - `SIGHUP`(1): 터미널 끊김 / 설정 재로드
- **kill PID**, **kill -9 PID**
- **fg/bg/&**: 포그라운드·백그라운드 (os/[[cpu-scheduling]])

## 표준 스트림과 리다이렉션

os/[[io-devices]], [[file-system-basics]]의 fd:

- **stdin(0), stdout(1), stderr(2)**: 표준 입출력·오류
- **리다이렉션**: `> file`(출력을 파일로), `< file`(입력), `2>`(오류)
- **파이프 `|`**: 한 명령 출력 → 다음 입력 (os/[[process]]의 fork+exec 조합)
- 작은 도구를 조합 (유닉스 철학)

```
cat log | grep ERROR | wc -l   # 로그에서 ERROR 줄 수
```

## 핵심 명령어

| 분류 | 명령 |
|---|---|
| 파일 | ls, cd, cp, mv, rm, mkdir, find |
| 내용 | cat, less, head, tail, grep, sed, awk |
| 권한 | chmod, chown, sudo |
| 프로세스 | ps, top, kill, jobs |
| 네트워크 | curl, ss, netstat (network/[[icmp-and-tools]]) |
| 디스크 | df, du, mount |
| 패키지 | apt, yum, dnf |

## 환경과 셸

- **환경 변수**: `PATH`(실행 파일 검색 경로), `HOME` 등. `export`
- **셸**: bash, zsh - 명령 해석기 → [[shell-scripting]]
- **`~/.bashrc`**: 셸 설정

## 왜 중요한가

- **서버 운영**: 배포·디버깅·모니터링 전부 리눅스에서
- **컨테이너**: Docker가 리눅스 기반 ([[docker-internals]], os/[[virtualization-and-containers]])
- **CI/CD**: 빌드 환경이 리눅스 ([[ci-cd-principles]])
- os/ 이론(프로세스·파일·권한)의 실전 인터페이스

## 연결

- 프로세스·시그널 → os/[[process]], [[exceptions-and-interrupts]]
- 파일·fd → os/[[file-system-basics]]
- 모든 것은 파일 → os/[[io-devices]]
- 권한·최소 권한 → security/[[least-privilege]]
- 셸 스크립트 → [[shell-scripting]]
- 디버깅 → [[linux-debugging]]
- 컨테이너 → [[docker-internals]]

## 궁금한 것 (나중에)

- [ ] systemd (서비스 관리)
- [ ] cgroup·namespace (컨테이너 기반) → os/[[virtualization-and-containers]]
- [ ] 파일 권한 심화 (ACL, capabilities)
- [ ] SSH 키·설정

## 출처

- "The Linux Command Line" (Shotts), FHS 표준
