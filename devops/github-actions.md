# GitHub Actions (GitHub Actions)

## 한 줄 요약

GitHub 저장소 이벤트(push, PR 등)에 반응해 자동으로 잡을 실행하는 CI/CD 플랫폼. 워크플로우(YAML) = 이벤트 트리거 + 잡(러너에서 실행) + 스텝. 이 노트 저장소도 GitHub Actions로 Quartz 사이트를 자동 배포한다.

## 왜 필요한가

- CI/CD 파이프라인을 실제로 어떻게 구현하나 ([[ci-cd-principles]])
- 워크플로우 구조 (이벤트·잡·스텝)
- 시크릿·러너를 어떻게 다루나

## 구조

```
Workflow (.github/workflows/*.yml)
 └ on: 이벤트 트리거 (push, pull_request, schedule...)
 └ jobs: 잡들 (기본 병렬, needs로 순서)
    └ runs-on: 러너 (실행 환경, ubuntu-latest 등)
    └ steps: 스텝들 (순차)
       └ uses: 재사용 액션  또는  run: 셸 명령
```

- **Workflow**: 파일 하나 = 파이프라인 하나
- **Event**: 언제 돌지 (push/PR/스케줄/수동/태그...)
- **Job**: 독립 실행 단위, 각자 깨끗한 러너에서. 기본 병렬 ([[ci-cd-principles]]의 병렬화)
- **Step**: 잡 안의 순차 단계
- **Action**: 재사용 가능한 스텝 패키지 (`actions/checkout` 등 마켓플레이스)

## 예: 테스트 워크플로우

```yaml
name: CI
on:
  push: {branches: [main]}
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4      # 코드 가져오기
      - uses: actions/setup-node@v4
        with: {node-version: 20}
      - run: npm ci                    # 의존성 (lockfile)
      - run: npm test                  # 테스트 게이트
```

- PR·push마다 자동 → CI 게이트 ([[ci-cd-principles]]의 fail fast)

## 이 저장소의 배포 워크플로우 (실제)

이 CS 노트 저장소 `.github/workflows/deploy.yml`이 하는 일:

```yaml
on:
  push: {branches: [main]}       # main에 푸시하면
permissions:
  contents: read
  pages: write                   # Pages 배포 권한
jobs:
  build:
    steps:
      - Quartz 클론 (jackyzha0/quartz@v4)
      - 노트를 content/로 rsync
      - git 히스토리에서 created/modified 주입
      - npx quartz build           # 정적 사이트 빌드
      - Pages artifact 업로드
  deploy:
    needs: build                   # build 끝나야 (순서)
    - Pages에 배포
```

- **매 커밋이 곧 배포** (지속적 배포, [[ci-cd-principles]]의 CD)
- 백엔드 없이 GitHub Actions가 빌드+호스팅 파이프라인 ([[cloud-basics]]의 관리형)

## 시크릿

민감 값을 안전하게 (security/[[secrets-management]]):

```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}   # 저장소 설정에 저장
```

- **저장소/조직 Secrets**에 저장 → 로그에 마스킹됨
- **절대 YAML·코드에 하드코딩 금지** ([[git-internals]] - 커밋되면 히스토리에 영원)
- **`GITHUB_TOKEN`**: 자동 발급 토큰, 최소 권한 원칙 (`permissions:`로 좁힘, security/[[least-privilege]])
- **포크 PR 주의**: 신뢰 안 되는 코드에 시크릿 노출 위험 (`pull_request_target` 조심)
- **OIDC**: 장기 클라우드 키 대신 단기 토큰 (더 안전)

## 러너

잡이 실제 돌아가는 머신:

- **GitHub 호스티드**: ubuntu/windows/macOS, 매번 깨끗한 VM (편함, 사용량 과금)
- **셀프호스티드**: 내 서버에 러너 설치
  - 이유: 특수 하드웨어(GPU), 사내망 접근, 대용량·비용
  - **주의**: 퍼블릭 저장소에 셀프호스티드는 위험 (악의적 PR이 내 머신 실행) → 프라이빗에만 권장

## 최적화 (CI 일반)

- **캐싱**: `actions/cache`로 의존성 캐시 ([[ci-cd-principles]]의 캐싱)
- **매트릭스**: 여러 버전·OS 동시 테스트 (`strategy.matrix`)
- **동시성 제어**: `concurrency` + cancel-in-progress → 빠른 연속 푸시 시 이전 빌드 취소 (이 저장소도 사용)
- **조건부 실행**: `if:`로 불필요한 잡 스킵

## 왜 GitHub Actions인가

- **저장소에 통합**: 코드 옆에 파이프라인 (설정 불필요)
- **마켓플레이스**: 재사용 액션 풍부
- **무료 티어**: 퍼블릭 저장소 무료 (이 노트 사이트도)
- 대안: GitLab CI, CircleCI, Jenkins (개념 같음 - 이벤트→잡→스텝)

## 연결

- CI/CD 개념 구현 → [[ci-cd-principles]]
- 시크릿 관리·최소 권한 → security/[[secrets-management]], [[least-privilege]]
- 하드코딩 위험 → [[git-internals]]
- 관리형 호스팅 → [[cloud-basics]]
- 병렬 잡·캐싱 → [[ci-cd-principles]]

## 궁금한 것 (나중에)

- [ ] reusable workflow / composite action 작성
- [ ] OIDC로 클라우드 인증 (키 없는 배포)
- [ ] 자체 액션 만들기 (JS/Docker 액션)
- [ ] 매트릭스 빌드 실전

## 출처

- GitHub Actions 공식 문서, 이 저장소 deploy.yml
