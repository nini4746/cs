# QUIC

## 한 줄 요약

UDP 위에 TCP의 신뢰성 + TLS 암호화 + 멀티플렉싱을 유저공간에서 재구현한 프로토콜. TCP의 head-of-line blocking과 느린 연결 설정을 해결하며, HTTP/3의 기반이다.

## 왜 필요한가

- TCP의 근본 한계를 왜 못 고치나
- HTTP/3가 왜 UDP 위에 서나
- 연결 마이그레이션이 뭔가

## TCP의 고착 문제

TCP는 개선하고 싶어도 못 바꿈:

1. **커널 구현**: TCP는 OS 커널에 있음 → 바꾸려면 전 세계 OS 업데이트 (수년~불가)
2. **미들박스 고착(ossification)**: 방화벽·NAT가 TCP를 특정 방식으로 검사 → 새 TCP 기능이 통과 못 함
3. **head-of-line blocking**: TCP의 순서 보장이 근본적 → HTTP/2 멀티플렉싱도 TCP 레벨에선 못 피함 ([[tcp-basics]], [[http]])

QUIC의 전략: **UDP 위에 유저공간에서** 새로 구현 → 커널·미들박스 우회, 앱 업데이트로 진화.

## QUIC = UDP + 재구현

QUIC은 UDP([[udp]]) 위에 TCP의 좋은 점을 얹음:

- **신뢰성**: 재전송, 순서 (스트림별) → [[tcp-reliability]]
- **혼잡 제어**: → [[congestion-control]]
- **TLS 1.3 내장**: 암호화가 프로토콜의 일부 (선택 아님) → security/[[tls-deep-dive]]
- **멀티플렉싱**: 여러 스트림 (아래)
- 전부 **유저공간 라이브러리**로 → 앱이 업데이트하면 즉시 개선

## 핵심 1: 스트림별 독립 (HOL blocking 해결)

TCP의 근본 문제 해결:

```
TCP: 한 연결 = 하나의 바이트 스트림
     패킷3 손실 → 스트림 전체가 3을 기다림 (HTTP/2도 이걸 못 피함)

QUIC: 한 연결 = 여러 독립 스트림
      스트림A 패킷 손실 → 스트림B,C는 계속 진행 (독립!)
```

- 각 스트림이 자기 순서만 관리 → 한 스트림의 손실이 다른 스트림 안 막음
- HTTP/3가 이걸로 진짜 멀티플렉싱 달성 → [[http]]

## 핵심 2: 빠른 연결 설정

TCP는 핸드셰이크(1 RTT, [[tcp-basics]]) + TLS 핸드셰이크(1~2 RTT) = 2~3 RTT:

- **QUIC**: 연결 + 암호화를 **한 번에** (TLS 1.3 통합) → **1 RTT**
- **0-RTT**: 이전에 연결했던 서버면 **0 RTT** (첫 패킷에 데이터) - 재접속 즉시
- 모바일·고지연 환경에서 큰 이득 (RTT 절약)

## 핵심 3: 연결 마이그레이션

TCP 연결은 **4-tuple(출발IP:포트, 목적IP:포트)로 식별** → IP 바뀌면 끊김:

- WiFi → LTE 전환 시 TCP 연결 재설정 필요 (IP 바뀜)
- QUIC은 **연결 ID**로 식별 (IP 아님) → **IP 바뀌어도 연결 유지**
- 모바일에서 네트워크 전환해도 다운로드/통화 안 끊김

## QUIC vs TCP

| | TCP | QUIC |
|---|---|---|
| 기반 | IP 직접 | UDP 위 |
| 위치 | 커널 | 유저공간 |
| HOL blocking | 있음 | 스트림별 해결 |
| 암호화 | 별도 TLS | 내장 |
| 연결 설정 | 2~3 RTT | 1 RTT (0-RTT 가능) |
| 마이그레이션 | ✗ | ✓ (연결 ID) |
| 진화 | 느림 (커널) | 빠름 (앱) |

## 대가와 논란

- **CPU 비용**: 유저공간 처리 + 암호화 → TCP보다 CPU 더 씀 (커널 오프로드 없음)
- **UDP 차단**: 일부 네트워크가 UDP를 제한/느리게 → QUIC 실패 시 TCP로 폴백
- **관측성**: 암호화가 많아 네트워크 디버깅 어려움
- 그래도 구글·주요 CDN([[cdn]])이 광범위 배포 → HTTP/3 채택 증가

## 연결

- UDP 기반 → [[udp]]
- 대체하는 TCP → [[tcp-basics]], [[tcp-reliability]]
- 혼잡 제어 → [[congestion-control]]
- HTTP/3 → [[http]]
- 내장 TLS → security/[[tls-deep-dive]]
- 유저공간 vs 커널 → os/[[limited-direct-execution]]

## 궁금한 것 (나중에)

- [ ] QUIC 패킷 구조와 연결 ID
- [ ] 0-RTT의 replay 공격 위험
- [ ] QUIC 혼잡 제어 (BBR 통합)
- [ ] HTTP/3 프레이밍 (QPACK)

## 출처

- RFC 9000 (QUIC), Kurose & Ross 3장 보충
