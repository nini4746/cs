# Git 워크플로우 (Git Workflows)

## 한 줄 요약

팀이 Git을 쓰는 방식 - 브랜치 전략(trunk-based, GitHub flow)과 통합 방법(merge vs rebase). 협업 관례가 목적이지 규칙이 목적이 아니며, 작은 자주 통합이 큰 드문 통합보다 낫다.

## 왜 필요한가

- 팀이 브랜치를 어떻게 관리하나
- merge vs rebase 언제
- 통합 지옥을 피하는 법

## merge vs rebase

두 브랜치를 합치는 두 방법 ([[git-internals]]):

### merge

```
두 브랜치를 합치는 머지 커밋 생성 (부모 2개)
히스토리에 분기·병합이 그대로 남음
```

- **히스토리 보존**: 실제로 일어난 대로 (분기·병합 표시)
- 비선형 히스토리 (그래프)
- 안전 (기존 커밋 안 바꿈)

### rebase

```
내 커밋들을 다른 브랜치 끝으로 재적용 (새 커밋 생성)
히스토리가 선형 (분기 없앰)
```

- **선형 히스토리**: 깔끔하게 일직선
- **히스토리 재작성**: 새 커밋 (해시 바뀜) → 커밋은 불변이라 복제 ([[git-internals]])
- **황금 규칙**: **공유된(push된) 브랜치는 rebase 금지** (남의 히스토리 깨뜨림) - 로컬 정리에만

**선택**: 로컬 커밋 정리·최신화는 rebase (깔끔), 공유 브랜치 통합은 merge (안전). 팀 컨벤션 따르기.

## 브랜치 전략

### trunk-based development

- **main(trunk)에 자주 통합** (하루에도 여러 번)
- 짧은 수명 브랜치 (몇 시간~하루) 또는 직접 main
- feature flag로 미완성 기능 숨김
- CI/CD와 잘 맞음 ([[ci-cd-principles]]) → 지속 통합의 본래 의미
- 통합 지옥 회피 (자주 = 충돌 작음)

### GitHub flow

- main + 짧은 feature 브랜치
- 브랜치 → PR → 리뷰 → main 머지 → 배포
- 단순, 대부분 팀에 적합

### Git flow (복잡)

- main/develop/feature/release/hotfix 여러 브랜치
- 릴리스 주기가 긴 제품용 (요즘은 과하다는 평 - trunk-based 선호 추세)

## 작고 자주 vs 크고 드문

핵심 원칙 - **작은 변경을 자주 통합**:

- 큰 브랜치를 오래 두면 → **통합 지옥**(merge hell): main과 멀어져 충돌 폭발
- 작게 자주 → 충돌 작고 리뷰 쉬움
- distributed-systems·software-design의 "작은 단계" 정신 (software-design/[[refactoring-catalog]])

## Pull Request (PR)

협업의 중심:

- 브랜치 → PR → **코드 리뷰** → 머지
- **리뷰**: 버그·설계·가독성 확인 (software-design/[[naming-and-readability]])
- **CI 게이트**: 테스트 통과해야 머지 ([[ci-cd-principles]], software-design/[[testing-strategy]])
- 논의·기록 (왜 이렇게 했나)

## 좋은 커밋

- **원자적**: 하나의 논리적 변경 (software-design/[[refactoring-catalog]]의 기능/리팩토링 분리)
- **명확한 메시지**: 무엇을·왜 (제목 + 본문) → software-design/[[naming-and-readability]]
- **컨벤셔널 커밋**: `feat:`, `fix:` 등 (자동 버저닝·changelog)
- 이 노트 저장소도 컨벤셔널 커밋 사용

## 협업 관례가 목적

- **관례 > 규칙**: 팀이 정한 방식을 일관되게 (software-design/[[naming-and-readability]]의 일관성)
- **자동화**: 린터·포매터·CI로 논쟁 종결 ([[ci-cd-principles]])
- **소통**: PR·커밋 메시지가 협업 기록
- 워크플로우는 팀 크기·릴리스 주기에 맞게 (Git flow는 과할 수 있음)

## 연결

- 커밋·브랜치 = 객체·포인터 → [[git-internals]]
- CI 게이트 → [[ci-cd-principles]]
- 코드 리뷰·커밋 메시지 → software-design/[[naming-and-readability]]
- 기능/리팩토링 분리 → software-design/[[refactoring-catalog]]
- 테스트 통과 → software-design/[[testing-strategy]]

## 궁금한 것 (나중에)

- [ ] cherry-pick, revert 활용
- [ ] interactive rebase (커밋 정리)
- [ ] monorepo vs polyrepo
- [ ] semantic-release (자동 버저닝)

## 출처

- "Pro Git", trunk-based development (Paul Hammant)
