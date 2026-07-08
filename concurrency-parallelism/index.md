---
title: "concurrency-parallelism"
---

# 동시성·병렬성 syllabus

기준: **"The Art of Multiprocessor Programming"** (Herlihy & Shavit) + Cornell CS6120류 + CUDA 문서. 석사급 - os/의 스레드·락 기초 위에서 메모리 모델·lock-free·병렬 알고리즘·하드웨어 병렬을 다룬다.

전제: os/[[threads-and-races]], os/[[locks]], os/[[semaphores]], os/[[deadlock]], os/[[lock-free-basics]] (기초는 os에서). 여기선 **왜 어렵고, 어떻게 확장하나**.

핵심 질문: **공유 상태는 왜 지옥이고, 어떻게 안전하게 병렬로 빨라지나?**

## 1. 동시성의 본질

- [x] [[concurrency-vs-parallelism]] - 동시성≠병렬성, 왜 인간 직관이 깨지나, 결정성 상실
- [ ] [[memory-models]] - 메모리 재정렬, happens-before, sequential vs relaxed, acquire/release

## 2. Lock-free와 원자성

- [ ] [[atomics-and-cas]] - 원자 연산, compare-and-swap, ABA 문제, 왜 CAS가 만능 아닌가
- [ ] [[lock-free-structures]] - lock-free 스택/큐, 진행 보장 계층(wait-free/lock-free/obstruction-free)

## 3. 병렬성 이론

- [ ] [[parallelism-limits]] - Amdahl vs Gustafson, work-span 모델, 확장성의 벽
- [ ] [[parallel-patterns]] - map/reduce/scan, fork-join, pipeline, 데이터 vs 태스크 병렬

## 4. 하드웨어 병렬

- [ ] [[simd-and-vectorization]] - SIMD, 자동 벡터화, 데이터 정렬 → computer-architecture/와 연결
- [ ] [[gpu-computing]] - SIMT, 워프, 메모리 계층, 왜 GPU가 특정 문제에 수십 배인가

## 5. 동시성 모델

- [ ] [[message-passing]] - actor(Erlang), CSP(Go 채널), shared-nothing, 왜 메시지가 락보다 나은가
- [ ] [[async-and-coroutines]] - async/await, 이벤트 루프, 코루틴, 협력 스케줄링 → web/[[javascript-event-loop]]
- [ ] [[structured-concurrency]] - 구조적 동시성, 취소·스코프, 왜 "go문"이 goto처럼 위험한가
