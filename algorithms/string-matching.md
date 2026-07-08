# 문자열 매칭 (String Matching)

## 한 줄 요약

텍스트에서 패턴을 찾는 문제. 순진하게는 O(nm)이지만, KMP는 실패 함수로 O(n+m), 라빈-카프는 해싱으로 평균 O(n+m). KMP의 실패 함수는 사실상 DFA를 만드는 것.

## 왜 필요한가

- grep, 편집기 찾기, DNA 검색의 기반
- 순진한 O(nm)을 어떻게 O(n+m)으로
- 오토마타([[dfa-nfa]])와 알고리즘의 만남

## 순진한 방법

텍스트 각 위치에서 패턴을 처음부터 비교:

```
for i in 텍스트:
    for j in 패턴: if 불일치 break
    if 전부 일치: 찾음
```

- 최악 **O(nm)**: `aaaa...a`에서 `aaab` 찾기 - 매 위치에서 거의 끝까지 비교 후 실패
- 불일치 시 텍스트 포인터를 1칸만 뒤로 → 이미 본 정보를 버림

## KMP (Knuth-Morris-Pratt)

핵심: **불일치 시 패턴의 이미 매칭된 부분을 활용**해 텍스트를 되돌리지 않음.

### 실패 함수 (failure function)

패턴 각 위치에서 "여기서 불일치하면 패턴의 어디로 점프할지" = **접두사이면서 접미사인 최대 길이**:

실측 (`ababc`):
```
failure of 'ababc': 0 0 1 2 0
```

- `abab`까지 매칭 후 다음이 불일치하면 → f[3]=2, 즉 `ab`(길이2)는 이미 매칭됐으니 거기부터
- 이미 매칭한 `ab`를 다시 비교 안 함 → 텍스트 포인터 안 되돌림

### 복잡도

- 실패 함수 구축 O(m), 검색 O(n) → **O(n+m)**
- 텍스트 각 문자를 상수 번만 봄 (되돌림 없음)

실측:
```
'ababcabab' in 'ababcababcababc': 2   ← 겹치는 매칭도 찾음
'aa' in 'aaaaa': 4                     ← 4번 (겹침)
'xyz' in 'abcabc': 0
```

### KMP = DFA

실패 함수는 사실상 **패턴을 인식하는 DFA**([[dfa-nfa]])를 만드는 것:
- 각 상태 = "패턴의 몇 글자까지 매칭됨"
- 실패 함수 = 불일치 시 전이
- 문자열 매칭과 오토마타 이론의 직접 연결 → automata/[[regex-and-finite-automata]]

## 라빈-카프 (Rabin-Karp)

**해싱**으로 매칭. 패턴과 텍스트 윈도우의 해시를 비교:

```
1. 패턴 해시 계산
2. 텍스트를 슬라이딩하며 각 윈도우 해시 비교
3. 해시 같으면 실제 문자 비교 (해시 충돌 대비)
```

- **rolling hash**: 윈도우 이동 시 해시를 O(1)에 갱신 (한 글자 빼고 한 글자 더함)
- 평균 O(n+m), 최악 O(nm) (해시 충돌 많으면)
- **다중 패턴/2D 검색에 유리**: 여러 패턴 해시를 한 번에 비교
- 표절 검사, 중복 탐지에 활용

## 알고리즘 선택

| 방법 | 복잡도 | 특징 |
|---|---|---|
| 순진 | O(nm) | 단순, 짧은 텍스트 |
| KMP | O(n+m) | 단일 패턴 보장 |
| 라빈-카프 | O(n+m) 평균 | 다중 패턴, 2D |
| Boyer-Moore | O(n/m) 최선 | 실전 grep (뒤에서 비교, 건너뛰기) |
| Aho-Corasick | O(n+매칭) | 다중 패턴 동시 (트라이 기반 → [[tries]]) |

**실전 grep**은 Boyer-Moore 계열 (긴 패턴에서 여러 글자씩 건너뜀). 다중 패턴은 Aho-Corasick.

## 연결

- KMP = DFA → automata/[[dfa-nfa]], [[regex-and-finite-automata]]
- 다중 패턴 트라이 → data-structures/[[tries]]
- 라빈-카프 해싱 → data-structures/[[hash-tables]]
- 편집 거리 (유사 문자열) → [[dp-patterns]]

## 궁금한 것 (나중에)

- [ ] Boyer-Moore의 bad character / good suffix 규칙
- [ ] Aho-Corasick의 실패 링크 (KMP의 트라이 확장)
- [ ] suffix array로 검색 O(m log n)
- [ ] 정규식 엔진의 매칭 → automata/[[regex-engines]]

## 출처

- CLRS 32장 (문자열 매칭)
