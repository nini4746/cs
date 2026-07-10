# 고속 푸리에 변환 (FFT)

## 한 줄 요약

DFT를 직접 계산하면 O(N²)이지만, Cooley-Tukey 알고리즘은 분할정복으로 O(N log N)에 계산한다. N개 점을 짝수/홀수 인덱스로 반씩 쪼개 재귀하고, 트위들 인자(twiddle factor)로 합치는 것이 핵심. 이 속도 향상 하나가 디지털 신호처리를 실용적으로 만든 결정적 도구다.

## 왜 필요한가

- DFT 나이브 계산 O(N²): N=10⁶이면 10¹² 연산 → 비현실적
- FFT O(N log N): 같은 N에 ~2×10⁷ 연산 → 5만 배 빠름
- 실시간 오디오·통신·이미지가 FFT 없이는 불가능했음
- 분할정복(divide and conquer)의 대표 성공 사례 → algorithms/[[divide-and-conquer]]

## DFT 복습과 병목

`X[k] = Σ_{n=0}^{N−1} x[n]·W_N^{nk}`, 여기서 `W_N = e^(−j·2π/N)` (트위들 인자)

- 각 X[k]마다 N번 곱셈, k가 N개 → 총 **N² 복소 곱셈**
- W_N의 주기성·대칭성(`W_N^{k+N/2} = −W_N^k`)을 안 씀 → 낭비. FFT는 이걸 활용

## Cooley-Tukey: 짝/홀 분할

N점 DFT를 짝수 인덱스와 홀수 인덱스로 분리:

```
X[k] = Σ_{짝수 n} x[n]·W_N^{nk} + Σ_{홀수 n} x[n]·W_N^{nk}
     = E[k] + W_N^k · O[k]
```

- E[k]: 짝수 표본의 N/2점 DFT
- O[k]: 홀수 표본의 N/2점 DFT
- 대칭성으로 상·하반부를 한 번에:
```
X[k]        = E[k] + W_N^k·O[k]
X[k + N/2]  = E[k] − W_N^k·O[k]
```

두 N/2 DFT를 계산해 O(N)번의 결합만 하면 됨 → 재귀.

```mermaid
flowchart TD
    A["N점 DFT"] --> B["N/2 짝수 DFT"]
    A --> C["N/2 홀수 DFT"]
    B --> D["…재귀…"]
    C --> E["…재귀…"]
    B & C --> F["나비 결합 (twiddle)"]
```

## 복잡도 분석

점화식: `T(N) = 2·T(N/2) + O(N)`

- 마스터 정리(master theorem) → `T(N) = O(N log N)`
- 재귀 깊이 log₂N, 각 층에서 O(N) 결합
- algorithms/[[asymptotic-analysis]]의 병합정렬과 동일한 구조

| N | DFT O(N²) | FFT O(N log N) | 배율 |
|---|---|---|---|
| 1,024 | ~10⁶ | ~10⁴ | ~100× |
| 1,048,576 | ~10¹² | ~2×10⁷ | ~50,000× |

## 나비 연산과 비트 반전

- **나비(butterfly)**: `(a, b) → (a + W·b, a − W·b)`. FFT의 기본 연산 단위
- **비트 반전(bit-reversal)**: 짝/홀 재귀로 입력 순서가 인덱스 이진수를 뒤집은 순서로 재배열됨. in-place 구현 시 먼저 비트 반전 정렬
- 예: N=8에서 인덱스 1(001) ↔ 4(100), 3(011) ↔ 6(110)

## 변형과 실전 사항

| 이슈 | 내용 |
|---|---|
| N이 2의 거듭제곱 아님 | 혼합기수(mixed-radix), Bluestein(chirp-z), 또는 영 채움 |
| 실수 입력 | 켤레 대칭 이용 → 절반 계산(rfft) |
| 라딕스-4/분할기수 | 곱셈 수 더 줄임 |
| 라이브러리 | FFTW, numpy.fft, cuFFT (GPU) |

- **주의**: 영 채움은 계산용 크기 맞춤·해상도 표시용이지 정보를 추가하진 않음

## 실전 활용

- **고속 합성곱**: `y = IFFT(FFT(x)·FFT(h))` → O(N log N) 필터링. 긴 신호는 overlap-add/overlap-save → [[digital-filters]]
- **스펙트럼 분석**: 오디오 스펙트로그램, STFT의 프레임마다 FFT → [[spectral-analysis]]
- **대수 응용**: 큰 정수·다항식 곱셈을 O(N log N)으로 → algorithms/[[divide-and-conquer]]
- **통신**: OFDM(LTE/5G/WiFi)이 IFFT/FFT로 부반송파 변복조
- **압축**: JPEG(DCT), MP3 등 변환 부호화

## 연결

- 계산 대상 DFT 정의 → [[fourier-transform]]
- 분할정복 패러다임 → algorithms/[[divide-and-conquer]]
- 점화식·마스터 정리 → algorithms/[[asymptotic-analysis]]
- 고속 합성곱으로 필터링 → [[digital-filters]]
- 프레임별 FFT → [[spectral-analysis]]

## 궁금한 것 (나중에)

- [ ] Bluestein 알고리즘(임의 N) 상세
- [ ] 분할기수(split-radix)가 왜 곱셈이 최소인가
- [ ] 수 이론 변환(NTT)과 FFT의 차이
- [ ] GPU에서 FFT 병렬화 전략

## 출처

- Cooley & Tukey (1965), "An Algorithm for the Machine Calculation of Complex Fourier Series"
- Oppenheim, Discrete-Time Signal Processing 9장
- CLRS 30장 (다항식과 FFT)
