---
title: "프로그래밍 언어"
---

# 프로그래밍 언어 syllabus

기준: **Crafting Interpreters** (무료 공개) + CS 시리즈 PL 과목 개념. 언어 사용법이 아니라 언어가 동작하는 원리.

## 1. 언어 핵심 개념

- [ ] [[static-vs-dynamic-typing]] - 타입 검사 시점, 강타입/약타입 구분, 타입 추론
- [ ] [[scope-and-closures]] - 렉시컬 스코프, 클로저가 캡처하는 것, 업밸류
- [ ] [[value-vs-reference]] - 값/참조 의미론, 언어별 차이 (Python 전부 참조, Go 전부 값)
- [ ] [[garbage-collection]] - reference counting vs tracing (mark-sweep, 세대별), GC 일시정지
- [ ] [[error-handling-models]] - 예외 vs 에러 값(Go/Rust) vs Option/Result

## 2. 패러다임

- [ ] [[functional-programming]] - 불변성, 고차 함수, 순수 함수가 사는 이유
- [ ] [[oop-under-the-hood]] - vtable, 동적 디스패치 비용, 상속 vs 조합
- [ ] [[type-systems-advanced]] - 제네릭 구현 (단형화 vs 소거), 대수적 데이터 타입

## 3. 실행 모델

- [ ] [[compiled-vs-interpreted]] - AOT/JIT/인터프리터 스펙트럼, JVM/V8이 실제로 하는 일
- [ ] [[memory-management-models]] - 수동(C) vs GC vs 소유권(Rust), 각각의 비용

> 컴파일러(렉싱·파싱·AST·바이트코드 VM·최적화)는 별도 과목으로 분리 → compilers/
