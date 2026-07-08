# Lempel-Ziv 압축 (Lempel-Ziv)

## 한 줄 요약

분포를 미리 몰라도 되는 **범용(universal) 압축**. 앞서 나온 문자열을 사전 삼아 반복을 (거리, 길이) 참조로 대체한다 - LZ77은 슬라이딩 윈도우, LZ78/LZW는 사전 테이블. 데이터가 길어지면 그 소스의 엔트로피에 점근한다. gzip·zstd·PNG의 뿌리.

## 왜 필요한가

- 분포를 모르는 실제 파일을 어떻게 압축하나 (Huffman은 빈도표 필요)
- LZ가 어떻게 반복을 잡나
- 왜 "범용" 압축인가

## Huffman의 한계 → LZ의 동기

```
Huffman/arithmetic: 기호 분포(빈도)를 알아야 ([[huffman-and-entropy-coding]])
                    기호를 독립으로 봄 → 반복 패턴 못 잡음
실제 데이터: 분포 모름 + 반복 많음 ("the"가 수백 번, 코드 블록 반복)
```

- LZ는 **분포 가정 없이** 데이터를 지나가며 반복을 발견 → 사전 자동 구축
- 기호 간 **상관(반복)**을 활용 (Huffman이 못 하는 것)

## LZ77 (슬라이딩 윈도우)

**앞서 나온 부분을 (거리, 길이)로 참조**:

```
출력 토큰 = (거리 back, 길이 len, 다음 문자)
"이 위치의 len글자는 back칸 앞의 것과 같다"
```

### 코드로 확인

```python
# 윈도우에서 현재 위치와 가장 길게 일치하는 과거 위치 찾기
```

실행:
```
원문: 'abcabcabcabcabcabc' (18글자)
토큰 4개:
  (dist=0, len=0, next='a')
  (dist=0, len=0, next='b')
  (dist=0, len=0, next='c')
  (dist=3, len=15, next='')      # 3칸 앞부터 15글자 반복!

반복 없는 'abcdefghij' (10글자) -> 토큰 10개 (압축 안 됨)
```

- 처음 `abc`는 신규(리터럴), 그 뒤 전부 **"3칸 앞 15글자 복사"** 한 토큰으로 → 18글자가 4토큰
- **반복 없으면 못 줄임**: abcdefghij는 10글자 10토큰 (오히려 오버헤드) - 압축은 중복이 있어야
- 겹치는 복사 허용: dist=3, len=15가 3글자 사전을 넘어 스스로 이어 복사 (실행 길이 부호화 효과)

## LZ78 / LZW (사전 테이블)

**명시적 사전에 새 문자열을 번호로 등록**:

```
본 적 있는 최장 문자열 → 사전 번호로 출력, 새 문자열은 사전에 추가
```

- LZW(LZ78 변형): GIF, 초기 compress, PDF
- 슬라이딩 윈도우 대신 성장하는 사전 (번호 참조)

## 범용성 (universal, 핵심 이론)

LZ의 이론적 위엄 - **소스를 몰라도 최적에 수렴**:

```
데이터 길이 n → ∞ 일 때, LZ의 압축률 → 소스의 엔트로피율 H
(정상 에르고딕 소스에 대해, 분포를 전혀 몰라도)
```

- Huffman은 분포를 줘야 하지만 LZ는 **데이터만으로** 엔트로피([[entropy-and-information]]) 하한에 점근
- "범용" = 특정 분포에 맞춘 게 아니라 어떤 소스든 (충분히 길면) 최적
- 실전 함의: 텍스트·코드·로그처럼 구조·반복 있는 데이터에 강함

## 실전 압축 = LZ + 엔트로피 코딩

LZ 혼자가 아니라 **2단계 결합**:

```
gzip  = LZ77 + Huffman         (반복 제거 후 토큰을 엔트로피 코딩)
zstd  = LZ류 + FSE/ANS         (더 나은 엔트로피 단계, 빠름)
LZMA  = LZ77(큰 윈도우) + range coding  (고압축)
PNG   = 필터 + DEFLATE(=gzip)
```

- LZ가 **반복(구조)** 제거 → 엔트로피 코더가 **남은 기호 편향** 제거 ([[huffman-and-entropy-coding]])
- 두 단계가 상보적: LZ는 기호 간 상관, 엔트로피 코딩은 기호 분포

## 트레이드오프

- **윈도우/사전 크기**: 크면 먼 반복도 잡음(압축률↑) but 느림·메모리↑
- **압축 속도 vs 비율**: zstd는 레벨로 조절 (실시간~아카이브)
- **비압축 데이터**: 이미 압축된/랜덤 데이터는 반복 없어 못 줄임 (엔트로피가 이미 최대)
- 압축 불가능성의 극한 → [[kolmogorov-complexity]]

## 연결

- 엔트로피 하한에 점근 → [[entropy-and-information]], [[source-coding-theorem]]
- 결합되는 엔트로피 코딩 → [[huffman-and-entropy-coding]]
- 압축 불가능성 (랜덤) → [[kolmogorov-complexity]]
- 문자열 매칭 알고리즘 → algorithms/[[string-matching]]
- 실전 사용: HTTP 압축 → network/[[http]]

## 궁금한 것 (나중에)

- [ ] DEFLATE 포맷 상세 (gzip 내부)
- [ ] 접미사 배열·해시 체인 (LZ 매칭 가속)
- [ ] Burrows-Wheeler 변환 (bzip2 - 다른 접근)
- [ ] LZ 최적 파싱 (greedy vs optimal)

## 출처

- Ziv & Lempel(1977, 1978), Cover & Thomas 13장, "Managing Gigabytes"
