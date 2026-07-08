# 시크릿 관리 (Secrets Management)

## 한 줄 요약

API 키·비밀번호·인증서 같은 시크릿을 안전하게 저장·배포·회전하는 것. 코드에 하드코딩하지 말고, 전용 저장소(Vault)에서 주입하며, 유출 대비 회전이 핵심.

## 왜 필요한가

- 시크릿을 코드/git에 넣으면 왜 위험한가
- 어디에 어떻게 저장하나
- 키 회전이 왜 필요한가

## 시크릿이란

인증·암호화에 쓰이는 비밀 값:
- API 키, DB 비밀번호, 암호화 키([[crypto-basics]])
- 인증서 개인키([[digital-signatures]])
- OAuth 시크릿, 토큰
- pepper([[password-storage]])

이게 유출되면 → 시스템 침해. 시크릿 관리 = 이걸 안전하게.

## 하지 말 것: 하드코딩

가장 흔한 실수 - **코드/git에 시크릿**:

```python
API_KEY = "sk-abc123..."   # 절대 금지!
```

왜 위험:
- **git 히스토리에 영원히**: 나중에 지워도 히스토리에 남음 (devops/[[git-internals]]의 불변 객체)
- **공개 저장소 유출**: GitHub에 실수로 push → 봇이 초 단위로 스캔·악용
- **접근 범위**: 코드 보는 모두가 시크릿 봄
- 실제 사고 빈번 (AWS 키 유출로 수천 달러 청구)

## .env의 함정

`.env` 파일로 코드에서 분리 - 개선이지만 완벽 아님:

```
# .env (gitignore 필수!)
API_KEY=sk-abc123
```

- **`.gitignore`에 반드시** (실수로 커밋하면 하드코딩과 같음)
- 로컬 개발엔 OK, **프로덕션엔 부족**: 평문 파일, 접근 제어 약함, 회전 어려움
- 팀·프로덕션은 전용 시크릿 저장소로

## 시크릿 저장소

프로덕션 표준 - **전용 시스템에서 주입**:

- **HashiCorp Vault**: 시크릿 저장·발급·회전, 감사 로그, 동적 시크릿
- **클라우드**: AWS Secrets Manager, GCP Secret Manager, Azure Key Vault (devops/[[cloud-basics]])
- **Kubernetes Secrets**: (기본은 base64일 뿐 - 암호화 활성화 필요) → devops/[[kubernetes-basics]]

특징:
- **암호화 저장** (at rest)
- **접근 제어**: 누가 어떤 시크릿에 (최소 권한 [[least-privilege]])
- **감사 로그**: 누가 언제 접근
- **런타임 주입**: 앱이 시작 시 가져옴 (코드·이미지에 없음)

## 키 회전 (rotation)

시크릿을 **주기적으로 교체**:

- 유출됐을 수 있으니 (침해 가정 [[threat-modeling]])
- 유출돼도 회전 후엔 무효 → 피해 시간 제한
- **자동 회전**: Vault·클라우드가 지원 (DB 비번을 주기적 변경)
- **동적 시크릿**: 요청 시 짧은 수명 시크릿 발급 (더 안전)

## 유출 대응

시크릿이 유출되면:
1. **즉시 회전/폐기** (그 시크릿 무효화)
2. **영향 조사** (얼마나 접근됐나, 감사 로그)
3. git 히스토리에서 제거 (하지만 이미 노출됐다고 가정 - 회전이 우선)
4. **비밀 스캐닝** 도입 (재발 방지)

## 비밀 스캐닝

시크릿 유출을 자동 탐지:
- **git-secrets, gitleaks, trufflehog**: 커밋에서 시크릿 패턴 탐지
- **pre-commit 훅**: 커밋 전 차단 (devops/, update-config의 훅)
- **GitHub secret scanning**: push 시 스캔, 유출 시 알림·자동 폐기
- CI에 통합 → 유출을 초기에

## 실무 원칙

1. **코드에 시크릿 절대 금지** (스캐닝으로 강제)
2. **환경별 분리** (dev/staging/prod 다른 시크릿)
3. **최소 권한** ([[least-privilege]]): 각 서비스가 필요한 시크릿만
4. **회전 자동화** (수동은 안 함)
5. **감사** (누가 접근했나)
6. **암호화** (저장·전송 모두)

## 연결

- git 불변 히스토리 → devops/[[git-internals]]
- 암호화 키 → [[crypto-basics]]
- pepper → [[password-storage]]
- 최소 권한 → [[least-privilege]]
- 클라우드 시크릿 → devops/[[cloud-basics]]
- k8s secrets → devops/[[kubernetes-basics]]
- pre-commit 훅 → devops/[[ci-cd-principles]]

## 궁금한 것 (나중에)

- [ ] 동적 시크릿 (Vault DB 시크릿 엔진)
- [ ] envelope encryption (키를 키로 암호화)
- [ ] HSM (하드웨어 보안 모듈)
- [ ] SPIFFE/SPIRE (워크로드 신원)

## 출처

- OWASP Secrets Management Cheat Sheet, HashiCorp Vault 문서
