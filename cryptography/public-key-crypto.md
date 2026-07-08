# 공개키 암호 (Public-Key Cryptography)

## 한 줄 요약

암호화 키(공개)와 복호화 키(비밀)를 분리해, 사전 공유 비밀 없이 안전하게 통신하는 혁명. 한쪽 방향은 쉽고 역방향은 어려운 **일방향 trapdoor 함수**(RSA는 소인수분해)에 기댄다. 느리므로 실제론 대칭키를 교환하는 데만 쓰고(하이브리드), 서명에도 쓴다. 안전성은 수학 난제의 어려움에 의존한다.

## 왜 필요한가

- 대칭 암호의 키 배분 문제를 어떻게 푸나
- RSA가 실제로 어떻게 동작하나
- 무엇의 어려움에 안전성이 걸려 있나

## 문제: 키 배분

대칭 암호([[symmetric-ciphers]])의 근본 난제:

```
대칭키는 양쪽이 같은 비밀을 미리 공유해야 함
→ 그 비밀을 어떻게 안전하게 전달? (닭과 달걀)
n명이 서로 통신하려면 n(n-1)/2개 키 (폭발)
```

- 공개키의 해법: **암호화 키를 공개**해도 됨 (그걸로는 복호 못 하니까)

## 공개키의 아이디어 (Diffie-Hellman-Merkle 1976)

```
공개키(public): 누구나 알아도 됨 → 암호화·서명 검증용
개인키(private): 나만 아는 비밀 → 복호·서명용
공개키로 암호화한 건 개인키로만 복호 (역은 서명)
```

- 열린 자물쇠(공개키)를 나눠주고, 열쇠(개인키)는 나만 가짐
- **비대칭**: 두 키가 수학적으로 짝이지만 공개키에서 개인키를 못 구함

## Trapdoor 일방향 함수 (핵심)

공개키를 떠받치는 수학 구조:

```
일방향 함수: 계산은 쉽고 역산은 어려움 (곱셈 쉽고 소인수분해 어렵)
trapdoor:   비밀(trapdoor)을 알면 역산도 쉬움
```

- RSA: **곱셈은 쉽지만 소인수분해는 어렵다** (p·q=n은 쉽고, n→p,q는 어려움)
- 개인키 = trapdoor (비밀 소수를 알면 복호 쉬움)

## RSA 상세

### 코드로 확인 (교과서 RSA, 소규모)

```python
p, q = 61, 53;  n = p*q          # 공개 모듈러스
phi = (p-1)*(q-1);  e = 17        # 공개 지수
d = modinv(e, phi)                # 개인 지수 (e의 역원 mod phi)
c = pow(m, e, n)                  # 암호화
m = pow(c, d, n)                  # 복호
```

실행:
```
공개키 (n=3233, e=17),  개인키 d=2753
평문 65 -> 암호문 2790 -> 복호 65  (일치: True)
서명 588 -> 검증 65  (원본 65과 일치: True)
```

동작 원리 (math/[[modular-arithmetic]]):
- **키 생성**: 두 소수 p,q → n=pq, φ(n)=(p-1)(q-1), e 고르고 d=e⁻¹ mod φ
- **암복호**: `c=mᵉ mod n`, `m=cᵈ mod n` (오일러 정리로 `mᵉᵈ≡m`)
- **서명은 반대**: 개인키 d로 서명, 공개키 e로 검증 ([[mac-and-aead]], security/[[digital-signatures]])

### 안전성 가정

- **소인수분해 어려움**: n을 p,q로 분해하면 φ(n) 계산 → d 복원 → 깨짐
- 2048비트+ n이면 현재 계산력으로 분해 불가 (하지만 양자컴퓨터는 Shor로 깸 → [[post-quantum-crypto]])
- **교과서 RSA는 안전하지 않음**: 결정적(IND-CPA 위반), 패딩 필요 (OAEP) → 실무는 패딩 스킴 필수

## 하이브리드 암호 (실무)

공개키는 **느리다** → 대칭키 교환에만:

```
1. 공개키로 대칭 세션키를 암호화해 전달 (또는 키 교환 [[diffie-hellman]])
2. 이후 데이터는 빠른 대칭키(AES)로 ([[symmetric-ciphers]])
```

- 공개키의 편리함(키 배분) + 대칭키의 속도 → 둘의 장점
- TLS가 정확히 이 구조 (security/[[tls-deep-dive]])

## 안전성은 수학 난제에 의존

공개키 암호의 특징 - **계산 난제 위에 서 있음**:

```
RSA:         소인수분해 (integer factorization)
Diffie-Hellman/ECC: 이산로그 (discrete log) → [[diffie-hellman]], [[elliptic-curves]]
격자 기반:    최단 벡터 문제 (양자 저항) → [[post-quantum-crypto]]
```

- 이 난제들이 "쉬워지면"(알고리즘 발견·양자컴퓨터) 암호가 깨짐
- 그래서 난제 다양화·후양자 대비 ([[post-quantum-crypto]])

## 왜 중요한가

- **인터넷 보안의 토대**: TLS·SSH·서명·인증서가 다 공개키 (security/[[tls-deep-dive]])
- **키 배분 해결**: 사전 공유 없이 낯선 상대와 안전 통신 (전자상거래 가능케 함)
- **서명·부인방지**: 개인키 서명으로 신원·무결성 (security/[[digital-signatures]], devops/[[git-workflows]]의 커밋 서명)

## 연결

- 대칭 암호와 하이브리드 → [[symmetric-ciphers]]
- 모듈러 산술·오일러 정리 → math/[[modular-arithmetic]]
- 이산로그 기반 → [[diffie-hellman]], [[elliptic-curves]]
- 서명 → [[mac-and-aead]], security/[[digital-signatures]]
- 실무 TLS → security/[[tls-deep-dive]]
- 양자 위협 → [[post-quantum-crypto]]

## 궁금한 것 (나중에)

- [ ] OAEP 패딩 (안전한 RSA)
- [ ] RSA 대 ElGamal 비교
- [ ] CRT로 RSA 복호 가속
- [ ] 왜 e=65537을 흔히 쓰나

## 출처

- Diffie-Hellman(1976), RSA(1978), Katz & Lindell 8·11장, math/[[modular-arithmetic]]
