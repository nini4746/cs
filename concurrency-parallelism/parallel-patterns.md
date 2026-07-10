# 병렬 패턴 (Parallel Patterns)

## 한 줄 요약

병렬 프로그램을 짜는 재사용 가능한 골격들 - map(독립 변환), reduce(트리 결합), scan(누적합), fork-join(분할정복), pipeline(단계 병렬). 핵심은 문제를 **독립적인 조각으로 쪼개고**(데이터 병렬) 의존성 사슬(span)을 짧게 만드는 것. MapReduce·GPU·병렬 라이브러리가 다 이 패턴들의 조합.

## 왜 필요한가

- 병렬 코드를 어떤 구조로 짜나 (매번 새로 X)
- reduce·scan이 어떻게 O(log n) span으로 병렬화되나
- 데이터 병렬 vs 태스크 병렬

## 데이터 병렬 vs 태스크 병렬

```
데이터 병렬: 같은 연산을 많은 데이터에 (SIMD, GPU [[gpu-computing]])
             "배열 각 원소에 f 적용" → 자연스럽게 병렬
태스크 병렬: 다른 연산을 동시에 (파이프라인 단계, 독립 작업)
```

- 데이터 병렬이 확장성 좋음 (조각 수 = 데이터 크기)
- 대부분 실전은 둘의 조합

## Map: 독립 변환 (가장 쉬움)

```
map(f, [x1..xn]) = [f(x1)..f(xn)]   각 원소 독립 → 완전 병렬
```

- 의존성 없음 → span O(1) (이론상), work O(n)
- **embarrassingly parallel**(당황스럽게 쉬운 병렬): 이미지 필터, 몬테카를로
- 가장 이상적 - 조율 거의 불필요

## Reduce: 트리 결합

```
reduce(+, [x1..xn]) = x1+x2+...+xn
순차: span O(n)   트리: span O(log n)  (결합법칙 이용)
```

### 코드로 확인

```
트리 리덕션 합=31  깊이(span)=3 = ceil(log2(8))=3
```

- 인접 쌍을 병렬로 더하며 절반씩 → **log n 단계**에 완료
- 조건: **결합법칙**(associativity) 성립해야 (`(a+b)+c=a+(b+c)`) → 순서 자유
- 부동소수점 주의: 결합법칙이 정확히 안 성립 → 병렬 합은 순차 합과 미세하게 다를 수 있음 (computer-architecture/의 부동소수점)

## Scan (prefix sum): 누적 병렬

```
scan(+, [3,1,4,1,5,9,2,6]) = [3,4,8,9,14,23,25,31]  (각 위치까지 누적)
```

실행:
```
prefix sum(scan): [3, 4, 8, 9, 14, 23, 25, 31]
검증: 마지막 원소 31 == 총합 31
```

- 순차로는 당연하지만 **병렬로 span O(log n)** (Hillis-Steele / Blelloch 알고리즘)
- 놀랍도록 자주 쓰임: 정렬(기수 정렬 자리 계산), 필터의 출력 위치 할당, 스트림 압축, 히스토그램
- "누적은 순차적"이라는 직관을 깨는 대표 예

## Fork-Join: 분할정복 병렬

```
문제를 반으로 나눠 병렬 실행 → 결과 합침
fork: 하위 작업 분기,  join: 완료 대기 후 결합
```

- 병렬 정렬(merge sort), 병렬 탐색 (algorithms/[[divide-and-conquer]])
- **work-stealing** 스케줄러가 유휴 코어에 일 분배 (Cilk, Java ForkJoinPool, Go) → span에 근접 ([[parallelism-limits]])

## Pipeline: 단계 병렬 (태스크 병렬)

```
데이터 흐름을 단계로: [읽기] → [변환] → [쓰기]
각 단계가 다른 코어에서 동시에 (조립 라인)
```

- 컴파일러 단계(compilers/), 스트림 처리, CPU 파이프라인(computer-architecture/[[pipelining]])
- 처리량↑ (지연은 그대로, 단위시간 처리량 증가)
- 병목 단계가 전체 속도 결정 (가장 느린 단계)

## MapReduce (분산 스케일)

map+reduce 패턴을 **분산 시스템**으로:

```
map: 데이터 조각마다 (key,value) 방출 → shuffle(key로 모음) → reduce: key별 집계
```

- 수천 대에 걸친 데이터 병렬 (distributed-systems/, devops/[[cloud-basics]])
- Hadoop/Spark의 토대 - 패턴이 스케일을 만남

## 왜 중요한가

- **바퀴 재발명 방지**: 검증된 골격 조합 (직접 락 다루기보다 안전)
- **span 최소화**: reduce/scan의 O(log n)이 [[parallelism-limits]]의 병렬도를 실현
- **라이브러리로 추상화**: OpenMP, TBB, Rayon, NumPy - 패턴을 API로 → 사용자는 조합만

## 셀프 체크

> [!question]- reduce가 span O(log n)으로 병렬화되는 조건은?
> 결합법칙(associativity)이 성립해야 한다. `(a+b)+c = a+(b+c)`라 결합 순서가 자유로우면 인접 쌍을 병렬로 결합하며 절반씩 줄여 log n 단계에 끝난다.

> [!question]- scan(prefix sum)이 "누적은 순차적"이라는 직관을 깨는 이유는?
> 각 위치까지의 누적이라 순차적으로 보이지만, Hillis-Steele/Blelloch 알고리즘으로 span O(log n)에 병렬화된다. 정렬 자리 계산·필터 출력 위치·스트림 압축에 자주 쓰인다.

> [!question]- 데이터 병렬과 태스크 병렬의 차이는?
> 데이터 병렬은 같은 연산을 많은 데이터에 적용(map, SIMD/GPU)해 조각 수가 데이터 크기라 확장성이 좋다. 태스크 병렬은 다른 연산을 동시에(pipeline 단계, 독립 작업) 수행한다.

> [!question]- 병렬 리덕션에서 부동소수점을 주의해야 하는 이유는?
> 부동소수점 덧셈은 결합법칙이 정확히 성립하지 않는다(반올림). 결합 순서가 달라지는 병렬 합은 순차 합과 미세하게 다른 결과를 내 재현성 문제가 생긴다.

## 연습문제

> [!example]- 문제: 정수 배열에 병렬 트리 리덕션을 뺄셈으로 수행하면 왜 틀리는지 논증하고, 언제는 안전한지 밝혀라
> **풀이**
> 트리 리덕션은 결합 순서를 임의로 바꾼다. 뺄셈은 결합법칙이 성립하지 않아 `(a-b)-c ≠ a-(b-c)`이므로, 짝짓는 방식에 따라 결과가 달라진다. 예: [8,1,2]를 `(8-1)-2=5` vs `8-(1-2)=9`.
> 안전 조건: 리덕션 연산은 결합법칙을 만족하는 모노이드여야 한다(+, ×, max, min, AND). 뺄셈이 필요하면 부호를 데이터에 흡수해 덧셈 리덕션으로 바꾼다.

> [!example]- 문제: [읽기]→[압축]→[쓰기] 3단계 파이프라인에서 압축이 가장 느릴 때 전체 처리량과 개선 방향을 설계하라
> **풀이**
> 파이프라인 처리량은 가장 느린 단계가 결정한다(병목). 세 단계가 각기 다른 코어에서 겹쳐 돌아도 전체 throughput은 압축 단계의 처리 속도로 제한된다(지연은 단계 합 그대로).
> 개선: 병목인 압축 단계를 내부에서 데이터 병렬로 쪼개(여러 워커가 청크 압축) 그 단계의 유효 처리량을 올린다. 단계별 처리량을 균형 맞추는 것이 목표다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) map/reduce/scan/fork-join/pipeline 각 패턴이 무엇을 병렬화하는가, (2) reduce·scan의 O(log n) span이 왜 결합법칙에 의존하는가, (3) 데이터 병렬과 태스크 병렬(pipeline)의 차이와 병목 단계의 의미.

## 연결

- span·병렬도 → [[parallelism-limits]]
- 데이터 병렬 하드웨어 → [[simd-and-vectorization]], [[gpu-computing]]
- 분할정복 → algorithms/[[divide-and-conquer]]
- 파이프라인 하드웨어 → computer-architecture/[[pipelining]]
- MapReduce 분산 → distributed-systems/[[message-queues]], devops/[[cloud-basics]]
- 리덕션 결합법칙 깨는 부동소수점 → computer-architecture/[[floating-point]]

## 궁금한 것 (나중에)

- [ ] work-stealing 스케줄러 상세 (Cilk)
- [ ] Blelloch scan (work-efficient 병렬 scan)
- [ ] 병렬 정렬 알고리즘 (sample sort, bitonic)
- [ ] 부동소수점 병렬 리덕션 재현성

## 출처

- "Structured Parallel Programming"(McCool et al.), Blelloch scan, MapReduce(Dean & Ghemawat)
