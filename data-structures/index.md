---
title: "data-structures"
---

# 자료구조 syllabus

기준: CLRS 해당 장 + Open Data Structures. 각 구조마다 "언제 쓰나 + 내부 구현 + 캐시 관점 성능"까지.

## 1. 선형 구조

- [x] [[arrays-and-dynamic-arrays]] - 동적 배열 성장 전략, amortized O(1) 증명, 캐시 친화성
- [x] [[linked-lists]] - 배열 대비 진짜 트레이드오프 (포인터 추적 비용), 실무에서 드문 이유
- [x] [[stacks-and-queues]] - 구현 선택지, 덱, 원형 버퍼

## 2. 해시

- [x] [[hash-tables]] - 해시 함수, 체이닝 vs 오픈 어드레싱, 로드 팩터, 리사이징
- [x] [[hash-in-practice]] - 언어별 구현 (Python dict, Java HashMap), SipHash와 HashDoS

## 3. 트리

- [x] [[binary-search-trees]] - BST 연산, 균형 깨지면 O(n)
- [x] [[balanced-trees]] - AVL vs Red-Black, 회전, 실무 채택 (std::map)
- [x] [[b-trees]] - 디스크 기반 트리, 차수가 큰 이유 → database/인덱스와 직결
- [ ] [[heaps]] - 이진 힙, heapify O(n) 증명, 우선순위 큐
- [ ] [[tries]] - 트라이, 자동완성, radix tree

## 4. 집합·구간

- [ ] [[union-find]] - 경로 압축 + rank, 역아커만 복잡도
- [ ] [[segment-tree-and-bit]] - 구간 질의, 펜윅 트리

## 5. 확률적 자료구조

- [ ] [[bloom-filter]] - 원리, false positive 확률 계산, 실사용 (캐시 앞단)
- [ ] [[skip-list]] - 확률적 균형, Redis가 쓰는 이유
- [ ] [[hyperloglog]] - 카디널리티 추정
