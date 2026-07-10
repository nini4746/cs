# NP를 넘어서 (Beyond NP)

## 한 줄 요약

NP 위에는 더 풍부한 세계가 있다 - 양화 교대를 층층이 쌓은 다항 계층(PH), 해의 개수를 세는 #P, 증명자·검증자가 대화하는 상호작용 증명(IP=PSPACE), 그리고 양자 다항 시간 BQP. 이 클래스들은 P·NP·PSPACE 사이 지형을 채우며, "검증"을 계수·교대·상호작용·양자로 확장하면 무엇이 가능한지 보여준다.

## 왜 필요한가

- NP·co-NP만으론 "∀∃ 교대", "해의 개수", "대화형 증명" 같은 자연스러운 문제를 못 담음
- 최적화의 "이게 **유일** 최적인가", 확률추론의 "해가 **몇 개**인가" 등은 NP 밖
- 양자 컴퓨팅의 능력(BQP)이 이 지형 어디에 놓이는지가 암호에 직결

## 다항 계층 (PH)

NP·co-NP를 양화 교대로 일반화. 층 k마다 `∃∀∃…`(k번 교대).

| 층 | 정의 | 예 |
|---|---|---|
| Σ₁ = NP | ∃w. V(x,w) | SAT |
| Π₁ = co-NP | ∀w. V(x,w) | TAUTOLOGY |
| Σ₂ | ∃u ∀v. V | 최소 회로 존재? |
| Π₂ | ∀u ∃v. V | |
| Σₖ / Πₖ | k번 교대 | |

```
PH = ⋃ₖ Σₖ ⊆ PSPACE
```

- **붕괴 정리**: 어떤 층에서 Σₖ = Πₖ이면 PH 전체가 그 층으로 붕괴. 특히 P=NP면 PH=P
- PH가 무한히 진짜 층을 이룬다고 **믿지만 미증명** (P vs NP보다 강한 가정)
- TQBF(무제한 교대)는 PSPACE-완전이라 PH를 삼킴 → [[space-classes]]

```mermaid
graph BT
    P --> NP
    P --> coNP[co-NP]
    NP --> S2[Σ₂]
    coNP --> P2[Π₂]
    S2 --> PH
    P2 --> PH
    PH --> PSPACE
```

## #P와 세기 문제

**#P**(sharp-P): NP 검증자의 수용하는 증명서 **개수**를 세는 함수 클래스.

- NP가 "해가 **있나**?"라면 #P는 "해가 **몇 개**?"
- **#SAT**: 만족 할당의 수. **Permanent**(행렬 퍼머넌트) 계산
- **Valiant 정리**: Permanent는 #P-완전 - 항목이 0/1인 행렬조차. 결정판(이분매칭 존재)은 P인데 세기는 #P-완전이라는 극적 대비
- **Toda 정리**: PH ⊆ P^#P - 계수 능력이 다항 계층 전체를 다항으로 흡수. 세기가 교대보다도 강함
- 응용: 확률 그래프 모형 추론, 신뢰도 계산이 #P-hard → 근사(algorithms/[[approximation-and-heuristics]])로 우회

## 상호작용 증명 (IP)

증명자 Prover(무한 계산력)와 검증자 Verifier(다항·무작위)가 **여러 라운드 대화**. 검증자가 무작위 도전을 던지고 증명자가 답, 마지막에 수용/거부.

- yes면 정직한 증명자가 검증자를 확신시킴(완전성), no면 어떤 증명자도 못 속임(건전성, 오류 확률 낮음)
- **IP = PSPACE** (Shamir 1992): 대화형 증명의 힘이 정확히 다항 공간. 무작위성 없인 IP=NP인데, 무작위 도전이 능력을 PSPACE까지 끌어올림
- 증명 도구는 **산술화(arithmetization)** - 불리언 식을 다항식으로 올려 검증자가 랜덤 점에서 검사 (PCP와 같은 계보 → [[approximation-algorithms]])
- 다중 증명자 MIP = NEXP. 영지식(zero-knowledge) 증명의 이론적 뿌리 → cryptography/[[public-key-crypto]]

## BQP - 양자의 위치

**BQP**: 양자 컴퓨터가 다항 시간에 유계 오류로 푸는 문제 (BPP의 양자판).

```
P ⊆ BPP ⊆ BQP ⊆ PSPACE,   BQP ⊆ P^#P
```

- **인수분해·이산로그 ∈ BQP** (Shor) - RSA·Diffie-Hellman 위협 → cryptography/[[diffie-hellman]], cryptography/[[elliptic-curves]], security/[[crypto-basics]]
- 이 문제들은 NP-완전으로 안 알려짐(NP-중간 후보) → 양자가 NP-완전을 푼다는 뜻은 **아님**
- **BQP vs NP**: 포함 관계 양방향 모두 미해결. 양자가 NP-완전을 다항에 풀 근거 없음
- BQP는 PH 안에 있는지조차 불명 (오라클 분리 결과 존재)

## 지형 요약

| 클래스 | 확장 방향 | 상한 |
|---|---|---|
| PH | 양화 교대 | PSPACE |
| #P | 해 개수 세기 | Toda: PH ⊆ P^#P |
| IP | 무작위 상호작용 | = PSPACE |
| BQP | 양자 병렬 | ⊆ P^#P |

## 연결

- 출발점 P, NP, co-NP → [[p-and-np]]
- 무작위성(BPP, BQP의 배경) → [[randomized-complexity]]
- PSPACE·TQBF·게임 → [[space-classes]]
- 산술화·PCP 계보 → [[approximation-algorithms]]
- 양자 위협받는 암호 → cryptography/[[diffie-hellman]], cryptography/[[elliptic-curves]], security/[[crypto-basics]]
- automata/ 맛보기(#P, BQP 언급) → automata/[[complexity-classes]]

## 궁금한 것 (나중에)

- [ ] Toda 정리 PH ⊆ P^#P 증명 개요
- [ ] IP=PSPACE 산술화(sum-check protocol)
- [ ] PH 붕괴 정리의 정확한 조건
- [ ] BQP가 PH에 포함되는가 (오라클 분리 이후 진전)

## 출처

- Arora & Barak 5장(PH), 8장(IP), 9장(#P), 10장(양자)
- Sipser 10.4(상호작용 증명 맛보기)
