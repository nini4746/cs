# 그래프 이론 (Graph Theory)

## 한 줄 요약

정점과 간선으로 관계를 모델링하는 수학. 오일러·해밀턴 경로, 트리 성질, 채색 등 개념이 알고리즘(algorithms/[[graph-traversal]])의 이론적 기반이다.

## 왜 필요한가

- algorithms/그래프 알고리즘의 수학적 배경
- 그래프 개념·용어의 정확한 정의
- 그래프 문제의 난이도 (오일러 vs 해밀턴)

## 그래프 기본

**G = (V, E)**: 정점(vertex) 집합 + 간선(edge) 집합:

- **방향/무방향**: 간선에 방향 있나
- **가중/비가중**: 간선에 값 (algorithms/[[shortest-paths]])
- **차수(degree)**: 정점에 붙은 간선 수
- **경로/사이클**: 정점 열 / 시작=끝 경로
- **연결(connected)**: 모든 정점이 도달 가능
- CS: algorithms/[[graph-traversal]], data-structures 그래프 표현

## 핵심 정리들

### 악수 정리 (handshaking)

**차수의 합 = 간선 수 × 2** (각 간선이 두 정점에 기여):
- 따름: 홀수 차수 정점은 짝수 개
- 간단하지만 여러 증명에 쓰임

### 오일러 경로/회로 (Eulerian)

**모든 간선을 정확히 한 번** 지나는 경로:

- **오일러 회로 존재 조건**: 연결 + 모든 정점의 차수가 짝수
- **오일러 경로**: 홀수 차수 정점이 정확히 0개 또는 2개
- 쾨니히스베르크 다리 문제 (그래프 이론의 시초, 오일러 1736)
- **O(E)로 판정** - 쉬움!

### 해밀턴 경로/회로 (Hamiltonian)

**모든 정점을 정확히 한 번** 지나는 경로:

- 오일러(간선)와 대조 - 해밀턴은 **정점**
- **판정이 NP-완전** (algorithms/[[p-vs-np]]) - 어려움!
- TSP가 가중 해밀턴 회로

**놀라운 대조**: 오일러(간선 한 번)는 O(E) 쉬운데, 해밀턴(정점 한 번)은 NP-완전. 비슷해 보이는데 난이도가 천지차 → 문제의 미묘함.

## 트리 (tree)

**사이클 없는 연결 그래프** (data-structures/[[binary-search-trees]] 등의 기반):

성질 (동치 - 하나면 다 성립):
- V개 정점, **정확히 V−1개 간선**
- 임의 두 정점 사이 유일한 경로
- 간선 하나 추가 → 사이클, 하나 제거 → 분리

- **신장 트리(spanning tree)**: 그래프의 모든 정점을 잇는 트리 → algorithms/[[mst]]
- data-structures의 모든 트리가 이 정의 위에

## 그래프 채색 (coloring)

인접 정점을 다른 색으로 - **최소 색 수(채색수)**:

- **4색 정리**: 평면 그래프는 4색이면 충분 (지도 색칠)
- **채색수 판정은 NP-완전** (algorithms/[[p-vs-np]])
- **응용**: 레지스터 할당 (compilers/[[codegen-and-optimization]] - 동시에 살아있는 변수 = 인접 = 다른 레지스터), 스케줄링, 주파수 할당

## 특수 그래프

- **이분 그래프(bipartite)**: 두 그룹, 간선은 그룹 간만 → 매칭 (algorithms/[[network-flow]]), 2색 가능
- **완전 그래프(complete)**: 모든 쌍 연결
- **DAG**: 방향 비순환 → 위상 정렬 (algorithms/[[graph-traversal]]), 의존성
- **평면 그래프**: 교차 없이 그림 (회로 설계)

## CS 응용 (종합)

그래프 이론이 알고리즘의 기반:

- **순회·탐색** → algorithms/[[graph-traversal]]
- **최단 경로** → algorithms/[[shortest-paths]]
- **MST (신장 트리)** → algorithms/[[mst]]
- **매칭·유량 (이분)** → algorithms/[[network-flow]]
- **채색 (레지스터 할당)** → compilers/[[codegen-and-optimization]]
- **NP-완전 (해밀턴, 채색)** → algorithms/[[p-vs-np]]
- **네트워크 토폴로지** → network/[[routing]]

## 연결

- 그래프 알고리즘 → algorithms/[[graph-traversal]], [[shortest-paths]], [[mst]]
- 트리 자료구조 → data-structures/[[binary-search-trees]]
- 채색 = 레지스터 할당 → compilers/[[codegen-and-optimization]]
- NP-완전 → algorithms/[[p-vs-np]]
- 유량·매칭 → algorithms/[[network-flow]]

## 궁금한 것 (나중에)

- [ ] 4색 정리 증명 (컴퓨터 보조 증명)
- [ ] 그래프 동형(isomorphism) 문제 (P도 NP-완전도 아닌 애매한 위치)
- [ ] 스펙트럴 그래프 이론 (고유값 → math/[[eigenvalues]])
- [ ] 랜덤 그래프

## 출처

- Rosen "Discrete Mathematics" 10-11장
