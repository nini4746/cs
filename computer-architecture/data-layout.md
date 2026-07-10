# 데이터 배치: 배열, 구조체, 정렬 (Data Layout)

## 한 줄 요약

배열은 연속된 한 덩어리, 구조체는 선언 순서대로 놓되 타입별 정렬 규칙 때문에 빈틈(패딩)이 생긴다. 필드 순서만 바꿔도 크기가 줄어드는 이유가 이것이다.

## 왜 필요한가

- 같은 필드인데 순서만 다른 구조체가 24바이트 vs 16바이트 (아래 실측) - 대량 할당 시 메모리 33% 차이
- 네트워크/파일로 구조체를 그대로 쓰면 깨지는 이유 (패딩, 엔디언)
- `sizeof`가 예상과 다른 온갖 순간의 근본 원인
- 캐시 라인 활용 ([[memory-hierarchy]])과 직결 - 배치가 곧 성능

## 배열: 연속 + 스케일 인덱스

`T a[N]` = `sizeof(T) × N` 바이트 연속 블록. `&a[i]` = `a + i × sizeof(T)`.

- 이 곱셈을 하드웨어 주소 지정 모드가 공짜로 처리 (`ldr x8, [x0, x1, lsl #3]` → [[assembly-basics]])
- **2차원 배열도 한 덩어리** (row-major): `int a[3][4]`에서 `a[1][0]`은 `a[0][3]` 바로 다음. 실측 확인: 주소 차이 정확히 1 (int 단위)
- `&a[i][j]` = `a + (i × 4 + j) × 4` - 행 우선 순회가 캐시 친화적인 수학적 근거

### 배열 이름 ≠ 포인터

```
int arr[10]; int *p = arr;
sizeof arr == 40   // 배열 전체
sizeof p   == 8    // 포인터 하나
```

배열 이름은 대부분 문맥에서 첫 원소 포인터로 **decay**하지만 `sizeof`, `&arr`에서는 배열 그 자체. 함수 인자로 넘기는 순간 무조건 포인터로 decay → 함수 안에서 `sizeof`로 길이 못 구하는 이유.

## 정렬 (alignment)

**규칙: K바이트 타입은 K의 배수 주소에 놓여야 한다.** 이 머신 실측:

```
char=1  short=2  int=4  long=8  double=8  pointer=8
```

왜: 하드웨어가 메모리를 정렬 단위로 읽음. 비정렬 접근은 느리거나 (두 번 읽어 조합), 일부 명령(SIMD)과 일부 CPU에서는 크래시. malloc이 항상 16바이트 정렬 주소를 주는 이유이기도.

## 구조체: 선언 순서 + 패딩

컴파일러는 필드 순서를 **절대 안 바꾼다** (C 표준 보장). 대신 각 필드를 자기 정렬에 맞추려 빈칸(패딩)을 삽입:

```c
struct bad {          struct good {
    char a;   // 1B       long b;   // 8B
    long b;   // 8B       int  d;   // 4B
    char c;   // 1B       char a;   // 1B
    int  d;   // 4B       char c;   // 1B
};                    };
```

실측 (이 머신):

```
bad : size=24 offsets a=0 b=8 c=16 d=20
good: size=16 offsets b=0 d=8 a=12 c=13
```

`bad`의 해부:

```
[a][패딩 7B..........][bbbbbbbb][c][패딩3B][dddd]
 0                     8         16         20    = 24B
```

- a 다음 7바이트 낭비: b가 8의 배수 주소를 요구해서
- 마지막에도 패딩 가능: **구조체 전체 크기는 최대 정렬의 배수** (배열로 늘어놨을 때 다음 원소도 정렬 유지해야 하니까)

**규칙: 큰 필드부터 선언하면 패딩 최소화.** 같은 데이터가 24B → 16B.

### 패딩의 함정들

- `memcmp`로 구조체 비교 금지 - 패딩 바이트는 쓰레기값
- 구조체를 그대로 파일/네트워크에 쓰면 컴파일러/플랫폼마다 레이아웃 다를 수 있음 → 직렬화 필요. `#pragma pack(1)`은 패딩 제거하지만 비정렬 접근 비용/위험 발생
- 컴파일러 경고 활용: `clang -Wpadded`가 패딩 발생 지점 알려줌

## AoS vs SoA

구조체 배열 (Array of Structs) vs 배열 구조체 (Struct of Arrays):

```c
// AoS: 한 개체의 모든 필드가 인접
struct particle { float x, y, z, mass; } ps[N];

// SoA: 같은 필드끼리 인접
struct { float x[N], y[N], z[N], mass[N]; } ps;
```

- 개체 하나 전체를 자주 만지면 → AoS
- 한 필드만 전체 순회하면 (모든 x 갱신) → SoA. 캐시 라인에 필요한 데이터만 실림 + SIMD 벡터화 유리
- 게임 엔진(ECS)·데이터베이스(column store → [[db-storage]])가 SoA 쪽으로 간 이유

## 유니언 (union)

모든 멤버가 **같은 주소에서 겹침**. 크기 = 가장 큰 멤버.

```c
union { float f; unsigned u; } v;   // f로 쓰고 u로 읽으면 비트 재해석
```

[[floating-point]]에서 비트 패턴 볼 때 쓴 `memcpy`의 전통적 대안 (C에서는 합법, C++에서는 UB - `memcpy`나 `bit_cast` 사용). 태그드 유니언 = Rust enum / ADT의 뿌리 → [[type-systems-advanced]].

## 코드로 확인

위 실측 전부 이 코드:

```c
#include <stdio.h>
#include <stddef.h>

struct bad  { char a; long b; char c; int d; };
struct good { long b; int d; char a; char c; };

int main(void) {
    printf("alignof: char=%zu int=%zu long=%zu ptr=%zu\n",
           _Alignof(char), _Alignof(int), _Alignof(long), _Alignof(void *));

    printf("bad : size=%2zu offsets a=%zu b=%zu c=%zu d=%zu\n",
           sizeof(struct bad), offsetof(struct bad, a), offsetof(struct bad, b),
           offsetof(struct bad, c), offsetof(struct bad, d));
    printf("good: size=%2zu offsets b=%zu d=%zu a=%zu c=%zu\n",
           sizeof(struct good), offsetof(struct good, b), offsetof(struct good, d),
           offsetof(struct good, a), offsetof(struct good, c));

    int a[3][4];
    printf("2D contiguous: %d\n", &a[1][0] - &a[0][3] == 1);

    int arr[10]; int *p = arr;
    printf("sizeof arr=%zu, sizeof p=%zu\n", sizeof arr, sizeof p);
    return 0;
}
```

`offsetof` = `<stddef.h>` 매크로. 구조체 레이아웃 궁금할 때 바로 찍어보기. 더 자세히는 `clang -Xclang -fdump-record-layouts` 또는 `pahole`(리눅스).

## 셀프 체크

> [!question]- 정렬(alignment) 규칙 한 문장과 그 하드웨어적 이유는?
> K바이트 타입은 K의 배수 주소에 놓여야 한다. 하드웨어가 메모리를 정렬 단위로 읽기 때문이다. 비정렬 접근은 느리거나(두 번 읽어 조합), SIMD 같은 일부 명령·CPU에서는 크래시한다. malloc이 항상 16바이트 정렬 주소를 주는 이유이기도 하다.

> [!question]- 구조체 전체 크기를 결정하는 규칙은 무엇이고 왜 그런가?
> 구조체 전체 크기는 그 안에서 가장 큰 정렬 요구의 배수가 되어야 한다. 구조체를 배열로 늘어놨을 때 다음 원소의 첫 필드도 정렬을 유지해야 하기 때문이다. 그래서 마지막 필드 뒤에도 패딩이 붙을 수 있다.

> [!question]- AoS와 SoA는 각각 언제 유리한가?
> 개체 하나의 모든 필드를 자주 함께 만지면 AoS(Array of Structs)가 유리하다. 반대로 한 필드만 전체 순회하면(모든 x 갱신 등) SoA(Struct of Arrays)가 유리한데, 캐시 라인에 필요한 데이터만 실리고 SIMD 벡터화에도 좋기 때문이다. ECS 게임엔진과 column store DB가 SoA로 간 이유다.

## 연습문제

> [!example]- 문제: 구조체 크기와 오프셋을 계산하라
> `struct { char a; int b; char c; double d; };`의 각 필드 오프셋과 전체 크기를 계산하라 (char=1, int=4, double=8, 정렬은 각 타입 크기와 동일).
> **풀이**
> a: offset 0 (1B).
> b: int는 4의 배수 주소 필요 → offset 1~3은 패딩, b=4 (4B, 끝 8).
> c: offset 8 (1B, 끝 9).
> d: double은 8의 배수 필요 → offset 9~15 패딩, d=16 (8B, 끝 24).
> 최대 정렬은 double의 8. 현재 끝 24는 8의 배수라 꼬리 패딩 없음.
> 전체 크기 = 24B (실제 데이터는 1+4+1+8=14B, 나머지 10B가 패딩).

> [!example]- 문제: 필드를 재배열해 크기를 최소화하라
> 위 문제의 필드(char a, int b, char c, double d)를 재배열해 패딩을 최소화하고, 최소 크기를 구하라.
> **풀이**
> 큰 정렬부터 선언한다: `double d; int b; char a; char c;`
> d=0 (8B, 끝 8), b=8 (4B, 끝 12), a=12 (1B), c=13 (1B, 끝 14).
> 최대 정렬 8의 배수로 올림 → 크기 16B. 꼬리 패딩 2B만 남는다.
> 24B → 16B로 33% 절감. "큰 필드부터 선언하면 패딩 최소화" 규칙 그대로다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 정렬 규칙(K의 배수)과 그로 인해 필드 사이·구조체 꼬리에 패딩이 생기는 과정을 오프셋을 짚어가며 계산할 수 있는가. (2) 왜 필드 순서만 바꿔도 크기가 줄어드는지, 컴파일러가 순서를 못 바꾸는 제약과 함께 설명할 수 있는가. (3) AoS vs SoA를 캐시 라인 이용률로 설명할 수 있는가.

## 연결

- 주소 지정 모드가 배열 인덱싱을 공짜로 만드는 지점 → [[assembly-basics]]
- 배치가 캐시 라인과 만나는 지점, hot/cold 필드 분리 → [[memory-hierarchy]]
- 스택 위 지역변수 배치와 오버플로우 → [[buffer-overflow]]
- column store = SoA의 데이터베이스 버전 → [[db-storage]]
- 연속 배열의 인덱싱과 성장 → data-structures/[[arrays-and-dynamic-arrays]]
- 태그드 유니언이 언어의 합 타입/ADT로 → programming-languages/[[type-systems-advanced]]

## 궁금한 것 (나중에)

- [ ] Rust/스위프트는 필드 재배열을 하는데 (C는 금지) 뭘 얻고 뭘 포기하나
- [ ] `alignas`로 캐시 라인 정렬하는 실전 패턴 (false sharing 방지)
- [ ] 비정렬 접근이 실제로 얼마나 느린가 - Apple Silicon에서 측정
- [ ] flexible array member (`struct { int n; char data[]; }`)의 용도

## 출처

- CS:APP 3.8-3.9
