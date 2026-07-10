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

## 셀프 체크

> [!question]- REST에서 자원과 동작은 각각 무엇으로 표현하나?
> 자원은 URL로 표현하되 동사가 아닌 명사(복수형)를 쓴다(/users/123). 동작은 HTTP 메서드로 표현한다(GET 조회, POST 생성, PUT 전체수정, PATCH 부분수정, DELETE 삭제). /getUser 같은 동사 URL 대신 GET /users/123처럼 자원과 동작을 분리한다.

> [!question]- 멱등성이 왜 중요하고, 어떤 메서드가 멱등인가?
> 멱등하면 여러 번 호출해도 결과가 같아 네트워크 실패 시 재시도가 안전하다. GET·PUT·DELETE는 멱등, POST·PATCH(보통)는 멱등이 아니다. 불안정한 분산 네트워크에서 재시도 안전성이 핵심이라 중요하다.

> [!question]- POST 재시도 시 중복 생성을 어떻게 막나?
> POST는 멱등이 아니라 재시도하면 중복 생성될 수 있다. 클라이언트가 요청마다 고유한 멱등 키(Idempotency-Key)를 헤더로 보내고, 서버가 같은 키의 요청은 한 번만 처리하고 이후엔 저장된 결과를 반환하게 해 방어한다.

> [!question]- HATEOAS는 무엇이고 실무에서 왜 잘 안 쓰나?
> 응답에 다음 가능한 동작의 링크를 포함해 자기 서술적으로 만드는, 순수 REST의 정점이다. 실무에선 구현이 복잡하고 이득이 적어 거의 안 쓰며, 대부분의 "REST API"는 HATEOAS 없는 실용 REST다.

## 연습문제

> [!example]- 결제 API에서 클라이언트가 POST /payments 응답을 못 받고 재시도해 같은 결제가 두 번 발생했다. 이 문제를 없애는 설계를 제시하라.
> **풀이**
> 원인: POST는 멱등이 아니라 응답 유실 후 재시도하면 서버가 새 결제를 또 생성한다.
> 설계: 클라이언트가 결제 시도마다 고유 Idempotency-Key를 생성해 헤더로 보낸다. 서버는 그 키를 저장소에 기록하고, 처음 보는 키면 결제를 처리해 결과를 키와 함께 저장한다. 이미 본 키가 다시 오면 결제를 다시 하지 않고 저장된 응답을 그대로 반환한다. 이로써 재시도해도 결제는 한 번만 일어난다.

> [!example]- 다음 API를 REST 원칙에 맞게 재설계하라: `GET /getUserOrders?userId=123`, `POST /createOrder`, `POST /cancelOrder?id=99`. 응답 상태 코드도 지정하라.
> **풀이**
> - GET /users/123/orders - 사용자 123의 주문 목록(계층 URL, 명사 복수형). 200 OK.
> - POST /orders - 주문 생성. 성공 시 201 Created + Location 헤더로 새 자원 URL.
> - 주문 취소: 순수 자원으로 안 맞으면 실용적 타협으로 POST /orders/99/cancel. 성공 시 200 OK(변경된 주문 반환) 또는 204 No Content. 없는 주문이면 404, 이미 취소돼 충돌이면 409.
> 동사(getUserOrders, createOrder)를 URL에서 제거하고 메서드로 동작을 표현한 것이 핵심.

## 파인만

> [!note]- 백지에 "좋은 REST API의 원칙"을 URL 설계·메서드·멱등성·상태 코드·버저닝으로 나눠 남에게 설명하듯 써보라. 막히면 그 항목만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) 자원=URL(명사)·동작=메서드 원칙, (2) 멱등성이 재시도 안전성에 왜 중요하고 POST를 어떻게 방어하는지, (3) 상태 코드로 결과를 명확히 표현하는 이유(200에 에러 담지 않기).

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
