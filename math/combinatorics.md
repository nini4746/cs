# 조합론 (Combinatorics)

## 한 줄 요약

"몇 가지 방법이 있나"를 세는 수학. 순열·조합, 포함-배제, 비둘기집 원리가 도구. 알고리즘 복잡도 분석, 확률 계산, 해시 충돌의 기반.

## 왜 필요한가

- 경우의 수를 어떻게 세나 (복잡도·확률)
- 비둘기집 원리가 왜 강력한가
- 조합론이 CS 어디에

## 기본 계수 원리

- **곱의 법칙**: A가 m가지, B가 n가지 → (A,B)는 m×n가지 (순차 선택)
- **합의 법칙**: A 또는 B (배타적) → m+n가지
- 이게 복잡도 계산의 기본 (중첩 루프 = 곱)

## 순열과 조합

n개에서 k개 선택:

### 순열 (permutation) - 순서 있음

```
P(n,k) = n!/(n-k)!    (순서 구별)
n개 전체 순열 = n!
```

- 정렬의 경우의 수 = n! → 비교 정렬 하한 log(n!) (algorithms/[[comparison-sorts]])
- TSP 완전탐색 = n! (algorithms/[[p-vs-np]])

### 조합 (combination) - 순서 없음

```
C(n,k) = n!/(k!(n-k)!) = "n choose k"    (순서 무시)
```

- 부분집합 개수, "n개 중 k개 고르기"
- 이항 계수 (파스칼 삼각형)
- 예: 팀 구성, 로또

## 포함-배제 (inclusion-exclusion)

합집합의 크기를 정확히 (중복 보정):

```
|A ∪ B| = |A| + |B| − |A ∩ B|      (교집합 한 번 빼기)
|A ∪ B ∪ C| = |A|+|B|+|C| − |A∩B|−|A∩C|−|B∩C| + |A∩B∩C|
```

- 겹치는 걸 더했다 뺐다 (홀수 개 교집합 +, 짝수 −)
- 여러 조건 만족하는 개수 계산
- 확률(math/[[probability-basics]])에도

## 비둘기집 원리 (pigeonhole)

단순하지만 강력 - **n+1개를 n개 상자에 넣으면 어떤 상자에 2개 이상**:

- 자명해 보이지만 강력한 증명 도구
- **CS 응용**:
  - **해시 충돌**(data-structures/[[hash-tables]]): 키가 버킷보다 많으면 충돌 불가피
  - **펌핑 보조정리**(automata/[[pumping-lemma]]): 상태 p개인 DFA에 길이 p 이상 → 상태 반복 (사이클)
  - **압축 불가**: 모든 파일을 압축할 수 없음 (2^n 파일을 2^n 미만으로 못 매핑)
  - **생일 역설**(math/[[probability-basics]]): 23명이면 생일 겹칠 확률 50%

## CS 응용

조합론이 CS 곳곳:

- **복잡도 분석**: 경우의 수 = 시간 (algorithms/[[asymptotic-analysis]])
- **정렬 하한**: log(n!) (algorithms/[[comparison-sorts]])
- **완전탐색**: 순열·조합 열거 (백트래킹)
- **확률 알고리즘**: 경우의 수로 확률 (math/[[probability-basics]])
- **비둘기집**: 충돌·펌핑 (data-structures/[[hash-tables]], automata/[[pumping-lemma]])
- **DP**: 경우의 수 세기 (algorithms/[[dp-patterns]] - 경로 수 등)

## 카탈란 수 등 특수 수열

- **카탈란 수**: 균형 괄호, 이진 트리 모양, 다각형 삼각분할의 개수
- **피보나치**: 재귀 계수 (algorithms/[[dp-fundamentals]])
- 조합론적 구조를 세는 수열들

## 연결

- 복잡도 (경우의 수) → algorithms/[[asymptotic-analysis]]
- 정렬 하한 log(n!) → algorithms/[[comparison-sorts]]
- 비둘기집 (해시 충돌) → data-structures/[[hash-tables]]
- 비둘기집 (펌핑) → automata/[[pumping-lemma]]
- 확률 → [[probability-basics]]
- 경우의 수 DP → algorithms/[[dp-patterns]]

## 궁금한 것 (나중에)

- [ ] 생성 함수 (generating functions)
- [ ] 카탈란 수 유도
- [ ] 이중 계수 (double counting) 증명
- [ ] 램지 이론

## 출처

- Rosen "Discrete Mathematics" 6장
