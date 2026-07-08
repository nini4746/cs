# GPU 컴퓨팅 (GPU Computing)

## 한 줄 요약

수천 개의 단순한 코어로 같은 명령을 방대한 데이터에 동시 적용하는 처리량 기계. CPU가 지연(latency) 최적화라면 GPU는 **처리량(throughput) 최적화** - 워프 단위 SIMT 실행과 대규모 스레드로 메모리 지연을 숨긴다. 데이터 병렬·산술 집약적 문제(행렬곱, 딥러닝)에서 CPU 대비 수십 배지만, 분기·불규칙 접근엔 약하다.

## 왜 필요한가

- GPU가 왜 특정 문제에 압도적인가
- SIMT·워프가 뭔가
- 왜 딥러닝이 GPU를 쓰나 (ai-ml/[[llm-training]])

## CPU vs GPU 철학

```
CPU: 소수의 강력한 코어 (복잡한 제어, 큰 캐시, 분기 예측)
     → 지연 최적화 (한 작업을 빨리)
GPU: 수천 개 단순 코어 (작은 제어, 큰 산술 유닛)
     → 처리량 최적화 (많은 작업을 동시에)
```

- CPU는 순차·분기 많은 코드, GPU는 **데이터 병렬**([[parallel-patterns]]의 map) 대량 연산
- GPU는 제어·캐시에 쓸 트랜지스터를 **산술 유닛(ALU)**에 투자 → 연산 밀도↑

## SIMT (핵심 실행 모델)

**Single Instruction, Multiple Threads** - SIMD([[simd-and-vectorization]])의 스레드판:

```
워프(warp, NVIDIA 32스레드): 같은 명령을 32스레드가 동시 실행 (lockstep)
스레드마다 다른 데이터 → 데이터 병렬
```

- SIMD가 "한 명령 여러 데이터"라면 SIMT는 "한 명령 여러 스레드" (프로그래밍은 스레드처럼, 실행은 SIMD처럼)
- **워프 다이버전스(divergence)**: 워프 내 스레드가 `if`로 갈라지면 → 양쪽 경로를 **순차 실행**(마스킹) → 성능 급락
  - GPU가 분기 많은 코드에 약한 근본 이유

## 지연 숨김 (latency hiding, 핵심 원리)

GPU는 캐시가 작은데 어떻게 느린 메모리를 견디나:

```
한 워프가 메모리 대기 → 즉시 다른 워프로 전환 (제로 오버헤드 스위칭)
수천 스레드가 대기 중 → 항상 실행할 워프가 있음 → 메모리 지연이 숨겨짐
```

- CPU는 캐시로 지연을 **줄이고**, GPU는 병렬로 지연을 **숨김** (다른 철학)
- **점유율(occupancy)**: 충분한 워프가 상주해야 지연 숨김 → GPU 최적화의 핵심 지표

## 메모리 계층 (GPU 특유)

```
레지스터 (스레드별, 최속)
공유 메모리 (블록 내 스레드 공유, 프로그래머 관리 캐시) ← 핵심 최적화 포인트
글로벌 메모리 (전체, 큼, 느림 - 여기 접근 최소화)
```

- **coalescing(병합 접근)**: 워프의 32스레드가 **연속 주소** 접근하면 한 번의 트랜잭션 → 흩어지면 32번 (성능 수십 배 차이)
- 공유 메모리로 재사용 데이터 캐싱 (타일링) → 글로벌 접근 줄임 (computer-architecture/[[memory-hierarchy]]의 지역성)

## 프로그래밍 모델 (CUDA)

```
grid → block(스레드 블록) → thread 계층
커널(kernel): GPU에서 도는 함수, 수천 스레드가 각자 실행
호스트(CPU) ↔ 디바이스(GPU) 메모리 복사 (PCIe 병목)
```

- CUDA(NVIDIA), OpenCL/SYCL(범용), 최근 Triton(파이썬으로 커널)
- **데이터 전송이 병목**: CPU-GPU 복사가 비쌈 → 계산을 GPU에 오래 유지 ([[cloud-basics]]의 egress처럼)

## 언제 GPU가 이기나 (판단)

```
잘 맞음: 데이터 병렬 + 산술 집약 + 규칙적 접근 + 분기 적음
  → 행렬곱, 컨볼루션, 물리 시뮬레이션, 렌더링
안 맞음: 순차 의존 + 분기 많음 + 불규칙 메모리 + 작은 데이터
  → 전송 오버헤드가 이득 초과
```

- **arithmetic intensity**(연산/메모리 비율)가 높아야 이득 (roofline 모델)
- 작은 문제는 CPU가 나음 (전송·커널 실행 오버헤드)

## 왜 딥러닝의 심장인가

- 신경망 = **거대한 행렬곱**(ai-ml/[[neural-networks]]) = 완벽한 데이터 병렬·산술 집약
- 행렬곱은 arithmetic intensity 높음 → GPU 효율 극대 (텐서 코어는 행렬곱 전용 유닛)
- LLM 학습·추론이 GPU/TPU 위 (ai-ml/[[llm-training]], [[attention-and-transformers]])
- 대규모는 여러 GPU 분산 (distributed-systems/, [[parallelism-limits]])

## 연결

- SIMD의 스레드판 → [[simd-and-vectorization]]
- 데이터 병렬 map → [[parallel-patterns]]
- 메모리 지역성·타일링 → computer-architecture/[[memory-hierarchy]]
- 행렬곱·딥러닝 → ai-ml/[[neural-networks]], [[llm-training]]
- 다중 GPU 확장 → [[parallelism-limits]]
- 전송 병목·비용 → devops/[[cloud-basics]]

## 궁금한 것 (나중에)

- [ ] 텐서 코어·행렬곱 가속 상세
- [ ] roofline 모델로 병목 진단
- [ ] GPU 간 통신 (NVLink, NCCL)
- [ ] Triton으로 커널 작성 (파이썬)

## 출처

- "Programming Massively Parallel Processors"(Kirk & Hwu), CUDA C++ 프로그래밍 가이드
