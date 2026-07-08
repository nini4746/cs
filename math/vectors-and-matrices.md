# 벡터와 행렬 (Vectors and Matrices)

## 한 줄 요약

벡터는 크기+방향(또는 데이터 배열), 행렬은 선형 변환. 행렬 곱은 변환의 합성이며, 그래픽·ML·PageRank의 언어다. 기하학적 의미를 이해하면 공식이 직관이 된다.

## 왜 필요한가

- ML·그래픽·데이터의 기본 언어
- 행렬 곱이 왜 그렇게 정의되나 (변환 합성)
- computer-architecture/[[matrix-blocking]]의 그 행렬곱

## 벡터 (vectors)

두 관점:

- **기하**: 크기 + 방향 (화살표)
- **데이터**: 숫자 배열 `[x, y, z]` (ML의 특징 벡터, 임베딩)

연산:
- **덧셈**: 성분별 (화살표 이어붙이기)
- **스칼라 곱**: 늘이기/줄이기
- **내적(dot product)**: `a·b = Σ aᵢbᵢ` → 유사도, 사영. **ML 임베딩 유사도**(ai-ml/[[embeddings]])가 이것
- **크기(norm)**: 벡터 길이

내적의 의미: `a·b = |a||b|cos θ` → 두 벡터가 얼마나 같은 방향인가 (유사도).

## 행렬 (matrices) = 선형 변환

핵심 통찰: **행렬 = 선형 변환** (공간을 변형):

```
행렬 M을 벡터 v에 곱하면 (Mv) → v를 변환한 새 벡터
```

- 행렬의 **각 열 = 기저 벡터가 어디로 가는가**
- 회전, 확대, 반사, 사영 등이 다 행렬
- 그래픽: 3D 변환 (회전·이동·투영)이 행렬 곱

## 행렬 곱 = 변환 합성

왜 행렬 곱이 그렇게 복잡하게 정의되나:

**행렬 곱 = 두 변환을 순서대로 적용 (합성)**:

```
(AB)v = A(Bv)    먼저 B 변환, 그다음 A 변환
```

- `AB`는 "B 하고 A 하는" 하나의 변환
- 그래서 정의가 그 모양 (합성이 되려면)
- **비가환**: `AB ≠ BA` (변환 순서 중요 - 회전 후 이동 ≠ 이동 후 회전)

이 관점이면 행렬 곱 공식이 암기가 아니라 필연.

## 특수 행렬

- **단위 행렬(I)**: 아무 변환 안 함 (Iv = v)
- **역행렬(A⁻¹)**: 변환을 되돌림 (`A⁻¹A = I`) → 선형 시스템 풀기 → [[linear-systems]]
- **전치(transpose)**: 행↔열
- **대각 행렬**: 각 축 독립 스케일

## 계산 관점 (CS)

- **행렬곱 O(n³)** (순진) → computer-architecture/[[matrix-blocking]]의 그 연산. Strassen O(n^2.81) (algorithms/[[divide-and-conquer]])
- **캐시 블로킹**: 행렬곱 최적화 (computer-architecture/[[matrix-blocking]] 실측)
- **SIMD/GPU**: 행렬 연산 병렬화 (computer-architecture/[[simd]])
- 데이터 배치: row-major vs column-major (computer-architecture/[[data-layout]])

## CS 응용

선형대수가 CS 곳곳:

- **그래픽**: 3D 변환 (회전·투영 행렬)
- **ML**: 신경망 = 행렬 곱 연속 (ai-ml/[[neural-networks]]), 임베딩 (ai-ml/[[embeddings]])
- **PageRank**: 고유벡터 (→ [[eigenvalues]])
- **데이터**: 특징 벡터, 유사도 (내적)
- **압축**: SVD (→ [[svd-basics]])

## 연결

- 선형 시스템 (역행렬) → [[linear-systems]]
- 고유값 (PageRank) → [[eigenvalues]]
- SVD → [[svd-basics]]
- 행렬곱 블로킹 → computer-architecture/[[matrix-blocking]]
- Strassen → algorithms/[[divide-and-conquer]]
- 신경망 → ai-ml/[[neural-networks]]
- 임베딩 유사도 → ai-ml/[[embeddings]]

## 궁금한 것 (나중에)

- [ ] 기저와 좌표계 변환
- [ ] 선형 독립·랭크 → [[linear-systems]]
- [ ] 외적 (cross product, 3D)
- [ ] 3Blue1Brown "Essence of Linear Algebra" (직관)

## 출처

- Strang "Linear Algebra", 3Blue1Brown
