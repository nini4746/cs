---
title: "cryptography"
---

# 암호학 syllabus

기준: **Katz & Lindell** (Introduction to Modern Cryptography) + Boneh-Shoup + Dan Boneh Coursera. 석사급 - 정의(IND-CPA 등)·환원 증명·수학 원리 중심. security/의 응용 위에서 "왜 안전한가"를 다룬다.

전제: security/[[crypto-basics]], security/[[hashing]], security/[[digital-signatures]], security/[[tls-deep-dive]] (응용은 security), math/[[modular-arithmetic]] (수학 기반). 여기선 **원리와 증명**.

핵심 질문: **"안전하다"를 어떻게 정의하고 증명하나? 무엇 위에 서 있나?**

## 1. 대칭 암호

- [x] [[symmetric-ciphers]] - 블록 vs 스트림, AES/Feistel, PRP/PRF, 완전 비밀성(OTP)과 한계
- [x] [[block-cipher-modes]] - ECB/CBC/CTR/GCM, IV·nonce, 왜 ECB가 위험한가

## 2. 공개키 암호

- [ ] [[public-key-crypto]] - 공개키 아이디어, trapdoor 함수, RSA 수학과 안전성 가정
- [ ] [[diffie-hellman]] - 키 교환, 이산로그 문제, 중간자 공격
- [ ] [[elliptic-curves]] - 타원곡선, 왜 짧은 키로 같은 강도, ECDH/ECDSA

## 3. 무결성과 인증

- [ ] [[cryptographic-hashes]] - Merkle-Damgård vs sponge, 충돌/역상 저항, 생일 공격
- [ ] [[mac-and-aead]] - HMAC, 인증 암호(AEAD/GCM), encrypt-then-MAC 원칙

## 4. 프로토콜과 심화

- [ ] [[key-exchange-protocols]] - 세션 키, 전방향 비밀성(PFS), 인증된 키 교환
- [ ] [[zero-knowledge-proofs]] - 영지식 정의, 대화형/비대화형, zk-SNARK 개념
- [ ] [[commitment-and-secret-sharing]] - 커밋먼트 스킴, Shamir 비밀 공유, 임계 암호
- [ ] [[post-quantum-crypto]] - 양자 위협(Shor), 격자 기반, NIST PQC 표준
