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

## 셀프 체크

> [!question]- RP, co-RP, BPP, ZPP의 오류 유형은 각각 무엇인가?
> RP는 한쪽 오류(yes 인스턴스만 틀릴 수 있음, 수용이 나오면 확실히 yes), co-RP는 반대(no만 틀림, 거부면 확실히 no), BPP는 양측 오류, ZPP는 오류 없이 기대 시간만 무작위(Las Vegas). ZPP = RP ∩ co-RP.

> [!question]- 오류 증폭이 왜 정의의 상수(1/2, 2/3)를 임의로 만드나?
> 독립 반복으로 오류가 지수적으로 준다. RP는 k번 실행 후 한 번이라도 수용하면 수용해 오탐이 (1/2)ᵏ, BPP는 k번 후 다수결로 Chernoff 한계에 의해 오류가 2^(−Ω(k))로 감소. 그래서 2/3이든 1−2⁻ⁿ이든 같은 클래스다.

> [!question]- 알려진 BPP의 상한 두 가지는 무엇이며 각각 무엇을 뜻하나?
> BPP ⊆ P/poly(Adleman) - 좋은 무작위 비트열을 회로에 박아넣을 수 있다. BPP ⊆ Σ₂ ∩ Π₂(Sipser-Gács) - BPP가 다항 계층 2단계 안에 들어간다. BPP vs NP 포함 관계는 양방향 미해결.

> [!question]- "hardness가 randomness를 산다"는 무슨 뜻인가?
> 충분히 강한 회로 하한(예: E ⊄ SIZE(2^εn))이 있으면 강한 의사난수 생성기(PRG)가 존재하고, 그로부터 P = BPP가 따라온다(Nisan-Wigderson, Impagliazzo-Wigderson). 즉 "무작위 vs 결정" 문제가 "회로 하한(hardness)" 문제로 환원된다.

## 연습문제

> [!example]- 다항식 항등검사(PIT)의 Schwartz-Zippel 알고리즘이 co-RP에 속함을 증명하라
> **풀이**
> 입력: 산술 회로로 주어진 다항식 p(x₁,…,xₙ), 전체 차수 ≤ d. 판정: p ≡ 0 인가?
> 알고리즘: 크기 |S| ≥ 2d인 유한집합 S에서 각 xᵢ를 균등 무작위로 뽑아 p(r)을 평가, p(r)=0이면 "항등(0)"으로 수용, 아니면 거부.
> 분석(Schwartz-Zippel 보조정리): p가 항등적으로 0이 아니면 Pr[p(r)=0] ≤ d/|S| ≤ 1/2.
> - p ≡ 0 (yes): 항상 p(r)=0 → Pr[수용] = 1.
> - p ≢ 0 (no): Pr[수용] = Pr[p(r)=0] ≤ 1/2.
> 이는 정확히 co-RP의 정의(yes는 확실, no는 절반 이하 오류). 평가가 회로 크기에 다항이므로 PIT ∈ co-RP. ∎

> [!example]- ZPP = RP ∩ co-RP임을 증명하라
> **풀이**
> (⊆) L ∈ ZPP이면 답이 항상 옳고 기대 다항 시간인 Las Vegas 머신 A가 있다. RP 판정: A를 기대시간의 2배까지만 돌리고, 끝나면 그 답을, 시간 초과면 "거부" 반환. Markov 부등식으로 초과 확률 ≤ 1/2. yes 인스턴스에서 A가 제때 끝나면 정답(수용)을 주므로 Pr[수용] ≥ 1/2, no 인스턴스에선 A가 절대 잘못 수용 안 하니 Pr[수용]=0 → RP. 대칭으로 시간 초과면 "수용" 반환하면 co-RP. 따라서 L ∈ RP ∩ co-RP.
> (⊇) L ∈ RP ∩ co-RP이면 RP 머신 M₁(no에서 오류 없음)과 co-RP 머신 M₂(yes에서 오류 없음)가 있다. 둘을 번갈아 반복 실행: M₁이 수용하면 확실히 yes로 확정, M₂가 거부하면 확실히 no로 확정, 둘 다 애매하면 재시도. 각 라운드가 확정될 확률이 상수 이상이라 기대 라운드 수가 상수, 답은 항상 옳음 → ZPP. ∎

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) RP/co-RP/BPP/ZPP를 오류 유형과 확률 조건으로 구분, (2) 오류 증폭이 정의 상수를 무의미하게 만드는 논리, (3) 탈무작위화(P=BPP)가 회로 하한으로 환원되는 hardness-vs-randomness 얼개.

## 연결

- 클래스 사슬 배경 → [[p-and-np]], [[space-classes]]
- BPP ⊆ Σ₂, 다항 계층 → [[beyond-np]]
- 무작위 검증자(PCP) → [[approximation-algorithms]]
- 소수판정·암호 응용 → cryptography/[[public-key-crypto]], security/[[crypto-basics]]
- 확률·기대·Chernoff → math/[[probability-basics]]
- automata/ 맛보기(BPP 언급) → automata/[[complexity-classes]]
- 오류 증폭의 Chernoff 집중부등식 → math/[[concentration]]

## 궁금한 것 (나중에)

- [ ] Chernoff 한계로 BPP 증폭 계산 세부
- [ ] Nisan-Wigderson PRG 구성
- [ ] hardness vs randomness 정리 전체 논리
- [ ] RL = L 진전(무방향 연결성 이후)

## 출처

- Arora & Barak 7장(무작위 계산), 20장(탈무작위화)
- Motwani & Raghavan, *Randomized Algorithms*
