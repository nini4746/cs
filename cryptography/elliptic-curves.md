# 타원곡선 암호 (Elliptic Curves)

## 한 줄 요약

타원곡선 위 점들의 덧셈이라는 대수 구조에서 이산로그 문제를 세워, RSA보다 훨씬 짧은 키로 같은 안전성을 얻는 공개키 암호. 256비트 ECC ≈ 3072비트 RSA. 곡선 위 점 덧셈은 쉽지만 "몇 번 더했나"(스칼라)를 역산하기는 어렵다는 ECDLP에 안전성이 걸려 있다. 현대 TLS·서명의 기본.

## 왜 필요한가

- 왜 ECC가 RSA보다 짧은 키로 강한가
- 타원곡선에서 무슨 연산을 하나
- ECDH/ECDSA가 뭔가

## 왜 타원곡선인가

```
RSA 안전성: 소인수분해 → 준지수 알고리즘(GNFS) 존재 → 큰 키 필요(2048~4096비트)
ECC 안전성: 타원곡선 이산로그(ECDLP) → 준지수 알고리즘 없음(현재) → 짧은 키로 충분
```

- **키 크기 비교** (같은 보안 강도):
  - 128비트 보안: RSA 3072비트 vs **ECC 256비트**
  - 256비트 보안: RSA 15360비트 vs **ECC 512비트**
- 짧은 키 = 빠른 연산, 적은 대역폭·저장, 저전력 (모바일·IoT)

## 타원곡선과 점 덧셈

```
곡선: y² = x³ + ax + b  (유한체 위)
곡선 위 두 점 P, Q → 세 번째 점 R = P+Q (기하적 정의: 직선과 곡선의 교점)
```

- **점 덧셈이 군(group) 구조**: 결합법칙·항등원(무한원점)·역원 성립 (math/의 대수 구조)
- **스칼라 곱**: `kP = P+P+...+P` (k번) → 이게 "지수 연산" 역할
- 곱셈처럼 **kP 계산은 쉽지만** (double-and-add, 로그 시간), **P와 kP에서 k 찾기는 어려움**

## ECDLP (안전성 기반)

```
공개: 곡선, 기준점 G, 공개점 Q = kG
비밀: 스칼라 k
장애물: Q=kG에서 k 찾기 = 타원곡선 이산로그 (ECDLP) → 어려움
```

- [[diffie-hellman]]의 이산로그를 **곱셈군에서 타원곡선군으로** 옮긴 것
- ECDLP는 일반 DLP보다 어려움(준지수 공격 없음) → 그래서 짧은 키로 충분

## ECDH / ECDSA

DH·서명을 타원곡선으로:

- **ECDH**: [[diffie-hellman]]의 곡선판 - 각자 kG 공개, 공유 비밀 `k_A·k_B·G`
  - **ECDHE**(임시): 전방향 비밀성 → TLS 1.3 기본 (security/[[tls-deep-dive]])
- **ECDSA**: 타원곡선 디지털 서명 (security/[[digital-signatures]])
  - **주의: nonce 재사용·편향이 치명적** → 개인키 유출 (PS3, 비트코인 사고 사례) - RFC6979 결정적 nonce로 완화
- **EdDSA**(Ed25519): 최신 서명, ECDSA의 함정 개선 (결정적, 빠름, 안전)

## 실제 곡선들

```
NIST P-256(secp256r1): 널리 쓰임, 하지만 상수 출처 논란
Curve25519(X25519):    Bernstein, 빠르고 안전 설계 → 현대 표준 (TLS, SSH, Signal)
secp256k1:             비트코인·이더리움
```

- **Curve25519가 신뢰받음**: 잘못 구현하기 어렵게 설계 (nothing-up-my-sleeve 상수)

## 왜 중요한가

- **현대 기본**: TLS 1.3, SSH, Signal, 암호화폐가 다 ECC (RSA에서 이동)
- **효율**: 짧은 키 → 핸드셰이크 빠름, 모바일·IoT 친화 (network/[[tls]])
- **양자 취약은 동일**: ECC도 Shor 알고리즘에 깨짐 → 후양자로 이동 필요 ([[post-quantum-crypto]])

## 셀프 체크

> [!question]- 256비트 ECC가 3072비트 RSA와 같은 보안을 주는 이유는?
> RSA가 기대는 소인수분해에는 준지수 알고리즘(GNFS)이 있어 큰 키가 필요하지만, ECDLP에는 현재 준지수 공격이 없어 키 크기가 보안 강도의 약 2배면 충분하다.

> [!question]- 타원곡선에서 "지수 연산" 역할을 하는 것과 안전성 기반은?
> 스칼라 곱 kG(=기준점 G를 k번 더함)가 지수 역할을 한다. kG는 double-and-add로 쉽게 계산되지만, G와 kG에서 k를 찾는 ECDLP는 어렵다.

> [!question]- ECDSA에서 nonce가 치명적인 이유와 완화책은?
> nonce k를 재사용하거나 편향되면 두 서명에서 개인키가 대수적으로 복원된다(PS3, 비트코인 사고). RFC6979의 결정적 nonce나 EdDSA(Ed25519)로 완화한다.

> [!question]- Curve25519가 NIST P-256보다 신뢰받는 이유는?
> nothing-up-my-sleeve 상수로 출처가 투명하고, 잘못 구현하기 어렵게(상수시간 연산, 특수점 회피) 설계됐다. P-256은 상수 출처 논란이 있다.

## 연습문제

> [!example]- 문제: 서명자가 ECDSA에서 두 메시지에 같은 nonce k를 썼다. 두 서명 (r, s1), (r, s2)와 해시 z1, z2로부터 개인키 d를 복원하는 과정을 유도하라.
> **풀이**
> ECDSA에서 s = k⁻¹(z + r·d)이다.
> s1 - s2 = k⁻¹(z1 - z2) → k = (z1 - z2)/(s1 - s2).
> 이어서 s1 = k⁻¹(z1 + r·d)에서 d = (s1·k - z1)/r.
> r이 두 서명에서 같다는 것 자체가 k 재사용의 신호다 → 결정적 nonce(RFC6979)가 필수.

> [!example]- 문제: 128비트 보안을 위해 ECC 256비트를 쓰는데, 대규모 양자 컴퓨터가 등장하면 왜 이 이점이 무의미해지고 무엇으로 이동해야 하는지 논하라.
> **풀이**
> Shor 알고리즘이 이산로그와 소인수분해를 다항시간에 풀어 ECDLP·RSA가 키 크기와 무관하게 모두 붕괴한다.
> 짧은 키라는 ECC의 효율 이점도 안전성이 사라지면 의미가 없다.
> 격자 기반 등 후양자 암호(PQC)로 이동해야 하며, harvest-now-decrypt-later 때문에 전환은 조기에 시작해야 한다.

## 파인만

> [!note]- 백지에 왜 ECC가 짧은 키로 강한지, ECDH/ECDSA가 무엇인지 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) ECDLP와 준지수 공격 부재로 인한 키 크기 이점, (2) 스칼라 곱의 일방향성, (3) ECDSA nonce 함정과 완화책.

## 연결

- 이산로그의 곡선판 → [[diffie-hellman]]
- 공개키 원리 → [[public-key-crypto]]
- 서명 (ECDSA/EdDSA) → security/[[digital-signatures]]
- 대수 구조(군) → math/[[modular-arithmetic]]
- TLS·SSH 적용 → security/[[tls-deep-dive]], network/[[tls]]
- 양자 위협 → [[post-quantum-crypto]]
- Shor로 ECDLP 붕괴 → quantum-computing/[[shor-algorithm]]

## 궁금한 것 (나중에)

- [ ] 점 덧셈 공식 유도 (아핀·야코비안 좌표)
- [ ] 왜 secp256k1 vs Curve25519 (설계 차이)
- [ ] ECDSA nonce 공격 상세 (격자 기반 복원)
- [ ] 페어링 기반 암호 (BLS 서명, zk)

## 출처

- Katz & Lindell, Boneh-Shoup, "Serious Cryptography"(Aumasson), Bernstein Curve25519
