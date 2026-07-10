# 어텐션과 트랜스포머 (Attention and Transformers)

## 한 줄 요약

Attention은 각 토큰이 "다른 어떤 토큰을 얼마나 볼지" 가중치를 계산해 정보를 모으는 메커니즘 - Query·Key로 유사도를 재고 softmax로 정규화해 Value를 가중합한다. 트랜스포머는 순환 없이 attention만 쌓아 **병렬 처리 + 장거리 의존**을 얻었고, 이것이 LLM의 뼈대다.

## 왜 필요한가

- attention이 실제로 뭘 계산하나
- 왜 RNN을 이겼나 ([[cnn-rnn-overview]])
- 트랜스포머 구조와 positional encoding

## Attention의 직관

```
"그 동물이 길을 안 건넜다. 그것이 너무 피곤해서."
                              ↑ "그것"은 "동물"을 가리킴 (거리 멀어도)
```

- 각 토큰이 **문맥의 관련 토큰에 주목**해 자기 표현을 갱신
- RNN처럼 순차로 전달 안 하고 **모든 토큰이 서로 직접 연결** → 장거리도 즉시 ([[cnn-rnn-overview]]의 RNN 한계 해결)

## Scaled Dot-Product Attention (핵심)

세 벡터 - **Query**(뭘 찾나), **Key**(뭘 가졌나), **Value**(실제 내용):

```
Attention(Q,K,V) = softmax(QKᵀ / √d) · V
```

단계:
```
1. Q·K 내적 → 유사도 점수 (쿼리가 각 키와 얼마나 맞나)
2. √d로 나눔 (스케일링 - 차원 크면 점수 커져 softmax 포화 방지)
3. softmax → 가중치 (합 1)
4. V의 가중합 → 출력 (관련 토큰 정보 모음)
```

## 코드로 확인

최소 self-attention (토큰 3개, Q=K=V로 단순화):

```python
scores = [dot(q,k)/math.sqrt(d) for k in vecs]   # 유사도
w = softmax(scores)                              # 가중치 (합1)
out = 가중합(w, vecs)                             # V 모음
```

실행 (행=쿼리, 각 토큰이 어디에 주목하나):
```
          the    cat    sat
    the  0.45   0.27   0.27
    cat  0.19   0.51   0.31    ← "cat"이 자기 자신에 최대(0.51)
    sat  0.23   0.38   0.38
```

- 각 토큰이 유사한 토큰에 더 높은 가중치 (cat→cat 0.51)
- softmax로 합이 1인 분포 → V를 그 비율로 섞음
- **이게 attention의 전부** - 나머지는 이걸 크게·여러 개 쌓은 것

## 멀티헤드 attention

**여러 attention을 병렬로** (각자 다른 관계 학습):

- head 하나는 문법, 하나는 지시 관계... 서로 다른 패턴
- 결과를 이어붙여 → 풍부한 표현
- 관점 다양성 (여러 시각으로 문맥 파악)

## 트랜스포머 구조

블록을 쌓음:

```
입력 임베딩 + positional encoding
  ↓
[멀티헤드 attention → Add&Norm → FFN → Add&Norm]  ← 블록 (N번 반복)
  ↓
출력
```

- **잔차 연결(Add)**: 입력을 출력에 더함 → 기울기 소실 완화 ([[training-dynamics]]), 깊게 쌓기 가능
- **LayerNorm**: 정규화로 안정 ([[training-dynamics]])
- **FFN**: 위치별 MLP (attention 후 변환)
- **인코더/디코더**: 원래 번역용(둘 다). GPT는 **디코더만**(다음 토큰 예측 [[llm-training]])

## Positional Encoding (필수)

attention은 **순서를 모름** (집합처럼 다 동시에 봄) → 위치 정보 주입:

```
"개가 사람을 물다" vs "사람이 개를 물다" - 순서가 의미!
attention만으론 구분 불가 → 위치 신호 추가
```

- **위치별 벡터를 임베딩에 더함** (sin/cos 패턴 또는 학습된 위치)
- 요즘은 **RoPE**(회전 위치 인코딩) 등 상대 위치 방식이 주류
- 이게 없으면 트랜스포머는 단어 순서를 못 봄

## 왜 트랜스포머가 이겼나

- **병렬 처리**: 모든 토큰 동시 계산 (RNN의 순차 병목 제거) → GPU 최대 활용 → 대규모 학습
- **장거리 의존**: 어떤 두 토큰도 1홉에 연결 (RNN은 거리만큼 홉)
- **확장성**: 크게 쌓을수록 좋아짐 → 스케일링 법칙 ([[llm-training]])
- 대가: attention은 **길이의 제곱** 계산 (토큰 n개 → n² 쌍) → 긴 문맥 비쌈

## 왜 이게 핵심인가

- **모든 현대 LLM의 뼈대** (GPT, Claude, Llama...)
- 비전(ViT)·음성·멀티모달로 확산 (범용 구조)
- [[llm-training]]·[[embeddings]]·[[tokenization]]이 다 이 위

## 셀프 체크

> [!question]- Scaled dot-product attention에서 Q, K, V는 각각 무슨 역할인가?
> Query는 "무엇을 찾나"(현재 토큰의 질의), Key는 "무엇을 가졌나"(각 토큰의 색인), Value는 "실제 내용"이다. Q·K로 유사도를 재 softmax 가중치를 만들고, 그 가중치로 V를 가중합해 출력한다.

> [!question]- QKᵀ를 √d로 나누는 이유는?
> 차원 d가 크면 내적 값의 분산이 커져 softmax 입력이 극단으로 가고, 한 곳에 몰려 기울기가 거의 0이 된다(포화). √d로 나눠 스케일을 맞추면 분포가 부드러워져 학습이 안정된다.

> [!question]- attention만으로는 왜 부족해 positional encoding이 필요한가?
> attention은 모든 토큰을 동시에 보는 집합 연산이라 순서 정보가 없다. "개가 사람을 물다"와 "사람이 개를 물다"를 구분 못 한다. 위치별 신호를 임베딩에 더해(또는 RoPE 같은 상대 위치로) 순서를 주입한다.

> [!question]- 트랜스포머가 RNN을 이긴 두 핵심 이유는?
> 병렬 처리(모든 토큰 동시 계산 → GPU 최대 활용 → 대규모 학습)와 장거리 의존(어떤 두 토큰도 1홉에 직접 연결). 대가는 길이의 제곱 계산량이다.

## 연습문제

> [!example]- 문제: 토큰이 2개, 쿼리 q에 대한 두 키와의 내적이 각각 4, 0이고 차원 d=4다. scaled softmax 가중치를 계산하고, V가 [1,0], [0,1]일 때 출력을 구하라.
> **풀이**
> 스케일: √d=2. 스케일된 점수 = 4/2=2, 0/2=0.
> softmax: e²≈7.389, e⁰=1, 합≈8.389. 가중치 ≈ 0.881, 0.119.
> 출력 = 0.881·[1,0] + 0.119·[0,1] = [0.881, 0.119].
> 즉 첫 토큰에 크게 주목한 결과가 나온다. √d로 나눴기에 점수 4가 2로 완화돼 분포가 덜 극단적이 됐다.

> [!example]- 문제: 시퀀스 길이를 n=1000에서 n=4000으로 늘리면 attention 연산량은 몇 배가 되나? 왜 긴 문맥이 비싼지 설명하라.
> **풀이**
> attention은 모든 토큰 쌍(n×n)의 점수를 계산하므로 O(n²)이다. n이 4배면 n²은 16배. 그래서 문맥을 길게 할수록 계산·메모리가 제곱으로 폭증해 긴 문맥이 비싸다. FlashAttention·KV 캐시·선형 attention이 이를 완화하려는 시도다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) softmax(QKᵀ/√d)·V 한 줄을 단계별로 말로 풀 수 있는지 (2) 잔차 연결·LayerNorm·FFN이 블록에서 하는 일 (3) 병렬성과 장거리 의존이라는 두 승리 요인과 그 대가(제곱 복잡도).

## 연결

- RNN 한계 해결 → [[cnn-rnn-overview]]
- 잔차·LayerNorm → [[training-dynamics]]
- 디코더·스케일링 → [[llm-training]]
- 토큰이 입력 단위 → [[tokenization]]
- 벡터 표현 → [[embeddings]]
- softmax → [[linear-models]]

## 궁금한 것 (나중에)

- [ ] RoPE·ALiBi (상대 위치 인코딩)
- [ ] 효율적 attention (FlashAttention, 선형 attention)
- [ ] KV 캐시 (추론 시 재계산 회피)
- [ ] 인코더-디코더 vs 디코더-only 차이

## 출처

- "Attention is All You Need" (Vaswani et al. 2017), Jay Alammar "Illustrated Transformer"
