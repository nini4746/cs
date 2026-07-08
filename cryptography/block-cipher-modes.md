# 블록 암호 운용 모드 (Block Cipher Modes)

## 한 줄 요약

블록 암호(AES)는 고정 블록 하나만 처리하므로, 긴 데이터를 안전하게 암호화하려면 운용 모드가 필요하다. ECB(각 블록 독립)는 같은 평문이 같은 암호문이 되어 패턴을 누출하는 치명적 결함이 있다. CTR/CBC는 IV·nonce로 매번 다른 암호문을 만들고, GCM은 여기에 무결성까지 더한 인증 암호다.

## 왜 필요한가

- 블록 하나 넘는 데이터를 어떻게 암호화하나
- 왜 ECB를 절대 쓰면 안 되나
- IV·nonce가 왜 필요한가

## 블록 암호의 한계

```
AES는 128비트(16바이트) 블록 하나만 → 그 이상은? 모드가 필요
```

- 긴 데이터를 블록으로 쪼개 어떻게 이어 암호화하나가 운용 모드
- 잘못 쓰면 강한 블록 암호도 무력화 (모드가 안전성 좌우)

## ECB: 하면 안 되는 것

**각 블록을 독립적으로 암호화** - 단순하지만 치명적:

### 코드로 확인

```
ECB 모드 (각 블록 독립):
  b'AAAAAAAA' -> 36112de0e644973e
  b'BBBBBBBB' -> 73f693226d5920b1
  b'AAAAAAAA' -> 36112de0e644973e   ← 같은 평문 = 같은 암호문
  → 블록1,3,4(AAAA) 암호문 동일: True  (패턴 누출!)
```

- **같은 평문 블록 → 항상 같은 암호문 블록** → 데이터 구조·반복이 그대로 보임
- 유명한 "ECB 펭귄": 이미지를 ECB로 암호화하면 윤곽이 그대로 드러남
- IND-CPA 위반 ([[symmetric-ciphers]]): 결정적이라 평문 정보 누출
- **결론: ECB 절대 금지** (거의 유일하게 "무조건 나쁨"인 것)

## IV / Nonce (핵심)

같은 평문도 매번 다른 암호문이 되게 하는 **초기값**:

```
IV(initialization vector) / nonce(number used once)
→ 각 암호화에 다른 IV → 확률적 암호화 (IND-CPA 달성)
```

- **재사용 금지**: nonce 재사용은 스트림 암호의 키 재사용 재앙과 같음 ([[symmetric-ciphers]]의 two-time pad)
- IV는 비밀일 필요 없음 (암호문과 함께 전송), 하지만 **유일·예측 불가**해야

## CTR 모드 (스트림처럼)

**nonce+카운터를 암호화해 키스트림 생성 → 평문과 XOR**:

### 코드로 확인

```
CTR 모드 (위치별 키스트림):
  b'AAAAAAAA' -> 657e0b0101631663
  b'AAAAAAAA' -> 679b9e94c98bff86   ← 같은 평문인데 다른 암호문!
  → 같은 AAAA여도 다른 암호문: True  (패턴 숨김)
```

- 위치(카운터)마다 다른 키스트림 → 같은 평문도 다른 암호문 (패턴 숨김)
- **병렬화 가능**: 각 블록 독립 계산 ([[block-cipher-modes]]가 [[parallel-patterns]]의 map처럼)
- **랜덤 접근**: 특정 블록만 복호 가능 (디스크 암호화)
- 블록 암호를 스트림 암호로 바꾸는 모드

## CBC 모드 (체이닝)

**이전 암호문 블록을 다음 평문에 XOR 후 암호화**:

```
c[i] = E(m[i] ⊕ c[i-1]),  c[0]은 IV와 XOR
```

- 블록이 사슬처럼 연결 → 패턴 숨김
- **순차적**(이전 블록 필요, 병렬 암호화 불가), 복호는 병렬 가능
- 패딩 필요 → **패딩 오라클 공격** 위험 (security/의 실무 취약점)
- 요즘은 CTR/GCM 선호

## GCM: 인증 암호 (현대 표준)

CTR + 무결성 - **암호화와 인증을 동시에** (AEAD):

```
GCM = CTR 모드 암호화 + GHASH 인증 태그
→ 기밀성 + 무결성 + 인증 (변조 감지)
```

- 단순 암호화는 **변조를 못 막음** (공격자가 암호문 비트 뒤집기 가능) → 인증 태그 필수
- **AEAD**(Authenticated Encryption with Associated Data): 헤더는 인증만, 본문은 암호화+인증 → [[mac-and-aead]]
- TLS 1.3의 기본 (security/[[tls-deep-dive]]), 대부분 신규 시스템의 선택

## 모드 선택 (실무 요약)

```
ECB:  절대 금지
CBC:  레거시, 패딩 오라클 주의
CTR:  병렬·랜덤접근, 하지만 인증 별도 필요
GCM/ChaCha20-Poly1305: 기본 선택 (AEAD, 인증 포함) ✅
```

- "암호화만 하고 인증 안 함"은 흔한 치명적 실수 → **항상 AEAD** ([[mac-and-aead]]의 encrypt-then-MAC)

## 왜 중요한가

- **강한 암호도 모드가 망침**: AES-256도 ECB면 취약
- **IND-CPA의 실현**: IV/nonce가 확률적 암호화를 만듦 ([[symmetric-ciphers]])
- **AEAD가 현대 기본**: 기밀성만으론 부족, 무결성 필수 (실무 보안 security/)

## 연결

- 블록 암호·IND-CPA → [[symmetric-ciphers]]
- 인증 암호·encrypt-then-MAC → [[mac-and-aead]]
- nonce 재사용 = 키 재사용 재앙 → [[symmetric-ciphers]]
- CTR 병렬성 → concurrency-parallelism/[[parallel-patterns]]
- 실무 적용·패딩 오라클 → security/[[crypto-basics]], [[tls-deep-dive]]

## 궁금한 것 (나중에)

- [ ] 패딩 오라클 공격 상세 (CBC)
- [ ] GCM의 GHASH·nonce 재사용 취약점
- [ ] XTS 모드 (디스크 암호화)
- [ ] nonce misuse-resistant 암호 (SIV)

## 출처

- Katz & Lindell 3-4장, NIST SP 800-38 시리즈, Boneh-Shoup
