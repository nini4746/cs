---
title: "정보이론"
---

# 정보이론 syllabus

기준: **Cover & Thomas** (Elements of Information Theory) + MacKay (Information Theory, Inference, and Learning Algorithms). 석사급 - 정리와 증명 스케치, 압축·통신·ML의 한계를 정량화.

핵심 질문: **정보를 어떻게 재나? 압축·전송의 이론적 한계는 어디인가?**

## 1. 엔트로피와 정보

- [x] [[entropy-and-information]] - self-information(왜 -log), 섀넌 엔트로피, 비트의 의미, 최대/최소 엔트로피
- [x] [[joint-conditional-entropy]] - 결합·조건부 엔트로피, chain rule, 엔트로피의 성질
- [x] [[mutual-information]] - 상호정보량, KL divergence(상대 엔트로피), 왜 비대칭인가

## 2. 무손실 압축 (source coding)

- [x] [[source-coding-theorem]] - 섀넌 소스 코딩 정리, 엔트로피 = 압축 하한, 접두부호와 Kraft 부등식
- [x] [[huffman-and-entropy-coding]] - Huffman(최적 기호 부호), arithmetic/range coding, 엔트로피에 근접
- [x] [[lempel-ziv]] - LZ77/78, 사전 기반, 범용 압축(분포 몰라도), gzip/zstd의 뿌리

## 3. 잡음 채널과 오류 정정

- [x] [[channel-capacity]] - 채널 용량, 잡음 채널 코딩 정리, 왜 용량 아래면 오류 0 가능한가
- [x] [[error-correcting-codes]] - 패리티/Hamming code, 블록 부호, 거리와 정정 능력, 현대 부호 개관(LDPC/터보)

## 4. 심화·응용

- [x] [[rate-distortion]] - 손실 압축 이론, 비트 예산 vs 왜곡 트레이드오프
- [x] [[information-theory-in-ml]] - cross-entropy 손실, MDL, information bottleneck, 왜 ML이 정보이론인가
- [x] [[kolmogorov-complexity]] - 알고리즘적 정보량, 압축 불가능성, 섀넌 엔트로피와의 관계
