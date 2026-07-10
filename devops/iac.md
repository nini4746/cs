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

## 셀프 체크

> [!question]- 인프라를 손 클릭(ClickOps) 대신 코드로 하는 이점은?
> 버전관리(git 히스토리에 누가·왜·언제), 재현성(같은 코드→같은 인프라, 환경 일치), 리뷰(PR로 변경 리뷰), 자동화(CI/CD 배포), 문서화(코드가 곧 명세). ClickOps는 재현·기록·일관성이 없다.

> [!question]- 선언형과 멱등은 무슨 뜻인가?
> 선언형은 "무엇"(원하는 상태)을 선언하면 "어떻게"는 도구가 현재와 비교해 차이만큼 조정하는 것. 멱등은 여러 번 적용해도 결과가 같은 것(이미 맞으면 아무것도 안 함).

> [!question]- Terraform이 상태 파일을 두는 이유는?
> 코드 리소스와 실제 클라우드 리소스를 매핑하기 위해(이 코드 블록=이 실제 인스턴스). plan은 코드·상태·실제를 비교해 diff를 계산하고 apply가 그 차이만 실행한다. 팀은 원격 상태(S3 등)+잠금으로 공유한다.

> [!question]- drift란 무엇이고 어떻게 대응하나?
> 코드와 실제 상태의 어긋남(예: 누가 콘솔에서 t3.micro를 t3.large로 변경). `terraform plan`이 감지하며, 코드대로 되돌리거나 코드를 갱신한다. 근본 대응은 손 변경 금지(모든 변경은 코드로).

> [!question]- 불변(immutable) 인프라란?
> 서버를 고치지 말고 새로 만들어 교체하는 것(애완동물 아니라 가축). 블루그린 배포와 통하며 drift·구성 편차를 줄인다.

## 연습문제

> [!example]- 문제: 장애 대응 중 누군가 콘솔에서 인스턴스 타입을 손으로 바꿨다. 다음 `terraform apply` 때 무슨 일이 생기고 올바른 절차는?
> **풀이**
> plan이 코드(t3.micro)와 실제(t3.large)의 drift를 diff로 보여준다. 그대로 apply하면 도구가 코드에 맞춰 t3.micro로 되돌려(의도치 않은 다운그레이드) 장애 핫픽스를 날릴 수 있다.
> 올바른 절차: 변경을 유지해야 하면 코드를 t3.large로 갱신해 커밋(리뷰) 후 apply → 코드와 실제를 일치. 원칙은 손 변경 금지, 모든 변경을 코드 경로로.

> [!example]- 문제: 팀이 로컬 상태 파일을 각자 두고 apply하다 충돌한다. 어떻게 구성해야 하나?
> **풀이**
> 원격 상태 + 잠금을 쓴다. 상태를 공유 저장소(S3 등)에 두고 잠금(DynamoDB 등)으로 동시 apply를 막는다(한 번에 한 사람만). 상태에 시크릿이 노출될 수 있으니 암호화·접근제어를 건다. CI에서만 apply하도록 하면 일관성이 더 좋아진다.

## 파인만

> [!note]- 백지에 "코드↔상태파일↔실제 클라우드" 삼각과 plan/apply 흐름을 남에게 설명하듯 그려보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 선언형·멱등·조정, (2) 상태 파일이 매핑·diff에 필요한 이유와 원격 상태·잠금, (3) drift의 원인·감지·손 변경 금지 원칙.

## 연결

- 선언·멱등·조정 → [[kubernetes-basics]]
- 버전관리·리뷰 → [[git-internals]], [[git-workflows]]
- CI/CD로 인프라 배포 → [[ci-cd-principles]]
- 상태 잠금 → distributed-systems/[[coordination-services]]
- 상태 시크릿 → security/[[secrets-management]]
- 불변 인프라 → [[deployment-strategies]]
- 무엇을 프로비저닝하나 → [[cloud-basics]]
- 멱등성 (반복 적용 안전) → distributed-systems/[[idempotency]]

## 궁금한 것 (나중에)

- [ ] Terraform 모듈·워크스페이스 실전
- [ ] Pulumi (범용 언어 IaC) 장단
- [ ] GitOps (git이 유일 진실원, Argo CD/Flux)
- [ ] 상태파일 없는 도구 (실제 상태만 조회)

## 출처

- Terraform 공식 문서, "Terraform: Up & Running" (Brikman)
