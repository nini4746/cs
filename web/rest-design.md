# REST 설계 (REST Design)

## 한 줄 요약

REST는 HTTP를 자원 중심으로 쓰는 API 스타일 - 자원을 URL로, 동작을 HTTP 메서드로 표현한다. 멱등성·상태 코드·버저닝이 좋은 API의 핵심. 규약이지 표준은 아니다.

## 왜 필요한가

- API를 어떻게 설계하나 (일관성)
- 멱등성이 왜 중요한가 (재시도 안전)
- REST의 원칙과 실무 타협

## REST 원칙

**REST(Representational State Transfer)**: 자원(resource) 중심 API:

- **자원 = URL**: `/users/123` (동사 아닌 명사)
- **동작 = HTTP 메서드**: GET/POST/PUT/DELETE (network/[[http]])
- **무상태**: 각 요청이 독립 (network/[[http]]의 stateless) → 확장 쉬움
- **표현(representation)**: 자원을 JSON/XML로 주고받음

```
GET    /users        # 목록
GET    /users/123    # 하나 조회
POST   /users        # 생성
PUT    /users/123    # 전체 수정
PATCH  /users/123    # 부분 수정
DELETE /users/123    # 삭제
```

동사를 URL에 넣지 않음 (`/getUser` ✗ → `GET /users/123` ✓). 자원과 동작 분리.

## 자원 모델링

좋은 URL 설계:

- **명사, 복수형**: `/users`, `/orders` (일관성)
- **계층**: `/users/123/orders` (사용자의 주문)
- **필터·정렬은 쿼리**: `/users?role=admin&sort=name`
- **동작이 자원으로 안 맞으면**: `/orders/123/cancel` (실용적 타협 - 순수 REST는 아니지만)

## 멱등성과 안전성

HTTP 메서드의 속성 (network/[[http]] 복습):

| 메서드 | 안전 | 멱등 |
|---|---|---|
| GET | ✓ (변경 없음) | ✓ |
| POST | ✗ | ✗ (매번 새로 생성) |
| PUT | ✗ | ✓ (같은 결과) |
| PATCH | ✗ | ✗ (보통) |
| DELETE | ✗ | ✓ (이미 없으면 그대로) |

**멱등성이 중요한 이유**: 네트워크 실패 시 **재시도 안전** → distributed-systems/[[idempotency]]:
- PUT은 여러 번 해도 같은 결과 → 응답 못 받아도 재시도 OK
- POST는 재시도 시 중복 생성 → 멱등 키(Idempotency-Key)로 방어
- 분산·불안정 네트워크에서 필수 개념

## 상태 코드 활용

의미 있는 상태 코드 (network/[[http]]):

- **200 OK**, **201 Created**(POST 성공), **204 No Content**(DELETE)
- **400 Bad Request**(잘못된 입력), **401 Unauthorized**(인증), **403 Forbidden**(권한), **404 Not Found**
- **409 Conflict**(충돌), **422 Unprocessable**(검증 실패), **429 Too Many Requests**(rate limit)
- **500**(서버 오류), **503**(사용 불가)

상태 코드로 결과를 명확히 (200에 에러 담지 말 것).

## 버저닝

API 변경 시 기존 클라이언트 보호 (network/[[http]]의 하위 호환):

- **URL**: `/v1/users`, `/v2/users` (명확, 흔함)
- **헤더**: `Accept: application/vnd.api.v2+json`
- **하위 호환 유지**: 필드 추가는 OK, 제거·변경은 breaking → 새 버전
- 폐기(deprecation) 정책·기간 안내

## HATEOAS (순수 REST)

응답에 **다음 가능한 동작 링크** 포함 (자기 서술적):
```json
{ "id": 123, "status": "pending",
  "links": { "cancel": "/orders/123/cancel" } }
```
- 이론적으로 REST의 정점이지만 실무에선 거의 안 씀 (복잡, 이득 적음)
- 대부분 "REST API"는 HATEOAS 없는 실용 REST

## REST의 한계와 대안

- **오버페칭/언더페칭**: REST는 고정 응답 → 필요보다 많이/적게 받음 → GraphQL이 해결 → [[graphql-and-alternatives]]
- **여러 자원**: 한 화면에 여러 자원이면 여러 요청 (N+1) → GraphQL/BFF
- **실시간**: REST는 pull → WebSocket/SSE ([[websockets-sse]])
- 대안들 → [[graphql-and-alternatives]]

## 좋은 API 원칙

1. **일관성**: 명명·구조 일관 (팀 컨벤션)
2. **예측 가능**: 표준 메서드·상태 코드
3. **멱등성**: 재시도 안전한 설계
4. **명확한 오류**: 상태 코드 + 에러 본문 (무엇이 잘못됐나)
5. **페이지네이션**: 큰 목록은 페이지로 (cursor/offset)
6. **rate limiting**: 남용 방지 (429)
7. **문서화**: OpenAPI/Swagger

## 연결

- HTTP 메서드·상태 코드 → network/[[http]]
- 멱등성 → distributed-systems/[[idempotency]]
- 대안 (GraphQL/gRPC) → [[graphql-and-alternatives]]
- 실시간 → [[websockets-sse]]
- 인증 → [[web-auth]]
- API 설계 원칙 → software-design/[[api-design-principles]]

## 궁금한 것 (나중에)

- [ ] cursor vs offset 페이지네이션
- [ ] REST vs RPC 스타일
- [ ] OpenAPI 스펙과 코드 생성
- [ ] 멱등 키 구현 → distributed-systems/[[idempotency]]

## 출처

- Roy Fielding REST 논문, MDN, REST API 가이드
