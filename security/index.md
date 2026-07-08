---
title: "security"
---

# 보안 syllabus

기준: 대학 정보보호 과목 + OWASP. 공격 원리 이해 → 방어 설계 순서.

## 1. 암호학 기초

- [x] [[crypto-basics]] - 대칭(AES) vs 비대칭(RSA, ECC), 하이브리드 암호화가 표준인 이유
- [x] [[hashing]] - 암호학적 해시 성질, SHA-2/3, 충돌 저항성
- [ ] [[password-storage]] - 왜 bcrypt/argon2인가 (salt, work factor), 평문/단순 해시가 뚫리는 과정
- [ ] [[digital-signatures]] - 서명/검증, MAC vs 서명, 인증서와 PKI
- [ ] [[tls-deep-dive]] - TLS 1.3 핸드셰이크, forward secrecy → network/tls 심화

## 2. 웹 보안 (OWASP Top 10 중심)

- [ ] [[injection]] - SQL 인젝션 원리, prepared statement가 막는 방식
- [ ] [[xss-csrf]] - XSS 3종, CSP, CSRF 토큰 → web/과 연결
- [ ] [[authn-authz-failures]] - 세션 하이재킹, IDOR, 권한 상승 패턴

## 3. 시스템 보안

- [ ] [[memory-safety]] - 버퍼 오버플로우, use-after-free → computer-architecture/buffer-overflow 기반
- [ ] [[least-privilege]] - 최소 권한 원칙, 샌드박싱, 컨테이너 격리의 한계

## 4. 실무 설계

- [ ] [[threat-modeling]] - 위협 모델링 기초, 공격 표면 분석
- [ ] [[secrets-management]] - 시크릿 관리, 키 로테이션, .env가 위험해지는 순간
- [ ] [[supply-chain]] - 의존성 공격, lockfile, 패키지 신뢰 문제
