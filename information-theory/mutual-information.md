# 상호정보량과 KL divergence (Mutual Information and KL Divergence)

## 한 줄 요약

KL divergence는 "분포 q로 분포 p를 부호화할 때 낭비되는 비트"이자 두 분포의 차이를 재는 척도인데, 비대칭이라 거리는 아니다. 상호정보량 I(X;Y)는 "X를 알면 Y의 불확실성이 얼마나 줄어드나" = 결합분포가 독립곱에서 얼마나 벗어났나(KL). 둘 다 0 이상이고, 이 비음수성이 정보이론 부등식의 핵심.

## 왜 필요한가

- 두 분포가 얼마나 다른지 재는 법 (KL)
- 두 변수가 얼마나 얽혔는지 재는 법 (상호정보)
- 왜 cross-entropy 손실이 KL인가 (ai-ml/)

## KL divergence (상대 엔트로피)

**분포 p를 q로 부호화할 때의 초과 비트**:

```
D(p‖q) = Σ p(x) log₂[ p(x)/q(x) ]
       = (q로 부호화한 평균 비트) - (p로 부호화한 최적 비트 H(p))
```

- "진짜 분포는 p인데 q인 줄 알고 부호화 → 얼마나 손해 보나"
- **비음수**: `D(p‖q) ≥ 0`, 등호는 p=q일 때만 (Gibbs 부등식) → 정보이론 부등식 대부분의 뿌리

### 코드로 확인: 비대칭

```
KL(p||q) = 0.7370
KL(q||p) = 0.5310   <- 비대칭 (거리 아님)
KL(p||p) = 0.0000   <- 같으면 0
```

- `D(p‖q) ≠ D(q‖p)` → **거리(metric) 아님** (대칭성·삼각부등식 위반)
- p=q면 0, 다를수록 큼
- 방향이 의미를 가짐: `D(진짜‖모델)`이 학습에서 쓰는 방향 (아래)

## 상호정보량

**두 변수가 공유하는 정보** - X를 알아서 줄어든 Y의 불확실성:

```
I(X;Y) = H(Y) - H(Y|X)          (Y 불확실성 감소분, [[joint-conditional-entropy]])
       = H(X) - H(X|Y)          (대칭!)
       = H(X) + H(Y) - H(X,Y)
       = D( p(x,y) ‖ p(x)p(y) ) (결합이 독립곱에서 벗어난 정도)
```

### 코드로 확인

```
I(X;Y) = KL(joint || 독립곱) = 0.2781
독립 분포의 I = 0.0000  (독립 ⟺ I=0)
```

- 앞 노트([[joint-conditional-entropy]])의 `H(Y)-H(Y|X)=0.2781`과 **정확히 일치** (같은 양의 두 정의)
- **독립 ⟺ I=0**: 서로 아무 정보 안 줌 (결합 = 독립곱이니 KL=0)
- I는 대칭 (X가 Y에 주는 정보 = Y가 X에 주는 정보), 항상 ≥ 0

## 왜 I ≥ 0 인가 (조건은 해롭지 않다의 증명)

```
I(X;Y) = D(p(x,y) ‖ p(x)p(y)) ≥ 0   (KL 비음수성)
⟹ H(Y|X) ≤ H(Y)                      (조건은 불확실성 안 늘림)
```

- [[joint-conditional-entropy]]의 부등식이 여기서 증명됨
- 최대 엔트로피(균등이 최대, [[entropy-and-information]])도 KL≥0에서: `log n - H(X) = D(p‖균등) ≥ 0`

## ML과의 직접 연결 (왜 중요한가)

정보이론이 ML의 언어인 이유:

- **cross-entropy 손실 = H(p) + D(p‖q)**: 진짜 분포 p, 모델 q일 때 cross-entropy `H(p,q)=H(p)+D(p‖q)`. H(p)는 고정 → **손실 최소화 = KL 최소화 = 모델을 진짜 분포에 맞추기** (ai-ml/[[linear-models]]의 분류 손실, [[information-theory-in-ml]])
- **정보 이득**: 특성이 라벨에 주는 I(특성;라벨) → 결정 트리 분할, 특성 선택 (ai-ml/[[ml-fundamentals]])
- **VAE·information bottleneck**: I를 목적 함수에 (표현 학습)
- **채널 용량**: `C = max I(X;Y)` → [[channel-capacity]]

## 셀프 체크

> [!question]- KL divergence가 왜 거리(metric)가 아닌가?
> 대칭성이 깨지고(`D(p‖q) ≠ D(q‖p)`) 삼각부등식도 만족하지 않기 때문. "분포 p를 q로 부호화할 때의 초과 비트"라는 비대칭 정의라 방향이 의미를 가진다. p=q일 때만 0, 항상 ≥0.

> [!question]- I(X;Y)의 네 가지 동치 표현을 대고, 왜 대칭인가?
> `I = H(Y)-H(Y|X) = H(X)-H(X|Y) = H(X)+H(Y)-H(X,Y) = D(p(x,y)‖p(x)p(y))`. 앞 두 표현이 같으므로 X가 Y에 주는 정보 = Y가 X에 주는 정보로 대칭. 두 변수가 공유하는 정보량이라는 해석.

> [!question]- I(X;Y) ≥ 0 하나가 왜 "조건은 해롭지 않다"와 "균등이 최대 엔트로피"를 동시에 함의하나?
> `I = D(p(x,y)‖p(x)p(y)) ≥ 0`(KL 비음수성)이고 `I = H(Y)-H(Y|X)`이므로 `H(Y|X) ≤ H(Y)`. 또 `log n - H(X) = D(p‖균등) ≥ 0`이라 `H(X) ≤ log n`. 두 결과 모두 같은 KL≥0의 따름정리.

## 연습문제

> [!example]- 문제: `D(p‖q) ≥ 0` (Gibbs 부등식)을 Jensen 부등식으로 증명하라.
> **풀이**
> `-D(p‖q) = Σ p(x) log₂[q(x)/p(x)]`. log는 오목함수이므로 Jensen에 의해
> `Σ p(x) log₂[q(x)/p(x)] ≤ log₂ Σ p(x)·[q(x)/p(x)] = log₂ Σ q(x) = log₂ 1 = 0`.
> 따라서 `-D(p‖q) ≤ 0`, 즉 `D(p‖q) ≥ 0`. 등호는 q(x)/p(x)가 상수, 곧 p=q일 때만. ∎

> [!example]- 문제: 결합분포 `p(x₁,y₁)=0.4, p(x₁,y₂)=0.1, p(x₂,y₁)=0.1, p(x₂,y₂)=0.4`에서 I(X;Y)를 구하라.
> **풀이**
> 주변분포 `p(x₁)=p(x₂)=0.5, p(y₁)=p(y₂)=0.5` → `H(X)=H(Y)=1`.
> `H(X,Y) = -(2·0.4·log₂0.4 + 2·0.1·log₂0.1) = 2·0.4·1.3219 + 2·0.1·3.3219 = 1.0575 + 0.6644 = 1.7219`.
> `I(X;Y) = H(X)+H(Y)-H(X,Y) = 1+1-1.7219 = 0.2781 비트`.

## 파인만

> [!note]- 백지에 KL과 상호정보의 정의를 쓰고, 둘이 어떻게 연결되는지 설명하라.
> **점검 포인트**: (1) KL이 "초과 비트"이자 비대칭이라 거리가 아니라는 것, (2) I(X;Y)=D(결합‖독립곱)이라는 KL 표현, (3) KL≥0 하나가 조건부·최대엔트로피 부등식을 모두 낳는다는 것.

## 연결

- 조건부 엔트로피·감소분 정의 → [[joint-conditional-entropy]]
- 최대 엔트로피 증명 → [[entropy-and-information]]
- cross-entropy 손실 → [[information-theory-in-ml]], ai-ml/[[linear-models]]
- 정보 이득(특성) → ai-ml/[[ml-fundamentals]]
- 채널 용량 = max I → [[channel-capacity]]
- 확률·독립 → math/[[probability-basics]]

## 궁금한 것 (나중에)

- [ ] 왜 forward KL vs reverse KL이 다른 학습 (mode-covering vs seeking)
- [ ] Jensen-Shannon divergence (대칭화, GAN)
- [ ] f-divergence 일반화
- [ ] 데이터 처리 부등식 (정보는 처리로 안 늘어남)

## 출처

- Cover & Thomas 2장, MacKay 8장, "Deep Learning"(Goodfellow) 3장
