# DNS

## 한 줄 요약

도메인 이름(example.com)을 IP 주소로 바꾸는 분산 계층형 데이터베이스. 루트→TLD→권한 서버로 위임되며, 캐싱(TTL)으로 부하를 줄인다. 인터넷의 전화번호부.

## 왜 필요한가

- 사람은 이름, 컴퓨터는 IP - 그 사이 번역
- 왜 분산·계층형인가 (중앙 서버 하나면 불가능)
- TTL·캐싱이 왜 중요한가

## 문제: 이름 → IP

`example.com`에 접속하려면 IP가 필요 ([[ip-addressing]]). DNS가 이름을 IP로 해석:

실측 (`dig example.com`):
```
example.com. → 104.20.23.154 (A 레코드)
TTL: 109초
```

브라우저가 URL을 IP로 바꾸는 첫 단계 → web/[[what-happens-url]].

## 분산 계층 구조

중앙 서버 하나로는 불가능 (규모, 단일 장애점). DNS는 **계층적 위임**:

```
        루트 (.)                    ← 13개 루트 서버 클러스터
       /    |    \
     .com  .org  .kr               ← TLD (최상위 도메인) 서버
      |
  example.com                       ← 권한(authoritative) 서버
      |
  www.example.com                   ← 최종 레코드
```

- 각 레벨이 다음 레벨을 **위임** (알 필요 없이 "저기 물어봐")
- 부하 분산, 관리 분산 (각 도메인 소유자가 자기 레코드 관리)

## 조회 과정 (resolution)

`www.example.com` 조회:

```
1. 클라이언트 → 로컬 DNS 리졸버 (ISP 또는 8.8.8.8)
2. 리졸버 → 루트 서버: ".com 어디?"
3. 루트 → ".com TLD 서버 주소"
4. 리졸버 → TLD: "example.com 어디?"
5. TLD → "example.com 권한 서버 주소"
6. 리졸버 → 권한 서버: "www.example.com IP?"
7. 권한 서버 → "104.20.23.154"
8. 리졸버 → 클라이언트 (그리고 캐시)
```

- **재귀적 질의**: 클라이언트가 리졸버에 "다 알아서 답 줘"
- **반복적 질의**: 리졸버가 각 서버에 단계별로 물음 (위 2~7)

## 레코드 타입

| 타입 | 의미 |
|---|---|
| **A** | 이름 → IPv4 (실측의 104.20.23.154) |
| **AAAA** | 이름 → IPv6 |
| **NS** | 이 도메인의 네임서버 (실측: cloudflare.com) |
| **CNAME** | 별칭 (다른 이름으로) |
| **MX** | 메일 서버 → [[email-protocols]] |
| **TXT** | 임의 텍스트 (SPF/DKIM 검증 등 → [[email-protocols]]) |

## 캐싱과 TTL

DNS는 **캐싱으로 부하 관리** (매번 루트까지 가면 폭발):

- 각 레코드에 **TTL**(Time To Live, 실측 109초): 이 시간 동안 캐시 유효
- 리졸버·OS·브라우저가 여러 층으로 캐시 → os/[[page-cache]]의 계층 캐싱과 같은 발상
- **트레이드오프**: TTL 길면 부하↓ 하지만 변경 반영 느림 (IP 바꿔도 옛 캐시가 남음). 서버 이전 시 TTL 미리 낮춤

## DNS와 성능·보안

- **성능**: DNS 조회가 페이지 로드 첫 지연 (수십 ms). CDN·prefetch로 완화 → web/[[web-performance]]
- **로드 밸런싱**: 한 이름에 여러 A 레코드 → 분산. CDN이 지리적으로 가까운 IP 반환 → [[cdn]]
- **보안**: DNS는 평문 → 도청·조작 가능 (DNS 스푸핑). **DNSSEC**(서명), **DoH/DoT**(암호화된 DNS) → security/[[tls-deep-dive]]

## 전송 방식

- 주로 **UDP** (빠름, 작은 요청/응답) → [[udp]]
- 응답이 크거나(512B 초과) 영역 전송은 TCP
- DoH는 HTTPS 위 ([[http]]), DoT는 TLS 위

## 연결

- IP 주소 → [[ip-addressing]]
- UDP 위에서 → [[udp]]
- 캐싱 계층 → os/[[page-cache]]
- URL 접속 전체 과정 → web/[[what-happens-url]]
- CDN의 DNS 라우팅 → [[cdn]]
- 암호화 DNS → security/[[tls-deep-dive]]

## 궁금한 것 (나중에)

- [ ] DNSSEC 서명 체인
- [ ] DoH vs DoT 트레이드오프
- [ ] anycast로 루트 서버 13개가 수백 개인 이유
- [ ] DNS 기반 CDN 라우팅 상세 → [[cdn]]

## 출처

- Kurose & Ross 2.4 (DNS)
