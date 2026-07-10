# 구조 패턴 (Structural Patterns)

## 한 줄 요약

객체·클래스를 조합해 더 큰 구조를 만드는 GoF 패턴들 - 어댑터(인터페이스 변환), 데코레이터(기능 덧붙임), 퍼사드(복잡함 감춤), 프록시(대리). 조합([[composition-over-inheritance]])으로 유연한 구조를 짠다.

## 왜 필요한가

- 객체를 어떻게 조합해 구조를 만드나
- 기능을 유연하게 확장하는 법 (데코레이터)
- 복잡한 하위 시스템을 감추는 법 (퍼사드)

## 어댑터 (Adapter)

**호환 안 되는 인터페이스를 변환**:

```
기존 코드는 인터페이스 A를 기대, 라이브러리는 B 제공
→ 어댑터가 B를 A로 감싸 변환
```

- 레거시·서드파티 통합 (인터페이스 안 맞을 때)
- 예: 옛 API를 새 인터페이스로, 다른 결제사 API를 통일된 인터페이스로
- 조합([[composition-over-inheritance]])으로 대상을 감쌈

## 데코레이터 (Decorator)

**객체를 감싸 기능을 동적으로 추가** (상속 없이):

```
기본 커피 → 우유 데코레이터로 감쌈 → 시럽 데코레이터로 또 감쌈
각 데코레이터가 같은 인터페이스 유지 + 기능 추가
```

- 상속 대신 조합으로 기능 확장 ([[composition-over-inheritance]]) → **런타임에 조합** (상속은 컴파일 타임 고정)
- OCP([[solid]]): 새 기능을 새 데코레이터로 (기존 코드 안 건드림)
- 예: Java I/O 스트림(`BufferedReader(FileReader(...))`), 미들웨어 체인 (web 요청 처리)
- 기능 조합 폭발을 상속 대신 데코레이터로 해결

## 퍼사드 (Facade)

**복잡한 하위 시스템 앞에 단순한 인터페이스**:

```
복잡한 여러 클래스 → 퍼사드 하나가 단순한 API 제공
클라이언트는 퍼사드만 씀 (내부 복잡함 모름)
```

- 깊은 모듈([[deep-modules]])의 구현 - 복잡함을 감추는 단순 인터페이스
- 예: 컴파일러의 `compile()` (렉싱·파싱·최적화 감춤 → compilers/), 라이브러리 진입점
- 하위 시스템과 결합↓ ([[coupling-cohesion]])

## 프록시 (Proxy)

**대상 객체의 대리** - 접근 제어·부가 동작:

```
클라이언트 → 프록시 → 실제 객체
프록시가 중간에서 뭔가 함 (지연 로딩, 캐싱, 권한, 로깅)
```

종류:
- **가상 프록시**: 지연 로딩 (비쌀 때만 실제 생성)
- **보호 프록시**: 접근 제어 (security/[[authn-authz-failures]])
- **캐싱 프록시**: 결과 캐싱 (distributed-systems/[[caching-strategies]])
- **원격 프록시**: 원격 객체 대리 (RPC distributed-systems/[[rpc]])
- 예: ORM 지연 로딩, CDN(network/[[cdn]]), API 게이트웨이

## 기타 구조 패턴

- **컴포지트(Composite)**: 트리 구조를 균일하게 (파일/폴더를 같게 다룸) → data-structures/[[tries]]
- **브리지(Bridge)**: 추상과 구현을 분리해 독립 확장
- **플라이웨이트(Flyweight)**: 공유로 메모리 절약 (같은 객체 재사용) → computer-architecture/[[data-layout]]

## 공통 원리

구조 패턴 대부분이 **조합 + 인터페이스**:
- 상속 아니라 조합([[composition-over-inheritance]])
- 같은 인터페이스 유지하며 감싸기/변환/대리
- 결합↓, 유연성↑ ([[coupling-cohesion]])

## 실전 관점

- **어댑터**: 통합 시 자주 (외부 API)
- **데코레이터**: 미들웨어·스트림·횡단 관심사 (로깅·인증)
- **퍼사드**: 라이브러리·모듈 경계
- **프록시**: 인프라 (캐시·게이트웨이·ORM)
- 과용 경계 동일 ([[solid]], [[deep-modules]]) - 실제 필요할 때만

## 연결

- 조합 → [[composition-over-inheritance]]
- 퍼사드 = 깊은 모듈 → [[deep-modules]]
- OCP (데코레이터) → [[solid]]
- 결합 → [[coupling-cohesion]]
- 프록시 응용 → distributed-systems/[[caching-strategies]], [[rpc]], network/[[cdn]]
- 컴포지트 트리 → data-structures/[[tries]]

## 궁금한 것 (나중에)

- [ ] 데코레이터 vs 프록시 차이 (의도)
- [ ] AOP (관심사 분리)와 데코레이터
- [ ] 동적 프록시 (Java reflection)
- [ ] 미들웨어 체인 구현

## 출처

- GoF "Design Patterns"
