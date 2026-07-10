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

## 셀프 체크

> [!question]- Workflow/Event/Job/Step/Action의 관계는?
> Workflow(파일 하나=파이프라인)는 Event(push·PR·schedule 등)에 반응해 Job들을 실행한다. Job은 독립 러너(runs-on)에서 돌고 기본 병렬(needs로 순서). Job 안의 Step은 순차이며 uses(재사용 액션) 또는 run(셸 명령)이다.

> [!question]- 잡들의 실행 순서는 기본적으로 어떻게 되고 어떻게 바꾸나?
> 기본은 병렬(각자 깨끗한 러너). `needs:`로 의존을 걸면 앞 잡이 끝나야 다음 잡이 실행된다(예: build 후 deploy).

> [!question]- 시크릿을 워크플로우에서 어떻게 다루고 GITHUB_TOKEN은 어떻게 좁히나?
> 저장소/조직 Secrets에 저장하고 `${{ secrets.X }}`로 참조하면 로그에 마스킹된다. YAML·코드에 하드코딩 금지(커밋되면 히스토리에 영원). 자동 발급 GITHUB_TOKEN은 `permissions:`로 최소 권한만 부여한다.

> [!question]- 퍼블릭 저장소에 셀프호스티드 러너가 위험한 이유는?
> 악의적 PR이 러너(내 머신)에서 코드를 실행할 수 있다. 셀프호스티드는 프라이빗 저장소에만 권장하고, 포크 PR에 시크릿 노출(`pull_request_target`)도 조심한다.

> [!question]- CI 시간을 줄이는 대표 최적화 세 가지는?
> 캐싱(actions/cache로 의존성 캐시), 매트릭스(여러 버전·OS 동시 테스트), 동시성 제어(concurrency + cancel-in-progress로 연속 푸시 시 이전 빌드 취소).

## 연습문제

> [!example]- 문제: PR과 main push에서 Node 앱을 테스트하고, main에서만 빌드→배포하는(배포는 빌드 후에만) 워크플로우 뼈대를 작성하라.
> **풀이**
> ```yaml
> name: CI
> on:
>   pull_request:
>   push: {branches: [main]}
> jobs:
>   test:
>     runs-on: ubuntu-latest
>     steps:
>       - uses: actions/checkout@v4
>       - uses: actions/setup-node@v4
>         with: {node-version: 20}
>       - run: npm ci
>       - run: npm test
>   deploy:
>     needs: test
>     if: github.ref == 'refs/heads/main'
>     runs-on: ubuntu-latest
>     steps:
>       - run: echo "deploy"
> ```
> test는 PR·push 모두, deploy는 needs로 test 후 + if로 main에서만 실행.

> [!example]- 문제: 개발자가 API 키를 워크플로우 YAML에 하드코딩했다. 무엇이 문제고 올바른 방법은?
> **풀이**
> 문제: YAML은 커밋되어 git 히스토리에 영원히 남아(되돌려도 남음) 저장소 접근자 누구나 키를 본다. 로그 마스킹도 안 된다.
> 올바른 방법: 키를 저장소/조직 Secrets에 넣고 `env: API_KEY: ${{ secrets.API_KEY }}`로 주입 → 로그 마스킹됨. 장기 클라우드 키라면 OIDC로 단기 토큰을 발급받아 키 자체를 없앤다.

## 파인만

> [!note]- 백지에 Workflow→Job→Step 구조와 이벤트 트리거를 남에게 설명하듯 그려보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 이벤트→잡(병렬/needs)→스텝(uses/run) 구조, (2) 시크릿 저장·마스킹·최소 권한, (3) 캐싱·매트릭스·동시성 최적화와 러너 선택 위험.

## 연결

- CI/CD 개념 구현 → [[ci-cd-principles]]
- 시크릿 관리·최소 권한 → security/[[secrets-management]], [[least-privilege]]
- 하드코딩 위험 → [[git-internals]]
- 관리형 호스팅 → [[cloud-basics]]
- 병렬 잡·캐싱 → [[ci-cd-principles]]
- 서드파티 액션(마켓플레이스) 공급망 위험 → security/[[supply-chain]]

## 궁금한 것 (나중에)

- [ ] reusable workflow / composite action 작성
- [ ] OIDC로 클라우드 인증 (키 없는 배포)
- [ ] 자체 액션 만들기 (JS/Docker 액션)
- [ ] 매트릭스 빌드 실전

## 출처

- GitHub Actions 공식 문서, 이 저장소 deploy.yml
