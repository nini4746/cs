# 균형 트리 (Balanced Trees)

## 한 줄 요약

삽입/삭제 시 회전으로 높이를 O(log n)으로 강제하는 BST. AVL은 엄격히 균형(조회 빠름), Red-Black은 느슨히 균형(수정 빠름). 실무 정렬 맵(std::map, TreeMap)은 대부분 Red-Black.

## 왜 필요한가

- [[binary-search-trees]]의 O(n) 퇴화를 막는 법
- AVL vs Red-Black 언제 뭘 쓰나
- std::map/TreeMap 안에서 뭐가 도나

## 핵심 도구: 회전 (rotation)

BST 불변식을 유지하면서 트리 모양을 바꿔 균형 조정. O(1) 연산:

```
    y            x
   / \          / \
  x   C   →    A   y
 / \              / \
A   B            B   C
(우회전: y를 내리고 x를 올림. 순서는 그대로 A<x<B<y<C)
```

회전은 중위 순서(정렬)를 보존하면서 높이만 바꿈. 삽입/삭제 후 불균형 지점에서 회전으로 복구.

## AVL 트리

**엄격한 균형**: 모든 노드에서 좌우 서브트리 높이 차 ≤ 1.

- 각 노드에 균형 인수(balance factor) 저장
- 삽입/삭제 후 위반 시 회전(단일/이중)으로 복구
- 높이 ≤ 1.44 log n → 매우 낮음

특성:
- **조회 빠름** (높이 최소)
- **수정 시 회전 잦음** (엄격해서 자주 재조정)
- 읽기 많은 워크로드에 유리

## Red-Black 트리

**느슨한 균형**: 색칠 규칙으로 "가장 긴 경로 ≤ 2 × 가장 짧은 경로" 보장.

규칙:
1. 각 노드는 빨강 또는 검정
2. 루트는 검정
3. 빨강 노드의 자식은 검정 (빨강 연속 불가)
4. 임의 노드에서 리프까지 경로의 검정 노드 수 동일

- 높이 ≤ 2 log n (AVL보다 느슨)
- 삽입/삭제 후 색 변경 + 회전으로 복구, **회전 횟수가 AVL보다 적음**

특성:
- **수정 빠름** (재조정 적음)
- 조회는 AVL보다 약간 느림 (높이 조금 더)
- 읽기/쓰기 섞인 일반 워크로드에 균형

## AVL vs Red-Black

| | AVL | Red-Black |
|---|---|---|
| 균형 | 엄격 (높이차 ≤1) | 느슨 (2배 이내) |
| 높이 | ~1.44 log n | ~2 log n |
| 조회 | 빠름 | 약간 느림 |
| 삽입/삭제 회전 | 많음 | 적음 |
| 용도 | 읽기 중심 | 일반 (실무 기본) |

**실무 채택**: 대부분 Red-Black.
- C++ `std::map`/`std::set`, Java `TreeMap`/`TreeSet`
- Java HashMap의 treeify ([[hash-in-practice]])
- 리눅스 커널 (프로세스 스케줄러 CFS의 vruntime 트리 → os/[[cpu-scheduling]], 가상 메모리 영역)

이유: 수정이 섞인 범용 상황에서 회전이 적어 전체적으로 유리.

## 복잡도

| 연산 | 복잡도 |
|---|---|
| 탐색/삽입/삭제 | O(log n) **보장** |
| 최소/최대/후속자 | O(log n) |
| 범위 질의 | O(log n + 결과수) |

BST와 달리 **최악도 O(log n)** - 회전이 높이를 보장. 이게 균형 트리의 존재 이유.

## 다른 균형 방식

- **Treap**: BST + 랜덤 우선순위로 힙 성질 → 확률적 균형. 구현 단순
- **Splay tree**: 접근한 노드를 루트로 회전 → 자주 쓰는 것이 빨라짐 (amortized)
- **Scapegoat, Weight-balanced**: 다른 균형 기준
- **B-tree**: 다분기, 디스크용 → [[b-trees]]

## 연결

- 균형 없는 BST의 문제 → [[binary-search-trees]]
- 디스크용 균형 트리 → [[b-trees]]
- CFS가 쓰는 red-black tree → os/[[cpu-scheduling]]
- HashMap treeify → [[hash-in-practice]]
- 확률적 대안 → [[skip-list]]

## 궁금한 것 (나중에)

- [ ] Red-Black 삽입의 색변경/회전 케이스 전체
- [ ] AVL과 Red-Black의 실측 성능 차이
- [ ] persistent(불변) 균형 트리 - 함수형 언어의 map
- [ ] 왜 std가 hash가 아니라 tree 기반 map도 제공하나

## 출처

- CLRS 13장 (red-black), Open Data Structures 8-9장
