# 캐시 미스 (Cache Misses)

## 한 줄 요약

캐시 미스는 세 원인(3C)으로 분류된다. working set이 캐시보다 크면 지연시간이 계단식으로 뛰는데, 이 계단을 직접 측정하면 내 CPU의 캐시 계층이 그대로 드러난다.

## 왜 필요한가

- [[memory-hierarchy]]에서 "미스가 성능을 죽인다"고 했는데, 어떤 미스를 어떻게 줄이나
- 왜 어떤 데이터 크기에서 성능이 갑자기 떨어지나
- 프로파일러의 캐시 미스율을 어떻게 해석하나

## 3C: 미스의 세 원인

| 종류 | 원인 | 줄이는 법 |
|---|---|---|
| **Compulsory (cold)** | 처음 접근 - 캐시에 있을 수가 없음 | 프리페칭, 큰 블록 |
| **Capacity** | working set이 캐시 용량 초과 | working set 줄이기 (blocking/tiling) |
| **Conflict** | 같은 집합에 매핑된 라인끼리 다툼 (캐시엔 자리 있는데) | 연관도 ↑, 데이터 배치 조정 (padding) |

- **Cold**은 불가피하지만 캐시 라인이 크면(64B) 한 번에 여러 데이터를 끌어와 상각
- **Capacity**는 가장 흔한 실전 병목. 알고리즘을 캐시에 맞게 쪼개는 게 답 → [[matrix-blocking]]
- **Conflict**는 stride가 2의 거듭제곱(4096 등)일 때 터짐. 배열 크기를 2^n에서 살짝 비틀면(padding) 완화

## 계단 측정: 캐시 계층이 드러난다

working set 크기를 키우며 **랜덤 pointer-chasing**(다음 주소가 이전 로드 결과 → 프리페처 무력화)으로 순수 접근 지연시간 측정. 이 머신 실측:

```
     4KB:   1 ns/access   ┐ L1 히트
    32KB:   1 ns/access   ┘
   256KB:   3 ns/access   ← L2 진입
  2048KB:   5 ns/access   ← L2/L3 경계
  8192KB:   7 ns/access   ┐ L3
 65536KB: 101 ns/access   ← RAM (캐시 초과, capacity miss 폭발)
```

64MB에서 지연시간이 100배로 뛴다. working set이 마지막 캐시를 넘는 순간 거의 모든 접근이 capacity miss → RAM 지연시간([[memory-hierarchy]]의 ~100ns)을 그대로 맞음. **이 계단의 위치 = 내 CPU 캐시 크기.**

### 왜 순차 접근으론 안 보이나

같은 실험을 순차 접근으로 하면 크기와 무관하게 평탄 (~0.3ns/elem). 하드웨어 프리페처가 다음 라인을 미리 끌어와 지연을 감추기 때문. 그래서 지연시간 측정엔 프리페처가 못 따라오는 랜덤 접근이 필수. **배열이 링크드 리스트보다 빠른 이유가 여기 다시 나온다** - 링크드 리스트 순회 = pointer chasing = 위 랜덤 곡선.

## 미스율 측정 도구

- **macOS**: Instruments의 CPU Counters, `xcrun xctrace`
- **Linux**: `perf stat -e cache-misses,cache-references ./a.out`, `perf record`
- 미스율만이 아니라 **미스 종류**를 추론: 크기를 바꿔 capacity 경계 찾기, stride를 바꿔 conflict 확인

## 줄이는 전략 종합

1. **지역성 높이기** ([[memory-hierarchy]]): 순차 접근, 작은 stride
2. **working set을 캐시에 맞추기**: 큰 데이터를 블록으로 쪼개 처리 → [[matrix-blocking]]의 핵심
3. **자료구조 선택**: 배열 > 링크드 리스트/트리 (pointer chasing 회피). 캐시 친화적 자료구조 (B-tree, 배열 기반 힙)
4. **conflict 회피**: 2^n stride 피하기, false sharing 방지 ([[cache-coherence]])
5. **hot/cold 분리**: 자주 쓰는 필드만 모아 캐시 라인에 (SoA, [[data-layout]])

## 연결

- 캐시 구조와 지역성 기초 → [[memory-hierarchy]]
- capacity miss를 알고리즘으로 잡기 → [[matrix-blocking]]
- conflict/false sharing의 코어 간 버전 → [[cache-coherence]]
- 자료구조 배치 → [[data-layout]]

## 궁금한 것 (나중에)

- [ ] 내 CPU의 정확한 L1/L2 크기와 위 계단 위치 대조 (`sysctl hw.perflevel0`)
- [ ] perf로 3C를 실제로 구분하는 방법
- [ ] TLB 미스는 이 곡선에 어떻게 겹치나 → [[virtual-memory]]
- [ ] non-temporal store(캐시 우회 쓰기)는 언제 이득인가

## 출처

- CS:APP 6.2-6.5 (특히 6.5 memory mountain)
