# 실전 해시 테이블 (Hash in Practice)

## 한 줄 요약

언어마다 해시 맵 구현이 다르다. Python dict는 삽입 순서를 유지하고, Java HashMap은 긴 체인을 트리로 바꾸고, 현대 구현은 SIMD를 쓴다. 그리고 나쁜 해시는 HashDoS 공격 표면이 되어 SipHash 같은 방어가 필요하다.

## 왜 필요한가

- 내가 쓰는 dict/HashMap이 실제로 뭘 하나
- 왜 Python dict가 순서를 기억하나
- 해시 테이블이 어떻게 공격당하나 (HashDoS)

## Python dict

- **오픈 어드레싱** ([[hash-tables]]) - 체이닝 아님
- **삽입 순서 유지** (3.7+): 별도 배열에 순서대로 (entry, hash) 저장, 해시 테이블은 그 인덱스만. dict가 순서를 기억하는 이유
- **compact dict**: 이 분리로 메모리 절약 + 순서 보존
- 작은 정수/문자열 키에 최적화

## Java HashMap

- **체이닝** 기반
- **treeify**: 한 버킷의 체인이 8개 넘고 테이블이 충분히 크면 그 버킷을 **red-black tree**로 변환 → [[balanced-trees]]. 최악을 O(n)에서 **O(log n)**으로. HashDoS 완화책
- 로드 팩터 0.75, 2배 리사이징
- `hashCode()`를 다시 섞음(spread) - 나쁜 hashCode 보완

## C++ / Rust / Go

- **C++ std::unordered_map**: 체이닝 (표준이 요구). 캐시 안 좋아 느린 편 → 실무는 abseil flat_hash_map 등으로 교체
- **Rust HashMap**: SwissTable 기반 (오픈 어드레싱 + SIMD), 기본 해시가 SipHash (DoS 저항)
- **Go map**: 버킷당 8개 슬롯 + 오버플로 버킷. 캐시 고려한 설계

## SwissTable (현대 고성능)

Google이 만든 오픈 어드레싱 설계, abseil/Rust가 채택:

- 각 슬롯의 해시 상위 1바이트를 **메타데이터 배열**에 따로 저장
- 조회 시 **SIMD**([[simd]])로 16개 메타바이트를 한 번에 비교 → 매칭 후보만 실제 키 비교
- 캐시 친화적 + 벡터 병렬 → 빠름
- "해시 테이블도 하드웨어를 안다"의 사례

## HashDoS 공격

해시 테이블의 최악 O(n)([[hash-tables]])을 악용:

- 공격자가 **전부 같은 버킷으로 가는 키**를 일부러 보냄 (해시 함수를 알면 계산 가능)
- 모든 삽입/조회가 O(n) → 하나의 큰 체인 → CPU 폭발
- 2011년 웹 프레임워크들(POST 파라미터를 dict에 넣음)이 대거 취약 → 작은 요청으로 서버 마비

### 방어: SipHash

- **키가 있는 해시 함수(keyed hash)**: 프로세스마다 랜덤 시크릿 키로 해시 → 공격자가 충돌 키를 미리 계산 불가
- **SipHash**: 빠르면서 암호학적으로 충돌 예측 어려움. Python(3.4+), Rust, 다수 언어의 기본 문자열 해시
- Java의 treeify도 다른 각도의 완화 (몰려도 O(log n))

## 실무 교훈

1. **기본 구현을 믿되 특성을 알라**: Python은 순서, Java는 treeify, Rust는 DoS 저항
2. **커스텀 키의 hash/equals를 제대로**: 나쁜 해시 = 성능 붕괴 + 미묘한 버그
3. **가변 객체를 키로 쓰지 마라**: 키의 해시가 바뀌면 못 찾음
4. **신뢰 못 할 입력을 키로**: DoS 저항 해시 확인 (대부분 언어 기본은 안전)
5. 극한 성능 필요하면 flat_hash_map/SwissTable 계열

## 연결

- 해시 테이블 원리 → [[hash-tables]]
- treeify의 red-black tree → [[balanced-trees]]
- SwissTable의 SIMD → [[simd]]
- SipHash와 암호학적 해시 → security/[[hashing]]
- HashDoS = 알고리즘 복잡도 공격 → security/[[injection]] 계열

## 궁금한 것 (나중에)

- [ ] Python compact dict의 메모리 레이아웃 상세
- [ ] SwissTable 메타데이터 바이트 인코딩
- [ ] SipHash가 왜 빠르면서 안전한가
- [ ] 언어별 해시맵 벤치마크

## 출처

- Python/Java/Rust 표준 라이브러리 문서
- Aumasson & Bernstein, "SipHash" (2012)
