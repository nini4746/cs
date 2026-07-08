# 해싱 (Cryptographic Hashing)

## 한 줄 요약

임의 데이터를 고정 길이 지문으로 바꾸는 단방향 함수. 결정적이고 눈사태 효과가 있으며 되돌릴 수 없다. 무결성 검증·비밀번호 저장·서명의 기반. 데이터구조 해시([[hash-tables]])와 목적이 다르다.

## 왜 필요한가

- 암호학적 해시가 데이터구조 해시와 뭐가 다른가
- 무결성 검증·비밀번호 저장의 기반
- 왜 SHA-1/MD5를 쓰면 안 되나

## 암호학적 해시의 성질

`hash(데이터) → 고정 길이 값`. 네 가지 필수 성질:

1. **결정적(deterministic)**: 같은 입력 → 항상 같은 해시 (실측: True)
2. **단방향(one-way / preimage resistance)**: 해시에서 원본 복원 불가
3. **눈사태 효과(avalanche)**: 입력 1비트 바뀌면 출력 절반 바뀜
4. **충돌 저항(collision resistance)**: 다른 두 입력이 같은 해시 내기 어려움

실측 (SHA-256):
```
'hello' → 2cf24dba5fb0a30e...
'hellp' → fdd7585e08c4e2af...   ← 한 글자 차이인데 완전히 다름
```

'hello'와 'hellp'(한 글자 차이)의 해시가 전혀 안 비슷함 = 눈사태 효과. 원본을 추측 못 하게.

## 데이터구조 해시와 차이

data-structures/[[hash-tables]]의 해시와 **목적이 다름**:

| | 암호학적 해시 | 데이터구조 해시 |
|---|---|---|
| 목적 | 보안 (되돌리기 방지) | 속도 (버킷 분배) |
| 속도 | 느림 (의도적) | 빠름 |
| 충돌 | 극도로 어려움 | 허용 (체이닝) |
| 예 | SHA-256, SHA-3 | FNV, MurmurHash |

암호학적 해시는 **느린 게 장점**(무차별 대입 방어), 데이터구조 해시는 **빠른 게 장점**. SipHash(data-structures/[[hash-in-practice]])는 그 중간(빠르면서 DoS 저항).

## 해시 함수들

- **SHA-256, SHA-512** (SHA-2): 현재 표준. 안전
- **SHA-3**: 다른 설계 (Keccak), SHA-2 백업
- **BLAKE2/3**: 빠르고 안전 (현대)
- **MD5, SHA-1**: **깨짐** (충돌 발견됨) → 절대 보안 용도 금지. 체크섬 정도만

## 용도

### 무결성 검증

파일·메시지가 변조 안 됐나:
- 다운로드 파일의 해시 확인 (변조·손상 감지)
- Git 커밋 해시 (내용 지문 → devops/[[git-internals]])
- 블록체인, 콘텐츠 주소 저장

### 비밀번호 저장

**절대 평문 저장 금지** → 해시로 → [[password-storage]]:
- 비밀번호 해시를 저장, 로그인 시 해시 비교
- 단, 일반 해시(SHA-256)로는 부족 → salt + 느린 해시 (bcrypt/argon2) → [[password-storage]]

### 디지털 서명

큰 데이터를 서명하기 전 해시 → 해시를 서명 → [[digital-signatures]]:
- 데이터 전체 대신 해시(짧음)를 서명 → 효율

### 기타

- **HMAC**: 해시 + 키 → 메시지 인증 (무결성 + 인증)
- **머클 트리**: 해시의 트리 (블록체인, Git)
- **중복 제거**: 같은 해시 = 같은 데이터
- **캐시 키, 샤딩** (data-structures/[[partitioning-db]]의 consistent hashing)

## 충돌과 생일 공격

- **충돌**: 다른 두 입력이 같은 해시. 이론상 존재(비둘기집, math/[[combinatorics]]) but 찾기 어려워야
- **생일 공격**: n비트 해시는 2^(n/2)번 시도로 충돌 확률 50% (생일 역설, math/[[probability-basics]]) → 256비트면 2^128, 사실상 불가
- MD5/SHA-1은 이 저항이 깨짐 (실제 충돌 생성됨) → 금지

## 연결

- 데이터구조 해시 → data-structures/[[hash-tables]], [[hash-in-practice]]
- 비밀번호 → [[password-storage]]
- 서명 → [[digital-signatures]]
- Git 해시 → devops/[[git-internals]]
- 생일 공격 확률 → math/[[probability-basics]], [[combinatorics]]
- 블룸 필터도 해시 → data-structures/[[bloom-filter]]

## 궁금한 것 (나중에)

- [ ] Merkle-Damgård vs 스펀지 구조 (SHA-2 vs SHA-3)
- [ ] HMAC 구성 (왜 단순 hash(key+msg)가 아닌가)
- [ ] 머클 트리 상세
- [ ] length extension 공격

## 출처

- "Serious Cryptography" (Aumasson), 정보보호 교재
