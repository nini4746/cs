# TLS 심화 (TLS Deep Dive)

## 한 줄 요약

TLS 1.3 핸드셰이크의 상세 - ECDHE로 공유 비밀을 만들고, 인증서로 서버를 인증하며, forward secrecy로 과거 통신을 미래 유출에서 보호한다. network/[[tls]]의 암호학적 내부.

## 왜 필요한가

- TLS 핸드셰이크가 정확히 어떻게 동작하나
- forward secrecy가 왜 중요한가
- network/[[tls]]의 암호학 관점 심화

## 복습: TLS가 주는 것

network/[[tls]]: 기밀성 + 무결성 + 인증. 이 노트는 **암호학적으로 어떻게** (암호 기초 [[crypto-basics]], [[digital-signatures]] 종합).

## TLS 1.3 핸드셰이크

1 RTT로 안전한 채널 확립:

```
클라이언트                           서버
ClientHello              →
  - 지원 암호 스위트
  - ECDHE 공개값 (키 공유 파라미터)
  - 랜덤값

                         ←    ServerHello
                              - 선택한 암호
                              - ECDHE 공개값
                              - 인증서 (+ 서명)
                              - Finished

[양쪽이 공유 비밀 계산 → 대칭 키 유도]
Finished                 →
[이후 대칭 암호로 통신]
```

### 단계별 암호학

1. **키 교환 (ECDHE)**: 양쪽이 공개값 교환 → 각자 **공유 비밀** 계산 ([[crypto-basics]]의 Diffie-Hellman). 도청자는 공개값을 봐도 공유 비밀 못 구함
2. **인증 (인증서 + 서명)**: 서버가 인증서([[digital-signatures]]의 PKI) 제시 + 서명으로 "내가 이 개인키 소유자" 증명 → 중간자 방지
3. **키 유도**: 공유 비밀 + 랜덤값 → 대칭 세션 키 (HKDF)
4. **대칭 통신**: 이후 AES-GCM 등으로 ([[crypto-basics]]의 하이브리드)

## forward secrecy (전방향 비밀성)

TLS 1.3의 핵심 성질:

**과거 통신이 미래에 서버 개인키가 유출돼도 안전**:

- **ephemeral(임시) 키 교환 (ECDHE의 E)**: 매 세션마다 새 임시 키 쌍 생성, 세션 후 폐기
- 공유 비밀이 임시 키에서 나옴 → 서버 장기 개인키로 복호화 불가
- 나중에 서버 개인키가 털려도 → 과거 세션의 임시 키는 이미 사라짐 → 과거 통신 못 깜

없으면 (옛 RSA 키 교환): 서버 개인키로 대칭 키를 암호화 → 개인키 유출 시 **모든 과거 통신 복호화 가능** (대량 감청). forward secrecy가 이걸 막음 → 스노든 이후 표준화.

## 1.3의 개선 (1.2 대비)

- **1 RTT** (1.2는 2 RTT): 핸드셰이크 빠름
- **0-RTT 재개**: 이전 연결 서버면 첫 패킷에 데이터 (하지만 replay 위험 → 멱등 요청만)
- **forward secrecy 필수**: 옛 RSA 키 교환 제거, ECDHE만
- **취약한 암호 제거**: RC4, SHA-1, CBC 모드 등 폐기
- **암호화된 핸드셰이크 일부**: 메타데이터 노출 감소

## 인증서 검증 상세

클라이언트가 서버 인증서를 믿는 과정 ([[digital-signatures]]의 PKI):

1. **체인 검증**: 서버 인증서 → 중간 CA → 루트 CA (내장 신뢰 앵커)까지 서명 확인
2. **도메인 일치**: 인증서의 도메인이 접속 도메인과 같나 (SAN)
3. **유효 기간**: 만료 안 됐나
4. **폐지 확인**: OCSP/CRL로 폐지 안 됐나 (탈취된 인증서)
5. **인증서 투명성(CT)**: 공개 로그에 기록됐나 (부정 발급 감지)

하나라도 실패 → 브라우저 경고.

## 공격과 방어

- **중간자(MITM)**: 인증서 검증이 방어. 하지만 사용자가 경고 무시하면 뚫림
- **다운그레이드 공격**: 약한 버전/암호로 유도 → TLS 1.3이 방어 (버전 협상 보호)
- **인증서 위조**: CA 침해 → CT 로그, 인증서 고정(pinning)
- **HSTS**: "항상 HTTPS" 강제 → SSL stripping 방어 → web/[[web-vulnerabilities]]

## 연결

- TLS 개요 → network/[[tls]]
- 대칭/비대칭/DH → [[crypto-basics]]
- 인증서·서명 → [[digital-signatures]]
- HTTPS와 HSTS → web/[[web-vulnerabilities]], network/[[http]]
- QUIC 내장 TLS → network/[[quic]]

## 궁금한 것 (나중에)

- [ ] HKDF 키 유도 상세
- [ ] 0-RTT replay 방어책
- [ ] 인증서 고정(pinning)과 위험
- [ ] ECH (Encrypted Client Hello, SNI 숨기기)

## 출처

- RFC 8446 (TLS 1.3), "Serious Cryptography"
