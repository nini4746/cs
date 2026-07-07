# 버퍼 오버플로우 (Buffer Overflow)

## 한 줄 요약

지역 배열에 경계 검사 없이 쓰면 스택 프레임의 다른 데이터 - 특히 복귀 주소 - 를 덮어쓴다. 이것이 수십 년간 가장 흔한 심각 취약점이었고, 방어(canary/NX/ASLR)의 원리를 알면 왜 그런지 보인다.

> 교육/방어 목적 노트. 실제 익스플로잇 코드가 아니라 원리와 방어를 다룸.

## 왜 필요한가

- C/C++이 여전히 시스템의 기반이고, 이 언어들은 경계 검사를 안 해줌
- Morris 웜(1988)부터 최근 CVE까지 같은 뿌리
- [[procedures-and-stack]] + [[data-layout]] + [[bits-and-integers]]가 여기서 공격/방어로 종합됨
- "메모리 안전 언어(Rust)"가 왜 나왔는지의 근거

## 취약점의 뿌리: 경계 검사 없는 쓰기

```c
void vulnerable(char *input) {
    char buf[8];
    strcpy(buf, input);   // input이 8바이트 넘으면? 그냥 계속 씀
}
```

스택은 아래로 자라지만 `strcpy`는 **낮은 주소 → 높은 주소**로 채운다. `buf`를 넘긴 바이트는 프레임의 위쪽 - 저장된 복귀 주소 방향 - 을 덮는다:

```
낮은 주소  ┌──────────┐
          │ buf[8]    │ ← strcpy 시작, 넘치면
          ├──────────┤   ↓ 이 방향으로 침범
          │ saved fp  │
          ├──────────┤
          │ 복귀 주소  │ ← 여기 덮이면 ret이 공격자 주소로 점프
높은 주소  └──────────┘
```

복귀 주소를 공격자가 원하는 값으로 덮으면 `ret` 시점에 제어 흐름 탈취. 고전적으로는 buf에 셸코드를 넣고 복귀 주소를 buf로 돌림.

## 실물로 확인

이 머신에서 스택 보호 유무만 바꿔 컴파일:

```bash
# 스택 보호 끔
gcc -O0 -fno-stack-protector bof.c -o bof_nossp
# 기본 (스택 보호 켜짐)
gcc -O0 bof.c -o bof_ssp
```

buf는 8바이트인데 40바이트 입력:

```
./bof_nossp AAAA...(40개)   → exit 0   (조용히 통과 - 프레임 이미 손상됨)
./bof_ssp   AAAA...(40개)   → exit 133 (SIGTRAP: 오버플로우 감지하고 abort)
```

같은 소스, 방어 플래그 하나 차이로 "조용한 손상"이 "즉시 중단"으로 바뀐다. 리눅스에서는 `*** stack smashing detected ***` 메시지 + SIGABRT(134), Apple에서는 SIGTRAP(133).

## 방어 3종 - 각각 뭘 막나

### 1. 스택 canary (스택 보호기)

프롤로그에서 복귀 주소 바로 앞에 랜덤 값(canary)을 심고, 에필로그에서 그 값이 그대로인지 검사. 오버플로우가 복귀 주소를 덮으려면 canary를 먼저 지나야 하니 변조가 탐지됨.

- `-fstack-protector`(요즘 기본), `-fno-stack-protector`로 끔
- 한계: 정확히 복귀 주소만 노리는 공격(간접 쓰기), canary 값 유출이 있으면 우회

### 2. NX / DEP (실행 방지 비트)

스택/힙 페이지를 **쓰기 가능하지만 실행 불가**로 표시 ([[virtual-memory]]의 페이지 권한). buf에 셸코드를 넣어도 CPU가 그 페이지의 코드 실행을 거부.

- 대응 공격: **ROP (Return-Oriented Programming)** - 새 코드를 안 넣고 기존 코드 조각(gadget)들의 복귀 주소를 엮어 실행. NX를 우회하는 표준 기법

### 3. ASLR (주소 공간 배치 무작위화)

실행마다 스택/힙/라이브러리 주소를 랜덤화 → 공격자가 "복귀 주소를 어디로 돌릴지"를 예측 못 함.

- 한계: 주소 유출 취약점과 결합되면 무력화, 엔트로피 낮으면 브루트포스

**세 방어는 층위가 다르다**: canary는 탐지, NX는 코드 실행 차단, ASLR은 위치 은닉. 그래서 셋을 함께 씀 (defense in depth). 각각 단독으로는 우회법이 있음.

## 관련 메모리 안전 버그

버퍼 오버플로우는 큰 범주의 대표. 같은 뿌리(경계·수명 미검사):

- **스택 오버플로우** (위 - 프레임 손상)
- **힙 오버플로우** - 힙 메타데이터/인접 청크 손상 → [[memory-allocation]]
- **정수 오버플로우 → 버퍼 오버플로우**: `malloc(n * size)`가 wrap해서 작은 버퍼 할당 후 큰 쓰기 ([[bits-and-integers]])
- **use-after-free** - 해제된 메모리 재사용
- **off-by-one** - `<=` 하나로 1바이트 초과, 종종 saved fp의 최하위 바이트만 덮음
- **포맷 스트링** - `printf(user_input)`으로 `%n` 등 악용

## 근본 해법

방어(canary/NX/ASLR)는 완화지 해결이 아님. 근본:

1. **경계 검사하는 API**: `strcpy`→`strlcpy`/`snprintf`, `gets`(제거됨)→`fgets`. 길이를 항상 동반
2. **메모리 안전 언어**: Rust의 소유권/경계 검사, Go/Java의 런타임 검사. 컴파일/런타임에 이 클래스를 원천 차단 → [[memory-management-models]]
3. **정적/동적 분석**: ASan(AddressSanitizer)으로 개발 중 탐지, 퍼징

```bash
gcc -fsanitize=address bof.c -o bof_asan   # 오버플로우를 정확한 위치로 잡아줌
```

## 연결

- 스택 프레임 구조 (이 공격의 무대) → [[procedures-and-stack]]
- 배열이 경계 없이 인접 메모리로 이어지는 이유 → [[data-layout]]
- NX/ASLR이 기대는 페이지 권한 → [[virtual-memory]]
- 메모리 안전을 언어가 보장하는 법 → [[memory-safety]]
- 정수 오버플로우가 버퍼 오버플로우로 → [[bits-and-integers]]

## 궁금한 것 (나중에)

- [ ] ROP 체인이 실제로 어떻게 구성되나 (gadget 찾기)
- [ ] ASan은 어떤 원리로 오버플로우를 정확히 잡나 (레드존, 섀도 메모리)
- [ ] CET/shadow stack 같은 하드웨어 방어는 뭘 바꾸나
- [ ] Rust의 `unsafe` 블록에서는 이 버그가 다시 가능한가

## 출처

- CS:APP 3.10
- Aleph One, "Smashing the Stack for Fun and Profit" (1996, 역사적 원전)
