---
title: "software-design"
---

# 소프트웨어 설계 syllabus

기준: GoF, Clean Code/Architecture, Refactoring (Fowler), A Philosophy of Software Design (Ousterhout).

## 1. 설계 원칙

- [x] [[solid]] - SOLID 각 원칙 + 과용하면 생기는 문제
- [x] [[coupling-cohesion]] - 결합도/응집도, 모듈 경계 긋는 기준
- [x] [[deep-modules]] - Ousterhout: 깊은 모듈, 인터페이스 복잡도 vs 구현 복잡도
- [x] [[composition-over-inheritance]] - 상속의 함정, 조합 설계

## 2. 디자인 패턴 (GoF 선별)

- [ ] [[creational-patterns]] - 팩토리, 빌더, 싱글턴 (그리고 싱글턴이 욕먹는 이유)
- [ ] [[structural-patterns]] - 어댑터, 데코레이터, 퍼사드, 프록시
- [ ] [[behavioral-patterns]] - 전략, 옵저버, 커맨드, 상태
- [ ] [[patterns-in-the-wild]] - 실제 코드베이스/표준 라이브러리에서 패턴 찾기

## 3. 아키텍처

- [ ] [[layered-architecture]] - 계층형, 의존성 방향, hexagonal/clean architecture
- [ ] [[monolith-vs-microservices]] - 트레이드오프, 마이크로서비스가 필요 없는 경우 → distributed-systems/와 연결
- [ ] [[event-driven-architecture]] - 이벤트 기반, CQRS 맛보기
- [ ] [[api-design-principles]] - 좋은 인터페이스, 하위 호환, 버저닝

## 4. 코드 품질

- [ ] [[naming-and-readability]] - 이름 짓기, 함수 크기, 주석의 역할
- [ ] [[refactoring-catalog]] - 냄새 → 리팩토링 매핑, 안전한 리팩토링 순서
- [ ] [[testing-strategy]] - 단위/통합/E2E 피라미드, 테스트 더블, 무엇을 테스트하지 말 것인가
- [ ] [[tdd]] - TDD 사이클, 효과 있는 경우와 아닌 경우

## 5. 도메인 설계

- [ ] [[ddd-basics]] - 유비쿼터스 언어, bounded context, aggregate (개념만)
