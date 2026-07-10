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

## 셀프 체크

> [!question]- Python dict가 삽입 순서를 기억할 수 있는 이유는?
> 별도 배열에 (entry, hash)를 삽입 순서대로 저장하고, 해시 테이블에는 그 배열의 인덱스만 담기 때문이다(compact dict). 이 분리 덕에 순서를 보존하면서 메모리도 절약한다. Python은 체이닝이 아니라 오픈 어드레싱을 쓴다.

> [!question]- Java HashMap의 treeify는 무엇이며 무엇을 완화하나?
> 한 버킷의 체인이 8개를 넘고 테이블이 충분히 크면 그 버킷을 red-black tree로 변환해 최악을 O(n)에서 O(log n)으로 낮춘다. 키가 한 버킷에 몰리는 HashDoS 상황을 완화하는 방어책이다.

> [!question]- SwissTable이 SIMD를 어떻게 활용해 조회를 빠르게 하나?
> 각 슬롯의 해시 상위 1바이트를 별도 메타데이터 배열에 모아 두고, 조회 시 SIMD로 16개 메타바이트를 한 번에 비교해 매칭 후보만 실제 키를 비교한다. 캐시 친화적 배치와 벡터 병렬로 빠르다.

> [!question]- HashDoS 공격의 원리와 SipHash가 이를 막는 방식은?
> 공격자가 해시 함수를 알면 전부 같은 버킷으로 가는 키를 만들어 보내 모든 삽입/조회를 O(n)으로 만들고 CPU를 폭발시킨다. SipHash는 프로세스마다 랜덤 시크릿 키를 쓰는 keyed hash라서 공격자가 충돌 키를 미리 계산할 수 없어 이를 막는다.

## 연습문제

> [!example]- 문제: 신뢰할 수 없는 외부 입력(HTTP POST 파라미터 등)을 키로 dict에 넣는 웹 서버가 HashDoS에 어떻게 당하는지 설명하고, 방어를 설계하라.
> **풀이**
> 공격 경로: 해시 함수가 고정·공개면 공격자는 같은 버킷으로 가는 키 집합을 미리 계산해 한 요청에 수천 개를 담아 보낸다. 삽입/조회가 전부 O(n)이 되어 하나의 큰 체인에서 CPU가 폭발한다(2011년 다수 프레임워크가 이 방식으로 마비).
> 방어 설계:
> - keyed hash(SipHash)로 전환 - 프로세스마다 랜덤 시크릿 키를 써서 충돌 키를 미리 계산 불가하게. (Python 3.4+, Rust 기본)
> - 몰려도 O(log n)이 되도록 Java식 treeify를 병행.
> - 파라미터 개수 상한 등 입력 크기 제한.
> 대부분 언어 기본이 이미 DoS 저항이므로 "기본 해시를 끄지 않는 것"이 1차 방어.

> [!example]- 문제: Python dict의 삽입 순서 보존과 Java HashMap의 treeify는 각각 조회의 시간/공간 복잡도에 어떤 영향을 주는지 분석하라.
> **풀이**
> - Python compact dict: 조회는 여전히 오픈 어드레싱 평균 O(1). 인덱스 배열 + 밀집 엔트리 배열로 분리해 오히려 공간이 준다(희소 포인터 배열을 안 씀). 순서 보존은 부수 효과이고 시간 복잡도는 그대로.
> - Java treeify: 평범한 버킷은 O(1)이지만 한 버킷에 8개 이상 몰리면 그 버킷만 O(체인) 대신 O(log 체인). 트리 노드가 링크드 노드보다 커서 공간은 늘지만, 최악 조회를 O(n)→O(log n)으로 상한을 낮춘다.
> 요약: 둘 다 평균 복잡도는 그대로 두고, 하나는 공간·순서를, 하나는 최악 상한을 개선한다.

> [!example]- 문제: 극한 조회 성능이 필요한 서비스에서 표준 std::unordered_map 대신 SwissTable 계열(flat_hash_map)을 고르는 근거를 대라.
> **풀이**
> - 표준 unordered_map은 체이닝을 사실상 강제(참조 안정성 요구)해 노드가 힙에 흩어지고 포인터 추적이 잦아 캐시 미스가 많다.
> - SwissTable은 오픈 어드레싱 + 상위 1바이트 메타데이터 배열을 SIMD([[simd]])로 16개씩 병렬 비교 → 캐시 친화적이고 조회당 명령 수가 적다.
> 선택 근거: 읽기 지배적, 값이 작고 참조 안정성이 필요 없는 워크로드에서 캐시 지역성과 SIMD 병렬로 실측 처리량이 크게 오른다. 대신 참조 안정성이나 표준 호환이 필수면 교체하지 않는다.

## 파인만

> [!note]- 백지에 "내가 쓰는 dict/HashMap이 실제로 뭘 하나"를 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1. Python(순서·compact), Java(treeify), Rust(SwissTable+SipHash)가 각각 무엇을 다르게 하는가.
> 2. HashDoS가 왜 성립하고 keyed hash(SipHash)가 왜 그것을 막는가.
> 3. SwissTable이 메타데이터 + SIMD로 조회를 빠르게 하는 원리와 표준 체이닝 대비 이점.

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
