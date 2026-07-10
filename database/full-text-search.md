# 전문 검색 (Full-Text Search)

## 한 줄 요약

문서 안의 단어로 검색하는 것. 핵심 자료구조는 **역색인**(단어 → 그 단어가 있는 문서 목록)이고, 관련도 점수는 TF-IDF/BM25로 매긴다. `LIKE '%word%'`가 전체 스캔인 이유와, 어휘(lexical) 매칭이 의미(semantic) 검색과 어떻게 다른지가 요점.

## 왜 필요한가

- `LIKE '%word%'`는 왜 느린가
- 검색 엔진이 어떻게 순식간에 찾나 (역색인)
- 관련도 순위를 어떻게 매기나 (TF-IDF/BM25)

## 왜 LIKE로는 안 되나

```sql
SELECT * FROM docs WHERE body LIKE '%database%'
```

- **전체 스캔**: 모든 행의 body를 처음부터 훑음 (인덱스 못 탐, [[index-usage]])
- 선행 `%` 때문에 B+tree 인덱스 무용 (접두사 아니라 중간 매칭)
- 형태소·랭킹·다중 단어 처리 불가
- → 전용 구조 필요: **역색인**

## 역색인 (inverted index, 핵심)

일반 인덱스가 "문서 → 단어"라면 역색인은 **"단어 → 문서 목록"**:

```
정방향: doc1 → [the, cat, sat, ...]
역방향: cat → [doc1], sat → [doc1, doc2], the → [doc1, doc2]
```

### 코드로 확인

역색인 구축 + TF-IDF 검색:

```python
inv[term][doc] += 1   # 단어별로 등장 문서·빈도 기록
```

실행:
```
역색인 일부:
  'cat' -> {1: 1}
  'sat' -> {1: 1, 2: 1}
  'the' -> {1: 2, 2: 2}
```

- 검색 시 **단어의 문서 목록만** 보면 됨 (전체 스캔 X) → O(결과 크기)
- 다중 단어는 목록 교집합/합집합 (data-structures/[[hash-tables]]·정렬 병합)

## 분석 파이프라인 (analysis)

역색인에 넣기 전 텍스트를 정규화:

```
원문 → 토큰화 → 소문자화 → 불용어 제거 → 어간 추출 → 색인
"The Cats" → [the, cats] → [cats] → [cat]
```

- **토큰화**: 단어로 쪼갬 (ai-ml/[[tokenization]]의 BPE와 다름 - 여긴 단어 단위)
- **불용어(stopword)**: the/is/a 등 흔한 단어 제거 (정보 적음)
- **어간 추출(stemming)**: running→run, cats→cat (형태 통일)
- 언어마다 다름 (한국어는 형태소 분석 필요)

## 관련도 점수: TF-IDF → BM25

여러 문서가 매칭되면 **순위**를 매김:

### TF-IDF

```
TF(단어 빈도): 문서에 자주 나오면 관련↑
IDF(역문서빈도): 여러 문서에 흔하면 관련↓ (the는 어디나 있어 무의미)
점수 = TF × IDF
```

코드 실행 ('cat sat' 검색):
```
검색 'cat sat':
  doc1 score=2.079  "the cat sat on the mat"
  doc2 score=0.693  "the dog sat on the log"
```
- doc1이 **cat+sat 둘 다** 있고, `cat`은 희귀(IDF↑) → 최고점
- doc2는 `sat`만 → 낮음
- `the`는 모든 문서에 있어 IDF≈0 → 점수 기여 거의 없음 (자동 무시)

### BM25 (실전 표준)

- TF-IDF 개선판: **TF 포화**(같은 단어 반복의 효과 감소) + **문서 길이 정규화**(긴 문서 편향 보정)
- Elasticsearch·Lucene의 기본 랭킹 (거의 모든 검색 엔진)

## 어휘 vs 의미 검색

전문 검색의 근본 한계와 보완:

```
전문 검색(lexical): 단어가 정확히 일치해야 (BM25)
  "car" 검색 → "automobile" 문서 못 찾음 (동의어 모름)
의미 검색(semantic): 임베딩 유사도 (ai-ml/[[embeddings]])
  "car" ≈ "automobile" (의미 가까움)
```

- **하이브리드**가 실전 최선: BM25(정확한 용어·희귀어) + 벡터(의미) 결합
- RAG의 검색이 이 조합 (ai-ml/[[rag]]) - 어휘 검색이 고유명사·코드에 강함

## DB에서의 전문 검색

- **PostgreSQL**: `tsvector`/`tsquery` + GIN 인덱스 (역색인)
- **전용 엔진**: Elasticsearch, Lucene, Solr (대규모·랭킹·집계)
- DB 내장은 간단할 때, 규모·기능 크면 전용 엔진으로

## 셀프 체크

> [!question]- `LIKE '%database%'`가 왜 느리고 B+tree 인덱스를 못 타나?
> 선행 `%` 때문에 접두사가 아니라 중간 매칭이라 정렬된 B+tree 인덱스로 범위를 좁힐 수 없다. 결국 모든 행의 body를 처음부터 훑는 전체 스캔이 된다. 게다가 형태소·랭킹·다중 단어 처리도 못 한다.

> [!question]- 역색인(inverted index)의 구조와, 그것이 검색을 빠르게 하는 이유는?
> 정방향은 "문서 → 단어 목록"이지만 역색인은 "단어 → 그 단어가 있는 문서 목록"이다. 검색 시 해당 단어의 문서 목록만 보면 되므로 전체 스캔 없이 O(결과 크기)로 찾는다. 다중 단어는 각 단어의 문서 목록을 교집합/합집합한다.

> [!question]- 역색인에 넣기 전 분석 파이프라인의 단계와 각 목적은?
> 토큰화(단어로 쪼갬) → 소문자화 → 불용어 제거(the/is/a 등 정보 적은 흔한 단어 제거) → 어간 추출(running→run, cats→cat으로 형태 통일) → 색인. 언어마다 다르며 한국어는 형태소 분석이 필요하다.

> [!question]- TF-IDF에서 TF와 IDF는 각각 무엇을 반영하며, `the` 같은 단어가 자동으로 무시되는 이유는?
> TF(단어 빈도)는 문서에 자주 나올수록 관련도가 높다고 본다. IDF(역문서빈도)는 여러 문서에 흔한 단어일수록 관련도를 낮춘다. `the`는 모든 문서에 있어 IDF가 0에 가깝고, 점수=TF×IDF이므로 기여가 거의 없어 자동으로 무시된다.

> [!question]- 어휘(lexical) 검색과 의미(semantic) 검색의 차이, 그리고 하이브리드가 실전 최선인 이유는?
> 어휘 검색(BM25)은 단어가 정확히 일치해야 해서 "car"로 "automobile" 문서를 못 찾는다(동의어 모름). 의미 검색은 임베딩 유사도로 "car≈automobile"을 잡는다. 하이브리드는 BM25(정확한 용어·희귀어·고유명사·코드에 강함)와 벡터(의미)를 결합해 서로의 약점을 메우므로 실전 최선이며 RAG 검색이 이 조합이다.

## 연습문제

> [!example]- 문제: 두 문서 doc1="the cat sat on the mat", doc2="the dog sat on the log"로 역색인을 만들고, 'cat sat' 검색 시 doc1이 doc2보다 높은 점수를 받는 이유를 TF-IDF로 설명하라
> **풀이**
> 역색인(단어 → {문서: 빈도}): cat → {1:1}, sat → {1:1, 2:1}, the → {1:2, 2:2}, mat → {1:1}, dog → {2:1}, log → {2:1}, on → {1:1, 2:1}.
> 검색 'cat sat': doc1은 cat과 sat 둘 다 매칭, doc2는 sat만 매칭.
> `cat`은 doc1에만 있어 IDF가 높다(희귀어) → 큰 점수 기여. `sat`은 두 문서 모두에 있어 IDF가 낮다. 따라서 doc1은 (희귀한 cat + sat) 점수를 받아 높고, doc2는 (흔한 sat)만 있어 낮다.
> 결론: doc1 > doc2. `the`는 모든 문서에 있어 IDF≈0으로 순위에 영향 없다.

> [!example]- 문제: PostgreSQL에서 body 열에 전문 검색을 하려 한다. `LIKE '%database%'` 대신 어떤 방식으로 인덱스를 만들고 질의할지 제시하고, 왜 빨라지는지 설명하라
> **풀이**
> 방식: body를 `tsvector`로 변환해 GIN 인덱스를 만든다.
> `CREATE INDEX idx_body ON docs USING GIN (to_tsvector('english', body));`
> 질의: `SELECT * FROM docs WHERE to_tsvector('english', body) @@ to_tsquery('english', 'database');`
> 왜 빨라지나: `to_tsvector`가 토큰화·불용어 제거·어간 추출을 거쳐 정규화된 단어들을 만들고, GIN 인덱스가 역색인 역할을 해 'database'가 든 문서 목록을 바로 찾는다. LIKE의 전체 스캔과 달리 단어의 문서 목록만 보므로 빠르고, 형태소·랭킹(ts_rank)도 가능하다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1. `LIKE '%word%'`가 전체 스캔인 이유와, 역색인(단어→문서 목록)이 이를 어떻게 O(결과 크기)로 바꾸는지.
> 2. 분석 파이프라인(토큰화·불용어·어간 추출)과 관련도 점수(TF-IDF의 직관, BM25가 더한 TF 포화·길이 정규화).
> 3. 어휘 검색 vs 의미 검색의 한계·보완과 하이브리드(BM25+벡터)가 실전 최선인 이유.

## 연결

- 왜 LIKE가 인덱스 못 타나 → [[index-usage]]
- 목록 교집합·해시 → data-structures/[[hash-tables]]
- 단어 vs 하위단어 토큰화 → ai-ml/[[tokenization]]
- 의미 검색 (임베딩) → ai-ml/[[embeddings]]
- 하이브리드 검색·RAG → ai-ml/[[rag]]
- IDF의 정보량 직관 → math/[[probability-basics]]

## 궁금한 것 (나중에)

- [ ] GIN vs GiST 인덱스 (PostgreSQL)
- [ ] BM25 파라미터(k1, b) 튜닝
- [ ] 한국어 형태소 분석 (은전한닢, nori)
- [ ] 벡터+BM25 하이브리드 스코어 결합 (RRF)

## 출처

- CMU 15-445, "Introduction to Information Retrieval" (Manning et al.), Lucene/Elasticsearch 문서
