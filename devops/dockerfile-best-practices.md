# Dockerfile 모범 사례 (Dockerfile Best Practices)

## 한 줄 요약

이미지를 작고 빠르고 안전하게 만드는 법 - 레이어 캐싱 활용, 멀티스테이지 빌드로 빌드 도구 제거, 최소 베이스 이미지, non-root 실행. 큰 이미지는 느린 배포·큰 공격 표면.

## 왜 필요한가

- 이미지를 어떻게 작고 빠르게
- 멀티스테이지 빌드가 뭔가
- 컨테이너 보안 기본

## 레이어 캐싱 활용

[[docker-internals]]의 레이어 캐싱 → Dockerfile 순서가 빌드 속도 좌우:

```dockerfile
# 나쁨: 코드 바뀔 때마다 npm install 재실행
COPY . .
RUN npm install

# 좋음: 의존성 정의만 먼저 → package.json 안 바뀌면 install 캐시
COPY package.json package-lock.json ./
RUN npm install          # 캐시됨 (무거운 단계)
COPY . .                 # 코드는 나중에 (자주 바뀜)
```

- **안 바뀌는 것을 앞에, 자주 바뀌는 것을 뒤에** ([[docker-internals]])
- 무거운 단계(의존성 설치)를 캐시 가능하게

## 멀티스테이지 빌드 (multi-stage)

핵심 기법 - **빌드 환경과 실행 환경 분리**:

```dockerfile
# 스테이지 1: 빌드 (컴파일러·빌드 도구 필요)
FROM golang:1.22 AS build
COPY . .
RUN go build -o app

# 스테이지 2: 실행 (바이너리만, 빌드 도구 없음)
FROM alpine:latest
COPY --from=build /app /app   # 빌드 결과만 복사
CMD ["/app"]
```

- 빌드 도구(컴파일러, 개발 의존성)는 **최종 이미지에 안 들어감**
- Go 예: 빌드는 800MB(golang) → 실행은 10MB(alpine + 바이너리)
- 이미지 크기 급감 → 빠른 배포, 작은 공격 표면 (security/[[supply-chain]])

## 최소 베이스 이미지

작을수록 좋음:

- **alpine**: 초소형 리눅스 (~5MB) - 대부분 앱에
- **distroless**(Google): OS 도구 없이 런타임만 - 더 안전 (셸도 없어 공격 어려움)
- **scratch**: 빈 이미지 (정적 바이너리만) - 최소
- 큰 이미지(ubuntu 등)는 불필요한 것 많음 → 공격 표면·크기↑

## 보안

컨테이너 보안 기본 (security/[[least-privilege]]):

- **non-root 실행**: `USER appuser` (기본 root는 위험 - 탈출 시 호스트 root)
  ```dockerfile
  RUN adduser -D appuser
  USER appuser
  ```
- **읽기 전용 파일시스템**: 런타임에 `--read-only`
- **최소 이미지**: 취약점 표면↓ (distroless)
- **시크릿 금지**: 이미지에 시크릿 넣지 마라 (레이어에 영원히 남음 - security/[[secrets-management]], [[git-internals]]의 히스토리와 같음). 런타임 주입
- **이미지 스캐닝**: 취약점 검사 (security/[[supply-chain]])

## 크기 줄이기

- **멀티스테이지** (위)
- **RUN 합치기**: `RUN a && b && c` (레이어 수↓, 중간 파일 정리)
  ```dockerfile
  RUN apt-get update && apt-get install -y pkg && rm -rf /var/lib/apt/lists/*
  ```
- **.dockerignore**: 불필요한 파일 빌드 컨텍스트에서 제외 (node_modules, .git)
- **필요한 것만 COPY**

## 재현성

- **버전 고정**: `FROM node:20.11` (latest 금지 - 재현 안 됨)
- **lockfile 사용**: package-lock.json (security/[[supply-chain]]의 의존성 고정)
- 같은 Dockerfile → 같은 이미지 (이상적)

## 왜 중요한가

- **배포 속도**: 작은 이미지 = 빠른 push/pull (network/[[cdn]]처럼 레이어 전송)
- **보안**: 작고 non-root = 공격 표면↓ (security/[[supply-chain]], [[least-privilege]])
- **비용**: 레지스트리 저장·전송 비용
- **CI 속도**: 캐싱으로 빌드 빠르게 ([[ci-cd-principles]])

## 셀프 체크

> [!question]- 멀티스테이지 빌드는 무엇을 해결하나?
> 빌드 환경과 실행 환경을 분리한다. 빌드 스테이지에서 컴파일러·개발 의존성으로 빌드하고 최종 스테이지엔 결과물(바이너리)만 COPY한다. 빌드 도구가 최종 이미지에 안 들어가 크기가 급감하고(예: 800MB→10MB) 공격 표면이 작아진다.

> [!question]- alpine·distroless·scratch는 각각 무엇인가?
> alpine은 초소형 리눅스(~5MB), distroless는 OS 도구 없이 런타임만(셸도 없어 더 안전), scratch는 빈 이미지(정적 바이너리만). 작을수록 크기·취약점 표면이 준다.

> [!question]- 컨테이너를 non-root로 실행해야 하는 이유는?
> 기본 root로 돌면 컨테이너 탈출 시 호스트 root 권한을 얻어 위험하다. `USER appuser`로 최소 권한 사용자로 실행하면 피해 범위가 줄어든다(최소 권한 원칙).

> [!question]- 시크릿을 이미지에 넣으면 왜 안 되나?
> 레이어는 불변이라 나중 레이어에서 지워도 이전 레이어에 영원히 남는다(git 히스토리와 같음). 이미지를 받은 누구나 추출할 수 있으므로 시크릿은 런타임에 주입해야 한다.

> [!question]- 이미지 재현성을 위해 무엇을 하나?
> 베이스 이미지 버전 고정(`FROM node:20.11`, latest 금지)과 lockfile 사용(package-lock.json). 같은 Dockerfile이 같은 이미지를 만들도록 버전을 핀한다.

## 연습문제

> [!example]- 문제: Go 앱을 담은 단일 스테이지 Dockerfile(최종 ~900MB, root 실행)을 작고 안전하게 다시 써라.
> **풀이**
> 멀티스테이지 + 최소 베이스 + non-root:
> ```dockerfile
> FROM golang:1.22 AS build
> WORKDIR /src
> COPY go.mod go.sum ./
> RUN go mod download
> COPY . .
> RUN go build -o /app
> FROM gcr.io/distroless/static:nonroot
> COPY --from=build /app /app
> USER nonroot
> CMD ["/app"]
> ```
> 빌드 도구는 build 스테이지에만, 최종엔 정적 바이너리만. distroless+nonroot로 셸 없는 최소 이미지에 비-root 실행.

> [!example]- 문제: CI 이미지 빌드가 매번 느리고, 이미지에 apt 캐시가 남아 크다. Dockerfile을 어떻게 개선하나?
> **풀이**
> 1. 레이어 캐싱: 의존성 정의를 먼저 COPY·설치, 앱 코드는 나중에 → 코드 변경 시 무거운 설치가 캐시됨.
> 2. RUN 합치기 + 정리: `RUN apt-get update && apt-get install -y pkg && rm -rf /var/lib/apt/lists/*`로 중간 캐시를 같은 레이어에서 제거.
> 3. .dockerignore로 node_modules·.git 등 불필요한 빌드 컨텍스트 제외.
> 재현성 위해 베이스·패키지 버전도 고정.

## 파인만

> [!note]- 백지에 "작고 빠르고 안전한 이미지"를 만드는 규칙을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 멀티스테이지로 빌드/실행 분리, (2) 최소 베이스+non-root로 공격 표면 축소, (3) 레이어 캐싱 순서와 시크릿을 런타임 주입하는 이유.

## 연결

- 레이어 캐싱 → [[docker-internals]]
- 이미지 보안·스캐닝 → security/[[supply-chain]]
- non-root·읽기전용 → security/[[least-privilege]]
- 시크릿 → security/[[secrets-management]]
- 의존성 고정 → security/[[supply-chain]]
- CI 빌드 → [[ci-cd-principles]]
- 레이어 전송·캐싱 (작은 이미지 = 빠른 배포) → network/[[cdn]]

## 궁금한 것 (나중에)

- [ ] BuildKit (병렬 빌드, 캐시 마운트)
- [ ] distroless 상세
- [ ] 멀티 아키텍처 이미지 (arm64/amd64)
- [ ] 이미지 서명 (cosign, security/[[digital-signatures]])

## 출처

- Docker 공식 best practices, distroless
