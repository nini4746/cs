# 비트와 정수 표현 (Bits and Integers)

## 한 줄 요약

컴퓨터의 정수는 수학의 정수가 아니다. 고정 폭 비트 패턴 위의 모듈러 연산이고, 그 차이에서 실전 버그가 나온다.

## 왜 필요한가

`int`가 "그냥 숫자"라고 믿으면 당하는 것들:

- `INT_MAX + 1`이 음수가 되거나, 컴파일러가 그 코드를 통째로 지워버림 (UB)
- `-1 < 0U`가 거짓
- 유명 사례: JDK 이진 탐색이 9년간 `(low + high) / 2` 오버플로우 버그를 품고 있었음

정수의 실체 = **고정 폭(w비트) 비트 패턴** + **해석 규칙 (unsigned / 2의 보수)**. 이 두 가지만 정확히 알면 위 현상이 전부 필연으로 보인다.

## 비트, 워드, 16진수

- 메모리는 바이트(8비트) 단위 주소. 레지스터는 워드(현대 64비트) 단위
- 16진수는 비트 패턴의 축약 표기: 16진수 한 자리 = 4비트. `0xF3` = `1111 0011`
- C 타입 폭 (LP64 기준): `char` 1B, `short` 2B, `int` 4B, `long` 8B, 포인터 8B

### 엔디언 (endianness)

멀티바이트 값을 메모리에 놓는 바이트 순서:

- **리틀 엔디언** (x86, ARM 기본): 최하위 바이트가 낮은 주소. `0x01020304` → 메모리에 `04 03 02 01`
- **빅 엔디언**: 그 반대. 네트워크 바이트 순서가 빅 엔디언 → `htonl`/`ntohl`이 존재하는 이유

같은 머신끼리는 신경 쓸 일 없고, **바이트 단위로 재해석할 때** (네트워크 전송, 파일 포맷, 캐스팅) 문제가 된다.

## 비트 연산

| 연산 | 기호 | 용도 |
|---|---|---|
| AND | `&` | 마스킹 (특정 비트 추출) |
| OR | `\|` | 비트 켜기 |
| XOR | `^` | 비트 토글, 같으면 0 |
| NOT | `~` | 전 비트 반전 |
| 좌 시프트 | `<<` | ×2ᵏ |
| 우 시프트 | `>>` | ÷2ᵏ (내림) - 단, 두 종류 있음 ↓ |

### 시프트 두 종류

- **논리 우 시프트**: 왼쪽을 0으로 채움. unsigned에 사용
- **산술 우 시프트**: 왼쪽을 부호 비트로 채움. signed에 사용 (음수 유지)

C에서 `>>`는 unsigned면 논리, signed면 (사실상 모든 컴파일러에서) 산술. 시프트 양이 폭 이상이면 (`x << 64`) UB.

### 자주 쓰는 비트 트릭

```c
x & (x - 1)         // 최하위 1비트 끄기. 0이면 x는 2의 거듭제곱 (x != 0 전제)
x & -x              // 최하위 1비트만 남기기 (펜윅 트리의 핵심)
x ^ x               // 항상 0. 레지스터 제로화 (xor eax, eax)
__builtin_popcount(x)  // 1비트 개수 (하드웨어 명령)
```

## 부호 없는 정수 (unsigned)

w비트 unsigned = 그냥 이진수. 범위 [0, 2ʷ−1].

연산의 실체: **mod 2ʷ 산술**. `UINT_MAX + 1 == 0`은 버그가 아니라 정의된 동작 (wrap-around). 덧셈은 2ʷ 시계 위를 도는 것.

## 2의 보수 (two's complement)

signed 정수의 사실상 유일한 표현 (C23부터는 표준이 아예 강제). 정의: 최상위 비트의 가중치만 음수.

```
w=4 예: b₃b₂b₁b₀ 의 값 = -8·b₃ + 4·b₂ + 2·b₁ + 1·b₀
1011 = -8 + 2 + 1 = -5
```

이 설계가 이긴 이유:

1. **덧셈 회로가 unsigned와 동일** - 부호 구분 없이 같은 가산기 사용, 해석만 다름
2. **0이 하나** (부호-크기 표현은 +0/-0 두 개)
3. 부정 연산이 간단: `-x == ~x + 1`

### 범위 비대칭과 INT_MIN

w=32: 범위 [−2³¹, 2³¹−1] = [-2147483648, 2147483647]. 음수가 하나 더 많다.

따라서 `-INT_MIN`은 표현 불가 → 결과가 다시 INT_MIN (그리고 signed 오버플로우라 UB). `abs()`가 음수를 반환할 수 있는 유일한 입력.

## 변환: 캐스팅은 비트를 안 바꾼다

같은 폭의 signed ↔ unsigned 캐스팅 = **비트 패턴 유지, 해석만 변경**.

```
(unsigned)-1 == 0xFFFFFFFF == UINT_MAX
```

### C의 함정: 암묵적 변환

signed와 unsigned가 한 식에 섞이면 **signed가 unsigned로 변환**된다:

```c
-1 < 0U        // 거짓! -1이 UINT_MAX로 변환됨
sizeof 반환값은 unsigned(size_t) →
for (int i = 0; i < v.size() - 1; i++)  // v 비어있으면 size()-1 == SIZE_MAX, 대참사
```

### 폭 변환

- **확장** (작은 → 큰): unsigned는 0 채움 (zero extension), signed는 부호 비트 복사 (sign extension). 값 보존
- **절단** (큰 → 작은): 상위 비트 버림 = mod 2ʷ. 값 바뀔 수 있음

## 오버플로우

| | unsigned | signed |
|---|---|---|
| 오버플로우 시 | wrap (mod 2ʷ), **정의됨** | **UB (undefined behavior)** |

signed 오버플로우가 UB인 것의 진짜 의미: 컴파일러가 "오버플로우는 절대 없다"고 **가정하고 최적화**한다.

```c
// 컴파일러는 이 함수를 통째로 "return 1"로 접는다.
// x + 1 > x 는 수학적으로 항상 참이니까 (오버플로우 없다고 가정했으므로)
int always_true(int x) { return x + 1 > x; }
// always_true(INT_MAX) → 1. 런타임에 wrap될 거라는 기대는 배신당함
```

### 실전 버그 패턴

```c
// JDK 이진 탐색 버그 (2006년 발견, 9년 잠복)
int mid = (low + high) / 2;        // low + high가 INT_MAX 초과 가능
int mid = low + (high - low) / 2;  // 수정판
```

곱셈도 위험: `malloc(n * sizeof(T))`에서 `n * sizeof(T)`가 wrap하면 작은 버퍼 할당 → 힙 오버플로우 (실제 CVE 단골). 검사 후 곱하거나 `calloc` 사용.

## 코드로 확인

```c
#include <stdio.h>
#include <limits.h>

int main(void) {
    // 1. 암묵적 변환: -1이 unsigned로 바뀜
    printf("-1 < 0U          : %d\n", -1 < 0U);              // 0 (거짓!)
    printf("(unsigned)-1     : %u\n", (unsigned)-1);          // 4294967295

    // 2. 범위 비대칭
    printf("INT_MIN          : %d\n", INT_MIN);
    printf("-INT_MIN (UB)    : %d\n", -INT_MIN);              // 그대로 INT_MIN

    // 3. 산술 vs 논리 우 시프트
    int neg = -8;
    printf("-8 >> 1          : %d\n", neg >> 1);              // -4 (산술: 부호 유지)
    printf("(unsigned)-8 >> 1: %u\n", (unsigned)neg >> 1);    // 2147483644 (논리)

    // 4. 엔디언 확인: 0x01020304를 바이트 단위로 읽기
    unsigned x = 0x01020304;
    unsigned char *p = (unsigned char *)&x;
    printf("bytes in memory  : %02x %02x %02x %02x\n", p[0], p[1], p[2], p[3]);
    // 리틀 엔디언이면 04 03 02 01

    // 5. 비트 트릭
    printf("64 is pow2       : %d\n", 64 && !(64 & 63));      // 1
    printf("popcount(0xFF)   : %d\n", __builtin_popcount(0xFF)); // 8
    return 0;
}
```

```bash
gcc -O1 bits.c -o bits && ./bits
```

실측 (Apple M계열, clang):

```
-1 < 0U          : 0
(unsigned)-1     : 4294967295
INT_MIN          : -2147483648
-INT_MIN (UB)    : -2147483648
-8 >> 1          : -4
(unsigned)-8 >> 1: 2147483644
bytes in memory  : 04 03 02 01
64 is pow2       : 1
popcount(0xFF)   : 8
```

## 연결

- 부동소수점은 완전히 다른 규칙 → [[floating-point]]
- 이 비트들이 레지스터에서 어떻게 움직이나 → [[assembly-basics]]
- mod 2ʷ 산술의 수학적 기반 → [[modular-arithmetic]]
- 정수 오버플로우가 보안 취약점이 되는 과정 → [[memory-safety]]

## 궁금한 것 (나중에)

- [ ] 컴파일러가 UB를 이용해 코드를 지우는 사례 더 (null 체크 제거 등)
- [ ] `-fwrapv`, `-ftrapv`, UBSan은 각각 뭘 바꾸나
- [ ] Rust는 오버플로우를 어떻게 다루나 (debug panic / release wrap의 논리)

## 출처

- CS:APP 2장 (2.1-2.3)
- Joshua Bloch, "Extra, Extra - Read All About It: Nearly All Binary Searches and Mergesorts are Broken" (2006)
