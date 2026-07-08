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
