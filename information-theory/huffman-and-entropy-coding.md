# Huffman과 엔트로피 코딩 (Huffman and Entropy Coding)

## 한 줄 요약

소스 코딩 정리의 하한 H(X)를 실제로 달성하는 알고리즘들. Huffman은 빈도가 낮은 두 기호를 반복 병합해 **기호 단위 최적** 접두부호를 만들지만 정수 길이라 최대 1비트 갭이 있다. Arithmetic/range coding은 열 전체를 하나의 실수 구간으로 부호화해 그 갭까지 없앤다.

## 왜 필요한가

- 엔트로피 하한([[source-coding-theorem]])을 실제로 어떻게 달성하나
- Huffman이 왜 최적이면서도 완벽하진 않나
- arithmetic coding이 왜 더 나은가

## Huffman 코딩

**빈도 낮은 둘을 반복 병합** - 탐욕 알고리즘:

```
1. 각 기호를 빈도 가진 노드로
2. 가장 빈도 낮은 두 노드를 병합 (부모 = 두 빈도 합)
3. 하나 남을 때까지 반복 → 이진 트리
4. 왼쪽=0, 오른쪽=1 → 루트→잎 경로가 부호
```

- **드문 기호가 깊은 잎**(긴 부호), 잦은 기호가 얕은 잎(짧은 부호) → 자기정보 직관 ([[entropy-and-information]])
- 우선순위 큐(힙)로 O(n log n), data-structures/[[heaps]]·algorithms/[[greedy]]의 대표 예
- **접두부호 보장**: 기호는 잎에만 → 어떤 부호도 다른 것의 접두사 아님 ([[source-coding-theorem]]의 Kraft)

### 코드로 확인 (CLRS 예제)

```python
# 빈도 낮은 두 노드 병합 반복
w1, l1 = heappop(h); w2, l2 = heappop(h)
merged = [(s,"0"+c) for s,c in l1] + [(s,"1"+c) for s,c in l2]
heappush(h, (w1+w2, merged))
```

실행:
```
Huffman 부호:
  a (freq 45) -> 0        # 최빈 → 1비트
  d (freq 16) -> 111
  b (freq 13) -> 101
  c (freq 12) -> 100
  e (freq  9) -> 1101     # 최소 빈도 → 4비트
  f (freq  5) -> 1100

엔트로피 H       = 2.2199 bits/기호
Huffman 평균 L   = 2.2400 bits/기호
고정길이 (3비트) = 3.0000 bits/기호
H <= L < H+1 ?   2.220 <= 2.240 < 3.220  (정리 만족)
```

- **a는 1비트, f는 4비트**: 빈도에 반비례 (엔트로피 코딩의 본질)
- **L=2.24 ≈ H=2.22**: 하한에 아주 근접, 고정 3비트보다 25% 절약
- 소스 코딩 정리 `H≤L<H+1` 만족

## Huffman의 최적성과 한계

- **기호 단위 최적**: 기호를 하나씩 부호화하는 접두부호 중엔 Huffman이 최소 평균 길이 (증명: 탐욕 교환 논법)
- **1비트 갭의 원인**: 부호 길이가 **정수**여야 함. 최적은 `-log₂p`(예: 0.47비트)인데 정수로 올림 → 낭비
  - 예: p=0.9인 기호도 최소 1비트 (이상적 0.15비트인데)
  - 편향 심한 분포에서 갭이 두드러짐
- **완화**: 기호를 블록으로 묶어 부호화 → 기호당 갭 축소 ([[source-coding-theorem]]의 블록화)

## Arithmetic / Range Coding

**열 전체를 하나의 실수 구간으로** - 정수 길이 제약 탈출:

```
[0,1) 구간을 기호 확률대로 분할 → 기호마다 해당 구간으로 좁혀감
최종 구간 안의 한 실수를 이진으로 출력
```

- 기호당 **분수 비트** 가능 → 엔트로피에 임의로 근접 (1비트 갭 제거)
- 확률 모델과 분리 (적응형 모델과 결합 쉬움)
- 현대 압축의 핵심: **range coding**, **ANS**(비대칭 수 체계 - zstd, LZMA) → 빠르고 최적
- 대가: 구현 복잡, 과거엔 특허 이슈

## 정적 vs 적응형

- **정적**: 빈도를 미리 알고 부호표 고정 (2-pass 또는 표 전송)
- **적응형(adaptive)**: 지나가며 빈도 갱신 (1-pass, 표 전송 불필요) - 적응형 Huffman/arithmetic
- 분포를 아예 모르면? → 사전 기반 범용 압축 [[lempel-ziv]]

## 실전 압축에서의 위치

```
gzip     = LZ77 + Huffman        (사전 매칭 후 엔트로피 코딩)
zstd/LZMA = LZ류 + arithmetic/ANS (더 나은 엔트로피 단계)
JPEG/MP3 = 변환 + 양자화 + Huffman/arithmetic (손실 [[rate-distortion]])
```

- 엔트로피 코딩은 거의 모든 압축의 **마지막 단계** ([[lempel-ziv]]와 짝)

## 연결

- 달성 대상 하한 → [[source-coding-theorem]]
- 부호 길이 = 자기정보 직관 → [[entropy-and-information]]
- 힙·탐욕 → data-structures/[[heaps]], algorithms/[[greedy]]
- 사전 기반 앞단계 → [[lempel-ziv]]
- 손실 압축의 엔트로피 단계 → [[rate-distortion]]

## 궁금한 것 (나중에)

- [ ] ANS(asymmetric numeral systems) 상세 - 왜 빠른가
- [ ] 적응형 arithmetic coding 구현
- [ ] Huffman 최적성 증명 (교환 논법)
- [ ] 정규 Huffman 부호 (canonical - 표 압축)

## 출처

- Cover & Thomas 5장, CLRS 16장(Huffman), MacKay 6장, "Managing Gigabytes"
