# 암호학적 해시 (Cryptographic Hashes)

## 한 줄 요약

임의 길이 입력을 고정 길이 출력으로 압축하되, 되돌리기·충돌 만들기가 계산적으로 불가능한 함수. 세 저항성(역상·제2역상·충돌)이 핵심이고, 충돌은 생일 역설 때문에 출력이 n비트여도 **2^(n/2)** 시도면 발견 가능하다(그래서 256비트를 씀). Merkle-Damgård·sponge 두 구조가 있고, 무결성·서명·블록체인의 토대.

## 왜 필요한가

- 암호학적 해시가 일반 해시와 뭐가 다른가 (data-structures/[[hash-tables]])
- 세 저항성이 뭔가
- 왜 SHA-256은 256비트인가 (생일 공격)

## 일반 해시 vs 암호학적 해시

```
일반 해시(hash table): 빠르고 고르게 분산 → data-structures/[[hash-tables]]
암호학적 해시: 위 + 악의적 공격자가 못 뒤집고 못 충돌시킴 (보안 성질)
```

- 암호학적 해시는 **속도가 목적이 아님** (오히려 password는 느려야 - security/[[password-storage]])
- SHA-256, SHA-3, BLAKE2/3

## 세 가지 저항성 (핵심 정의)

```
1. 역상 저항(preimage): 해시 h가 주어져도 h=H(m)인 m 못 찾음 (일방향)
2. 제2역상 저항(2nd preimage): m이 주어져도 H(m)=H(m') 인 다른 m' 못 찾음
3. 충돌 저항(collision): H(m1)=H(m2)인 어떤 쌍도 못 찾음 (가장 강한 요구)
```

- 충돌 저항 ⟹ 제2역상 저항 (충돌이 더 어려움)
- 이 성질들이 무결성·서명·커밋먼트를 가능케 함

## 생일 공격 (왜 256비트인가)

충돌 저항의 한계 - **생일 역설**:

```
n비트 해시:
  역상 공격: ~2^n 시도 (전수)
  충돌 공격: ~2^(n/2) 시도 (생일 역설 - 훨씬 적음!)
```

### 코드로 확인 (24비트 해시)

```
충돌! '390' 와 '2799' 가 같은 24비트 해시 0xe90924
시도 횟수: 2,799
이론 ~2^(24/2)=2^12=4,096  (전수 2^24=16,777,216보다 훨씬 적음)
```

- 24비트 해시 충돌을 **2799번**만에 발견 (전수 1670만의 0.02%)
- 생일 역설: 23명만 모여도 생일 겹칠 확률 50% → 충돌은 제곱근으로 쉬워짐 (math/[[probability-basics]])
- **함의**: 충돌 저항 128비트를 원하면 → **출력 256비트** 필요 (그래서 SHA-256)
- 역상만 필요하면 절반이어도 되지만, 서명 등은 충돌 저항 필요 → 넉넉히

## 구조

### Merkle-Damgård (SHA-1/2, MD5)

```
메시지를 블록으로 → 압축 함수를 반복 체이닝 → 최종 해시
```

- **길이 확장 공격(length extension)**: H(m)에서 H(m‖extra)를 계산 가능 → MAC에 쓸 때 취약 → HMAC으로 방어 ([[mac-and-aead]])
- MD5·SHA-1은 **충돌 깨짐**(실제 충돌 생성됨) → 사용 금지, SHA-256은 안전

### Sponge (SHA-3/Keccak)

```
상태에 흡수(absorb) → 짜냄(squeeze) → 가변 길이 출력 가능
```

- 길이 확장 공격 면역 (다른 구조)
- SHA-3는 SHA-2 대안 (SHA-2가 깨질 경우 대비)
- BLAKE3는 빠르고 병렬화 (트리 해시, concurrency-parallelism/[[parallel-patterns]])

## 용도

- **무결성**: 파일·다운로드 검증 (변조 감지) - security/[[hashing]]
- **서명**: 메시지 해시에 서명 (긴 메시지 대신 해시, [[public-key-crypto]], security/[[digital-signatures]])
- **커밋먼트**: 값을 숨기고 나중에 공개 → [[commitment-and-secret-sharing]]
- **블록체인**: 블록 체이닝·작업증명 (해시 퍼즐)
- **Merkle 트리**: 대량 데이터 무결성 (git 객체 devops/[[git-internals]], 분산 시스템)
- **비밀번호**: 전용 느린 해시(bcrypt/argon2) - 일반 해시와 다름 (security/[[password-storage]])

## 왜 중요한가

- **디지털 신뢰의 바닥**: 서명·인증서·블록체인·git이 다 해시 위
- **정의의 명확성**: 세 저항성으로 "안전한 해시"를 정의 → 공격을 정량화 (생일 공격)
- **깨지면 연쇄 붕괴**: MD5/SHA-1 충돌이 실제 공격으로 (위조 인증서 등)

## 연결

- 일반 해시 → data-structures/[[hash-tables]]
- 생일 역설·확률 → math/[[probability-basics]]
- HMAC (길이 확장 방어) → [[mac-and-aead]]
- 서명에서 해시 → [[public-key-crypto]], security/[[digital-signatures]]
- 커밋먼트 → [[commitment-and-secret-sharing]]
- 무결성·비밀번호 (응용) → security/[[hashing]], [[password-storage]]
- git 객체·Merkle → devops/[[git-internals]]

## 궁금한 것 (나중에)

- [ ] SHA-1 충돌 공격 상세 (SHAttered)
- [ ] Keccak sponge 내부
- [ ] Merkle 트리·Merkle 증명
- [ ] argon2 vs bcrypt (메모리 하드 함수)

## 출처

- Katz & Lindell 6장, "Serious Cryptography"(Aumasson), NIST SHA-3
