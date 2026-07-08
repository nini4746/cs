# 최소 권한 (Least Privilege)

## 한 줄 요약

각 구성요소에 필요한 최소한의 권한만 부여해, 침해되어도 피해를 제한하는 원칙. 샌드박싱·권한 분리·컨테이너 격리가 구현이며, 심층 방어의 핵심 기둥.

## 왜 필요한가

- 뚫려도 피해를 어떻게 제한하나
- 샌드박스가 뭐고 어떻게 격리하나
- 보안 설계의 근본 원칙

## 원칙: 필요한 만큼만

**최소 권한(Principle of Least Privilege)**: 각 사용자·프로세스·구성요소에게 **작업에 필요한 최소 권한만**:

- DB 계정: 그 앱이 쓰는 테이블에만, 필요한 동작만 (SELECT만 필요하면 DELETE 권한 X)
- 프로세스: 필요한 파일·네트워크만 (os/[[process]])
- 사용자: 필요한 기능만 (관리자 권한 남발 금지)

**왜**: 어떤 부분이 침해돼도(인젝션 [[injection]], 메모리 버그 [[memory-safety]]) **피해가 그 권한 범위로 제한**됨. 권한이 크면 뚫렸을 때 전부 잃음.

## 침해 가정 (assume breach)

현대 보안 사고방식: **뚫린다고 가정하고 피해를 제한**:

- 완벽한 방어는 불가능 (버그, 신종 공격)
- 그래서 "뚫려도 어디까지 갈 수 있나"를 최소화
- 최소 권한 = 침해의 **폭발 반경(blast radius)** 축소
- 예: SQL 인젝션([[injection]])으로 DB 접근돼도, 그 계정이 읽기만이면 삭제·다른 테이블 못 함

## 샌드박싱 (sandboxing)

**코드를 격리된 제한 환경에서** 실행 → os/[[virtualization-and-containers]]:

- 브라우저 렌더러: 샌드박스에 가둠 → 악성 사이트가 시스템 접근 못 함 (web/[[browser-architecture]]의 site isolation)
- 모바일 앱: 각 앱이 샌드박스 (다른 앱·시스템 격리)
- **seccomp**(리눅스): 프로세스가 쓸 수 있는 시스템 콜 제한 (os/[[limited-direct-execution]])
- **capabilities**: root의 권한을 잘게 쪼갬 (전부 아니면 전무 대신)

## 권한 분리 (privilege separation)

프로그램을 **권한별로 분리**:

- 높은 권한이 필요한 부분을 최소화하고 격리
- 예: 웹서버가 80포트 바인딩(root 필요)만 root로, 요청 처리는 낮은 권한으로 (권한 강등)
- OpenSSH의 권한 분리 구조 (파싱을 낮은 권한 프로세스로)

## 컨테이너·격리

- **컨테이너**(os/[[virtualization-and-containers]]): namespace/cgroup으로 격리. 하지만 커널 공유 → 완벽 아님
- **VM**: 강한 격리 (하드웨어 레벨)
- **rootless 컨테이너**: root 없이 실행
- 멀티테넌트는 강한 격리 필요 (VM, gVisor) → os/[[virtualization-and-containers]]

## 접근 제어와 연결

- **RBAC/ABAC**([[authn-authz-failures]]): 역할·속성으로 권한 부여, 최소로
- **기본 거부**: 명시 허용만 (allowlist)
- **정기 검토**: 안 쓰는 권한 회수 (권한 부풀림 방지)

## 실무 적용

| 대상 | 최소 권한 적용 |
|---|---|
| DB 계정 | 앱별 계정, 필요 테이블·동작만 |
| 클라우드 IAM | 역할별 최소 정책 (devops/[[cloud-basics]]) |
| 컨테이너 | non-root, 읽기전용 파일시스템, capabilities 최소 |
| API 토큰 | 스코프 제한, 만료 |
| 프로세스 | seccomp, 낮은 권한 사용자 |
| 파일 권한 | 필요한 것만 (os/[[linux-essentials]]) |

## 심층 방어의 기둥

최소 권한은 **심층 방어(defense in depth)**의 핵심:
- 한 계층 뚫려도 다음이 막음 ([[xss-csrf]]의 계층 방어)
- 최소 권한 = 각 계층의 피해 제한
- 다른 방어(인증, 암호화, 검증)와 결합

## 연결

- 컨테이너 격리 → os/[[virtualization-and-containers]]
- 시스템 콜 제한 → os/[[limited-direct-execution]]
- 브라우저 샌드박스 → web/[[browser-architecture]]
- 인가·RBAC → [[authn-authz-failures]]
- 인젝션 피해 제한 → [[injection]]
- 클라우드 IAM → devops/[[cloud-basics]]
- 리눅스 권한 → devops/[[linux-essentials]]

## 궁금한 것 (나중에)

- [ ] seccomp-bpf 프로파일 작성
- [ ] 리눅스 capabilities 전체 목록
- [ ] zero trust 아키텍처
- [ ] 최소 권한 자동화 (권한 분석 도구)

## 출처

- Saltzer & Schroeder (보안 설계 원칙, 1975), OWASP
