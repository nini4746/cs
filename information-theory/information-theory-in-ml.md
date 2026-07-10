# 정보이론과 머신러닝 (Information Theory in ML)

## 한 줄 요약

머신러닝의 언어가 사실 정보이론이라는 것 - 분류의 cross-entropy 손실은 "모델 분포로 진짜 라벨을 부호화하는 평균 비트"이자 KL divergence 최소화이고, 모델 선택의 MDL은 "가장 짧게 압축하는 가설이 최선"이며, 표현 학습의 information bottleneck은 상호정보량의 균형이다. 학습 = 압축.

## 왜 필요한가

- 왜 분류 손실이 cross-entropy인가 (ai-ml/[[linear-models]])
- 과적합·모델 선택을 정보로 보는 관점 (MDL)
- "학습은 압축"이라는 통찰

## Cross-Entropy 손실 (핵심)

분류 학습의 표준 손실 - **정보이론에서 곧장 나옴**:

```
H(p, q) = -Σ p(x) log q(x)     (진짜 분포 p, 모델 예측 q)
        = H(p) + D(p‖q)         ([[mutual-information]]의 KL)
```

- "모델 분포 q로 진짜 분포 p의 결과를 부호화할 때 평균 비트" ([[source-coding-theorem]])
- H(p)는 데이터 고정 → **손실 최소화 = KL 최소화 = 모델을 진짜 분포에 맞추기**

### 코드로 확인

진짜 라벨 `p=[0,1,0]`(클래스 1 정답)에 대한 예측별 손실:

```
좋은 예측 q=[0.1,0.8,0.1]: cross-entropy 손실 = 0.3219
애매한 예측 q=[0.3,0.4,0.3]: cross-entropy 손실 = 1.3219
틀린 예측 q=[0.8,0.1,0.1]: cross-entropy 손실 = 3.3219

H(p,q) = H(p) + KL(p||q) 확인:
  H(p,q)       = 1.5219
  H(p)+KL(p||q)= 1.5219
```

- **자신 있게 맞히면 손실↓, 자신 있게 틀리면 손실 폭발**(3.32) → 잘못된 확신을 강하게 벌줌
- 정답에 q→0이면 손실→∞ (`-log q`) → 모델이 "절대 아니다"라고 한 게 정답이면 큰 벌
- 항등식 `H(p,q)=H(p)+KL` 성립 → 손실이 곧 KL(+상수)

## 왜 MSE 아니라 cross-entropy (분류에서)

- 확률 출력엔 cross-entropy가 자연스러움 (최대우도와 동치)
- **기울기가 건강**: 시그모이드+MSE는 기울기 소실, 시그모이드+CE는 오차에 비례하는 깨끗한 기울기 (ai-ml/[[training-dynamics]])
- 최대우도 추정(MLE) = cross-entropy 최소화 = KL 최소화 (같은 것의 세 이름)

## MDL: 최소 기술 길이

**모델 선택을 압축으로** (오컴의 면도날의 정보이론판):

```
최선의 모델 = 데이터를 가장 짧게 기술하는 것
총 길이 = L(모델) + L(모델로 압축한 데이터)
```

- 복잡한 모델은 L(모델)↑, 하지만 데이터를 잘 맞혀 L(데이터|모델)↓
- **균형점이 최선** → 과적합(모델 너무 복잡)·과소적합(데이터 설명 못 함) 자동 절충 (ai-ml/[[ml-fundamentals]])
- "학습 = 압축": 데이터의 규칙성을 찾는 것 = 짧게 기술하는 것 → [[kolmogorov-complexity]]

## Information Bottleneck

표현 학습을 상호정보량으로 - **압축과 예측의 균형**:

```
좋은 표현 Z: 입력 X는 최대한 압축(I(X;Z)↓) 하되 라벨 Y 정보는 유지(I(Z;Y)↑)
목적: min I(X;Z) - β·I(Z;Y)
```

- 관련 없는 것 버리고(압축) 예측에 필요한 것만 남김
- 신경망이 층을 거치며 하는 일의 한 해석 (ai-ml/[[neural-networks]])

## 기타 접점

- **결정 트리 분할**: 정보 이득 = 상호정보량 `I(특성;라벨)`이 큰 특성으로 분할 ([[mutual-information]], ai-ml/[[ml-fundamentals]])
- **VAE**: ELBO에 KL 항 (잠재 분포를 사전분포에 맞춤)
- **강화학습**: 최대 엔트로피 RL (정책 엔트로피로 탐험 장려)
- **perplexity**: 언어모델 평가 = `2^H` (cross-entropy의 지수) → ai-ml/[[llm-evaluation]]

## 왜 중요한가

- **손실 함수의 근거**: cross-entropy가 임의 선택이 아니라 정보이론 필연
- **통합 관점**: 압축·추론·학습·일반화가 한 언어로 (엔트로피·KL·상호정보)
- **"학습 = 압축 = 이해"**: 규칙성을 찾아 짧게 표현하는 것이 지능의 한 정의

## 셀프 체크

> [!question]- cross-entropy 손실이 왜 KL divergence 최소화와 같은가?
> `H(p,q)=H(p)+D(p‖q)`인데 진짜 분포 p는 데이터로 고정이라 H(p)가 상수. 따라서 cross-entropy를 줄이는 것은 곧 `D(p‖q)`를 줄이는 것 = 모델 q를 진짜 분포 p에 맞추는 것이다. 최대우도(MLE)와도 동치.

> [!question]- 분류에서 MSE 대신 cross-entropy를 쓰는 실질적 이유는?
> 확률 출력에 자연스럽고 MLE와 동치라는 이론적 근거 외에, 기울기가 건강하다. 시그모이드+MSE는 기울기 소실이 생기지만 시그모이드+CE는 오차(예측-정답)에 비례하는 깨끗한 기울기를 준다.

> [!question]- MDL과 information bottleneck은 각각 무엇을 정보로 균형 잡나?
> MDL은 `L(모델)+L(데이터|모델)`을 최소화 - 모델 복잡도와 데이터 적합도의 균형(오컴의 면도날). Information bottleneck은 `min I(X;Z)-β·I(Z;Y)` - 입력 X는 최대한 압축하되 라벨 Y 정보는 유지하는 표현 Z를 찾는다.

## 연습문제

> [!example]- 문제: 정답 라벨 `p=[0,1,0]`(클래스 1), 모델 예측 `q=[0.2,0.7,0.1]`일 때 cross-entropy 손실을 구하라.
> **풀이**
> `H(p,q) = -Σ p log₂ q = -(0·log q₀ + 1·log₂0.7 + 0·log q₂) = -log₂0.7`.
> `log₂0.7 ≈ -0.515` → 손실 `≈ 0.515 비트`.
> 정답 클래스의 예측 확률만 손실에 기여하며, q₁→1이면 손실→0, q₁→0이면 손실→∞.

> [!example]- 문제: 언어모델의 cross-entropy가 심볼당 H=3비트일 때 perplexity를 구하고 의미를 해석하라.
> **풀이**
> `perplexity = 2^H = 2³ = 8`.
> 의미: 매 스텝 모델이 평균적으로 "동등하게 그럴듯한 8개 후보 중 하나를 고르는" 만큼의 불확실성을 가진다. perplexity가 낮을수록(H 낮을수록) 예측을 잘하는 모델이다.

## 파인만

> [!note]- 백지에 "학습 = 압축"을 cross-entropy·MDL·bottleneck 세 관점으로 설명하라.
> **점검 포인트**: (1) cross-entropy=H(p)+KL이라 손실 최소화=KL 최소화=MLE라는 삼위일체, (2) MDL의 L(모델)+L(데이터|모델) 균형이 과적합/과소적합을 절충한다는 것, (3) information bottleneck의 압축(I(X;Z)↓)과 예측(I(Z;Y)↑) 균형.

## 연결

- cross-entropy·KL → [[mutual-information]], [[entropy-and-information]]
- 부호화 비트 해석 → [[source-coding-theorem]]
- 학습=압축, MDL → [[kolmogorov-complexity]]
- 분류 손실·MLE → ai-ml/[[linear-models]]
- 과적합·정보이득 → ai-ml/[[ml-fundamentals]]
- 기울기 건강함 → ai-ml/[[training-dynamics]]
- perplexity → ai-ml/[[llm-evaluation]]
- information bottleneck으로 본 층별 표현 학습 → ai-ml/[[neural-networks]]

## 궁금한 것 (나중에)

- [ ] information bottleneck으로 본 딥러닝 (Tishby, 논쟁적)
- [ ] focal loss (불균형 - cross-entropy 변형)
- [ ] 최대 엔트로피 RL (SAC)
- [ ] label smoothing의 정보이론적 해석

## 출처

- MacKay(전체 관점), "Deep Learning"(Goodfellow) 3장, Tishby "Information Bottleneck"
