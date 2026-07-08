---
title: "devops"
---

# 데브옵스 syllabus

기준: 실무 표준 도구 + 원리. 도구 사용법 암기가 아니라 아래에서 뭐가 도는지.

## 1. 리눅스

- [x] [[linux-essentials]] - 파일 시스템 구조, 권한, 프로세스 관리, 시그널
- [x] [[shell-scripting]] - bash 함정 모음 (quoting, set -euo pipefail), 언제 스크립트를 버리고 프로그램 쓸까
- [x] [[linux-debugging]] - strace, lsof, /proc, 리소스 병목 찾기 (top/iostat)

## 2. Git

- [x] [[git-internals]] - 객체 모델 (blob/tree/commit), ref가 전부인 이유, reflog로 살아나기
- [x] [[git-workflows]] - rebase vs merge, 브랜치 전략, 협업 관례

## 3. 컨테이너

- [x] [[docker-internals]] - 이미지 레이어, namespace/cgroup → os/virtualization-and-containers 기반
- [x] [[dockerfile-best-practices]] - 레이어 캐싱, 멀티스테이지 빌드, 이미지 크기
- [x] [[kubernetes-basics]] - Pod/Deployment/Service 모델, 선언적 상태 조정 루프
- [ ] [[kubernetes-networking]] - Service/Ingress, DNS, 왜 네트워크가 k8s의 최난관인가

## 4. CI/CD

- [ ] [[ci-cd-principles]] - 파이프라인 설계, 테스트 단계 배치, 캐싱
- [ ] [[deployment-strategies]] - 롤링/블루그린/카나리, 롤백 설계
- [ ] [[github-actions]] - 워크플로우 구조, 시크릿, 셀프호스티드 러너

## 5. 인프라

- [ ] [[iac]] - Terraform 개념, 상태 관리, drift
- [ ] [[cloud-basics]] - 컴퓨트/스토리지/네트워크 기본 블록, 요금이 나오는 구조
- [ ] [[observability]] - 로그/메트릭/트레이스 3종, SLO/SLI → distributed-systems/와 연결
