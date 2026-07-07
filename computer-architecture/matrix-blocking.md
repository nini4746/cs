# 행렬곱 블로킹 (Cache Blocking / Tiling)

## 한 줄 요약

행렬곱은 capacity miss의 교과서 사례다. 전체를 한 번에 훑으면 캐시에서 계속 밀려나지만, 캐시에 들어가는 작은 타일 단위로 쪼개 처리하면 같은 연산이 몇 배 빨라진다. 직접 측정하면 8배 이상.

## 왜 필요한가

- [[cache-misses]]의 capacity miss를 알고리즘으로 잡는 대표 기법
- 같은 O(n³) 연산인데 왜 구현에 따라 성능이 10배 나나
- BLAS/딥러닝 커널이 실제로 하는 것의 축소판

## 순진한 행렬곱의 문제

C = A × B, `C[i][j] = Σ A[i][k] × B[k][j]`:

```c
for (i) for (j) { double s=0;
    for (k) s += A[i][k] * B[k][j];   // B[k][j]: k가 증가하면 행을 건너뜀
    C[i][j] = s;
}
```

- `A[i][k]`: k 순차 → 행 우선, 캐시 친화적
- `B[k][j]`: k 순차인데 **열 접근** → 매번 한 행(N×8B)만큼 점프 → 캐시 라인 낭비 ([[memory-hierarchy]]의 열 우선 순회 문제)

N이 크면 B를 한 번 훑는 동안 앞서 캐시에 올린 B가 이미 밀려남(capacity miss). 다음 i에서 B를 처음부터 다시 - **B 전체를 N번 캐시 미스하며 재로드**.

## 블로킹: working set을 캐시에 맞추기

행렬을 작은 타일(예: 64×64)로 쪼개고, 타일끼리 곱함:

```c
for (ii; ii+=Bs) for (kk; kk+=Bs) for (jj; jj+=Bs)   // 타일 순회
    for (i=ii..ii+Bs) for (k=kk..kk+Bs) {
        double aik = A[i][k];
        for (j=jj..jj+Bs) C[i][j] += aik * B[k][j];   // 타일 내부는 행 접근
    }
```

핵심: **한 번 캐시에 올린 타일(64×64×8B = 32KB)을 밀려나기 전에 재사용을 다 끝냄**. B 타일을 여러 번 쓰는 동안 그게 캐시에 머묾 → capacity miss 급감.

타일 크기 선택: 세 타일(A,B,C)이 함께 캐시(L1/L2)에 들어갈 만큼. 너무 크면 안 들어가고, 너무 작으면 오버헤드.

## 실측

이 머신, N=1024 double, `-O2`:

```
naive ijk : 1.74 GFLOPS
blocked64 : 15.09 GFLOPS    ← 8.7배
```

연산 횟수(2N³)는 동일. 8.7배 전부가 캐시 재사용에서 나온다. 순진한 버전이 메모리 대기로 대부분 시간을 낭비한 것.

## 더 나아가면

이건 시작일 뿐. 실제 고성능 커널(OpenBLAS, MKL)은 여기에 더:

- **다층 블로킹**: L1/L2/L3 각 계층에 맞춘 중첩 타일
- **SIMD 벡터화**: 타일 내부를 벡터 명령으로 → [[simd]]
- **레지스터 블로킹**: 가장 안쪽을 레지스터에 유지
- **패킹**: 타일을 연속 메모리로 재배치해 접근 규칙화
- 멀티스레딩

이 조합으로 이론 피크(수백 GFLOPS)의 90%+ 달성. 순진한 1.74에서 갈 길이 멀지만 블로킹이 첫 관문.

## 일반 원리: cache blocking

행렬곱만이 아니라 **큰 데이터를 여러 번 훑는 모든 연산**에 적용:

- 이미지 컨볼루션, FFT, 데이터베이스 조인([[query-execution]]의 hash join 블로킹), 정렬(external sort)
- 규칙: "데이터를 한 번 올렸을 때 최대한 재사용하고 넘어가라"
- cache-oblivious 알고리즘은 타일 크기를 몰라도 재귀 분할로 자동으로 이 효과 (궁금한 것 참고)

## 연결

- capacity miss 기초 → [[cache-misses]]
- 열 접근이 느린 이유 → [[memory-hierarchy]]
- 타일 내부 벡터화 → [[simd]]
- DB의 블로킹된 조인 → [[query-execution]]

## 궁금한 것 (나중에)

- [ ] 최적 타일 크기를 캐시 크기에서 유도하는 계산
- [ ] cache-oblivious 행렬곱(재귀 분할)이 명시적 블로킹만큼 빠른가
- [ ] SIMD까지 넣어 얼마까지 끌어올릴 수 있나 (이 머신 피크 대비)
- [ ] BLAS의 packing이 실제로 뭘 재배치하나

## 출처

- CS:APP 6.6
- Goto & van de Geijn, "Anatomy of High-Performance Matrix Multiplication"
