# 공급망 보안 (Supply Chain Security)

## 한 줄 요약

내 코드가 아니라 의존성(라이브러리, 빌드 도구, CI)을 통한 공격. 하나의 인기 패키지가 침해되면 수천 프로젝트가 감염된다. lockfile·서명·SBOM으로 대응한다.

## 왜 필요한가

- 내 코드는 안전한데 왜 뚫리나
- npm/pip 의존성이 왜 위험한가
- 유명 공급망 공격 사례의 교훈

## 문제: 남의 코드에 의존

현대 소프트웨어는 **대부분 남의 코드**:
- npm 프로젝트 하나가 수백~수천 의존성 (transitive 포함)
- 각 의존성이 또 의존성 → 거대한 트리 (data-structures/[[graph-traversal]])
- 하나라도 악성이면 → 내 앱에 침투
- "내 코드 100줄, 의존성 100만 줄"

**공급망 공격**: 내 코드가 아니라 **의존성·빌드 과정**을 노림.

## 공격 형태

### 악성 패키지

- **타이포스쿼팅**: 유명 패키지와 비슷한 이름 (`reqeusts` vs `requests`) → 오타로 설치
- **의존성 혼동(dependency confusion)**: 내부 패키지명을 공개 저장소에 올려 가로챔
- **계정 탈취**: 인기 패키지 관리자 계정 뺏어 악성 버전 배포

### 침해된 정상 패키지

- 인기 패키지가 침해됨 → 그걸 쓰는 모두 감염
- **event-stream 사건**(2018): 인기 npm 패키지에 비트코인 지갑 탈취 코드 주입
- **SolarWinds**(2020): 빌드 시스템 침해 → 서명된 정상 업데이트에 백도어 → 수천 기관 (미 정부 포함)
- **xz utils 백도어**(2024): 오픈소스 압축 라이브러리에 수년에 걸친 사회공학 백도어 (거의 성공)

### 빌드/CI 침해

- CI 파이프라인(devops/[[ci-cd-principles]])에 악성 주입
- 빌드 도구, 컨테이너 베이스 이미지 침해

## 왜 심각한가

- **증폭**: 하나 침해 → 수천 프로젝트 (인기 패키지일수록)
- **신뢰 악용**: 정상 채널(패키지 매니저, 서명된 업데이트)로 배포 → 탐지 어려움
- **깊은 의존성**: transitive 의존성은 직접 안 봄 → 감시 사각
- **신뢰 기반 생태계**: 오픈소스는 서로 믿음 (network/[[email-protocols]]의 신뢰 문제와 유사)

## 방어

### 의존성 고정 (lockfile)

**정확한 버전을 고정** → devops/[[git-internals]]:
- `package-lock.json`, `Cargo.lock`, `poetry.lock`
- 해시([[hashing]])로 무결성 검증 → 같은 버전이 바뀌면 감지
- 빌드 재현성 (누가 언제 빌드해도 같은 의존성)

### 취약점 스캐닝

- `npm audit`, `pip-audit`, Dependabot, Snyk
- 알려진 취약점(CVE) 있는 의존성 탐지·알림
- 자동 업데이트 PR

### 최소·검증된 의존성

- **의존성 줄이기**: 작은 유틸리티를 위해 패키지 추가하지 말기 (left-pad 사건)
- **평판 확인**: 관리 활발한가, 다운로드 수, 관리자
- **감사**: 중요 의존성은 코드 검토

### 서명과 출처 검증

- **패키지 서명**([[digital-signatures]]): 정품 확인
- **SBOM**(Software Bill of Materials): 무엇이 들었나 목록 → 취약점 발생 시 영향 파악
- **SLSA**: 공급망 무결성 프레임워크 (빌드 출처 증명)
- **재현 가능한 빌드**: 같은 소스 → 같은 바이너리 (변조 감지)

### 격리

- 빌드를 격리 환경에서 (컨테이너 os/[[virtualization-and-containers]])
- 의존성이 빌드 시 임의 코드 실행하는 것 제한 (npm install 스크립트)
- 최소 권한 ([[least-privilege]])

## 실무 원칙

1. **lockfile 커밋** (재현성 + 무결성)
2. **정기 스캐닝** (npm audit, Dependabot)
3. **의존성 최소화** (필요한 것만)
4. **업데이트하되 검증** (자동 업데이트 + 테스트)
5. **CI/빌드 보호** (시크릿 관리 [[secrets-management]], 최소 권한)
6. **SBOM 유지** (영향 파악)

## 연결

- 의존성 트리 → data-structures/[[graph-traversal]]
- lockfile 해시 → [[hashing]], devops/[[git-internals]]
- 패키지 서명 → [[digital-signatures]]
- 빌드 격리 → os/[[virtualization-and-containers]]
- CI 보안 → devops/[[ci-cd-principles]], [[secrets-management]]
- 신뢰 기반 취약성 → network/[[email-protocols]], [[routing]]

## 궁금한 것 (나중에)

- [ ] SLSA 레벨과 출처 증명
- [ ] 재현 가능한 빌드 구현
- [ ] xz 백도어의 정확한 메커니즘
- [ ] npm install 스크립트 샌드박싱

## 출처

- SLSA framework, OWASP 의존성 관리, xz/SolarWinds 사례 분석
