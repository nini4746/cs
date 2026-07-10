# SIMD와 벡터화 (SIMD and Vectorization)

## 한 줄 요약

한 명령으로 여러 데이터를 동시에 처리하는 데이터 병렬 - CPU의 벡터 레지스터(SSE/AVX/NEON)가 8개, 16개 값을 한 번에 더한다. 스레드 병렬과 직교하는 **코어 내부 병렬**이다. 컴파일러가 자동 벡터화해주지만, 데이터 정렬·분기·의존성 때문에 자주 실패하므로 그 조건을 아는 게 핵심.

## 왜 필요한가

- 스레드 없이도 어떻게 병렬이 되나 (코어 내부)
- 자동 벡터화가 왜 자주 실패하나
- 왜 데이터 레이아웃이 성능을 좌우하나

## SIMD란

**Single Instruction, Multiple Data** - 한 명령이 여러 데이터에:

```
스칼라: for i: c[i] = a[i] + b[i]   (한 번에 하나)
SIMD:   c[0:8] = a[0:8] + b[0:8]    (한 명령으로 8개 동시)
```

- **벡터 레지스터**: 128비트(SSE)·256비트(AVX)·512비트(AVX-512)에 여러 값 packing
  - AVX2 256비트 = float 8개 or double 4개 or int32 8개 동시
  - ARM NEON, SVE도 유사
- Flynn 분류의 SIMD (computer-architecture/) - MIMD(멀티코어)와 직교

## 스레드 병렬과 직교

병렬성의 두 축이 곱해짐:

```
멀티코어(MIMD): 코어 N개 → N배 ([[parallelism-limits]])
SIMD(코어 내): 벡터 폭 W → W배
합치면: N × W 배 잠재력 (예: 8코어 × AVX2 8-wide = 64배)
```

- GPU는 이 SIMD를 극단으로 (SIMT [[gpu-computing]])
- 둘 다 **데이터 병렬**([[parallel-patterns]]의 map) 활용

## 자동 벡터화

컴파일러가 루프를 SIMD 명령으로 자동 변환 (`-O3 -march=native`):

```c
for (i=0; i<n; i++) c[i] = a[i] + b[i];   // 컴파일러가 SIMD로
```

- 이상적: 코드 그대로 두면 컴파일러가 알아서
- **현실: 자주 실패** → 컴파일러 리포트(`-fopt-info-vec`)로 확인 (computer-architecture/의 벤치마크 교훈처럼 실제 확인 필수)

## 벡터화가 실패하는 이유 (핵심)

컴파일러가 벡터화 못 하는 흔한 원인:

- **데이터 의존성**: `a[i] = a[i-1] + 1` (이전 결과 필요 → 순차) - scan은 특수 알고리즘 필요 ([[parallel-patterns]])
- **분기(branch)**: 루프 안 `if` → 각 원소가 다른 경로 (마스킹으로 일부 가능하나 비효율)
- **포인터 앨리어싱**: `a`와 `b`가 겹칠 수 있으면 컴파일러가 안전하게 못 함 → `restrict` 키워드
- **비정렬 접근·스트라이드**: 메모리가 벡터 경계에 안 맞거나 띄엄띄엄 → 느린 로드
- **함수 호출**: 루프 내 인라인 안 되는 호출

## 데이터 레이아웃: AoS vs SoA

벡터화·캐시 효율의 관건:

```
AoS (Array of Structs): [{x,y,z}, {x,y,z}, ...]  ← x만 쓰려도 y,z 딸려옴
SoA (Struct of Arrays): {xs:[...], ys:[...], zs:[...]}  ← x들이 연속 → SIMD 로드 쉬움
```

- **SoA가 SIMD 친화적**: 같은 필드가 연속 메모리 → 한 번에 벡터 로드
- 캐시 지역성도 향상 (computer-architecture/[[memory-hierarchy]])
- 게임 엔진·과학 계산이 SoA 선호 (데이터 지향 설계)

## 어떻게 벡터화를 돕나

- **단순한 루프**: 고정 횟수, 의존성 없음, 분기 최소
- **정렬**: 데이터를 벡터 경계에 정렬(aligned)
- **`restrict`/`__restrict`**: 앨리어싱 없음을 컴파일러에 약속
- **SoA 레이아웃**: 위
- **인트린식(intrinsics)**: 최후엔 손으로 SIMD 명령 직접 (`_mm256_add_ps`) - 이식성↓ 통제↑
- **라이브러리**: NumPy·BLAS·Eigen이 이미 벡터화됨 (직접 안 짜도 됨)

## 왜 중요한가

- **공짜 성능**: 같은 코어에서 수 배 (스레드 없이, 전력 효율↑)
- **수치 계산의 바닥**: BLAS·딥러닝 커널·이미지·오디오가 다 SIMD 위 (ai-ml/의 행렬 연산)
- **무시하면 손해**: 벡터화 안 된 코드는 하드웨어의 1/8만 씀
- 프로파일링으로 확인 (devops/[[linux-debugging]]의 perf)

## 셀프 체크

> [!question]- SIMD 병렬과 스레드 병렬이 "직교"한다는 말의 뜻은?
> 둘은 독립된 병렬성의 축이라 곱해진다. 멀티코어(MIMD) N배와 벡터 폭(SIMD) W배를 결합하면 N×W배 잠재력이 된다(예: 8코어 × AVX2 8-wide = 64배). SIMD는 스레드 없이 코어 내부에서 병렬을 얻는다.

> [!question]- 자동 벡터화가 실패하는 대표 원인들은?
> 데이터 의존성(`a[i]=a[i-1]+1`), 루프 내 분기, 포인터 앨리어싱(a·b 겹칠 가능성), 비정렬·스트라이드 접근, 인라인 안 되는 함수 호출.

> [!question]- 데이터 의존성이 왜 벡터화를 막나?
> `a[i] = a[i-1] + 1`처럼 이전 반복 결과가 다음에 필요하면 동시에 여러 원소를 계산할 수 없다. 순차 실행이 강제되며, scan 같은 누적은 특수 병렬 알고리즘이 따로 필요하다.

> [!question]- AoS와 SoA 중 SIMD에 유리한 것과 이유는?
> SoA(Struct of Arrays). 같은 필드가 연속 메모리에 놓여 한 번의 벡터 로드로 여러 값을 packing할 수 있다. AoS는 x만 쓰려 해도 y·z가 딸려와 로드가 흩어지고 캐시 효율도 나쁘다.

## 연습문제

> [!example]- 문제: 아래 두 루프 중 어느 쪽이 자동 벡터화되고 어느 쪽이 막히는지 판정하고 이유를 밝혀라
> ```c
> // A: for (i=0;i<n;i++) c[i] = a[i] + b[i];
> // B: for (i=1;i<n;i++) a[i] = a[i-1] * 2;
> ```
> **풀이**
> A는 각 원소가 독립적이라 벡터화 가능하다(단 컴파일러가 a,b,c 앨리어싱을 배제해야 하며, `restrict`로 도와주면 확실해진다). B는 `a[i]`가 직전 반복의 `a[i-1]`에 의존하는 루프 반송 의존성(loop-carried dependency)이라 여러 반복을 동시에 계산할 수 없어 벡터화가 막힌다.

> [!example]- 문제: 파티클 배열 `struct{float x,y,z;} p[N]`에서 모든 x를 갱신하는 루프가 느리다. 벡터화·캐시 관점에서 재설계하라
> **풀이**
> 현재는 AoS라 x만 접근해도 y·z가 캐시라인에 섞여 들어와 대역폭을 낭비하고, x들이 12바이트 간격으로 흩어져 연속 벡터 로드가 안 된다.
> 재설계: SoA로 `float xs[N], ys[N], zs[N]`로 분리하면 xs가 연속 메모리라 한 번에 8개(AVX2)를 벡터 로드·연산할 수 있고 캐시 지역성도 좋아진다. 데이터 지향 설계의 핵심 기법이다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) SIMD가 스레드 병렬과 직교해 곱해지는 코어 내부 병렬이라는 점, (2) 자동 벡터화가 실패하는 조건들(의존성·분기·앨리어싱·정렬)과 각각 왜 막는가, (3) SoA가 왜 SIMD·캐시에 유리한가.

## 연결

- SIMD 분류·하드웨어 → computer-architecture/[[simd]]
- 데이터 병렬 map → [[parallel-patterns]]
- SIMT 극단 → [[gpu-computing]]
- 캐시·레이아웃 → computer-architecture/[[memory-hierarchy]]
- 멀티코어와 직교 → [[parallelism-limits]]
- 행렬 연산 → math/[[vectors-and-matrices]], ai-ml/[[neural-networks]]

## 궁금한 것 (나중에)

- [ ] AVX-512 다운클럭 문제 (전력·발열)
- [ ] 마스킹·gather/scatter (조건부·불규칙 SIMD)
- [ ] SVE/RVV (가변 길이 벡터)
- [ ] 인트린식 실전 (수동 벡터화)

## 출처

- "Computer Systems: A Programmer's Perspective"(CS:APP), Intel 최적화 매뉴얼, Agner Fog
