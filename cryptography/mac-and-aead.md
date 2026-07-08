# MAC과 인증 암호 (MAC and AEAD)

## 한 줄 요약

암호화는 기밀성만 줄 뿐 **변조를 막지 못한다** - 무결성·인증은 MAC(메시지 인증 코드)이 담당한다. HMAC은 해시 기반 MAC이고, AEAD(GCM 등)는 암호화와 인증을 한 번에 처리한다. 핵심 원칙은 **encrypt-then-MAC**: 암호문에 MAC을 붙여야 안전하다. "암호화했으니 안전하다"는 흔하고 치명적인 착각.

## 왜 필요한가

- 암호화만으로 왜 부족한가 (변조)
- HMAC이 뭔가
- 왜 AEAD가 현대 표준인가

## 기밀성 ≠ 무결성 (핵심)

```
암호화([[symmetric-ciphers]]): 내용을 숨김 (기밀성) - 하지만 변조는 못 막음
```

- **공격 예**: CTR/스트림 암호는 `c=m⊕keystream` → 공격자가 암호문 비트를 뒤집으면 평문도 그 비트가 뒤집힘 (키 몰라도!)
  - "$100"의 특정 비트 조작 → "$900"으로 (내용은 못 읽어도 조작 가능)
- 그래서 **무결성·인증**이 따로 필요: "이 메시지가 변조 안 됐고, 키 아는 자가 보냈다"

## MAC (메시지 인증 코드)

**공유 키로 태그를 생성** → 변조·위조 감지:

```
tag = MAC(key, message)
받는 쪽: 같은 키로 태그 재계산해 비교 → 일치해야 진짜
```

- 키 없으면 유효 태그 못 만듦 → **위조 불가**(unforgeable, EUF-CMA)
- 대칭 (양쪽 같은 키) - 서명과 달리 부인방지는 없음 (둘 다 키 가짐)

### 코드로 확인 (HMAC)

```
메시지: b'transfer $100 to alice'
HMAC 태그: 874d714eeee283440ae2e96bd2cee95a...
정상 검증: True
변조 메시지 검증: False  <- 태그 불일치 감지!
공격자(키 모름) 태그 검증: False  <- 실패
```

- 변조하면 태그 불일치 → 감지
- 키 모르는 공격자는 유효 태그 생성 불가

## HMAC

**해시 기반 MAC** - 표준 구성:

```
HMAC(k, m) = H( (k⊕opad) ‖ H( (k⊕ipad) ‖ m ) )
```

- 왜 이 복잡한 구조? **길이 확장 공격 방어**: 단순 `H(k‖m)`은 Merkle-Damgård([[cryptographic-hashes]])에서 위조 가능 → HMAC의 이중 해시가 막음
- 어떤 해시든 사용 가능 (HMAC-SHA256 등), 안전성 증명 있음
- **타이밍 공격 주의**: 태그 비교는 상수 시간(`compare_digest`) - 조기 종료하면 바이트별 시간 누출

## AEAD (인증 암호)

기밀성 + 무결성을 **한 번에** (Authenticated Encryption with Associated Data):

```
AEAD 암호화(key, nonce, 평문, 연관데이터) → (암호문, 태그)
- 평문: 암호화 + 인증
- 연관데이터(AD): 암호화 안 하지만 인증 (헤더·메타데이터)
```

- **GCM**(AES-GCM), **ChaCha20-Poly1305**: 현대 표준 ([[block-cipher-modes]])
- 암호화와 MAC을 따로 조합하는 실수를 방지 (하나의 검증된 프리미티브)
- TLS 1.3은 AEAD만 허용 (security/[[tls-deep-dive]])

## Encrypt-then-MAC (핵심 원칙)

암호화와 MAC을 조합하는 순서 - **틀리면 취약**:

```
Encrypt-then-MAC (안전) ✅: 암호화 후 암호문에 MAC → 태그부터 검증, 실패 시 복호 안 함
MAC-then-Encrypt:          평문에 MAC 후 암호화 (TLS 구버전, 패딩 오라클 위험)
Encrypt-and-MAC:           둘 따로 (평문 MAC 노출 위험)
```

- **Encrypt-then-MAC이 증명상 안전**: 유효하지 않은 암호문은 복호조차 안 함 → 오라클 공격 차단
- AEAD를 쓰면 이 순서가 내장됨 → 직접 조합할 필요 없음 (그래서 AEAD 권장)

## 서명과의 차이

```
MAC:  대칭 (공유 키) - 빠름, 부인방지 없음 (둘 다 키 가짐)
서명: 비대칭 (개인키 서명, 공개키 검증) - 느림, 부인방지 있음 (서명자만 개인키)
```

- 둘 다 무결성·인증, 하지만 MAC은 "우리 둘 사이", 서명은 "누구나 검증·서명자 특정" ([[public-key-crypto]], security/[[digital-signatures]])

## 왜 중요한가

- **암호화만으론 불충분**: "암호화했으니 안전"은 흔한 치명적 실수 (변조 가능)
- **AEAD가 기본**: 모든 신규 시스템은 AEAD ([[block-cipher-modes]], TLS)
- **API 토큰·쿠키**: HMAC으로 서명된 토큰(JWT 등) - 변조 감지 (web/[[web-auth]])

## 연결

- 암호화의 기밀성 한계 → [[symmetric-ciphers]], [[block-cipher-modes]]
- 해시·길이 확장 → [[cryptographic-hashes]]
- 서명 (비대칭 인증) → [[public-key-crypto]], security/[[digital-signatures]]
- TLS의 AEAD → security/[[tls-deep-dive]]
- 토큰 무결성 → web/[[web-auth]]

## 궁금한 것 (나중에)

- [ ] Poly1305 MAC 원리
- [ ] GCM nonce 재사용 취약점 (forbidden attack)
- [ ] 패딩 오라클 공격 (MAC-then-Encrypt)
- [ ] JWT 서명 알고리즘 혼동 공격 (alg=none)

## 출처

- Katz & Lindell 4장, "Serious Cryptography", Bellare HMAC 논문
