# 모듈러 산술 (Modular Arithmetic)

## 한 줄 요약

나머지 연산의 수학. 합동, 페르마 소정리, 모듈러 역원이 핵심이며, RSA 암호가 이 위에 세워진다. 해싱·순환 버퍼·체크섬에도 쓰인다.

## 왜 필요한가

- RSA 암호(security/[[crypto-basics]])가 왜 안전한가의 수학
- 해시·순환 버퍼의 mod 연산
- 정수 오버플로우가 mod인 이유

## 합동 (congruence)

`a ≡ b (mod n)`: a와 b를 n으로 나눈 나머지가 같음:

```
17 ≡ 5 (mod 12)   (둘 다 12로 나누면 나머지 5) - 시계
```

- **동치 관계**([[sets-relations-functions]]): 같은 나머지끼리 동치류 (0~n-1)
- CS: **정수 오버플로우 = mod 2^w** (computer-architecture/[[bits-and-integers]]), **해시 % 버킷**(data-structures/[[hash-tables]]), **순환 버퍼 % 크기**(data-structures/[[stacks-and-queues]])

## 모듈러 연산 성질

덧셈·곱셈이 나머지와 잘 맞음:

```
(a + b) mod n = ((a mod n) + (b mod n)) mod n
(a × b) mod n = ((a mod n) × (b mod n)) mod n
```

- 중간에 mod 취해도 결과 같음 → 큰 수 연산에서 오버플로우 방지 (매 단계 mod)
- 해싱·체크섬에서 활용

## 페르마 소정리 (Fermat's Little Theorem)

RSA의 핵심 - **p가 소수면**:

```
a^(p-1) ≡ 1 (mod p)    (a가 p의 배수 아니면)
```

실측 (p=7):
```
2^6 mod 7 = 1
3^6 mod 7 = 1
4^6 mod 7 = 1   ← 전부 1 (페르마)
```

- 소수 지수에서 거듭제곱이 1로 순환
- RSA·소수 판정(밀러-라빈)의 기반
- 일반화: 오일러 정리 (φ(n) 사용)

## 모듈러 역원 (modular inverse)

`a × a^(-1) ≡ 1 (mod n)`인 역원:

실측:
```
3^(-1) mod 7 = 5   (3×5 = 15 ≡ 1 mod 7)
```

- 나눗셈을 곱셈으로 (모듈러엔 나눗셈 없음 → 역원 곱)
- **확장 유클리드 알고리즘**으로 계산 (gcd)
- gcd(a,n)=1일 때만 존재 (서로소)
- **RSA 복호화 키**가 암호화 키의 모듈러 역원

## 고속 거듭제곱 (fast exponentiation)

`a^b mod n`을 빠르게 (RSA가 큰 수에도 실용적인 이유):

실측:
```
2^1000 mod 13 = 3   (즉시 계산)
```

- **제곱-곱(square-and-multiply)**: b를 이진수로 보고 제곱 반복 → O(log b)
- 순진하게 b번 곱하면 O(b) - 큰 지수에 불가능
- 매 단계 mod 취해 수를 작게 유지
- algorithms/[[divide-and-conquer]]의 분할 발상 (지수를 반으로)

## RSA의 수학 (개요)

security/[[crypto-basics]]의 RSA가 이 위에:

```
1. 큰 소수 p, q → n = pq
2. 공개키 e, 개인키 d (모듈러 역원 관계, φ(n) 사용)
3. 암호화: c = m^e mod n
4. 복호화: m = c^d mod n    (페르마/오일러로 원본 복원)
```

- **안전성**: n = pq에서 p, q를 **인수분해하기 어려움** (큰 수) → algorithms/[[p-vs-np]]
- 페르마 소정리가 복호화가 원본을 복원함을 보장
- 고속 거듭제곱으로 실용적 (큰 수인데도 빠름)

## CS 응용 (종합)

- **RSA 암호** → security/[[crypto-basics]], [[digital-signatures]]
- **해싱** → data-structures/[[hash-tables]] (% 버킷)
- **정수 오버플로우** → computer-architecture/[[bits-and-integers]] (mod 2^w)
- **순환 버퍼** → data-structures/[[stacks-and-queues]]
- **체크섬·라빈-카프** → algorithms/[[string-matching]] (rolling hash)
- **consistent hashing** → distributed-systems/[[partitioning]]

## 셀프 체크

> [!question]- a ≡ b (mod n)의 정확한 의미와 CS 응용은?
> a와 b를 n으로 나눈 나머지가 같다는 뜻이며, 같은 나머지끼리 동치류(0~n-1)를 이루는 동치 관계다. CS에서는 정수 오버플로우(mod 2^w), 해시 % 버킷, 순환 버퍼 % 크기가 모두 이 연산이다.

> [!question]- 페르마 소정리는 무엇이고 어디에 쓰이는가?
> p가 소수이고 a가 p의 배수가 아니면 a^(p-1) ≡ 1 (mod p)이다. 소수 지수에서 거듭제곱이 1로 순환한다는 성질로, RSA 복호화가 원본을 복원함을 보장하고 밀러-라빈 소수 판정의 기반이 된다. φ(n)을 쓰는 오일러 정리로 일반화된다.

> [!question]- 모듈러 역원은 언제 존재하며 어떻게 구하는가?
> a × a⁻¹ ≡ 1 (mod n)인 a⁻¹은 gcd(a, n) = 1(서로소)일 때만 존재한다. 확장 유클리드 알고리즘으로 계산한다. 모듈러 산술에는 나눗셈이 없으므로 역원을 곱하는 것이 나눗셈 역할을 하며, RSA 복호화 키가 암호화 키의 모듈러 역원이다.

> [!question]- 고속 거듭제곱이 왜 필요하고 어떻게 빠른가?
> a^b mod n을 순진하게 b번 곱하면 O(b)라 큰 지수에서 불가능하다. 제곱-곱(square-and-multiply)은 b를 이진수로 보고 제곱을 반복해 O(log b)로 계산한다. 매 단계 mod를 취해 수를 작게 유지하므로 RSA가 큰 수에도 실용적이다.

## 연습문제

> [!example]- 계산하라: 3의 modular inverse를 mod 7에서 구하라.
> **풀이**
> 3 × x ≡ 1 (mod 7)인 x를 찾는다. gcd(3, 7) = 1이라 존재한다.
> x = 1..6을 대입: 3×5 = 15 = 14 + 1 ≡ 1 (mod 7).
> 따라서 3⁻¹ ≡ 5 (mod 7).

> [!example]- 계산하라: 페르마 소정리로 3^100 mod 7을 구하라.
> **풀이**
> p = 7은 소수, 3은 7의 배수가 아니므로 3^6 ≡ 1 (mod 7).
> 지수를 6으로 나눈다: 100 = 6×16 + 4.
> 3^100 = (3^6)^16 × 3^4 ≡ 1^16 × 3^4 = 81 ≡ 81 − 77 = 4 (mod 7).
> 따라서 3^100 mod 7 = 4.

> [!example]- 증명하라: 곱셈이 나머지와 잘 맞음, 즉 (a × b) mod n = ((a mod n) × (b mod n)) mod n을 보여라.
> **풀이**
> a = q₁n + r₁, b = q₂n + r₂ (r₁ = a mod n, r₂ = b mod n)로 쓴다.
> a × b = (q₁n + r₁)(q₂n + r₂) = n(q₁q₂n + q₁r₂ + q₂r₁) + r₁r₂.
> 첫 항은 n의 배수라 mod n에서 사라진다. 따라서 (a × b) mod n = (r₁r₂) mod n = ((a mod n)(b mod n)) mod n. 이 성질 덕에 중간마다 mod를 취해 오버플로우를 막을 수 있다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1. 합동 ≡와 동치류 개념, 그리고 덧셈·곱셈이 mod와 잘 맞는 성질을 설명할 수 있는가?
> 2. 페르마 소정리와 모듈러 역원(존재 조건 gcd=1, 확장 유클리드로 계산)이 RSA의 암호화/복호화에 어떻게 쓰이는지 연결할 수 있는가?
> 3. 고속 거듭제곱(square-and-multiply)이 왜 O(log b)이고 RSA를 실용적으로 만드는지 말할 수 있는가?

## 연결

- 동치 관계 → [[sets-relations-functions]]
- RSA → security/[[crypto-basics]], [[digital-signatures]]
- 오버플로우 = mod → computer-architecture/[[bits-and-integers]]
- 해싱 → data-structures/[[hash-tables]]
- 인수분해 난이도 → algorithms/[[p-vs-np]]
- 고속 거듭제곱 = 분할 → algorithms/[[divide-and-conquer]]

## 궁금한 것 (나중에)

- [ ] 확장 유클리드 알고리즘 (역원 계산)
- [ ] 중국인의 나머지 정리 (CRT)
- [ ] 밀러-라빈 소수 판정 (확률적)
- [ ] 이산 로그 (ECC 기반) → security/[[crypto-basics]]

## 출처

- Rosen "Discrete Mathematics" 4장, RSA 논문
