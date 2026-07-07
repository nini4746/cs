# SSD 내부 (SSD Internals)

## 한 줄 요약

SSD는 탐색 시간이 없지만 "제자리 덮어쓰기"가 불가능하다는 이상한 제약이 있다. 쓰기 전에 큰 블록을 통째로 지워야 하고, 이 때문에 FTL이 논리↔물리 매핑, wear leveling, garbage collection을 수행한다.

## 왜 필요한가

- SSD가 HDD와 왜 근본적으로 다른가
- 쓰기가 읽기보다 왜 복잡하고 느린가
- write amplification, TRIM이 뭔지
- DB/파일시스템이 SSD에 맞춰 설계를 바꾼 이유 → [[lsm-tree]]

## HDD와의 근본 차이

| | HDD | SSD (플래시) |
|---|---|---|
| 접근 방식 | 헤드 이동(탐색) | 전자적, 탐색 없음 |
| 랜덤 접근 | 느림 (탐색 지배) | 빠름 (균일) |
| 지연 | ~ms | ~100μs |
| 제자리 덮어쓰기 | 가능 | **불가능** (핵심 제약) |
| 마모 | 거의 없음 | 셀당 쓰기 횟수 제한 |

SSD는 탐색 시간이 없어 랜덤 접근이 빠름 → [[fast-file-system]]의 지역성 전제가 약해짐. 하지만 새 제약이 생김.

## 플래시의 이상한 규칙

플래시 메모리의 물리적 제약:

- **읽기/쓰기 단위 = 페이지**(4~16KB)
- **지우기 단위 = 블록**(수백 페이지, 훨씬 큼)
- **핵심: 이미 쓴 페이지를 덮어쓸 수 없음.** 다시 쓰려면 그 페이지가 속한 **블록 전체를 먼저 지워야** 함

```
페이지에 쓰기: 빈(지워진) 페이지에만 가능
페이지 수정: 불가. 블록 전체 지우고 다시 써야 함
```

이 "쓰기 전 지우기 + 지우기는 큰 단위" 비대칭이 SSD 복잡도의 근원.

## FTL: 이 복잡도를 감추는 계층

**FTL(Flash Translation Layer)**이 SSD 안(컨트롤러)에서 논리 블록 주소(LBA)를 물리 위치로 매핑하며 제약을 숨김. OS는 그냥 "블록 장치"로 봄 ([[io-devices]]).

### 로그 구조 쓰기 (out-of-place)

페이지를 수정하면 제자리에 안 쓰고:

1. **빈 페이지에 새 버전을 쓰고**
2. FTL 매핑을 새 위치로 갱신
3. 옛 페이지는 "무효(stale)"로 표시

덮어쓰기를 회피 → [[crash-consistency]]의 copy-on-write, [[lsm-tree]]와 같은 로그 구조 아이디어. SSD 자체가 로그 구조.

### Garbage Collection

무효 페이지가 쌓이면 회수 필요:

1. 유효 페이지가 섞인 블록에서 유효한 것만 다른 블록으로 복사
2. 원래 블록을 통째 지움 → 빈 블록 확보

**write amplification**: 사용자가 1을 쓰려는데 GC의 복사 때문에 실제 플래시엔 더 많이 씀. SSD 쓰기 성능/수명을 갉아먹는 주범.

### Wear Leveling

각 블록은 지우기 횟수 제한(수천~수만). 특정 블록만 계속 쓰면 거기만 빨리 죽음 → FTL이 **쓰기를 모든 블록에 고루 분산**해 수명 균등화. 안 쓰는 데이터도 가끔 옮겨 마모를 평준화.

## TRIM: OS가 SSD를 돕기

파일 삭제 시 OS는 블록을 "안 씀"으로 표시하지만 SSD는 모름 (파일시스템 개념이 없음). **TRIM** 명령으로 OS가 "이 LBA는 이제 무효"라고 알림:

- SSD가 그 페이지를 GC 대상으로 → 불필요한 복사 회피 → write amplification 감소
- TRIM 없으면 SSD가 죽은 데이터를 계속 옮김 → 성능 저하

## 설계에 주는 함의

- **큰 순차 쓰기 선호**: GC 부담 적음. 작은 랜덤 쓰기는 write amplification 유발
- **읽기는 걱정 없음**: 랜덤 읽기 빠르고 마모 없음
- **로그 구조 자료구조 유리**: LSM-tree([[lsm-tree]])가 SSD에서 뜬 이유 - 순차 쓰기 + 덮어쓰기 회피
- over-provisioning: SSD가 여유 공간을 숨겨둬 GC 원활하게

## 연결

- 블록 장치 추상 → [[io-devices]]
- HDD 전제의 지역성 → [[fast-file-system]]
- 로그 구조/CoW → [[crash-consistency]]
- SSD 최적 자료구조 → database/[[lsm-tree]]
- 디스크 계층 위치 → [[memory-hierarchy]]

## 궁금한 것 (나중에)

- [ ] write amplification factor를 실제 측정
- [ ] QLC/TLC/SLC의 밀도-수명 트레이드오프
- [ ] Zoned Namespace(ZNS) SSD - FTL을 호스트로 노출
- [ ] Optane/persistent memory는 이 그림을 어떻게 바꾸나

## 출처

- OSTEP 44장 (플래시 SSD)
