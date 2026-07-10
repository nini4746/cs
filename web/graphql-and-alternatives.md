# GraphQL과 대안 (GraphQL and Alternatives)

## 한 줄 요약

REST의 오버페칭·언더페칭을 해결하려는 API 스타일들 - GraphQL(클라이언트가 필요한 필드 지정), gRPC(고성능 바이너리 RPC), tRPC(타입 안전 RPC). 각각 REST 대비 트레이드오프가 다르다.

## 왜 필요한가

- REST의 한계([[rest-design]])를 뭐가 해결하나
- GraphQL이 언제 낫고 언제 과한가
- gRPC/tRPC의 자리

## REST의 문제

REST([[rest-design]])의 고정 응답이 낳는 문제:

- **오버페칭(over-fetching)**: 필요 없는 필드까지 받음 (`/users/123`이 20개 필드인데 이름만 필요)
- **언더페칭(under-fetching) / N+1**: 한 화면에 여러 자원 → 여러 요청 (사용자 + 그 주문 + 각 주문의 상품 → 요청 폭발)
- 모바일(느린 네트워크 → network/[[internet-overview]])에서 특히 문제

## GraphQL

**클라이언트가 필요한 데이터를 정확히 질의**:

```graphql
query {
  user(id: 123) {
    name              # 필요한 필드만
    orders {          # 관련 자원을 한 번에 (N+1 해결)
      amount
      items { name }
    }
  }
}
```

- **단일 엔드포인트**: `/graphql`에 쿼리를 POST (REST의 여러 URL 대신)
- **필요한 것만**: 오버페칭 없음
- **한 번에 여러 자원**: 언더페칭·N+1 없음 (중첩 질의)
- **스키마 + 타입**: 강타입 스키마 (programming-languages/[[type-systems-advanced]])
- **자기 문서화**: 스키마 인트로스펙션

### GraphQL의 대가

- **캐싱 어려움**: REST는 URL로 HTTP 캐싱([[http-for-web]]) 쉬움. GraphQL은 POST 단일 URL → HTTP 캐싱 안 됨 (앱 레벨 캐싱 필요)
- **복잡도**: 서버 구현·리졸버, 학습 곡선
- **N+1이 서버로 이동**: 클라이언트 N+1은 없앴지만 서버 리졸버가 DB에 N+1 낼 수 있음 → DataLoader로 배치 (database/[[query-execution]])
- **쿼리 복잡도 공격**: 깊은 중첩 쿼리로 서버 과부하 → 깊이 제한
- 남용 주의: 단순 CRUD엔 REST가 더 간단

## gRPC

**고성능 바이너리 RPC** (구글):

- **Protocol Buffers**: 바이너리 직렬화 (JSON보다 작고 빠름, computer-architecture/[[data-layout]]의 효율)
- **HTTP/2 기반**: 멀티플렉싱, 스트리밍 (network/[[http]], [[quic]])
- **양방향 스트리밍**: 클라-서버 동시 스트림
- **강타입 계약**: .proto 파일로 인터페이스 정의 → 코드 생성 (다언어)
- **용도**: **마이크로서비스 간 통신**(내부), 저지연·고처리량 → distributed-systems/[[rpc]]
- 단점: 브라우저 직접 지원 약함(gRPC-Web 필요), 사람이 못 읽음(바이너리)

REST(사람 친화, 외부 API) vs gRPC(효율, 내부 서비스 간).

## tRPC

**타입 안전 RPC** (TypeScript 생태계):

- 서버·클라이언트가 같은 TS 타입 공유 → **엔드투엔드 타입 안전** (programming-languages/[[static-vs-dynamic-typing]])
- 코드 생성 없이 타입 추론 (같은 코드베이스)
- **용도**: TypeScript 풀스택 (Next.js 등), 내부 API
- 스키마·코드 생성 오버헤드 없이 타입 안전 (GraphQL보다 가벼움)
- 단점: TS 전용, 서버-클라 같은 저장소 전제

## 비교

| | REST | GraphQL | gRPC | tRPC |
|---|---|---|---|---|
| 페칭 | 고정 | 클라 지정 | 고정 | 고정 |
| 포맷 | JSON | JSON | 바이너리 | JSON |
| 캐싱 | 쉬움(HTTP) | 어려움 | 없음 | 어려움 |
| 타입 안전 | 약함 | 스키마 | proto | TS 추론 |
| 용도 | 범용 외부 | 유연 페칭 | 내부 고성능 | TS 풀스택 |

## 선택 가이드

- **공개 API, 단순 CRUD**: REST (표준, 캐싱, 도구)
- **복잡한 페칭, 다양한 클라이언트**: GraphQL (모바일+웹이 다른 데이터)
- **마이크로서비스 내부 통신**: gRPC (효율, 계약)
- **TypeScript 풀스택**: tRPC (타입 안전, 간단)

"GraphQL이 REST보다 낫다"가 아니라 **문제에 맞게**. 대부분 앱은 여전히 REST로 충분.

## 셀프 체크

> [!question]- 오버페칭과 언더페칭(N+1)은 각각 무엇이고, GraphQL이 어떻게 해결하나?
> 오버페칭은 필요 없는 필드까지 받는 것(20개 필드 중 이름만 필요), 언더페칭/N+1은 한 화면에 여러 자원이 필요해 요청이 폭발하는 것이다. GraphQL은 클라이언트가 필요한 필드만 지정하고 중첩 질의로 관련 자원을 한 번에 받아 둘 다 해결한다.

> [!question]- GraphQL의 캐싱이 REST보다 어려운 이유는?
> REST는 자원마다 고유 URL이라 URL을 키로 HTTP 캐싱(브라우저·CDN)이 쉽다. GraphQL은 단일 엔드포인트(/graphql)에 쿼리를 POST하므로 URL 기반 HTTP 캐싱이 안 되고, 앱 레벨 캐싱을 따로 구현해야 한다.

> [!question]- GraphQL이 클라이언트 N+1을 없애도 서버에 N+1이 남는다는 말의 뜻은?
> 클라이언트는 중첩 질의로 한 번에 요청하지만, 서버의 리졸버가 각 중첩 필드마다 DB 쿼리를 날리면 서버 쪽에서 N+1이 생긴다. DataLoader로 같은 종류의 조회를 배치해 완화한다.

> [!question]- gRPC와 tRPC는 각각 어떤 상황에 쓰나?
> gRPC는 Protocol Buffers 바이너리 직렬화와 HTTP/2 기반으로 저지연·고처리량이 필요한 마이크로서비스 간 내부 통신에 쓴다. tRPC는 서버·클라이언트가 같은 TypeScript 타입을 공유해 코드 생성 없이 엔드투엔드 타입 안전을 얻는, TS 풀스택(같은 저장소) 내부 API용이다.

## 연습문제

> [!example]- 모바일 앱 화면 하나에 "사용자 + 그 사용자의 주문 목록 + 각 주문의 상품명"이 필요하다. REST로 짜니 요청이 수십 개 나가 느리다. GraphQL로 어떻게 바꾸고, 서버에서 무엇을 조심해야 하는지 설계하라.
> **풀이**
> GraphQL: /graphql에 user(id){ name, orders{ amount, items{ name } } } 형태의 중첩 쿼리 하나를 POST한다. 필요한 필드만, 관련 자원을 한 번에 받아 클라이언트 요청 폭발(언더페칭/N+1)과 오버페칭이 모두 사라진다. 느린 모바일 네트워크에서 왕복 수가 줄어 특히 유리하다.
> 서버 주의: 리졸버가 orders·items를 각각 DB에서 개별 조회하면 서버 N+1이 발생한다 → DataLoader로 배치. 또 깊은 중첩 쿼리로 인한 쿼리 복잡도 공격에 대비해 쿼리 깊이 제한을 둔다.

> [!example]- 팀이 "GraphQL이 REST보다 항상 우월하니 공개 API도 GraphQL로 가자"고 한다. 반론과 함께 각 API 스타일의 적합한 자리를 제시하라.
> **풀이**
> 반론: "항상 우월"은 틀리다. 공개 API·단순 CRUD는 REST가 표준적이고 HTTP 캐싱·도구 생태계가 좋아 더 간단하다. GraphQL은 서버 구현·리졸버 복잡도, 캐싱 어려움, 쿼리 복잡도 공격 대비 등 비용이 있다.
> 적합한 자리: 공개 API·단순 CRUD는 REST, 다양한 클라이언트가 서로 다른 데이터를 유연하게 페칭해야 하면 GraphQL, 마이크로서비스 내부 고성능 통신은 gRPC, TypeScript 풀스택 내부 API는 tRPC. 문제에 맞게 고르는 것이지 하나가 정답이 아니다.

## 파인만

> [!note]- 백지에 "REST의 어떤 한계를 GraphQL/gRPC/tRPC가 각각 어떻게 다루고 무엇을 포기하나"를 표로 그려 남에게 설명하듯 써보라. 막히면 그 칸만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) 오버/언더페칭이 무엇이고 GraphQL이 어떻게 푸는지, (2) GraphQL의 대가(캐싱 어려움, 서버 N+1, 복잡도), (3) gRPC·tRPC가 각각 어떤 상황을 겨냥하는지.

## 연결

- REST 기반과 한계 → [[rest-design]]
- HTTP 캐싱 (GraphQL 약점) → [[http-for-web]]
- gRPC의 RPC → distributed-systems/[[rpc]]
- 타입 시스템 → programming-languages/[[type-systems-advanced]], [[static-vs-dynamic-typing]]
- 서버 N+1 → database/[[query-execution]]

## 궁금한 것 (나중에)

- [ ] DataLoader 배치 패턴 (GraphQL N+1)
- [ ] GraphQL 구독(subscription) 실시간
- [ ] Protocol Buffers 인코딩
- [ ] gRPC 스트리밍 모드 4종

## 출처

- GraphQL/gRPC 공식 문서, tRPC 문서
