# 비밀번호 저장 (Password Storage)

## 한 줄 요약

비밀번호는 평문도 단순 해시도 안 된다. salt(사용자별 랜덤)로 레인보우 테이블을 막고, 느린 해시(bcrypt/argon2)로 무차별 대입을 막는다. work factor가 핵심.

## 왜 필요한가

- 왜 평문·SHA-256 저장이 위험한가
- salt와 느린 해시가 각각 뭘 막나
- DB 유출돼도 비밀번호를 지키는 법

## 절대 하지 말 것: 평문

비밀번호를 평문 저장 → DB 유출 시 모든 계정 즉시 탈취. 게다가 사용자가 여러 사이트에 같은 비번 재사용 → 연쇄 피해. **비밀번호는 저장하는 게 아니라 검증만** → 해시로.

## 부족함: 단순 해시

"해시하면 되지" (SHA-256, [[hashing]])? **부족**. 두 문제:

### 문제 1: 같은 비번 = 같은 해시 (레인보우 테이블)

실측:
```
SHA-256 (salt 없음):
  user1 "password123" → ef92b778bafe771e...
  user2 "password123" → ef92b778bafe771e...  ← 동일!
```

- 같은 비번이 같은 해시 → 공격자가 **미리 계산된 표(레인보우 테이블)**로 역조회
- 흔한 비번의 해시를 미리 계산해두면 유출된 해시를 즉시 매칭

### 문제 2: 해시가 빠름 (무차별 대입)

- SHA-256은 빠름([[hashing]]의 데이터구조 해시처럼) → 초당 수십억 개 시도 가능 (GPU)
- 약한 비번은 무차별 대입으로 금방 뚫림

## 해결 1: salt

**사용자마다 다른 랜덤 값**을 비번에 추가:

```
hash(salt + password)
```

실측:
```
salt 추가:
  user1 (salt1) → df618c3597847f9c...
  user2 (salt2) → e7b184f07df527e0...  ← 같은 비번인데 다름!
```

- 같은 비번이라도 salt가 달라 다른 해시 → **레인보우 테이블 무력화** (미리 계산 불가)
- salt는 비밀 아님 (해시와 함께 저장) - 목적은 각 해시를 유일하게
- 공격자가 각 사용자마다 따로 무차별 대입해야 → 비용↑

## 해결 2: 느린 해시 (work factor)

**의도적으로 느린 해시**로 무차별 대입을 비싸게:

실측:
```
PBKDF2 200k iterations: 23ms per hash
```

- 정상 로그인엔 23ms 무시할 만하지만, 무차별 대입엔 치명적 (초당 수십억 → 수십 개로)
- **work factor**: 반복 횟수·메모리를 조절 → 하드웨어 발전에 맞춰 올림
- 느린 게 **장점** ([[hashing]]의 암호학적 해시 정신)

## 비밀번호 해시 함수

전용 함수 사용 ([[crypto-basics]]의 "직접 만들지 마라"):

| 함수 | 특징 |
|---|---|
| **argon2** | 현대 권장 (메모리 하드 - GPU/ASIC 방어), 2015 PHC 우승 |
| **bcrypt** | 오래 검증됨, 널리 쓰임 |
| **scrypt** | 메모리 하드 |
| **PBKDF2** | 표준(FIPS), 메모리 하드 아님 (실측한 것) |

- **argon2 또는 bcrypt** 권장
- **메모리 하드**: 메모리를 많이 써서 GPU/ASIC 병렬화 방어 (argon2, scrypt)
- 이들은 salt + work factor를 **내장** → 직접 조합 안 해도 됨

## 종합: 올바른 방법

```
저장: argon2(password) → salt와 파라미터가 결과에 포함
검증: argon2.verify(저장된_해시, 입력_비번)
```

- 라이브러리가 salt 생성·work factor·검증을 다 처리
- 개발자는 argon2/bcrypt 라이브러리 호출만
- **직접 salt+hash 조합하지 말 것** (미묘한 실수 위험) → 검증된 라이브러리

## 추가 방어

- **비밀번호 정책**: 길이 우선 (복잡도보다), 유출된 비번 차단 (haveibeenpwned)
- **rate limiting**: 로그인 시도 제한 (온라인 무차별 대입 방어)
- **2FA/MFA**: 비번 외 추가 인증 → 유출돼도 방어
- **pepper**: salt에 더해 앱 전역 비밀 (DB와 분리 저장) → [[secrets-management]]

## 연결

- 해시 기초 → [[hashing]]
- 직접 만들지 마라 → [[crypto-basics]]
- 웹 인증 → web/[[web-auth]]
- pepper 관리 → [[secrets-management]]
- rate limiting → [[authn-authz-failures]]

## 궁금한 것 (나중에)

- [ ] argon2 파라미터 튜닝 (memory/time/parallelism)
- [ ] 메모리 하드 함수가 GPU를 막는 원리
- [ ] pepper vs salt 차이
- [ ] passkey/WebAuthn (비밀번호 없애기)

## 출처

- OWASP Password Storage Cheat Sheet, PHC (argon2)
