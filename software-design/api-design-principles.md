# API 설계 원칙 (API Design Principles)

## 한 줄 요약

좋은 API는 쓰기 쉽고 오용하기 어렵다. 명확한 계약, 하위 호환, 일관성이 핵심이며, 한번 공개하면 바꾸기 어렵다는 점(버저닝)이 설계를 신중하게 만든다. 깊은 모듈([[deep-modules]])의 실전.

## 왜 필요한가

- 좋은 인터페이스의 기준
- API를 왜 신중히 설계해야 (되돌리기 어려움)
- 하위 호환·버저닝

## 좋은 API의 성질

Josh Bloch "How to Design a Good API":

- **쓰기 쉽게, 오용하기 어렵게**: 올바른 사용이 자연스럽고, 틀린 사용이 어렵게 (타입으로 막기 programming-languages/[[type-systems-advanced]])
- **작고 명확**: 필요한 것만 노출, 나머지 감춤 → 깊은 모듈([[deep-modules]])
- **한 가지 방법**: 같은 일을 하는 여러 방법 지양 (혼란)
- **명확한 이름**: 이름이 곧 문서 (programming-languages/[[naming-and-readability]] 아니 [[naming-and-readability]])
- **최소 놀람(least surprise)**: 예상대로 동작

## 명확한 계약

API = **계약** (호출자와 구현자 사이):

- **입력·출력·오류**를 명시 (무엇을 받고 주고 실패하나)
- **전제·불변식** 문서화
- **오류 처리** 명확 (예외? Result? → programming-languages/[[error-handling-models]])
- 계약이 명확하면 독립 개발·테스트 가능 ([[coupling-cohesion]])

## 하위 호환 (backward compatibility)

핵심 제약 - **공개된 API는 바꾸기 어렵다**:

- 이미 쓰는 클라이언트가 있음 → 바꾸면 다 깨짐
- **호환 변경 (OK)**: 필드·메서드 **추가**, 선택적 파라미터
- **비호환 변경 (breaking)**: 필드·메서드 **제거·변경**, 필수 파라미터 추가, 동작 변경
- 그래서 **처음 설계가 중요** (되돌리기 비쌈) - 신중하게, 작게 시작 (나중에 추가 쉬움, 제거 어려움)

## 버저닝 (versioning)

비호환 변경이 불가피하면 (network/[[http]]의 하위 호환, web/[[rest-design]]):

- **버전 분리**: v1, v2 병행 (web/[[rest-design]]의 `/v2/`)
- **폐기 정책(deprecation)**: 옛 버전 지원 기간·마이그레이션 안내
- **시맨틱 버저닝**: major(비호환).minor(호환 추가).patch(버그) - 버전이 변경 성격을 알림
- 클라이언트에 마이그레이션 시간을 줌

## 일관성 (consistency)

API 전반의 일관성 - 배우기 쉽게:

- **명명 규칙**: camelCase/snake_case 통일, 동사·명사 규칙 (web/[[rest-design]])
- **인자 순서**: 일관 (예: 항상 대상 먼저)
- **오류 형식**: 통일 (같은 구조)
- **패턴 반복**: 비슷한 것은 비슷하게 → 하나 배우면 나머지 유추

## 최소화

작을수록 좋음:
- **노출 최소**: public을 적게 (나중에 늘리기 쉽고 줄이기 어려움)
- **when in doubt, leave it out**: 애매하면 빼기 (추가는 나중에)
- 큰 API = 큰 유지보수·호환 부담 ([[deep-modules]]의 인터페이스 최소화)

## 오용 방지 (make illegal states unrepresentable)

타입·설계로 틀린 사용을 컴파일 타임에 막기:
- 타입으로 제약 (programming-languages/[[type-systems-advanced]]의 ADT)
- 잘못된 순서 호출 방지 (빌더로 필수 단계 강제 [[creational-patterns]])
- 단위 혼동 방지 (타입으로 miles vs km)

## 종류별 API

- **라이브러리 API**: 함수·클래스 (이 노트 원칙)
- **REST/HTTP API**: web/[[rest-design]] (자원·메서드·상태코드)
- **RPC/gRPC**: web/[[graphql-and-alternatives]] (계약 = proto)
- 원리는 공통 (명확·호환·일관·최소)

## 셀프 체크

> [!question]- 호환 변경(backward compatible)과 비호환 변경(breaking)의 예를 각각 두 개씩 들라.
> 호환: 필드·메서드 추가, 선택적 파라미터 추가. 비호환: 필드·메서드 제거·이름 변경, 필수 파라미터 추가, 기존 동작 변경. 이미 쓰는 클라이언트가 있으므로 비호환 변경은 그들을 다 깨뜨린다.

> [!question]- "when in doubt, leave it out"이 왜 하위 호환과 연결되나?
> 공개 API는 되돌리기 어렵다. 추가는 나중에 호환적으로 할 수 있지만 제거는 비호환이라 못 뺀다. 그래서 애매하면 빼고 작게 시작한다.

> [!question]- make illegal states unrepresentable을 어떻게 구현하나?
> 타입으로 잘못된 사용을 컴파일 타임에 막는다. ADT로 불가능한 상태를 표현 못 하게, 빌더로 필수 단계를 강제, 단위를 타입으로 구분(miles vs km)해 혼동을 막는다.

## 연습문제

> [!example]- 문제: `createUser(String name, boolean active, boolean admin, boolean sendWelcomeEmail)` 시그니처는 오용하기 쉽다. 왜 나쁜지 진단하고 개선하라.
> **풀이**
> 문제: 호출부가 `createUser("kim", true, false, true)`처럼 boolean 나열이라 뭐가 뭔지 안 보이고(least surprise 위반), 순서를 바꿔도 컴파일된다.
> 개선: boolean을 enum·타입으로(`Status.ACTIVE`, `Role.USER`), 선택 옵션은 빌더나 옵션 객체로 → `User.builder().name("kim").active().build()`. 잘못된 조합을 타입으로 막고 이름이 곧 문서가 된다.

> [!example]- 문제: 운영 중인 v1 `search(query)`에 필수 파라미터 `locale`을 추가해야 한다. 하위 호환을 지키며 진화하는 방법을 설계하라.
> **풀이**
> 필수 파라미터 추가는 비호환이라 기존 호출을 깬다.
> 방법 1: `locale`을 선택적 파라미터 + 기본값(예: 서버 기본 로케일)으로 추가 → 기존 호출 그대로 동작.
> 방법 2: 정말 필수라면 `/v2/search`로 분리 병행 운영하고, v1에 deprecation 공지 + 마이그레이션 기간을 준다. SemVer로 major 증가를 알린다.

## 파인만

> [!note]- 백지에 "좋은 API의 조건"을 신입에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 쓰기 쉽고 오용 어렵게 + 최소 노출을 왜 그렇게 하나, (2) 호환 변경 vs 비호환 변경의 경계, (3) 비호환이 불가피할 때 버저닝·deprecation으로 어떻게 완충하나.

## 연결

- 깊은 모듈 (인터페이스 최소) → [[deep-modules]]
- 이름 → [[naming-and-readability]]
- 오류 계약 → programming-languages/[[error-handling-models]]
- 타입으로 오용 방지 → programming-languages/[[type-systems-advanced]]
- REST API → web/[[rest-design]]
- HTTP 버저닝 → network/[[http]]
- 빌더 (오용 방지) → [[creational-patterns]]

## 궁금한 것 (나중에)

- [ ] API 진화 전략 (tolerant reader)
- [ ] OpenAPI 스펙과 계약 우선 설계
- [ ] SemVer 상세 규칙
- [ ] API 사용성 테스트

## 출처

- Josh Bloch "How to Design a Good API and Why it Matters"
