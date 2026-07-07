# SIMD (벡터 연산)

## 한 줄 요약

한 명령어로 여러 데이터를 동시에 처리한다(Single Instruction, Multiple Data). 배열에 같은 연산을 반복하면 컴파일러가 자동 벡터화하거나 직접 벡터 명령을 써서 몇 배 빨라진다.

## 왜 필요한가

- [[instruction-level-parallelism]]과 다른 축의 병렬성 - 데이터 병렬
- 왜 `-O3`가 루프를 4배씩 빠르게 만드나
- 딥러닝/그래픽/미디어가 CPU에서 빠른 이유
- SIMD가 안 먹는 코드는 왜 안 먹나

## 병렬성의 축들 정리

- **ILP** ([[instruction-level-parallelism]]): 서로 다른 명령어를 동시에 (하드웨어가 자동)
- **SIMD**: 같은 명령어를 여러 데이터에 (벡터 레지스터)
- **멀티스레드/멀티코어**: 여러 코어 ([[multicore-and-numa]])
- 셋은 곱해짐: 8코어 × 4-wide SIMD × 슈퍼스칼라

## SIMD 기본

일반(스칼라) 명령은 한 번에 한 쌍:

```
add  c, a, b        ; c = a + b  (하나)
```

SIMD는 넓은 **벡터 레지스터**에 여러 값을 담고 한 명령으로 전부:

```
fadd v2.4s, v0.4s, v1.4s   ; float 4개를 동시에 더함 (ARM NEON)
```

- ARM **NEON**: 128비트 레지스터 → float 4개 / double 2개 / int8 16개
- x86 **SSE**(128b) → **AVX**(256b) → **AVX-512**(512b): 넓을수록 한 번에 더 많이
- ARM **SVE**: 가변 길이 벡터

## 실측: 자동 벡터화

`c[i] = a[i] + b[i]` 배열 덧셈. 컴파일러가 벡터화 여부만 다르게:

```c
for (long i = 0; i < N; i++) c[i] = a[i] + b[i];
```

이 머신, N=1억 float:

```
scalar     (-fno-vectorize): 0.118s  (0.85 Gflop/s)
vectorized (-O2 기본)       : 0.052s  (1.91 Gflop/s)   ← 2.3배
```

어셈블리 확인: 벡터판은 `fadd v?.4s`(4-wide NEON) 사용. 컴파일러가 루프를 "한 번에 4개씩" 처리하도록 변환한 것. (메모리 대역폭이 한계라 이론 4배엔 못 미침 - 큰 배열은 RAM 대역폭에 묶임)

## 자동 벡터화의 조건과 방해물

컴파일러가 자동 벡터화하려면:

- **독립적 반복**: 각 `c[i]`가 다른 반복과 무관 (의존 있으면 불가)
- **연속 메모리**: stride 1 (흩어진 접근은 gather 필요, 느림)
- **정렬**: 벡터 정렬 경계 (`alignas`, [[data-layout]])
- **알려진 반복 횟수**, 분기 최소

방해물:
- **aliasing**: `a`와 `c`가 겹칠 수 있으면 벡터화 포기 → `restrict`가 푸는 또 하나 ([[compiler-optimization-limits]])
- **FP 결합법칙**: reduction(합산)은 순서가 바뀌어 결과가 달라질 수 있어 `-ffast-math` 없이는 제한 ([[floating-point]], [[instruction-level-parallelism]])
- 복잡한 제어 흐름, 함수 호출

## 직접 쓰는 법 (필요할 때)

1. **자동 벡터화 유도**: `-O3`, `restrict`, 루프 단순화. 대부분 여기서 충분
2. **컴파일러 힌트**: `#pragma omp simd`, `__builtin_assume_aligned`
3. **인트린식(intrinsics)**: `<arm_neon.h>` / `<immintrin.h>`로 벡터 명령을 C에서 직접. 이식성↓ 제어↑
4. **라이브러리**: BLAS, Eigen, 표준 알고리즘 - 남이 최적화한 것 쓰기

## 어디에 쓰이나

- 행렬곱/컨볼루션 ([[matrix-blocking]]에 SIMD 얹기), 이미지/비디오 코덱, 암호화(AES-NI), 문자열 검색(SIMD strlen/memchr), JSON 파싱, 딥러닝 추론

## 연결

- 다른 병렬성 축 → [[instruction-level-parallelism]], [[multicore-and-numa]]
- 벡터화를 막는 aliasing → [[compiler-optimization-limits]]
- FP reduction 순서 문제 → [[floating-point]]
- SIMD + 블로킹 → [[matrix-blocking]]
- 정렬 요구 → [[data-layout]]

## 궁금한 것 (나중에)

- [ ] NEON 인트린식으로 배열 합산 직접 짜서 위 수치 개선
- [ ] gather/scatter가 왜 느린가
- [ ] SVE의 가변 길이가 실전에서 주는 이점
- [ ] GPU의 SIMT는 CPU SIMD와 어떻게 다른가 → ai-ml/

## 출처

- CS:APP 5.9.2 (벡터화)
- ARM NEON Programmer's Guide
