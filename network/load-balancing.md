# 로드 밸런싱 (Load Balancing)

## 한 줄 요약

여러 서버에 트래픽을 분산해 처리량·가용성을 높이는 것. L4(전송 계층, 빠름)냐 L7(응용 계층, 똑똑함)이냐, 분배 알고리즘(라운드로빈/최소연결/해시)을 무엇으로 하느냐가 핵심. 상태 있는 요청엔 consistent hashing이 노드 추가·삭제 시 재배치를 최소화한다.

## 왜 필요한가

- 서버 하나로 감당 안 되는 트래픽을 어떻게
- L4 vs L7 로드밸런서 차이
- 왜 단순 해싱 말고 consistent hashing인가

## 왜 로드밸런싱

```
서버 1대: 용량 한계, 죽으면 전체 다운 (SPOF)
서버 N대 + LB: 수평 확장 + 하나 죽어도 계속 (고가용성)
```

- **확장성**: 트래픽 늘면 서버 추가 (수평 확장, distributed-systems/[[why-distributed]])
- **가용성**: 죽은 서버 제외 (헬스 체크)
- **성능**: 부하 고르게 → 지연↓
- CDN([[cdn]]), k8s Service(devops/[[kubernetes-networking]]), DB 읽기 복제(database/[[replication-db]])가 다 이 원리

## L4 vs L7

로드밸런서가 어느 계층에서 결정하나:

### L4 (전송 계층)

```
TCP/UDP 수준에서 분배 (IP·포트만 봄)
패킷 내용 안 봄 → 빠름, 저오버헤드
```

- **빠름**: 헤더만 보고 라우팅 (내용 파싱 X)
- 연결을 서버에 고정 (NAT/DSR)
- 내용 기반 라우팅 불가 (URL·쿠키 모름)

### L7 (응용 계층)

```
HTTP 수준에서 분배 (URL·헤더·쿠키 봄) [[http]]
경로별 라우팅, TLS 종료, 콘텐츠 기반
```

- **똑똑함**: `/api`는 A서버, `/img`는 B서버 (경로 라우팅)
- TLS 종료([[tls]]), 압축, 캐싱, 요청 재작성
- 느림·비쌈 (내용 파싱), 하지만 유연
- k8s Ingress가 L7 (devops/[[kubernetes-networking]])

## 분배 알고리즘

- **라운드로빈**: 순서대로 (단순, 서버 성능 같을 때)
- **가중 라운드로빈**: 성능 좋은 서버에 더 (용량 차이 반영)
- **최소 연결**: 연결 적은 서버로 (요청 처리 시간 편차 클 때)
- **해시 기반**: 키(IP·세션)로 해싱 → **같은 클라이언트를 같은 서버로** (세션 고정, 캐시 지역성)
- **랜덤 + two-choices**: 둘 뽑아 덜 바쁜 쪽 (단순한데 효과 좋음)

## Consistent Hashing (핵심)

해시 기반 분배의 문제 - **노드 수가 바뀌면 대량 재배치**:

```
단순 모듈로: server = hash(key) % N
N이 3→4로 바뀌면 → 거의 모든 키의 목적지가 바뀜 (캐시 전멸)
```

consistent hashing 해법:
```
해시 링(0~2^32)에 노드를 배치 → 키는 시계방향 다음 노드로
노드 추가/삭제 시 → 인접 구간만 재배치 (전체 아님)
가상 노드(vnode)로 고르게 분산
```

### 코드로 확인

10000개 키, 노드 3→4 추가 시 재배치 비교:

```python
# 모듈로: hash(key) % N
# consistent: 해시 링 + 가상 노드 100개
```

실행:
```
노드 3->4 추가 시 재배치된 키 (총 10000개):
  모듈로 해싱:       7428 (74.3%)
  consistent hash:  2537 (25.4%)  <- 이상적 ~1/4
```

- 모듈로는 **74%가 재배치**(캐시·세션 대참사) vs consistent는 **25%**(이상적 1/4에 근접)
- 노드 추가 시 **새 노드가 가져갈 몫만** 이동 → 캐시 미스·데이터 이동 최소
- 분산 캐시(memcached), DB 파티셔닝(database/[[partitioning-db]]), DHT의 표준 기법

## 상태 문제: 세션 고정

- **무상태(stateless) 서버가 이상적**: 아무 서버나 처리 가능 → LB 자유
- **상태 있으면**(세션 메모리): 같은 클라이언트를 같은 서버로 (sticky session) 또는 **세션을 외부화**(Redis 등) → 무상태로
- 무상태가 확장·복구에 유리 (software-design/의 상태 최소화)

## 헬스 체크·고가용성

- **헬스 체크**: 주기적으로 서버 생존 확인 → 죽으면 풀에서 제외 ([[icmp-and-tools]], devops/[[observability]])
- **LB 자신의 이중화**: LB가 SPOF 되면 안 됨 → 이중 LB (active-passive, VRRP)
- **DNS 로드밸런싱**: DNS로 여러 IP 반환 (조악하지만 지리적 분산, [[cdn]])

## 연결

- 확장·가용성 → distributed-systems/[[why-distributed]]
- L7 라우팅·HTTP → [[http]], devops/[[kubernetes-networking]]
- TLS 종료 → [[tls]]
- CDN·DNS 분산 → [[cdn]], [[dns]]
- consistent hashing → database/[[partitioning-db]]
- 읽기 복제 분산 → database/[[replication-db]]
- 헬스 체크·관측 → [[icmp-and-tools]], devops/[[observability]]

## 궁금한 것 (나중에)

- [ ] Maglev 해싱 (구글 L4 LB)
- [ ] power of two choices 이론적 보장
- [ ] 지리적 로드밸런싱 (GSLB, anycast)
- [ ] 서비스 메시의 클라이언트 사이드 LB (Envoy)

## 출처

- Kurose & Ross, "Web Scalability for Startup Engineers", Karger et al.(consistent hashing 1997)
