# 병렬성의 한계 (Limits of Parallelism)

## 한 줄 요약

코어를 아무리 늘려도 직렬 부분이 성능의 벽이 된다 - Amdahl 법칙은 "고정 문제에서 직렬 10%면 최대 10배"라는 냉정한 상한을 준다. 하지만 Gustafson은 "문제 크기를 키우면 선형 확장 가능"이라 반박한다. work-span 모델로 병렬성의 이론적 상한(병렬도)을 정량화한다.

## 왜 필요한가

- 코어 2배가 왜 속도 2배가 아닌가
- Amdahl vs Gustafson, 왜 둘 다 맞나
- 병렬 알고리즘의 이론적 한계 (work-span)

## Amdahl 법칙 (비관적 상한)

**고정된 문제 크기**에서 직렬 부분이 상한을 못 박음:

```
가속(n) = 1 / [ (1-p) + p/n ]
  p = 병렬화 가능 비율, n = 코어 수
  n→∞ 이면 → 1/(1-p)  (직렬 부분이 벽)
```

### 코드로 확인

병렬 90%(p=0.9):
```
      1 코어 → 1.00x 가속
      8 코어 → 4.71x 가속
     16 코어 → 6.40x 가속
   1024 코어 → 9.91x 가속
  이론 최대(n=∞) = 10.0x  <- 직렬 10%가 벽

병렬 비율별 최대 가속:
  p=0.5:  최대 2.0x
  p=0.9:  최대 10.0x
  p=0.95: 최대 20.0x
  p=0.99: 최대 100.0x
```

- **직렬 10%면 코어 1024개여도 겨우 9.91배** (10배 벽에 막힘)
- 교훈: **직렬 부분을 줄이는 게 코어 늘리기보다 중요** (p를 0.9→0.99로)
- 수확 체감: 코어 8→16은 4.71→6.40 (2배 코어에 1.36배만)

## Gustafson 법칙 (낙관적 반박)

**문제 크기를 코어에 맞춰 키우면** 선형 확장:

```
가속(n) = (1-p) + p·n
```

실행:
```
Gustafson (문제 크기도 커짐) - p=0.9:
     16 코어 → 14.50x (선형 증가)
```

- 핵심 통찰: **큰 기계는 큰 문제를 푼다**. 코어가 많으면 더 큰 데이터를 처리 (직렬 비율이 상대적으로 작아짐)
- Amdahl은 "같은 문제를 빨리", Gustafson은 "더 큰 문제를 같은 시간에"
- 둘 다 맞음 - **가정이 다름**: 고정 크기(Amdahl) vs 확장 크기(Gustafson)
- 빅데이터·과학 계산은 Gustafson 쪽 (그래서 슈퍼컴이 의미)

## Work-Span 모델 (이론적 병렬도)

병렬 알고리즘의 본질적 한계를 그래프로:

```
Work (T₁)  = 총 연산량 (1코어 시간) - 전체 작업
Span (T∞)  = 임계 경로 (무한 코어 시간) - 의존성 사슬의 최장 경로
병렬도(parallelism) = T₁ / T∞  ← 이론상 최대 가속
```

- **Span이 하한**: 아무리 코어 많아도 의존 사슬(T∞)보다 빠를 수 없음 (algorithms/의 임계 경로)
- **Brent 정리**: `Tₚ ≤ T₁/p + T∞` → p코어 실행시간 상한
- 좋은 병렬 알고리즘 = work 적고(효율) span 짧음(병렬도↑)
- 예: 배열 합 - work O(n), span O(log n) → 병렬도 O(n/log n) (트리 리덕션)

## 병렬성을 깎는 현실 요인

이론 상한에도 못 미치는 실제 이유:

- **동기화 오버헤드**: 락·배리어 대기 ([[atomics-and-cas]], [[lock-free-structures]])
- **통신·데이터 이동**: 코어 간 캐시 전송, NUMA (computer-architecture/[[cache-coherence]])
- **부하 불균형**: 일이 고르게 안 나뉘면 느린 쪽 대기
- **거짓 공유(false sharing)**: 다른 변수인데 같은 캐시라인 → 무의미한 경쟁
- **메모리 대역폭**: 코어는 많은데 메모리가 병목 (computer-architecture/[[memory-hierarchy]])

## 왜 중요한가

- **확장성 판단**: "코어 더 넣으면 빨라지나?"의 정량적 답
- **최적화 우선순위**: Amdahl → 직렬 병목부터 (프로파일링, devops/[[linux-debugging]])
- **알고리즘 설계**: span을 줄이는 병렬 알고리즘 ([[parallel-patterns]])
- 클라우드 비용: 코어 2배 값어치 하나 (Amdahl로 예측, devops/[[cloud-basics]])

## 연결

- 병렬 알고리즘·리덕션 → [[parallel-patterns]]
- 동기화 비용 → [[atomics-and-cas]], [[lock-free-structures]]
- 메모리·캐시 병목 → computer-architecture/[[memory-hierarchy]], [[cache-coherence]]
- 임계 경로 → algorithms/[[graph-theory]]
- 프로파일링 → devops/[[linux-debugging]]

## 궁금한 것 (나중에)

- [ ] Universal Scalability Law (Gunther - 경쟁+일관성 비용)
- [ ] work-stealing 스케줄러 (Cilk, span 근접)
- [ ] NUMA 인식 병렬화
- [ ] roofline 모델 (연산 vs 대역폭 한계)

## 출처

- Amdahl(1967), Gustafson(1988), "Introduction to Algorithms"(CLRS) 27장 병렬 알고리즘
