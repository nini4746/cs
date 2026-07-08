# RPC (원격 프로시저 호출)

## 한 줄 요약

원격 서버의 함수를 로컬 함수처럼 호출하는 추상. 편리하지만 네트워크의 부분 실패를 감추지 못한다 - "응답이 없다"가 성공인지 실패인지 모호해 at-least/at-most/exactly-once 의미론이 갈린다.

## 왜 필요한가

- 노드끼리 어떻게 통신하나
- 왜 "정확히 한 번"이 어려운가
- 재시도가 왜 위험한가

## RPC = 원격 함수 호출

**원격 서버의 함수를 로컬처럼**:

```
result = server.getUser(123)   # 로컬 함수 같지만 실제론 네트워크 요청
```

- 내부적으로: 인자 직렬화 → 네트워크 전송 → 서버 실행 → 결과 직렬화 → 반환
- **추상화**: 네트워크 세부를 감춤 → 개발 편의
- 예: gRPC(web/[[graphql-and-alternatives]]), 옛 CORBA, JSON-RPC

## 문제: 네트워크는 로컬이 아니다

RPC의 위험한 환상 - **로컬 호출처럼 보이지만 아니다**:

로컬 함수 호출: 항상 성공하거나 예외 (명확)
원격 호출: **부분 실패**([[why-distributed]]) - "응답 없음"이 여러 의미:

```
요청 보냄 → ??? (응답 없음)
  - 요청이 서버에 안 갔나? (네트워크 손실)
  - 서버가 실행했는데 응답이 손실됐나?
  - 서버가 죽었나?
  - 그냥 느린가?
```

**구별 불가**. 이게 exactly-once를 어렵게 만듦.

## 전달 의미론 (delivery semantics)

응답 없을 때 재시도하나에 따라:

### at-most-once (최대 한 번)

- 재시도 안 함 → 중복 실행 없음
- 하지만 **손실 가능** (응답 못 받으면 실패로 간주, 실제론 됐을 수도)
- 안전하지만 유실 감수

### at-least-once (최소 한 번)

- 응답 없으면 **재시도** → 최소 한 번은 실행 보장
- 하지만 **중복 실행 가능** (첫 요청이 실제론 됐는데 응답만 손실 → 재시도로 두 번)
- 예: "이체"를 재시도하면 두 번 이체될 수 있음!

### exactly-once (정확히 한 번)

- 이상적이지만 **네트워크만으론 불가능**
- 방법: at-least-once + **멱등성**([[idempotency]]) → 여러 번 실행해도 한 번 효과
- 또는 중복 제거(dedup) - 요청 ID로 이미 처리했나 확인

## 멱등성이 핵심

**at-least-once + 멱등 연산 = 사실상 exactly-once**:

- 멱등: 여러 번 해도 결과 같음 (web/[[rest-design]]의 PUT)
- 재시도해도 안전 → at-least-once로 유실 없이 + 중복 걱정 없이
- 멱등 키(Idempotency-Key)로 비멱등 연산도 안전하게 → [[idempotency]]
- 분산 시스템 설계의 핵심 도구

## RPC의 다른 함정

- **직렬화 비용**: 인자·결과를 바이트로 (web/[[graphql-and-alternatives]]의 Protocol Buffers)
- **타입/버전 불일치**: 클라-서버 스키마 다르면 (계약 필요)
- **지연 은폐**: 로컬처럼 보여 지연을 간과 (분산 오류 2번 [[why-distributed]])
- **타임아웃 설정**: 얼마나 기다리나 (너무 짧으면 오탐, 길면 늦게 감지)

## REST vs RPC vs 메시지

통신 스타일:
- **RPC**(gRPC): 함수 호출 스타일, 강타입 계약 → web/[[graphql-and-alternatives]]
- **REST**: 자원 중심 → web/[[rest-design]]
- **메시지 큐**: 비동기, 느슨한 결합 → [[message-queues]]

동기 RPC는 강한 결합(상대가 살아있어야), 메시지는 느슨(큐가 버퍼).

## 연결

- 부분 실패 → [[why-distributed]]
- 멱등성 → [[idempotency]]
- gRPC 구현 → web/[[graphql-and-alternatives]]
- REST 비교 → web/[[rest-design]]
- 비동기 대안 → [[message-queues]]
- 네트워크 신뢰성 → network/[[tcp-reliability]]

## 궁금한 것 (나중에)

- [ ] gRPC 스트리밍 모드
- [ ] circuit breaker (실패 전파 차단)
- [ ] 백프레셔와 타임아웃 전파
- [ ] 재시도 폭풍(retry storm)과 지수 백오프

## 출처

- MIT 6.824 RPC, "DDIA" 4장
