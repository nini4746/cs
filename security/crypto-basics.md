# 암호학 기초 (Cryptography Basics)

## 한 줄 요약

대칭 암호(AES)는 하나의 키로 빠르게 암/복호화하고, 비대칭 암호(RSA/ECC)는 공개/개인 키 쌍으로 키 교환을 푼다. 실무는 둘을 조합(하이브리드)한다 - 비대칭으로 키 나누고 대칭으로 데이터 암호화.

## 왜 필요한가

- 대칭/비대칭이 왜 둘 다 필요한가
- TLS(network/[[tls]])가 실제로 뭘 쓰나
- 암호학의 기본 도구들

## 대칭 암호 (symmetric)

**하나의 키로 암호화·복호화**:

```python
key = generate_key()            # 하나의 비밀 키
ciphertext = encrypt(key, msg)  # 같은 키로 암호화
plaintext = decrypt(key, ciphertext)  # 같은 키로 복호화
```

실측 (AES-256-GCM):
```
AES: 같은 키로 암/복호화 OK: secret message  (키 256bit)
```

- **AES**: 표준 대칭 암호 (블록 암호). GCM 모드는 암호화+무결성(인증)
- **빠름**: 하드웨어 가속(AES-NI, computer-architecture/[[isa-design]]) → 대량 데이터에 적합
- **문제**: 양쪽이 **같은 키를 안전하게 공유**해야 함 → 도청되는 네트워크에서 어떻게? → 비대칭이 해결

## 비대칭 암호 (asymmetric)

**공개키/개인키 쌍** - 공개키로 암호화하면 개인키로만 복호화:

```
공개키(public): 누구나 알아도 됨 (공개)
개인키(private): 비밀 (소유자만)

공개키로 암호화 → 개인키로만 복호화
개인키로 서명 → 공개키로 검증 ([[digital-signatures]])
```

- **RSA**: 큰 수 인수분해의 어려움에 기반 (math/[[modular-arithmetic]])
- **ECC(타원곡선)**: 더 짧은 키로 같은 보안 (RSA 2048 ≈ ECC 256) → 빠르고 작음, 현대 표준
- **느림**: 대칭보다 훨씬 → 대량 데이터엔 부적합
- **핵심 능력**: **키 교환** - 처음 보는 상대와 안전하게 (공개키는 공개해도 되니까)

### 왜 안전한가

비대칭은 **수학적 난제**에 기댐 → automata/[[complexity-classes]], algorithms/[[p-vs-np]]:
- RSA: 인수분해가 어려움 (큰 수를 소인수분해 못 함)
- ECC: 이산 로그가 어려움
- P≠NP(추정)에 의존 - 풀기는 어렵고 검증은 쉬움 → algorithms/[[p-vs-np]]
- 양자 컴퓨터가 이걸 깰 수 있음(Shor) → 양자 내성 암호(PQC) 연구 중

## 하이브리드: 둘의 조합

실무(TLS 등)는 **비대칭 + 대칭을 조합**:

```
1. 비대칭으로 대칭 키를 안전하게 교환 (느리지만 키 교환만)
2. 이후 데이터는 대칭 키로 암호화 (빠름)
```

- 비대칭의 안전한 키 교환 + 대칭의 속도 → 양쪽 장점
- network/[[tls]]의 핸드셰이크가 정확히 이것
- "왜 비대칭만 안 쓰나" = 느려서 (대량 데이터에 부적합)

## Diffie-Hellman 키 교환

비대칭의 특수 형태 - **공유 비밀을 만듦** (키를 전송 안 하고):

- 양쪽이 공개 값을 교환 → 각자 공유 비밀 계산 (도청자는 못 구함)
- **ECDHE**(타원곡선 + ephemeral): TLS 1.3의 키 교환, forward secrecy 제공 (network/[[tls]])
- 매번 임시 키 → 과거 통신이 미래 키 유출에 안전

## 암호학의 세 목표

- **기밀성(confidentiality)**: 암호화 (이 노트)
- **무결성(integrity)**: 변조 감지 → [[hashing]], MAC
- **인증(authentication)**: 신원 확인 → [[digital-signatures]]

TLS(network/[[tls]])가 셋 다 제공.

## 하지 말 것 (실무 원칙)

- **직접 암호 구현 금지**: 미묘한 실수가 치명적 → 검증된 라이브러리 (libsodium, 표준)
- **자체 암호 알고리즘 금지**: AES/RSA 같은 검증된 것만
- **오래된 것 금지**: MD5, SHA-1, DES, RC4는 깨짐
- **키 관리가 핵심**: 알고리즘보다 키 유출이 실제 위협 → [[secrets-management]]

## 연결

- 해싱·무결성 → [[hashing]]
- 서명·인증 → [[digital-signatures]]
- TLS 실전 → network/[[tls]], [[tls-deep-dive]]
- 수학적 기반 → math/[[modular-arithmetic]], algorithms/[[p-vs-np]]
- AES-NI 하드웨어 → computer-architecture/[[isa-design]]
- 키 관리 → [[secrets-management]]

## 궁금한 것 (나중에)

- [ ] AES 내부 (라운드, S-box)
- [ ] RSA 수학 (오일러 정리) → math/[[modular-arithmetic]]
- [ ] 양자 내성 암호 (PQC)
- [ ] 블록 암호 모드 (CBC, GCM, CTR)

## 출처

- "Serious Cryptography" (Aumasson), 정보보호 교재
