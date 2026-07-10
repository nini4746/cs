# 근사 알고리즘의 복잡도 (Approximation Complexity)

## 한 줄 요약

NP-hard 최적화 문제는 정확한 다항 해를 못 구하니 "최적에 얼마나 가까운가"를 근사 비율(approximation ratio)로 보증한다. PTAS/FPTAS는 임의 정밀도를, APX는 상수배를 보장하는 클래스이고, PCP 정리는 어떤 문제는 특정 비율 이하로 근사하는 것조차 NP-hard임을 증명한다(근사 불가능성). algorithms/[[approximation-and-heuristics]]가 알고리즘 설계라면 여기선 그 난이도 이론.

## 왜 필요한가

- NP-완전([[np-completeness]]) 최적화는 다항 정확해가 P=NP를 함의 → 근사로 타협
- "근사도 얼마나 어려운가"는 문제마다 천차만별 → 이론적 분류 필요
- 근사 비율의 **한계선**(무엇이 불가능한가)을 알아야 헛수고를 피함

## 근사 비율

최적값 OPT, 알고리즘 값 ALG. 최소화 문제 기준 비율 ρ ≥ 1:

```
ALG ≤ ρ · OPT      (최소화, ρ에 가까울수록 좋음)
OPT ≤ ρ · ALG      (최대화)
```

- ρ=2 근사: 항상 최적의 2배 이내 보장
- **최악의 경우** 보증 - 평균이나 휴리스틱과 다름
- 예: 정점덮개 2-근사(간선 하나 골라 양끝 다 넣기), 메트릭 TSP 1.5-근사(Christofides)

## 근사 클래스 위계

| 클래스 | 보증 | 예 |
|---|---|---|
| **FPTAS** | (1+ε), 시간 poly(n, 1/ε) | 배낭(knapsack) |
| **PTAS** | (1+ε), 각 ε마다 다항(1/ε는 지수 가능) | 유클리드 TSP, 일부 스케줄링 |
| **APX** | 어떤 상수 ρ | 정점덮개, MAX-3SAT |
| **근사 불가** | 상수 비율 불가(P≠NP 가정) | 일반 TSP, 최대 클리크 |

```
FPTAS ⊆ PTAS ⊆ APX ⊆ NPO
```

- **PTAS**: 원하는 정밀도 ε마다 다항 알고리즘. 단 `n^(1/ε)`처럼 ε에 지수 의존 허용
- **FPTAS**: 1/ε에도 다항 → 훨씬 실용적. 배낭이 대표(값 반올림 DP, algorithms/[[dp-fundamentals]])
- (P≠NP면 이 포함들은 진포함)

## 근사 보존 환원과 gap

- 보통 환원은 yes/no만 보존, 근사엔 부족 → **gap-preserving 환원** 필요
- 아이디어: yes 인스턴스는 OPT 큼, no 인스턴스는 OPT 작음 - 그 **간극(gap)**을 만들어 심음
- 근사 알고리즘이 이 간극 안을 구분하면 원 문제(NP-hard)를 풀어버림 → 그 비율 근사는 NP-hard
- L-reduction 등이 APX-완전성(예: MAX-3SAT) 전파에 쓰임

## PCP 정리 (맛보기)

**PCP(Probabilistically Checkable Proofs)** 정리: NP = PCP(log n, 1). 근사 불가능성 증명의 엔진.

- 모든 NP 증명을, **상수 개 비트만 무작위로 읽고** 다항 확률로 검증하도록 다시 쓸 수 있다
- 검증자: O(log n) 무작위 비트로 위치를 정하고 상수 개 비트만 조회
- 함의: MAX-3SAT에 **hardness gap**을 만듦 - "거의 다 만족" vs "일부만 만족"을 구분하는 게 NP-hard

```mermaid
graph LR
    NP[NP 문제] -->|PCP 재작성| Proof[증명서]
    Proof -->|O log n 무작위, 상수 비트 조회| V{검증자}
    V --> gap[근사 gap 생성 → 근사 불가]
```

## 대표 근사 불가능성 결과

| 문제 | 하한 (P≠NP / UGC 가정) |
|---|---|
| MAX-3SAT | 7/8 초과 근사 NP-hard (Håstad, 타이트) |
| 최대 클리크 | n^(1−ε) 근사 NP-hard |
| 집합 덮개 | (1−o(1))ln n 보다 좋게 불가 |
| 정점 덮개 | 2−ε 근사 NP-hard (Unique Games 가정) |

- **Unique Games Conjecture(UGC)**: 참이면 여러 문제의 근사 한계가 타이트해짐 - 미해결 대형 가설
- 어떤 문제는 상한(알고리즘)과 하한(PCP)이 정확히 만남(예: MAX-3SAT 7/8) → 최적 근사가 밝혀진 셈

## 실전 정리

- 문제가 NP-hard여도 근사 난이도는 제각각 - FPTAS부터 근사 불가까지 스펙트럼
- 설계 기법(탐욕·LP 완화·라운딩·로컬서치)은 algorithms/[[approximation-and-heuristics]]
- 하한이 알려지면 그 이상 좋은 비율은 헛수고 → 목표 비율 설정에 필수

## 셀프 체크

> [!question]- 최소화 문제에서 ρ-근사와 최대화 문제에서 ρ-근사의 부등식은 각각 어떻게 쓰나?
> 최소화는 `ALG ≤ ρ·OPT` (ρ≥1, 1에 가까울수록 좋음), 최대화는 `OPT ≤ ρ·ALG`. 둘 다 최악의 경우 보증이며 평균·휴리스틱과 다르다.

> [!question]- FPTAS와 PTAS의 결정적 차이는 무엇인가?
> 둘 다 임의의 ε에 대해 (1+ε)-근사를 다항 시간에 낸다. 단 PTAS는 실행시간이 1/ε에 지수 의존(예: n^(1/ε))을 허용하고, FPTAS는 n과 1/ε 모두에 다항이라 훨씬 실용적이다. 배낭이 FPTAS 대표.

> [!question]- gap-preserving 환원이 왜 필요하며 어떻게 근사 불가능성을 증명하나?
> 보통 환원은 yes/no만 보존해 근사엔 부족하다. gap 환원은 yes 인스턴스는 OPT를 크게, no 인스턴스는 작게 만들어 그 간극을 심는다. 어떤 근사 알고리즘이 이 간극 안을 구분하면 원 NP-hard 문제를 풀어버리므로, 그 비율의 근사가 NP-hard가 된다.

> [!question]- PCP 정리 NP = PCP(log n, 1)의 두 파라미터는 각각 무엇을 뜻하나?
> 검증자가 O(log n) 개의 무작위 비트로 조회 위치를 정하고, 증명서에서 상수 개의 비트만 읽어 다항 확률로 검증한다는 뜻이다. 이 재작성이 MAX-3SAT에 hardness gap을 만들어 근사 불가능성의 엔진이 된다.

## 연습문제

> [!example]- 정점덮개 2-근사(간선 골라 양끝 넣기)의 근사 비율이 2임을 증명하라
> **풀이**
> 알고리즘: 아직 덮이지 않은 간선 e=(u,v)를 하나 고르고 u,v 둘 다 덮개에 넣고, e에 인접한 간선을 제거. 반복.
> 고른 간선들의 집합 M을 보면 서로 정점을 공유하지 않는다(매칭). 알고리즘이 넣은 정점 수는 정확히 2|M|.
> 어떤 정점덮개든 M의 각 간선을 덮으려면 그 간선의 끝점 중 최소 1개를 포함해야 하고, M의 간선들은 정점을 공유하지 않으므로 OPT ≥ |M|.
> 따라서 ALG = 2|M| ≤ 2·OPT. 근사 비율 2. ∎

> [!example]- MAX-3SAT의 (7/8+ε) 근사가 NP-hard임을 PCP로 논증하는 뼈대를 세워라
> **풀이**
> PCP 정리로 임의의 NP 문제 L을, 검증자가 상수 개 비트만 읽는 증명 검사로 재작성한다. 이 검사 각각을 상수 크기 3-CNF 절들로 인코딩하면 3SAT 인스턴스 φ가 나온다.
> yes 인스턴스: 정직한 증명서가 모든 검사를 통과 → φ의 거의 모든 절 만족(OPT 비율 ≈ 1).
> no 인스턴스: 어떤 증명서도 상수 비율 이상 검사를 통과 못 함 → φ에서 만족 가능한 절의 최대 비율이 7/8 이하로 눌린다(Håstad의 타이트 구성).
> 이 두 경우 사이 gap(1 vs 7/8)을 구분하는 근사 알고리즘은 L을 다항에 판정하게 되므로, 7/8을 넘는 근사는 NP-hard. Håstad가 이 하한이 타이트함(7/8-근사는 랜덤 할당으로 달성)을 보였다. ∎

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) 근사 비율의 정의와 FPTAS⊆PTAS⊆APX⊆NPO 위계, (2) gap-preserving 환원이 근사 하한을 만드는 논리, (3) PCP 정리 진술과 그것이 MAX-3SAT 근사 불가능성으로 이어지는 경로 - 이 셋을 막힘없이 설명할 수 있는가.

## 연결

- 알고리즘 설계 측면 → algorithms/[[approximation-and-heuristics]]
- 왜 근사하나 (NP-완전) → [[np-completeness]], [[p-and-np]]
- gap 환원의 기반 → [[reductions-and-hardness]]
- FPTAS의 DP 라운딩 → algorithms/[[dp-fundamentals]]
- 무작위 검증자 개념 → [[randomized-complexity]]
- 확률적 논증 → math/[[probability-basics]]

## 궁금한 것 (나중에)

- [ ] PCP 정리 증명 구조(산술화, 저차 다항 검사)
- [ ] Unique Games Conjecture의 현재 위치
- [ ] Håstad 7/8 하한 타이트성
- [ ] APX-완전성과 L-reduction 형식

## 출처

- Vazirani, *Approximation Algorithms*
- Williamson & Shmoys, *The Design of Approximation Algorithms*
- Arora & Barak 11장, 22장 (PCP)
