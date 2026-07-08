---
title: "ai-ml"
---

# AI/ML syllabus

기준: Andrew Ng ML 강의 + CS231n/CS224n 개념 + 최신 LLM 실무. 선행: math/ (선형대수, 확률).

## 1. 머신러닝 기초

- [x] [[ml-fundamentals]] - 지도/비지도, 훈련/검증/테스트 분리, 과적합과 정규화
- [x] [[linear-models]] - 선형/로지스틱 회귀, 경사하강법, 손실 함수
- [x] [[model-evaluation]] - 정확도의 함정, precision/recall/F1, ROC, 교차 검증

## 2. 딥러닝

- [x] [[neural-networks]] - 퍼셉트론 → MLP, 역전파 손으로 유도, 활성화 함수
- [x] [[training-dynamics]] - 옵티마이저 (SGD/Adam), 학습률, 배치 정규화, 왜 학습이 안 되나 디버깅
- [x] [[cnn-rnn-overview]] - CNN/RNN 핵심 아이디어 (역사적 맥락 수준)

## 3. 트랜스포머와 LLM

- [x] [[attention-and-transformers]] - attention 메커니즘, 트랜스포머 구조, positional encoding
- [x] [[llm-training]] - 사전학습 → SFT → RLHF 파이프라인, 스케일링 법칙
- [x] [[tokenization]] - BPE, 토큰 단위가 만드는 이상한 동작들
- [x] [[embeddings]] - 임베딩 공간, 유사도 검색 → math/svd-basics와 연결

## 4. LLM 활용 (실무)

- [x] [[prompting]] - 프롬프트 설계 원리, few-shot, chain-of-thought
- [ ] [[rag]] - RAG 구조, 청킹 전략, 벡터 DB, 실패 모드
- [ ] [[agents]] - 도구 사용, 에이전트 루프, MCP
- [ ] [[llm-evaluation]] - LLM 평가 방법, LLM-as-judge, 벤치마크의 한계
- [ ] [[fine-tuning]] - 파인튜닝 vs RAG vs 프롬프팅 선택 기준, LoRA 개념
