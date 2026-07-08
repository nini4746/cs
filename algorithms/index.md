---
title: "algorithms"
---

# 알고리즘 syllabus

기준 교과서: **CLRS** (Introduction to Algorithms) + MIT 6.006. 자료구조 자체는 data-structures/에서.

## 1. 기초

- [x] [[asymptotic-analysis]] - Big-O/Θ/Ω 정확한 정의, 상수가 중요해지는 경우
- [x] [[recurrences]] - 점화식 풀기, 마스터 정리, 재귀 트리
- [x] [[correctness-proofs]] - 루프 불변식으로 정당성 증명하는 법

## 2. 정렬과 탐색

- [x] [[comparison-sorts]] - merge/quick/heap 정렬, 비교 정렬 하한 Ω(n log n) 증명
- [x] [[linear-sorts]] - counting/radix/bucket, 비교 없이 하한 뚫는 법
- [x] [[binary-search]] - 변형들 (lower_bound, 답 이분 탐색), off-by-one 안 내는 틀
- [x] [[selection]] - k번째 원소 O(n), median of medians

## 3. 분할 정복

- [x] [[divide-and-conquer]] - 설계 패턴, 최근접 점 쌍, 카라츠바 곱셈

## 4. 동적 계획법

- [x] [[dp-fundamentals]] - 최적 부분 구조, 중복 부분 문제, top-down vs bottom-up
- [x] [[dp-patterns]] - LCS, LIS, 배낭, 편집 거리, 구간 DP
- [x] [[dp-optimization]] - 공간 압축, 비트마스크 DP

## 5. 그리디

- [x] [[greedy]] - 그리디가 성립하는 조건 (교환 논증), 활동 선택, 허프만 코딩

## 6. 그래프

- [x] [[graph-traversal]] - BFS/DFS, 위상 정렬, SCC
- [x] [[shortest-paths]] - 다익스트라, 벨만-포드, 플로이드-워셜, 음수 간선
- [x] [[mst]] - 크루스칼, 프림, cut property 증명
- [x] [[network-flow]] - 최대 유량, min-cut, 이분 매칭

## 7. 문자열

- [x] [[string-matching]] - KMP, 라빈-카프 → automata/와 연결 (KMP = DFA)

## 8. 계산 복잡도

- [x] [[p-vs-np]] - P, NP, NP-완전, 환원 → automata/complexity와 연결
- [ ] [[approximation-and-heuristics]] - NP-hard를 실전에서 다루는 법
