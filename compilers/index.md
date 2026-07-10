---
title: "컴파일러"
---

# 컴파일러 syllabus

기준: **Crafting Interpreters** (무료 공개). 오토마타 (automata/) 선행 추천 - 렉싱=DFA, 파싱=CFG.

## 1. 프론트엔드

- [x] [[lexing]] - 토크나이저 구현, 렉서가 DFA인 이유
- [x] [[parsing]] - 재귀 하강 파서 구현, LL vs LR, 연산자 우선순위
- [x] [[ast-and-interpretation]] - AST 설계, tree-walking 인터프리터
- [x] [[semantic-analysis]] - 심볼 테이블, 타입 체크, 스코프 해석

## 2. 백엔드

- [x] [[bytecode-vm]] - 스택 기반 VM, 바이트코드 컴파일
- [x] [[codegen-and-optimization]] - 네이티브 코드 생성 개요, SSA, 기본 최적화 패스

## 3. 종합

- [x] [[build-a-language]] - 미니 언어 처음부터 끝까지 (종합 프로젝트)
