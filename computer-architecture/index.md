---
title: "computer-architecture"
---

# 컴퓨터 구조 syllabus

대학 학부 컴퓨터구조 + 시스템 프로그래밍 수준. 기준 교과서:

- **CS:APP** - Computer Systems: A Programmer's Perspective (Bryant & O'Hallaron, 3판)
- **P&H** - Computer Organization and Design (Patterson & Hennessy)

노트 하나 = 챕터급 주제 하나. 완료하면 체크.

## 1. 정보의 표현 (CS:APP 2장)

- [x] [[bits-and-integers]] - 비트 연산, 부호 없는/2의 보수 정수, 오버플로우가 UB인 이유
- [x] [[floating-point]] - IEEE 754, 정밀도 한계, 0.1 + 0.2 != 0.3, NaN/Inf

## 2. 기계 수준 프로그램 (CS:APP 3장)

- [x] [[assembly-basics]] - 레지스터, 주소 지정 방식, mov/산술/제어 흐름 (x86-64 + ARM64 비교)
- [x] [[procedures-and-stack]] - 호출 규약, 스택 프레임, 재귀가 동작하는 원리
- [x] [[data-layout]] - 배열/구조체 메모리 배치, 정렬(alignment), 패딩
- [x] [[buffer-overflow]] - 스택 오버플로우 공격 원리와 방어 (canary, ASLR, NX)

## 3. 프로세서 아키텍처 (P&H 4장)

- [ ] [[isa-design]] - ISA란 무엇인가, RISC vs CISC, x86 vs ARM vs RISC-V
- [ ] [[pipelining]] - 5단계 파이프라인, 왜 클럭을 올릴 수 있나
- [ ] [[hazards]] - 구조/데이터/제어 해저드, 포워딩, 스톨

## 4. 프로그램 성능과 ILP (CS:APP 5장)

- [ ] [[compiler-optimization-limits]] - 컴파일러가 최적화 못 하는 것 (aliasing, 부작용)
- [ ] [[instruction-level-parallelism]] - 슈퍼스칼라, 비순차 실행, 루프 언롤링
- [ ] [[branch-prediction]] - 분기 예측, 예측 실패 비용, 정렬된 배열이 빨리 처리되는 이유

## 5. 메모리 계층 (CS:APP 6장)

- [ ] [[memory-hierarchy]] - 계층 구조, 지역성, 캐시 내부 동작, false sharing
- [ ] [[cache-misses]] - 3C 상세, 미스율 측정 (perf/instruments), memory mountain
- [ ] [[cache-coherence]] - MESI, 코어 간 캐시 동기화, false sharing의 근본 원인
- [ ] [[matrix-blocking]] - 행렬곱 blocking/tiling 직접 구현 + GFLOPS 측정

## 6. 링킹 (CS:APP 7장)

- [ ] [[linking]] - 심볼 해석, 재배치, 정적 vs 동적 링킹, 라이브러리가 로드되는 과정

## 7. 예외 제어 흐름 (CS:APP 8장, OS 접점)

- [ ] [[exceptions-and-interrupts]] - 인터럽트/트랩/폴트, 시스템 콜이 실제로 일어나는 과정 → os/와 연결

## 8. 가상 메모리 - 하드웨어 관점 (CS:APP 9장)

- [ ] [[virtual-memory]] - 주소 변환, 페이지 테이블, TLB (OS 관점은 os/에서)

## 9. 병렬 하드웨어

- [ ] [[simd]] - 벡터 연산, SIMD 명령어, 자동 벡터화
- [ ] [[multicore-and-numa]] - 멀티코어 구조, NUMA, 메모리 모델 맛보기
