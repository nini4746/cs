# Docker 내부 (Docker Internals)

## 한 줄 요약

Docker는 리눅스 namespace/cgroup으로 프로세스를 격리하고, 이미지를 레이어(읽기 전용 + 쓰기 레이어)로 쌓는다. VM이 아니라 격리된 프로세스이며, 레이어 캐싱이 빌드·배포 효율의 핵심.

## 왜 필요한가

- 컨테이너가 실제로 어떻게 격리되나
- 이미지 레이어가 뭔가 (캐싱)
- os/[[virtualization-and-containers]]의 실전

## 컨테이너 = 격리된 프로세스

os/[[virtualization-and-containers]] 복습 - **VM 아니라 프로세스**:

```
컨테이너 = 리눅스 프로세스 + namespace(격리된 뷰) + cgroup(자원 제한)
호스트 커널 공유 (게스트 OS 없음)
```

- **namespace**(os/[[virtualization-and-containers]]): PID·네트워크·마운트·유저 격리 → 컨테이너 안에선 "혼자만의 시스템"처럼
- **cgroup**: CPU·메모리·I/O 제한 → 한 컨테이너가 자원 독점 방지
- 이 둘이 Docker의 격리 (Docker는 이 위의 편의 도구)

## 이미지 레이어

Docker 이미지 = **읽기 전용 레이어들의 스택**:

```
[앱 코드 레이어]        ← 자주 바뀜 (위)
[의존성 레이어]
[런타임 레이어]
[베이스 OS 레이어]      ← 거의 안 바뀜 (아래)
─────────────────
[쓰기 가능 레이어]      ← 컨테이너 실행 시 추가 (copy-on-write)
```

- 각 Dockerfile 명령이 **레이어 하나** 생성
- **union filesystem**: 레이어들을 겹쳐 하나의 파일시스템으로
- **copy-on-write**(os/[[address-spaces]]의 COW): 실행 시 쓰기 레이어만 추가, 읽기 레이어 공유 → 여러 컨테이너가 같은 이미지 레이어 공유 (효율)

## 레이어 캐싱 (핵심)

빌드 효율의 열쇠 - **안 바뀐 레이어는 재사용**:

```
Dockerfile 변경 → 바뀐 레이어부터 재빌드 (그 위 전부), 아래는 캐시
```

- 레이어가 내용 주소(해시, [[git-internals]]와 유사) → 같으면 캐시
- **순서가 중요**: 자주 바뀌는 것(앱 코드)을 **뒤에**, 안 바뀌는 것(의존성)을 **앞에**
  ```dockerfile
  COPY package.json .    # 의존성 정의 (가끔 바뀜)
  RUN npm install         # 무거움 - package.json 안 바뀌면 캐시!
  COPY . .                # 앱 코드 (자주 바뀜) - 여기부터 재빌드
  ```
- 순서 틀리면 매번 npm install 재실행 (느림) → [[dockerfile-best-practices]]

## 이미지 vs 컨테이너

- **이미지**: 읽기 전용 템플릿 (레이어 스택). 빌드 결과물
- **컨테이너**: 이미지의 실행 인스턴스 (+ 쓰기 레이어)
- 한 이미지 → 여러 컨테이너 (os/[[process]]의 프로그램 vs 프로세스와 같은 관계)

## 레지스트리

이미지 저장·공유:
- **Docker Hub, GHCR** 등: 이미지 저장소
- push/pull로 배포 (network/[[cdn]]처럼 레이어 캐싱)
- 태그로 버전 (`app:1.2`, `app:latest`)
- 공급망 보안 주의 (security/[[supply-chain]] - 신뢰할 이미지, 서명)

## 왜 컨테이너인가

- **일관성**: "내 컴퓨터에선 됐는데" 해결 (같은 이미지 어디서나)
- **격리**: 의존성 충돌 없음 (각자 환경)
- **가벼움**(os/[[virtualization-and-containers]]): VM보다 빠름·작음 → 밀도↑
- **이식성**: 빌드 한 번, 어디서나 실행
- CI/CD·마이크로서비스의 기반 ([[ci-cd-principles]], software-design/[[monolith-vs-microservices]])

## macOS/Windows의 Docker

Docker는 리눅스 기술(namespace/cgroup) → 이 OS엔 없음:
- **경량 리눅스 VM 안에서** 컨테이너 실행 (os/[[virtualization-and-containers]])
- Docker Desktop이 VM 관리
- "컨테이너 = 리눅스" 확인

## 연결

- namespace/cgroup → os/[[virtualization-and-containers]]
- copy-on-write → os/[[address-spaces]]
- 이미지 vs 컨테이너 = 프로그램 vs 프로세스 → os/[[process]]
- 레이어 해시 → [[git-internals]], security/[[hashing]]
- 이미지 보안 → security/[[supply-chain]]
- Dockerfile 최적화 → [[dockerfile-best-practices]]
- 오케스트레이션 → [[kubernetes-basics]]

## 궁금한 것 (나중에)

- [ ] OCI 표준 (이미지·런타임 스펙)
- [ ] containerd vs Docker (런타임 계층)
- [ ] rootless 컨테이너 (security/[[least-privilege]])
- [ ] 이미지 취약점 스캐닝 (security/[[supply-chain]])

## 출처

- Docker 문서, os/[[virtualization-and-containers]]
