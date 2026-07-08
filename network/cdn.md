# CDN (콘텐츠 전송 네트워크)

## 한 줄 요약

콘텐츠를 사용자 가까운 엣지 서버에 캐싱해 지연과 원본 부하를 줄인다. DNS나 애니캐스트로 가장 가까운 엣지로 라우팅한다. 웹 성능의 핵심 인프라.

## 왜 필요한가

- 왜 전 세계 사용자가 빠르게 접속하나
- 지연시간([[internet-overview]]의 전파 지연)을 어떻게 줄이나
- 넷플릭스·유튜브가 어떻게 대역폭을 감당하나

## 문제: 거리 = 지연

원본 서버가 미국에 있으면 한국 사용자는 태평양을 왕복 ([[internet-overview]]의 전파 지연):

- 물리적 거리 → 광속 한계 → 수백 ms RTT
- 원본 서버 하나에 전 세계 요청 → 부하 폭발, 대역폭 비용
- 정적 콘텐츠(이미지, 비디오, JS)를 매번 원본에서 = 낭비

## 해법: 엣지 캐싱

**전 세계에 엣지 서버(PoP, Point of Presence)를 두고 콘텐츠 복제**:

```
원본(origin) → 엣지 서버들 (전 세계 수백~수천)
사용자 → 가장 가까운 엣지 → (캐시 히트면 즉시, 미스면 원본에서 가져와 캐시)
```

- 사용자는 가까운 엣지에서 받음 → **지연 급감** (수백ms → 수십ms)
- 원본은 엣지에만 서빙 → **부하·대역폭 절감**
- os/[[page-cache]], [[memory-hierarchy]]의 캐싱 발상을 지리적으로 확장

## 가까운 엣지 찾기: 라우팅

사용자를 어느 엣지로 보내나:

### DNS 기반

DNS 조회([[dns]]) 시 **사용자 위치에 따라 다른 IP 반환**:
- CDN의 DNS 서버가 요청자 위치를 추정 → 가까운 엣지 IP
- 유연하지만 DNS 캐싱 때문에 정밀도 한계

### 애니캐스트 (anycast)

**같은 IP를 여러 엣지가 광고** → 라우팅이 가장 가까운 곳으로:
- BGP([[routing]])가 최단 경로의 엣지로 패킷 전달
- 하나의 IP, 자동으로 가까운 엣지. Cloudflare 등이 사용
- DDoS 분산에도 유리 (공격이 여러 엣지로 흩어짐)

## 무엇을 캐싱하나

- **정적 콘텐츠**: 이미지, 비디오, CSS, JS, 폰트 → 잘 안 바뀜, 캐싱 최적
- **동적 콘텐츠**: API 응답 등 → 캐싱 어렵지만 짧은 TTL, edge compute로 일부
- 캐시 제어는 HTTP 헤더([[http]], web/[[http-for-web]]): Cache-Control, ETag

## 캐시 무효화

콘텐츠가 바뀌면 엣지 캐시를 갱신해야 → distributed-systems/[[caching-strategies]]:

- **TTL 만료**: 시간 지나면 원본 재확인
- **purge**: 명시적으로 캐시 삭제 (배포 시)
- **버전 URL**: 파일명에 해시 (`app.a1b2c3.js`) → 바뀌면 URL 바뀜 → 캐시 자동 우회 (web/[[web-performance]])

## CDN이 하는 다른 일

캐싱 넘어 종합 엣지 플랫폼으로 진화:

- **TLS 종료**: 엣지에서 HTTPS 처리 → security/[[tls-deep-dive]]
- **DDoS 방어**: 애니캐스트로 공격 흡수/분산
- **WAF**(웹 방화벽): 악성 요청 필터 → security/[[web-vulnerabilities]]
- **엣지 컴퓨팅**: 엣지에서 코드 실행 (Cloudflare Workers) → 동적 콘텐츠도 가까이
- **로드 밸런싱**, 이미지 최적화, 압축

## 대용량 스트리밍

넷플릭스·유튜브 = CDN 없이는 불가능:
- 비디오를 엣지(또는 ISP 내부 서버)에 미리 배치
- 넷플릭스 Open Connect: ISP에 직접 서버 설치 → 최단 거리
- 적응형 비트레이트 → web/[[websockets-sse]] 아닌 HTTP 청크

## 연결

- 전파 지연 → [[internet-overview]]
- DNS 라우팅 → [[dns]]
- 애니캐스트와 BGP → [[routing]]
- HTTP 캐싱 → [[http]], web/[[http-for-web]]
- 캐시 무효화 → distributed-systems/[[caching-strategies]]
- 계층 캐싱 발상 → os/[[page-cache]], computer-architecture/[[memory-hierarchy]]
- TLS 종료 → security/[[tls-deep-dive]]

## 궁금한 것 (나중에)

- [ ] 애니캐스트 BGP 광고 상세
- [ ] edge compute의 실행 모델 (isolate vs 컨테이너)
- [ ] CDN 캐시 계층 (엣지 → 지역 → 원본)
- [ ] 넷플릭스 Open Connect 아키텍처

## 출처

- Kurose & Ross 2.6 (비디오 스트리밍과 CDN)
