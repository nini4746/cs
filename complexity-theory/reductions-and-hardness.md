# 환원과 어려움 (Reductions and Hardness)

## 한 줄 요약

환원은 "문제 A를 문제 B의 인스턴스로 다항 시간에 바꿔 풀기" - A ≤ₚ B이면 A는 B보다 어렵지 않다. 다항 다대일 환원(Karp)과 튜링 환원(Cook)이 있고, 이 관계로 NP-hard와 NP-complete를 정의한다. 알려진 어려운 문제를 새 문제로 환원하면 새 문제의 어려움이 증명된다. automata/[[reductions]]의 계산가능성 환원을 복잡도로 정밀화한 것.

## 왜 필요한가

- "이 문제 어렵다"를 직접 증명하긴 어려움 → 이미 아는 어려운 문제와 비교
- 문제 간 난이도를 정렬하는 유일한 도구
- NP-완전성 전체가 환원 위에 세워짐 ([[np-completeness]])

## 다항 다대일 환원 (Karp reduction)

A ≤ₚ B: **다항 시간 계산 함수** f가 존재해서

```
x ∈ A  ⇔  f(x) ∈ B
```

- 한 인스턴스를 다른 인스턴스로 변환, 답(yes/no)은 보존
- f는 B를 호출하지 않음 - 딱 한 번 변환만
- B를 다항에 풀면 A도 다항에 풀림 (f 돌리고 B 풀이기 호출)

```mermaid
graph LR
    x[A의 인스턴스 x] -->|다항 함수 f| fx["B의 인스턴스 f(x)"]
    fx --> B{B 풀이기}
    B -->|yes/no| ans[x의 답 그대로]
```

## 튜링 환원 (Cook reduction)

A ≤ᵀ B: B를 **오라클(신탁)**로 여러 번 호출하며 A를 다항에 푼다.

| 구분 | Karp (다대일) | Cook (튜링) |
|---|---|---|
| B 호출 | 1회, 답 그대로 | 여러 번, 자유 사용 |
| 방향성 | yes↔yes 보존 | 부정·조합 가능 |
| NP 구조 보존 | 예 (NP-완전에 씀) | 아니오 (co-NP 섞임) |

- Karp가 더 엄격 → NP-완전성 정의에 이걸 씀 (yes 인스턴스를 yes로만 보내야 NP 구조 유지)
- Cook은 최적화↔결정 문제 연결 등에 편리하지만 NP 안에서 클래스 구분이 흐려짐

## 환원의 성질

- **추이성**: A ≤ₚ B, B ≤ₚ C ⇒ A ≤ₚ C. 환원 사슬을 이어붙일 수 있음
- **하한 전파**: A가 어렵고 A ≤ₚ B이면 B도 어렵다 (대우로 씀)
- **상한 전파**: B가 쉽고 A ≤ₚ B이면 A도 쉽다
- 다항끼리 합성은 다항 (f, g 다항이면 g∘f 다항) → 클래스 P가 환원에 닫힘

## NP-hard vs NP-complete

| 용어 | 정의 | NP 소속 |
|---|---|---|
| **NP-hard** | 모든 A∈NP에 대해 A ≤ₚ L | 불필요 |
| **NP-complete** | NP-hard **이면서** L∈NP | 필요 |

- NP-hard는 "NP만큼 어렵다"만 말함 - NP 밖일 수 있음(예: TQBF는 PSPACE-완전이라 NP-hard지만 NP인지 불명, 정지문제는 NP-hard지만 결정불가) → [[space-classes]], automata/[[decidability]]
- NP-complete = NP-hard ∩ NP. "NP 안의 가장 어려운" 정확한 위치

## 환원으로 어려움 증명하기

새 문제 X가 NP-hard임을 보이는 표준 절차:

1. 이미 NP-완전으로 아는 문제 Y를 고른다 (3SAT가 단골, [[np-completeness]])
2. Y ≤ₚ X 환원 f를 만든다 - **방향 주의**: 알려진 어려운 Y에서 새 X로!
3. f가 다항 시간임을 보인다
4. `y ∈ Y ⇔ f(y) ∈ X` 정당성 증명 (양방향)
5. X ∈ NP까지 보이면 NP-완전

흔한 실수: 방향을 거꾸로 (X ≤ₚ Y) 하면 X가 Y보다 **쉽다**만 보여 어려움 증명 실패.

## 환원 예시 스케치

- **3SAT ≤ₚ CLIQUE**: 각 절을 정점 그룹으로, 서로 다른 절의 양립 가능(모순 아닌) 리터럴끼리 간선. 크기 k(절 개수) 클리크 ⇔ 각 절에서 참 리터럴 하나씩 고름
- **3SAT ≤ₚ 3-COLORING**: 참/거짓/기준 색 가젯(gadget) + 절마다 OR 가젯. 3색 칠 ⇔ 만족 할당
- **VERTEX-COVER ↔ INDEPENDENT-SET**: 여집합 관계, S가 독립집합 ⇔ V∖S가 정점덮개. 거의 자명한 환원
- 가젯(gadget) 설계가 환원 기술의 핵심 - 논리 구조를 그래프/수치 구조로 옮김

## 다른 어려움 개념

- **PSPACE-hard, EXPTIME-hard**: 더 큰 클래스에 대한 hardness. 환원 자원은 여전히 다항 (때로 로그공간) → [[space-classes]], [[hierarchy-theorems]]
- **#P-hard**: 세기 문제의 어려움 → [[beyond-np]]
- **로그공간 환원**(≤ₗ): L, NL 클래스 구분엔 다항이 너무 커서 로그공간 환원 사용

## 셀프 체크

> [!question]- Karp 환원과 Cook 환원의 핵심 차이는 무엇이고, NP-완전성 정의엔 왜 Karp를 쓰나?
> Karp(다대일)는 B를 딱 한 번 변환만 하고 답을 그대로 보존하며 yes↔yes를 유지한다. Cook(튜링)은 B를 오라클로 여러 번 호출하고 부정·조합이 가능하다. Cook은 co-NP를 섞어 NP 안의 클래스 구분을 흐리므로, yes 구조를 보존하는 Karp 환원을 NP-완전성 정의에 쓴다.

> [!question]- A ≤ₚ B가 성립할 때 하한·상한은 어느 방향으로 전파되나?
> A ≤ₚ B는 "A가 B보다 어렵지 않다". 상한 전파: B가 쉬우면 A도 쉽다. 하한 전파(대우): A가 어려우면 B도 어렵다. 환원은 추이적이라 사슬로 이어붙일 수 있다.

> [!question]- NP-hard와 NP-complete의 차이를 예로 설명하라.
> NP-hard는 모든 A∈NP가 A ≤ₚ L(NP만큼 어려움)만 요구하고 L이 NP에 속할 필요는 없다 - TQBF(PSPACE-완전, NP인지 불명)나 정지문제(결정불가)도 NP-hard. NP-complete = NP-hard ∩ NP, 즉 NP 안의 가장 어려운 문제.

> [!question]- 새 문제 X가 NP-hard임을 보일 때 환원 방향을 거꾸로 하면 왜 실패하나?
> 알려진 어려운 Y에서 새 X로(Y ≤ₚ X) 환원해야 "X가 Y만큼 어렵다"가 나온다. 거꾸로 X ≤ₚ Y를 하면 "X가 Y보다 쉽다"만 보여, X의 어려움을 전혀 증명하지 못한다.

## 연습문제

> [!example]- VERTEX-COVER ≤ₚ INDEPENDENT-SET 환원을 구성하고 정당성을 증명하라
> **풀이**
> 입력: 그래프 G=(V,E)와 정수 k. 출력: 같은 그래프 G와 정수 k' = |V| − k.
> 핵심 관계: S가 정점덮개 ⇔ V∖S가 독립집합. 증명: S가 덮개 ⇔ 모든 간선이 S에 끝점을 하나 이상 가짐 ⇔ V∖S 안에는 양끝이 다 든 간선이 없음 ⇔ V∖S가 독립집합.
> 따라서 G에 크기 ≤ k 정점덮개 존재 ⇔ G에 크기 ≥ |V|−k 독립집합 존재. 변환은 정수 뺄셈뿐이라 O(1) 사실상 다항. 답(yes/no)이 정확히 보존되므로 유효한 Karp 환원. ∎

> [!example]- TQBF가 NP-hard이지만 NP인지 불명인 이유를 환원과 클래스 관계로 논증하라
> **풀이**
> TQBF는 PSPACE-완전이다. 즉 모든 A∈PSPACE가 A ≤ₚ TQBF. NP ⊆ PSPACE이므로 특히 모든 NP 문제도 TQBF로 다항 환원된다 → TQBF는 NP-hard.
> 그러나 TQBF ∈ NP는 알려지지 않았다. 만약 TQBF ∈ NP라면 PSPACE-완전 문제가 NP에 들어가 PSPACE ⊆ NP, 결합하면 NP = PSPACE가 되는데 이는 미해결(대다수는 거짓으로 예상). ∀∃ 무제한 교대에 대한 짧은 증명서가 알려져 있지 않은 것이 직관. 따라서 TQBF는 NP-hard지만 NP-완전이라 부를 수 없다. ∎

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) A ≤ₚ B의 정의와 상한·하한 전파 방향, (2) Karp vs Cook의 차이와 NP-완전성이 Karp를 쓰는 이유, (3) NP-hard 증명 절차(알려진 Y에서 새 X로, 다항성, 양방향 정당성)와 방향을 거꾸로 하면 안 되는 이유.

## 연결

- 계산가능성 환원 (원조) → automata/[[reductions]], automata/[[decidability]]
- NP-완전성의 기반 → [[np-completeness]]
- P, NP 정의 → [[p-and-np]]
- 공간 클래스 hardness → [[space-classes]]
- 근사 보존 환원(gap 환원) → [[approximation-algorithms]]
- 증명 방향·대우 → math/[[logic-and-proofs]]
- 환원 대상 그래프 가젯(CLIQUE·독립집합 등) → math/[[graph-theory]]
- ≤ₚ의 추이적 선순서 구조 → math/[[sets-relations-functions]]

## 궁금한 것 (나중에)

- [ ] Karp vs Cook 환원이 클래스 구분에 실제로 차이 내는 예
- [ ] 로그공간 환원의 합성이 로그공간인 이유 (재계산 트릭)
- [ ] 근사 보존 환원(L-reduction, gap-preserving)
- [ ] 가젯 설계 패턴 카탈로그

## 출처

- Sipser 7.4 (다항 시간 환원)
- Arora & Barak 2.2 (Karp/Cook 환원)
