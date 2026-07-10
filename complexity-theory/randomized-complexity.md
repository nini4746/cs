# 무작위 복잡도 (Randomized Complexity)

## 한 줄 요약

동전 던지기(무작위 비트)를 쓰는 다항 시간 알고리즘의 클래스들 - BPP(양측 오류), RP·co-RP(한쪽 오류), ZPP(오류 없이 기대시간 다항). 무작위성은 소수판정·다항식 항등검사 등에서 강력했지만, "무작위가 결정성을 진짜로 능가하나"는 미해결이고 오히려 P=BPP(탈무작위화)가 유력하다. [[approximation-algorithms]]의 PCP 검증자도 무작위성을 쓴다.

## 왜 필요한가

- 무작위 알고리즘이 종종 결정적보다 간단·빠름 (해싱, 소수판정, 소트)
- "무작위성이 계산 능력을 더하나?"는 근본 질문
- 회로 하한과 얽혀 탈무작위화·의사난수(PRG) 이론으로 연결

## 확률적 튜링 머신

일반 TM에 **무작위 비트 테이프**(공정한 동전) 추가. 판정이 확률변수가 됨. 오류를 어떻게 제한하느냐로 클래스가 갈림.

| 클래스 | x ∈ L일 때 | x ∉ L일 때 | 오류 유형 |
|---|---|---|---|
| **RP** | Pr[수용] ≥ 1/2 | Pr[수용] = 0 | 한쪽(yes만 틀림) |
| **co-RP** | Pr[수용] = 1 | Pr[수용] ≤ 1/2 | 한쪽(no만 틀림) |
| **BPP** | Pr[수용] ≥ 2/3 | Pr[수용] ≤ 1/3 | 양측 |
| **ZPP** | 항상 정답, 기대 다항시간 | | 오류 없음(시간만 랜덤) |

- **RP**: yes면 절반 이상 잡음, no면 절대 오탐 없음. "수용" 나오면 확실히 yes
- **co-RP**: 반대. "거부" 나오면 확실히 no
- **ZPP = RP ∩ co-RP**: Las Vegas 알고리즘 - 답은 늘 옳고 실행시간만 무작위

## 오류 증폭 (amplification)

핵심 성질: 오류 확률을 독립 반복으로 지수적으로 줄임.

- RP를 k번 독립 실행, 한 번이라도 수용하면 수용 → 오탐 확률 (1/2)ᵏ
- BPP는 k번 실행 후 **다수결** → Chernoff 한계로 오류가 `2^(−Ω(k))`로 감소
- 그래서 정의의 1/2, 2/3 상수는 임의 (2/3든 1−2⁻ⁿ든 같은 클래스) → math/[[probability-basics]]

```mermaid
graph LR
    one[1회: 오류 1/3] -->|k회 반복 + 다수결| many[오류 2^-Ω k]
    many --> practical[사실상 확실]
```

## 클래스 관계

```
P ⊆ ZPP ⊆ RP ⊆ BPP ⊆ PSPACE
RP ⊆ NP,   ZPP = RP ∩ co-RP
```

- **BPP ⊆ P/poly** (Adleman): 좋은 무작위 비트열을 회로에 "박아넣을" 수 있음
- **BPP ⊆ Σ₂ ∩ Π₂** (Sipser-Gács): BPP가 다항 계층 2단계 안에 → [[beyond-np]]
- BPP vs NP 관계는 불명 (포함 여부 양방향 다 미해결)

## 무작위성의 힘 - 예시

| 문제 | 무작위 알고리즘 |
|---|---|
| 소수판정 | Miller-Rabin (co-RP), 암호에 실용 → cryptography/[[public-key-crypto]] |
| 다항식 항등검사(PIT) | Schwartz-Zippel: 랜덤 대입해 0인지 (co-RP) |
| 최소 컷 | Karger의 무작위 수축 |
| 이분매칭 존재 | Tutte 행렬식 랜덤 평가 |

- 소수판정은 원래 무작위(Miller-Rabin)로 실용화, 이후 **AKS로 P**임이 증명됨 - 무작위가 준 힌트가 결국 결정적으로 흡수된 대표 사례
- PIT는 아직 결정적 다항 알고리즘 미발견 - 탈무작위화의 상징 문제

## 탈무작위화 (맛보기)

**P = BPP인가?** 다수 전문가는 **예**(무작위성이 다항 시간에선 본질적 힘이 아니다)라고 봄.

- 핵심 도구: **의사난수 생성기(PRG)** - 짧은 시드로 "구분 못 할" 긴 난수열 생성
- **Nisan-Wigderson / Impagliazzo-Wigderson**: 충분히 강한 **회로 하한**(예: E ⊄ SIZE(2^εn))이 있으면 강한 PRG가 존재하고 → **P = BPP**
- 즉 "무작위 vs 결정" 문제가 "회로 하한" 문제로 환원됨 - hardness가 randomness를 산다(hardness vs randomness)
- 대조: 공간의 무작위(RL=L?)는 상당 부분 해결에 근접

## 오류 없는 vs 있는 정리

- ZPP(Las Vegas): 답 항상 옳음, 시간만 랜덤 - 원하면 언제든 멈추고 "모름" 없이 정답
- RP/BPP(Monte Carlo): 시간 고정, 답에 오류 확률 - 증폭으로 무시할 수준까지
- 실무 암호·시뮬레이션은 이 구분이 안전성에 직결

## 연결

- 클래스 사슬 배경 → [[p-and-np]], [[space-classes]]
- BPP ⊆ Σ₂, 다항 계층 → [[beyond-np]]
- 무작위 검증자(PCP) → [[approximation-algorithms]]
- 소수판정·암호 응용 → cryptography/[[public-key-crypto]], security/[[crypto-basics]]
- 확률·기대·Chernoff → math/[[probability-basics]]
- automata/ 맛보기(BPP 언급) → automata/[[complexity-classes]]

## 궁금한 것 (나중에)

- [ ] Chernoff 한계로 BPP 증폭 계산 세부
- [ ] Nisan-Wigderson PRG 구성
- [ ] hardness vs randomness 정리 전체 논리
- [ ] RL = L 진전(무방향 연결성 이후)

## 출처

- Arora & Barak 7장(무작위 계산), 20장(탈무작위화)
- Motwani & Raghavan, *Randomized Algorithms*
