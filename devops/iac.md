# 코드형 인프라 (Infrastructure as Code, IaC)

## 한 줄 요약

서버·네트워크·DB 같은 인프라를 손으로 클릭하지 않고 **코드(선언)로 정의·버전관리·재현**하는 것. 도구(Terraform 등)가 코드와 실제 상태의 차이를 계산해 조정한다. 핵심 개념은 선언적 정의, 상태 파일, drift.

## 왜 필요한가

- 인프라를 왜 코드로 (클릭 대신)
- Terraform이 상태를 어떻게 관리하나
- drift가 뭔가

## 왜 코드로

```
손으로(ClickOps): 콘솔에서 클릭클릭 서버 생성
문제: 재현 불가, 기록 없음, "누가 뭘 바꿨지?", 환경 불일치
```

IaC의 이점:
- **버전관리**: 인프라 변경이 git 히스토리에 ([[git-internals]]) - 누가·왜·언제
- **재현성**: 같은 코드 → 같은 인프라 (dev/staging/prod 동일)
- **리뷰**: PR로 인프라 변경 리뷰 ([[git-workflows]])
- **자동화**: CI/CD로 인프라 배포 ([[ci-cd-principles]])
- **문서**: 코드가 곧 인프라 명세

## 선언형 (핵심)

[[kubernetes-basics]]와 같은 사상 - **무엇을** 선언, **어떻게**는 도구가:

```hcl
# Terraform (HCL) - 원하는 상태 선언
resource "aws_instance" "web" {
  ami           = "ami-123"
  instance_type = "t3.micro"
  count         = 3
}
```

- "웹 서버 3대가 있어야 한다" (명령 아니라 상태)
- 도구가 현재 상태 확인 → 차이만큼 조정 (없으면 생성, 남으면 삭제)
- **멱등**: 여러 번 적용해도 결과 같음 (이미 맞으면 아무것도 안 함)

## 상태 관리 (Terraform의 핵심·난점)

Terraform은 **상태 파일**(state)에 "내가 만든 것" 기록:

```
코드(원하는 상태) ↔ 상태파일(내가 아는 현재) ↔ 실제 클라우드
       plan: 세 개 비교해 차이(diff) 계산
       apply: 차이만큼 실행
```

- **왜 상태파일이 필요**: 클라우드 리소스와 코드 리소스를 매핑 (이 코드 블록 = 이 실제 인스턴스)
- **원격 상태**: 팀은 상태를 공유 저장 (S3 등) + **잠금**(동시 apply 방지, distributed-systems/[[coordination-services]] 개념)
- **상태에 시크릿 노출 위험**: 상태파일에 민감정보 저장될 수 있음 → 암호화·접근제어 (security/[[secrets-management]])

## drift (드리프트)

**코드와 실제 상태의 어긋남**:

```
코드: t3.micro
누군가 콘솔에서 손으로 t3.large로 변경
→ drift 발생 (코드 ≠ 실제)
```

- 원인: 손 변경(ClickOps), 외부 자동화, 수동 핫픽스
- `terraform plan`이 drift 감지 → 코드대로 되돌리거나 코드 갱신
- **교훈**: IaC 쓰면 **손 변경 금지** (안 그러면 IaC 의미 상실) → 조정 루프의 전제와 같음 ([[kubernetes-basics]])

## 도구 갈래

- **프로비저닝**(인프라 생성): Terraform(멀티클라우드, 선언형), CloudFormation(AWS), Pulumi(범용 언어)
- **구성관리**(서버 내부 설정): Ansible, Chef, Puppet
- 요즘은 컨테이너·k8s가 서버 구성 상당 부분 흡수 → 프로비저닝 위주

## 원칙

- **선언 > 명령**: 원하는 상태, 조정은 도구가
- **멱등**: 반복 적용 안전
- **불변 인프라**(immutable): 서버를 고치지 말고 **새로 만들어 교체** (애완동물 아니라 가축) → [[deployment-strategies]]의 블루그린과 통함
- **손 변경 금지**: 모든 변경은 코드로 (drift 방지)
- **모듈화·재사용**: 공통 패턴 모듈로

## 연결

- 선언·멱등·조정 → [[kubernetes-basics]]
- 버전관리·리뷰 → [[git-internals]], [[git-workflows]]
- CI/CD로 인프라 배포 → [[ci-cd-principles]]
- 상태 잠금 → distributed-systems/[[coordination-services]]
- 상태 시크릿 → security/[[secrets-management]]
- 불변 인프라 → [[deployment-strategies]]
- 무엇을 프로비저닝하나 → [[cloud-basics]]

## 궁금한 것 (나중에)

- [ ] Terraform 모듈·워크스페이스 실전
- [ ] Pulumi (범용 언어 IaC) 장단
- [ ] GitOps (git이 유일 진실원, Argo CD/Flux)
- [ ] 상태파일 없는 도구 (실제 상태만 조회)

## 출처

- Terraform 공식 문서, "Terraform: Up & Running" (Brikman)
