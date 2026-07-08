# 메모리 안전 (Memory Safety)

## 한 줄 요약

메모리를 잘못 접근하는 버그(버퍼 오버플로, use-after-free)가 보안 취약점의 큰 비중을 차지한다. C/C++의 수동 관리가 근원이고, Rust의 소유권·완화 기술·안전 언어가 대응이다.

## 왜 필요한가

- 왜 메모리 버그가 보안 문제인가
- 심각한 취약점(Heartbleed 등)의 근원
- Rust가 왜 주목받나

## 메모리 안전 버그 = 보안 취약점

computer-architecture/[[buffer-overflow]], os/[[memory-allocation]]에서 본 버그들이 **공격 표면**:

- MS·구글 통계: 심각 취약점의 **~70%가 메모리 안전 문제**
- C/C++로 짠 시스템(OS, 브라우저, 네트워크 스택)의 근본 위험
- 잘못된 메모리 접근 → 데이터 유출, 코드 실행, 크래시

## 주요 메모리 버그

### 버퍼 오버플로

경계 넘어 쓰기/읽기 → computer-architecture/[[buffer-overflow]]:
- **스택 오버플로**: 복귀 주소 덮어씀 → 코드 실행 탈취
- **힙 오버플로**: 인접 청크/메타데이터 손상 → os/[[memory-allocation]]
- **읽기 오버플로**: Heartbleed(2014) - OpenSSL이 요청보다 많이 읽어 **메모리 내용 유출**(키, 비번). 한 줄 버그가 인터넷 절반 위협

### use-after-free

해제된 메모리를 계속 사용 → os/[[memory-allocation]]:
- free 후 그 메모리가 재할당되면 → 남의 데이터 조작/유출
- 브라우저 취약점의 단골 (복잡한 객체 수명)

### 기타

- **double-free**: 두 번 해제 → 힙 메타데이터 손상
- **정수 오버플로 → 버퍼 오버플로**: `malloc(n*size)` wrap → 작은 버퍼 (computer-architecture/[[bits-and-integers]])
- **null 역참조**: 크래시 (DoS)
- **초기화 안 된 메모리**: 이전 데이터 유출
- **타입 혼동(type confusion)**: 객체를 다른 타입으로 해석

## 왜 C/C++에서 생기나

**수동 메모리 관리 + 경계 검사 없음** → programming-languages/[[memory-management-models]]:

- 컴파일러가 배열 경계·수명을 검사 안 함 (성능 위해)
- 프로그래머 실수 = 취약점
- 포인터 산술의 자유 = 위험
- 수십 년 레거시 코드

## 방어 계층

### 완화 기술 (mitigation)

버그가 있어도 악용을 어렵게 → computer-architecture/[[buffer-overflow]]:
- **스택 canary**: 복귀 주소 앞 랜덤 값 검사
- **ASLR**: 주소 무작위화 → 공격자가 위치 예측 못 함
- **NX/DEP**: 데이터 영역 실행 금지 → 셸코드 실행 차단
- **CFI**(제어 흐름 무결성): 정상 흐름만 허용
- 완화지 해결 아님 (ROP 등 우회 존재)

### 안전 언어 (근본 해결)

- **Rust**: 소유권·빌림 검사기가 **컴파일 타임에** 메모리 버그 차단 → programming-languages/[[memory-management-models]]. use-after-free/data race 불가능 (safe 코드)
- **GC 언어**(Java, Go): use-after-free 없음 (GC가 관리) → programming-languages/[[garbage-collection]]
- 정부·업계가 메모리 안전 언어로 전환 권고 (미 백악관 2024)

### 도구

- **ASan**(AddressSanitizer): 개발 중 메모리 버그 탐지 → os/[[memory-allocation]]
- **valgrind**, MSan(초기화), fuzzing
- 정적 분석 (하지만 한계 - automata/[[decidability]])

## Rust의 접근

메모리 안전을 **타입 시스템으로** (programming-languages/[[memory-management-models]]):
- 소유권: 각 값 소유자 하나 → double-free 불가
- 빌림 검사: aliasing 규칙 → use-after-free/data race 불가
- 수명(lifetime): dangling 포인터 불가
- **런타임 비용 0** (컴파일 타임 검사) → C급 성능 + 안전
- `unsafe` 블록에서만 수동 (최소화, 감사)

## 왜 여전히 C/C++인가

- 방대한 레거시 (OS 커널, 임베디드)
- 성능·제어 (일부 영역)
- 점진 전환: Rust로 새 부분 작성, 기존과 상호운용 (Linux 커널의 Rust 도입)

## 연결

- 버퍼 오버플로 → computer-architecture/[[buffer-overflow]]
- 힙 버그 → os/[[memory-allocation]]
- 정수 오버플로 → computer-architecture/[[bits-and-integers]]
- 소유권 (Rust) → programming-languages/[[memory-management-models]]
- GC (안전) → programming-languages/[[garbage-collection]]
- 정적 분석 한계 → automata/[[decidability]]
- 최소 권한 → [[least-privilege]]

## 궁금한 것 (나중에)

- [ ] ROP 체인이 완화를 우회하는 법
- [ ] CHERI (하드웨어 메모리 안전)
- [ ] Rust unsafe의 올바른 사용
- [ ] fuzzing으로 메모리 버그 찾기

## 출처

- computer-architecture/[[buffer-overflow]], MS/Google 취약점 통계
