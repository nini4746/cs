# 대칭 암호 (Symmetric Ciphers)

## 한 줄 요약

같은 키로 암호화·복호화하는 암호. 이론적 완벽함(One-Time Pad)은 키가 메시지만큼 길어 비실용적이라, 짧은 키로 무작위처럼 보이는 **의사난수 순열(PRP)**을 쓰는 블록 암호(AES)로 타협한다. 안전성의 정의는 "암호문이 평문에 대해 아무것도 안 흘린다"(IND-CPA)이며, 완벽 비밀성과 계산적 안전성의 차이가 현대 암호의 출발점.

## 왜 필요한가

- 완벽한 암호(OTP)가 왜 안 쓰이나
- 블록 암호가 실제로 뭘 보장하나 (PRP)
- "안전하다"를 어떻게 정의하나

## One-Time Pad: 완벽하지만 비실용

**평문을 무작위 키와 XOR** - 정보이론적으로 깨질 수 없음:

```
c = m ⊕ k   (k는 무작위, 메시지 길이, 1회용)
```

### 코드로 확인

```
평문:   b'HELLO'
암호문: ad4ac2568f
복호:   b'HELLO'  (일치: True)
```

- **완전 비밀성(perfect secrecy)**: 암호문이 평문에 대해 **정보 0** (information-theory/[[mutual-information]]의 I=0) - Shannon 증명
- 어떤 계산력으로도 못 깸 (통계적으로 불가능)

### 왜 안 쓰나 (세 치명적 제약)

```
1. 키가 메시지만큼 길다 (1GB 파일 → 1GB 키) - 키 전달이 메시지 전달만큼 어려움
2. 키 재사용 금지 (아래 - 재앙)
3. 키가 진짜 무작위여야
```

키 재사용의 재앙 (two-time pad):
```
키 재사용: c1 XOR c2 = m1 XOR m2 (키 사라짐!)
m1 안다면 m2 일부 복원: b'defend the bas'
```
- 두 암호문을 XOR하면 **키가 소거**되고 평문끼리 XOR만 남음 → 통계·기지평문 공격으로 복원
- 역사적 실패: 소련 VENONA (OTP 키 재사용 → 미국이 해독)

## 완벽 비밀성 vs 계산적 안전성 (핵심 전환)

```
완벽 비밀성(OTP): 무한 계산력에도 안전, 하지만 키 = 메시지 길이 (Shannon 하한)
계산적 안전성:   "현실적 시간 안엔 못 깬다" → 짧은 키 가능 (현대 암호)
```

- Shannon: 완벽 비밀성엔 키 ≥ 메시지 (피할 수 없음)
- 타협: **계산적으로만** 안전하면 됨 → 짧은 키(128비트)로 실용적 암호 (계산 복잡도에 의존)

## 블록 암호 (AES)

**고정 크기 블록을 의사난수 순열로** 변환:

```
AES: 128비트 블록, 128/192/256비트 키
키마다 다른 "무작위처럼 보이는 순열"(PRP, pseudorandom permutation)
```

- **PRP/PRF**: 키를 모르면 진짜 무작위 순열과 구별 불가 (안전성의 형식적 기반)
- 구조: **SPN**(substitution-permutation network) - 치환(혼돈)·순열(확산) 라운드 반복
  - **혼돈(confusion)**: 키와 암호문 관계 복잡 (S-box)
  - **확산(diffusion)**: 평문 한 비트가 암호문 전체에 퍼짐
- **Feistel 구조**(DES): 블록을 반으로 나눠 라운드 (복호 = 암호 역순, 구현 재사용)
- 블록 하나만으로는 부족 → 운용 모드로 긴 데이터 처리 ([[block-cipher-modes]])

## 스트림 암호

**키스트림을 생성해 XOR** (OTP를 흉내, 키는 짧게):

```
짧은 키 → PRNG로 긴 의사난수 키스트림 → 평문과 XOR
```

- ChaCha20, (구) RC4
- OTP처럼 XOR하지만 키스트림이 의사난수 → 계산적 안전
- **nonce 재사용 금지**: 같은 키스트림 재사용 = two-time pad 재앙 (위와 동일)

## 안전성 정의: IND-CPA

"안전하다"의 형식적 정의 (게임 기반):

```
IND-CPA: 공격자가 두 평문을 고르고, 하나가 암호화됨
        → 어느 쪽인지 1/2보다 유의미하게 잘 못 맞히면 안전
```

- **의미**: 암호문이 평문에 대해 **아무것도 안 흘림** (같은 평문도 매번 다른 암호문 → 확률적 암호화 필요, IV/nonce)
- 그래서 결정적 ECB 모드는 안전하지 않음 ([[block-cipher-modes]])
- 더 강한 정의: IND-CCA (선택 암호문 공격 저항) → [[mac-and-aead]]

## 왜 중요한가

- **모든 암호의 절반**: TLS·디스크 암호화·VPN의 데이터 암호화 (security/[[tls-deep-dive]])
- **공개키보다 빠름**: 대칭이 훨씬 빠름 → 공개키로 대칭키 교환 후 대칭으로 데이터 ([[public-key-crypto]]의 하이브리드)
- **정의의 중요성**: "안전"을 정의해야 증명 가능 (현대 암호의 방법론)

## 연결

- 완전 비밀성 = 정보 0 → information-theory/[[mutual-information]], [[entropy-and-information]]
- 운용 모드 → [[block-cipher-modes]]
- 공개키와 하이브리드 → [[public-key-crypto]]
- 인증 암호(무결성 추가) → [[mac-and-aead]]
- 응용 (실무) → security/[[crypto-basics]], [[tls-deep-dive]]
- 무작위성·엔트로피 → information-theory/[[entropy-and-information]]

## 궁금한 것 (나중에)

- [ ] AES 라운드 상세 (SubBytes/ShiftRows/MixColumns)
- [ ] PRP/PRF 전환 정리 증명
- [ ] ChaCha20 설계 (ARX)
- [ ] 차분·선형 공격 (블록 암호 분석)

## 출처

- Katz & Lindell 2-3장, Boneh-Shoup, Shannon "Communication Theory of Secrecy Systems"(1949)
