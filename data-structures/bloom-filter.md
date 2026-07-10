# 블룸 필터 (Bloom Filter)

## 한 줄 요약

"이 원소가 집합에 있나"를 아주 적은 메모리로 답하는 확률적 구조. "없다"는 100% 정확하지만 "있다"는 가끔 틀린다(false positive). 실제 데이터를 저장하지 않아 극도로 공간 효율적.

## 왜 필요한가

- 거대한 집합의 소속 검사를 적은 메모리로
- DB/캐시 앞단에서 "확실히 없으면 디스크 안 감"
- 확률적 자료구조의 대표 - 정확성을 메모리와 맞바꿈

## 구조

**비트 배열 + k개의 해시 함수**. 원소를 저장하지 않고 비트만 켬:

```
add(x):    k개 해시로 k개 위치를 1로
query(x):  그 k개 위치가 전부 1이면 "아마 있음", 하나라도 0이면 "확실히 없음"
```

```
비트배열: [0 1 0 0 1 0 1 0 ...]
add("cat"): h1%M, h2%M 위치를 1로
```

## 핵심 성질: 비대칭 오류

- **false negative 없음**: 넣은 건 반드시 "있음"으로 나옴 (비트를 껐을 리 없으니)
- **false positive 있음**: 안 넣었는데 "있음"으로 나올 수 있음 (다른 원소들이 우연히 그 비트들을 다 켜서)

실측 (10000비트, 2해시, 1000개 삽입):

```
false negatives: 0 (항상 0)
false positives: 335/10000 = 3.4%
```

넣은 1000개는 전부 정확히 검출 (FN=0). 안 넣은 것 중 3.4%가 "있음"으로 오판(FP). **"없음"은 믿고, "있음"은 확인 필요.**

## false positive 조절

FP율은 세 값으로 결정:

- **m**: 비트 수 (클수록 FP↓)
- **n**: 삽입 원소 수 (많을수록 FP↑)
- **k**: 해시 함수 수 (최적값 존재)

```
최적 k ≈ (m/n) × ln 2
FP율 ≈ (1 - e^(-kn/m))^k
```

원하는 FP율과 예상 n에서 m, k를 역산. 예: 1% FP에 원소당 ~9.6비트. **실제 데이터(수십 바이트)보다 훨씬 작음** → 공간 효율의 핵심.

## 왜 이렇게 작나

블룸 필터는 **원소를 저장하지 않음** - 비트만. 100만 개 URL을 실제 저장하면 수십 MB지만, 블룸 필터는 1% FP에 ~1.2MB. 대신 "정확히 뭐가 있나"는 못 말하고(열거 불가), 소속 여부만 확률적으로.

## 어디에 쓰나

- **캐시/DB 앞단**: "이 키가 있나?" 블룸이 "없음" → 디스크 조회 스킵. LSM-tree([[lsm-tree]])가 SSTable마다 블룸 필터로 불필요한 디스크 읽기 회피
- **웹 크롤러**: 방문한 URL인가 (거대 집합)
- **CDN/프록시**: 캐시에 있을 법한가
- **스팸/악성 URL 필터**: 블랙리스트 소속
- **분산 시스템**: 중복 방지, set 교집합 근사

## 한계와 변형

- **삭제 불가**: 비트를 끄면 다른 원소가 영향 → **counting Bloom filter**(비트 대신 카운터)로 삭제 지원
- **열거 불가**: 뭐가 들었는지 못 봄
- **동적 크기 조절 어려움**: scalable Bloom filter
- **Cuckoo filter**: 삭제 지원 + 비슷한 공간, 더 나은 지역성

## 관련 확률적 구조

정확성을 자원과 맞바꾸는 계열:
- **HyperLogLog**: 개수(카디널리티) 추정 → [[hyperloglog]]
- **Count-Min Sketch**: 빈도 추정
- **Bloom filter**: 소속 검사 (이 노트)

## 셀프 체크

<details>
<summary>블룸 필터의 오류가 왜 비대칭인가 (false negative는 없고 false positive만 있는 이유)?</summary>

넣은 원소는 해당 비트들을 켰고 비트를 끌 일이 없으므로 반드시 "있음"으로 나와 false negative가 없다. 반면 안 넣은 원소라도 다른 원소들이 우연히 그 k개 비트를 전부 켜놨으면 "있음"으로 오판할 수 있어 false positive는 존재한다. 그래서 "없음"은 믿고 "있음"은 확인이 필요하다.
</details>

<details>
<summary>false positive율을 결정하는 세 값과 각각의 방향은?</summary>

비트 수 m(클수록 FP↓), 삽입 원소 수 n(많을수록 FP↑), 해시 함수 수 k(최적값 존재)이다. 최적 k ≈ (m/n) × ln 2, FP율 ≈ (1 - e^(-kn/m))^k. 원하는 FP율과 예상 n으로 m, k를 역산한다.
</details>

<details>
<summary>블룸 필터가 실제 데이터 저장보다 극도로 작은 이유와 그 대가는?</summary>

원소 자체를 저장하지 않고 비트만 켜기 때문이다. 100만 URL을 실제 저장하면 수십 MB지만 블룸 필터는 1% FP에 ~1.2MB다. 대가로 "정확히 뭐가 들었나"는 열거하지 못하고 소속 여부만 확률적으로 답한다.
</details>

<details>
<summary>블룸 필터가 왜 삭제를 지원하지 못하며 어떤 변형이 이를 해결하나?</summary>

한 비트를 여러 원소가 공유하므로 특정 원소를 지우려고 비트를 끄면 그 비트를 공유하는 다른 원소에 영향을 준다. 비트 대신 카운터를 쓰는 counting Bloom filter가 삭제를 지원하고, Cuckoo filter도 삭제를 지원하며 지역성이 더 낫다.
</details>

## 연결

- 해시 함수 → [[hash-tables]], security/[[hashing]]
- 비트 조작 → computer-architecture/[[bits-and-integers]]
- LSM-tree에서의 사용 → database/[[lsm-tree]]
- 카디널리티 추정 사촌 → [[hyperloglog]]
- 캐시 전략 → distributed-systems/[[caching-strategies]]

## 궁금한 것 (나중에)

- [ ] 최적 k 유도 (미분으로 FP 최소화)
- [ ] counting/scalable Bloom filter 구현
- [ ] Cuckoo filter가 삭제를 지원하는 법
- [ ] LSM-tree의 블룸 필터 튜닝

## 출처

- Bloom (1970) 원논문, "Network Applications of Bloom Filters" 서베이
