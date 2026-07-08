# 유니온-파인드 (Union-Find / Disjoint Set)

## 한 줄 요약

원소들을 그룹으로 묶고 "둘이 같은 그룹인가"를 거의 O(1)에 답하는 구조. 경로 압축 + rank로 역아커만이라는 사실상 상수 시간을 달성한다. 크루스칼 MST, 연결성 판정의 핵심.

## 왜 필요한가

- "이 둘이 연결됐나"를 빠르게 (그래프 연결성, 네트워크)
- 크루스칼 MST([[mst]])의 사이클 판정
- 거의 O(1)인데 왜 그런지

## 문제: 동적 연결성

원소들이 있고, "a와 b를 합쳐라(union)", "a와 b가 같은 그룹인가(find)"를 반복. 예: 네트워크에서 두 컴퓨터가 연결됐나, 이미지에서 같은 영역인가.

두 연산:
- **find(x)**: x가 속한 그룹의 대표(root) 반환
- **union(a, b)**: a와 b의 그룹을 합침

같은 그룹 판정 = `find(a) == find(b)`.

## 기본: 트리로 그룹 표현

각 그룹을 트리로, 루트가 대표:

```
p[x] = x의 부모.  루트는 p[x]==x
find(x) = 루트까지 부모 따라 올라감
union(a,b) = 한 루트를 다른 루트의 자식으로
```

순진하게 하면 트리가 한 줄로 길어져 find가 O(n) (BST 퇴화와 같은 문제 [[binary-search-trees]]). 두 최적화가 이를 사실상 O(1)로:

## 최적화 1: union by rank

union 시 **낮은 트리를 높은 트리 밑에** 붙임 (rank = 대략 높이):

- 높은 트리가 루트 유지 → 트리가 안 깊어짐
- 높이 증가를 억제

## 최적화 2: 경로 압축 (path compression)

find 하는 김에 **지나온 노드들을 루트에 직접 연결**:

```c
int find(int x){ while(p[x]!=x){ p[x]=p[p[x]]; x=p[x]; } return x; }
// 또는 재귀로 완전 압축
```

- 한 번 find하면 그 경로가 평평해짐 → 다음 find는 빠름
- 트리를 점점 납작하게

## 복잡도: 역아커만

**union by rank + 경로 압축**을 함께 쓰면:

- 연산당 amortized **O(α(n))** (α = 역아커만 함수)
- α(n)은 우주의 원자 수 규모 n에서도 **≤ 4** → 사실상 상수
- 증명은 어렵지만 결과는 "실질적으로 O(1)"

## 실증

10개 원소, union 반복 후 연결성:

```
uni(0,1) uni(2,3) uni(1,3) → 0,1,2,3 한 그룹
0,3 connected? 1   ✓
0,5 connected? 0   ✓ (아직 별개)
uni(3,5) 후 0,6 connected? 1   ✓ (0그룹 + 5,6그룹 병합)
```

union이 그룹을 병합하고 find가 정확히 판정.

## 어디에 쓰나

- **크루스칼 MST**: 간선 추가 시 사이클 생기나 판정 = 두 끝이 같은 그룹인가 → [[mst]]
- **연결 요소**: 그래프에서 연결된 덩어리 찾기 → algorithms/[[graph-traversal]]
- **동적 연결성**: 네트워크, 소셜 그래프
- **이미지 처리**: 연결된 픽셀 영역 (connected components)
- **퍼콜레이션**: 물이 통하나
- 백준/코드포스 단골

## 한계

- **분리(un-union) 불가**: 합치기만, 쪼개기 안 됨 (그래서 disjoint SET union)
- 경로 압축이 트리를 파괴해 되돌리기 어려움
- 분리가 필요하면 다른 구조 (link-cut tree 등)

## 연결

- 트리 퇴화 문제 → [[binary-search-trees]]
- 크루스칼 MST → algorithms/[[mst]]
- 연결 요소 → algorithms/[[graph-traversal]]
- amortized 분석 → algorithms/[[asymptotic-analysis]]

## 궁금한 것 (나중에)

- [ ] 역아커만 복잡도 증명의 직관
- [ ] union by size vs by rank 차이
- [ ] 경로 압축 변형 (halving, splitting)
- [ ] 분리 지원 구조 (rollback union-find, link-cut tree)

## 출처

- CLRS 21장 (서로소 집합)
