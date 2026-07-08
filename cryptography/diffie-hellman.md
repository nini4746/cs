# 디피-헬만 키 교환 (Diffie-Hellman)

## 한 줄 요약

공개 채널로 도청자가 지켜보는 가운데 두 사람이 **공유 비밀을 만드는** 마법 - 각자 비밀 지수를 곱해도 지수 법칙 `(gᵃ)ᵇ=(gᵇ)ᵃ`이 성립해 같은 값에 도달한다. 안전성은 이산로그 문제(gᵃ에서 a 못 구함)에 의존한다. 인증이 없어 중간자 공격에 취약하므로 서명과 결합해야 한다.

## 왜 필요한가

- 사전 공유 없이 어떻게 공유 비밀을 만드나
- 이산로그 문제가 뭔가
- 왜 DH만으로는 부족한가 (MITM)

## 문제와 발상

```
공개 채널(도청됨)로 둘이 같은 비밀 키를 만들고 싶다
도청자가 오가는 모든 걸 봐도 그 비밀은 몰라야
```

- 1976년 공개키 혁명의 시작 ([[public-key-crypto]])
- 핵심: **지수 법칙의 교환성** `(gᵃ)ᵇ = gᵃᵇ = (gᵇ)ᵃ`

## 프로토콜

### 코드로 확인

```
공개 파라미터: p=23, g=5
Alice 비밀 a=6 -> 공개 A=8       (A = gᵃ mod p)
Bob   비밀 b=15 -> 공개 B=19      (B = gᵇ mod p)

Alice 계산 B^a mod p = 2          (= gᵇᵃ)
Bob   계산 A^b mod p = 2          (= gᵃᵇ)
공유 비밀 일치: True
```

단계:
```
1. 공개: 소수 p, 생성원 g (누구나 앎)
2. Alice: 비밀 a → 공개 A=gᵃ mod p 전송
3. Bob:   비밀 b → 공개 B=gᵇ mod p 전송
4. 각자: Alice는 Bᵃ, Bob은 Aᵇ → 둘 다 gᵃᵇ mod p (같은 비밀!)
```

- 비밀 a,b는 **절대 전송 안 됨** (각자 간직)
- 공유 비밀 gᵃᵇ로 대칭키 유도 → 이후 AES ([[symmetric-ciphers]])

## 안전성: 이산로그 문제

```
도청자가 보는 것: p, g, A=gᵃ, B=gᵇ
알고 싶은 것: gᵃᵇ
장애물: A=gᵃ에서 a를 구하려면 "이산로그" → 큰 p에선 어려움
```

- **이산로그 문제(DLP)**: `gᵃ mod p`는 쉽지만 역으로 a 찾기는 어려움 (일방향, [[public-key-crypto]]의 trapdoor 계열)
- **CDH 가정**(computational Diffie-Hellman): A,B에서 gᵃᵇ 계산이 어렵다
- 큰 p(2048비트+) 또는 타원곡선([[elliptic-curves]])에서 안전

## 치명적 약점: 중간자 공격 (MITM)

**DH는 인증이 없음** → 상대가 진짜인지 모름:

```
Alice ←→ [Mallory] ←→ Bob
Mallory가 각각과 따로 DH → 양쪽과 다른 공유키 → 중계하며 다 도청·변조
Alice는 Bob과 한다고 믿지만 실은 Mallory와
```

- DH 자체는 "누군가와 비밀을 만든다"만 보장, "그게 Bob이다"는 보장 못 함
- **해결: 인증 결합** → 공개값을 서명(security/[[digital-signatures]])하거나 인증서로 신원 확인 → 인증된 키 교환 ([[key-exchange-protocols]])

## 전방향 비밀성 (PFS, 핵심 이점)

DH의 큰 장점 - **임시(ephemeral) 키 교환**:

```
매 세션 새 임시 a,b 생성 → 세션 후 폐기 (DHE, ECDHE)
장기 개인키가 나중에 유출돼도 → 과거 세션 복호 불가
```

- 과거 트래픽을 저장해뒀다가 나중에 키 훔쳐도 못 깜 (각 세션 키가 독립)
- RSA 키 교환엔 없던 성질 → TLS 1.3이 ECDHE 필수화 (security/[[tls-deep-dive]])
- "지금 저장, 나중에 복호"(harvest now, decrypt later) 공격 방어의 핵심

## 왜 중요한가

- **TLS의 심장**: 모든 HTTPS 세션이 (EC)DHE로 키 교환 (security/[[tls-deep-dive]], network/[[tls]])
- **PFS 제공**: 장기 키 유출에도 과거 보호
- **공개키 암호의 원형**: 이산로그 계열(ElGamal, ECC, 서명)의 뿌리

## 연결

- 공개키 아이디어·trapdoor → [[public-key-crypto]]
- 타원곡선 버전 (ECDH) → [[elliptic-curves]]
- 유도한 키로 대칭 암호 → [[symmetric-ciphers]]
- MITM 방어 (인증) → [[key-exchange-protocols]], security/[[digital-signatures]]
- 모듈러 지수·이산로그 → math/[[modular-arithmetic]]
- TLS 적용·PFS → security/[[tls-deep-dive]], network/[[tls]]

## 궁금한 것 (나중에)

- [ ] index calculus (이산로그 최선 공격)
- [ ] 안전한 소수·생성원 선택 (작은 부분군 공격)
- [ ] MODP vs ECDHE 파라미터
- [ ] 삼자 이상 그룹 키 교환

## 출처

- Diffie & Hellman(1976), Katz & Lindell 10-11장, security/[[tls-deep-dive]]
