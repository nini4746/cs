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
