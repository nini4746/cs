# Git 내부 (Git Internals)

## 한 줄 요약

Git은 내용 주소 방식의 객체 저장소 - blob(파일)/tree(디렉토리)/commit(스냅샷)를 해시로 저장한다. 브랜치는 커밋을 가리키는 포인터일 뿐이고, ref가 전부다. 이 모델을 알면 Git이 두렵지 않다.

## 왜 필요한가

- Git이 실제로 어떻게 저장하나
- 브랜치·HEAD가 뭔가 (포인터)
- reflog로 "잃어버린" 커밋 복구

## 객체 모델

Git은 네 종류 객체를 **해시(SHA)로 저장** (security/[[hashing]]):

- **blob**: 파일 내용 (이름 없음, 내용만)
- **tree**: 디렉토리 (파일명 → blob/tree 매핑)
- **commit**: 스냅샷 (tree + 부모 커밋 + 메타)
- **tag**: 주석 태그

실측:
```
blob: git hash-object f.txt → ce013625... (내용의 SHA)
commit: git cat-file -t HEAD → commit
tree: HEAD^{tree} → tree
```

## 내용 주소 (content-addressable)

핵심 - **객체를 내용의 해시로 식별**:

실측:
```
"hello" 담긴 f.txt → ce013625...
"hello" 담긴 g.txt → ce013625...  (동일 해시!)
```

- **같은 내용 = 같은 해시 = 한 번만 저장** (중복 제거)
- 내용이 바뀌면 해시가 바뀜 → 변조 감지 (security/[[hashing]]의 무결성)
- data-structures/[[hash-tables]]의 내용 주소, database/[[lsm-tree]]의 불변 객체와 같은 발상

## 커밋 = 스냅샷 + 부모

commit 객체:
```
commit → tree (그 시점 전체 스냅샷)
       → parent commit(s) (이전 커밋)
       → 작성자·메시지
```

- **스냅샷**(diff 아님): 각 커밋이 전체 트리를 가리킴 (변경분 아니라 상태)
- **부모 링크**: 커밋들이 부모로 연결 → **DAG**(방향 비순환 그래프, algorithms/[[graph-theory]])
- 머지 커밋은 부모 2개
- 히스토리 = 커밋 DAG

## 브랜치 = 포인터

핵심 통찰 - **브랜치는 커밋을 가리키는 이름(ref)일 뿐**:

```
main → commit abc123 (그냥 포인터)
새 커밋하면 → main이 새 커밋으로 이동
```

- **브랜치 생성 = 포인터 하나 만들기** (O(1), 파일 하나) → Git 브랜치가 싼 이유
- **HEAD**: "현재 어디에 있나" (보통 브랜치를 가리킴)
- **ref가 전부**: `.git/refs/`에 브랜치·태그가 그냥 커밋 해시 담은 파일
- 커밋은 불변, 브랜치 포인터만 움직임

## reflog: 안전망

**ref가 움직인 이력** - "잃어버린" 커밋 복구:

```
git reflog          # HEAD가 거쳐온 모든 위치
git reset --hard 실수 → reflog에서 이전 커밋 찾아 복구
```

- 커밋은 **삭제해도 객체로 남음** (GC 전까지) → reflog로 되찾기
- "rebase/reset으로 날렸다" → 거의 항상 복구 가능 (reflog)
- Git이 두렵지 않은 이유: 커밋한 건 거의 안 잃음

## 주요 개념이 다 객체·ref

- **staging(index)**: 다음 커밋할 tree를 준비
- **merge**: 두 브랜치 커밋을 합침 (공통 조상 찾아 3-way)
- **rebase**: 커밋을 다른 베이스 위로 재적용 (새 커밋 생성, 히스토리 재작성) → software-design/[[refactoring-catalog]]의 커밋 정리
- **tag**: 특정 커밋에 이름 (릴리스)

## 실전 함의

- **커밋은 불변**: 시크릿 커밋하면 히스토리에 영원히 (security/[[secrets-management]]) - 되돌려도 남음
- **브랜치는 싸다**: 자유롭게 (feature 브랜치)
- **거의 안 잃음**: reflog가 안전망 → 실험 두려워 말기
- **해시로 무결성**: 히스토리 변조 감지 (커밋 서명 security/[[digital-signatures]])

## 연결

- 해시·내용 주소 → security/[[hashing]]
- 커밋 DAG → algorithms/[[graph-theory]]
- 불변 객체 → database/[[lsm-tree]]
- 시크릿 히스토리 → security/[[secrets-management]]
- 커밋 서명 → security/[[digital-signatures]]
- 워크플로우 → [[git-workflows]]
- 커밋 정리 (rebase) → software-design/[[refactoring-catalog]]

## 궁금한 것 (나중에)

- [ ] packfile (객체 압축 저장)
- [ ] git GC와 도달 불가 객체 (programming-languages/[[garbage-collection]]의 도달성)
- [ ] merge 3-way 알고리즘
- [ ] 히스토리에서 시크릿 완전 제거 (filter-repo)

## 출처

- "Pro Git" (Chacon) 10장 (Git Internals)
