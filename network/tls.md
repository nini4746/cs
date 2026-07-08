# TLS

## 한 줄 요약

TCP 위에 암호화·인증·무결성을 더하는 계층 (HTTPS의 S). 핸드셰이크로 대칭 키를 안전하게 교환하고, 인증서로 서버 신원을 검증한다. 비대칭 암호로 시작해 대칭 암호로 통신한다.

## 왜 필요한가

- HTTPS가 실제로 뭘 보호하나
- 처음 보는 서버와 어떻게 안전하게 키를 나누나
- 인증서가 뭘 검증하나 (상세는 security/[[tls-deep-dive]])

## 무엇을 보호하나

평문 통신(HTTP)은 경로의 누구나 도청·변조 가능 ([[wifi]]의 공유 매체, 라우터). TLS가 세 가지 보장:

- **기밀성(confidentiality)**: 암호화 → 도청해도 내용 못 봄
- **무결성(integrity)**: 변조 감지 → 중간에 못 바꿈
- **인증(authentication)**: 서버가 진짜인지 → 가짜 서버(피싱) 방지

TCP([[tcp-basics]]) 위, 응용([[http]]) 아래에 위치. HTTP + TLS = HTTPS.

## 핵심 문제: 키 교환

암호화하려면 양쪽이 **같은 비밀 키**를 알아야 함. 그런데 처음 보는 서버와 도청되는 네트워크에서 어떻게 키를 안전하게 나누나? → **비대칭 암호로 시작**:

- **비대칭 암호**(RSA, ECDH → security/[[crypto-basics]]): 공개키/개인키 쌍. 공개키로 암호화하면 개인키로만 복호화
- 이걸로 대칭 키를 안전하게 합의 (또는 Diffie-Hellman으로 공유 비밀 생성)
- **왜 비대칭만 안 쓰나**: 비대칭은 느림 → 키 교환에만 쓰고, 실제 데이터는 빠른 **대칭 암호**(AES)로

**하이브리드**: 비대칭(느림, 키 교환) + 대칭(빠름, 데이터). security/[[crypto-basics]]의 그 조합.

## 핸드셰이크 (개요)

TLS 1.3 기준 (상세는 security/[[tls-deep-dive]]):

```
1. 클라이언트 헬로: 지원 암호 목록, 키 교환 파라미터
2. 서버 헬로: 선택한 암호, 인증서, 키 교환 파라미터
3. 양쪽이 공유 비밀 계산 (Diffie-Hellman) → 대칭 키 유도
4. 이후 대칭 암호로 통신
```

- **TLS 1.3**: 1 RTT (이전 1.2는 2 RTT). QUIC([[quic]])은 이걸 전송과 통합해 더 빠름
- 핸드셰이크가 연결 지연에 추가 → keep-alive([[http]])로 재사용

## 인증서와 신뢰 체인

서버가 진짜임을 어떻게 믿나 → **인증서(certificate)**:

```
서버 인증서 (공개키 + 도메인) ← CA가 서명
CA 인증서 ← 상위 CA가 서명
...
루트 CA ← 브라우저/OS에 미리 내장 (신뢰 앵커)
```

- **CA(인증 기관)**: 서버의 신원을 확인하고 인증서에 **서명** (security/[[digital-signatures]])
- 브라우저가 루트 CA를 미리 신뢰 → 체인을 따라 서버 인증서 검증
- 도메인 일치, 만료, 폐지 확인
- 검증 실패 → 경고 (인증서 오류)

이 신뢰 체인(PKI)이 "처음 보는 서버를 믿는" 근거 → security/[[digital-signatures]].

## forward secrecy

TLS 1.3의 중요 성질: **과거 통신이 미래에 키가 유출돼도 안전**:

- 매 세션마다 임시(ephemeral) 키 교환 (ECDHE)
- 서버 개인키가 나중에 유출돼도 과거 세션은 복호화 불가 (그때의 임시 키는 이미 폐기)
- 대량 감청에 대한 방어 → security/[[tls-deep-dive]]

## 실무 관점

- **어디서나 HTTPS**: 이제 표준 (Let's Encrypt로 무료 인증서). HTTP는 리다이렉트
- **CDN이 TLS 종료**: 엣지에서 처리 → [[cdn]]
- **인증서 관리**: 만료 갱신 자동화 (만료되면 사이트 접속 불가)
- **HSTS**: "항상 HTTPS로" 강제 헤더 → security/[[web-vulnerabilities]]

## 연결

- TCP 위에서 → [[tcp-basics]]
- HTTPS = HTTP + TLS → [[http]]
- 상세 (핸드셰이크, forward secrecy) → security/[[tls-deep-dive]]
- 대칭/비대칭 하이브리드 → security/[[crypto-basics]]
- 인증서 서명 → security/[[digital-signatures]]
- QUIC 내장 TLS → [[quic]]
- CDN TLS 종료 → [[cdn]]

## 궁금한 것 (나중에)

- [ ] TLS 1.3 핸드셰이크 상세 → security/[[tls-deep-dive]]
- [ ] 인증서 투명성(CT) 로그
- [ ] mTLS (상호 인증)
- [ ] 0-RTT 재개와 replay 위험

## 출처

- Kurose & Ross 8.5 (전송 계층 보안: TLS)
