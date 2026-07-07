# 어셈블리 기초 (Assembly Basics)

## 한 줄 요약

어셈블리는 CPU가 실제로 실행하는 것의 사람용 표기다. 쓸 일은 거의 없지만 읽을 줄 알면 컴파일러가 내 코드로 뭘 했는지, 성능과 버그의 진짜 원인이 어디인지 보인다.

## 왜 필요한가

- 디버거가 소스 없는 지점에서 멈추면 결국 어셈블리를 마주함
- "이 코드 왜 빠르지/느리지"의 최종 답은 생성된 명령어에 있음 (곱셈이 시프트가 됐는지, 분기가 사라졌는지)
- 버퍼 오버플로우 공격 이해 ([[buffer-overflow]])의 전제 지식
- 읽기 ≫ 쓰기. 목표는 컴파일러 출력을 읽는 능력

## 큰 그림

```mermaid
graph LR
    C[C 소스] -->|컴파일러| A[어셈블리 .s] -->|어셈블러| O[오브젝트 .o] -->|링커| E[실행 파일]
```

- **ISA (Instruction Set Architecture)**: 소프트웨어와 하드웨어 사이 계약 - 명령어, 레지스터, 메모리 모델 정의. 상세는 [[isa-design]]
- 양대 진영: **x86-64** (Intel/AMD, CISC 계열), **ARM64/AArch64** (Apple Silicon, 스마트폰, CISC 대비 RISC). 이 노트는 내 머신인 ARM64 중심 + x86-64 대응 병기

## 레지스터

CPU 안의 가장 빠른 저장소. 어셈블리 프로그래밍 = 레지스터 사이 데이터 돌리기.

| | ARM64 | x86-64 |
|---|---|---|
| 범용 레지스터 | x0~x30 (31개, 64비트) | rax, rbx, rcx, rdx, rsi, rdi, rbp, rsp, r8~r15 (16개) |
| 32비트 접근 | w0~w30 (x레지스터 하위 절반) | eax, ebx, ... (r레지스터 하위 절반) |
| 스택 포인터 | sp | rsp |
| 반환값 | x0 | rax |
| 인자 전달 | x0~x7 | rdi, rsi, rdx, rcx, r8, r9 |
| 제로 레지스터 | xzr (항상 0) | 없음 (`xor eax,eax`로 대신) |

관례(어느 레지스터가 인자/반환/보존용인지)는 calling convention - 상세는 [[procedures-and-stack]].

## 핵심 차이: load-store 구조

- **ARM64 (RISC)**: 메모리 접근은 오직 `ldr`(load)/`str`(store). 산술 명령은 레지스터끼리만
- **x86-64 (CISC)**: `add rax, [rbx]`처럼 산술 명령이 메모리 피연산자를 직접 받음

그래서 같은 C 코드도 ARM64는 "load → 연산 → store" 3박자로 풀린다.

## 주소 지정 방식 (addressing modes)

메모리 주소를 만드는 문법. ARM64:

```asm
ldr x1, [x0]              ; x1 = Mem[x0]
ldr x1, [x0, #16]         ; x1 = Mem[x0 + 16]        (변위)
ldr x1, [x0, x2, lsl #3]  ; x1 = Mem[x0 + x2*8]      (스케일 인덱스 - 배열 a[i])
ldr x1, [x0], #8          ; x1 = Mem[x0]; x0 += 8    (post-index - 포인터 순회)
ldr x1, [x0, #8]!         ; x0 += 8; x1 = Mem[x0]    (pre-index)
```

x86-64 일반형은 `D(Rb, Ri, s)` = `Mem[D + Rb + Ri*s]`. 예: `movq 16(%rdi,%rsi,8), %rax`.

`a[i]`가 명령어 하나인 이유 = 이 스케일 인덱스 모드가 하드웨어에 있어서. 링크드 리스트 순회가 이 혜택을 못 받는 것도 같은 이유.

## 제어 흐름: 비교 → 플래그 → 분기

어셈블리에 if/while은 없다. 전부 **조건 플래그 + 분기**로 환원:

1. `cmp x0, #0` - 빼기를 수행하고 결과는 버린 채 플래그(N/Z/C/V)만 갱신
2. `b.lt LABEL` - 플래그 조건 (lt=less than, eq, ne, ge...) 맞으면 점프

x86-64 대응: `cmp` + `jl/je/jne/jge...`

루프 = 역방향 조건 분기. `while`/`for`는 컴파일되면 구분 안 됨.

## 코드로 확인

아래 C를 이 머신에서 `gcc -O1 -S asm_demo.c`로 컴파일한 **실제 출력** (Apple Silicon, clang):

```c
long sum_array(long *a, long n) {
    long sum = 0;
    for (long i = 0; i < n; i++)
        sum += a[i];
    return sum;
}

long absval(long x) { return x < 0 ? -x : x; }

long scale(long *p, long i) { return p[i] * 4; }
```

### sum_array - 루프의 실체

```asm
_sum_array:
	cmp	x1, #1          ; n < 1 이면
	b.lt	LBB0_4          ; 루프 건너뛰기 (가드)
	mov	x8, #0          ; sum = 0
LBB0_2:                         ; 루프 본체
	ldr	x9, [x0], #8    ; x9 = *a; a++  (post-index 한 방)
	add	x8, x9, x8      ; sum += x9
	subs	x1, x1, #1      ; n-- 하면서 플래그 갱신 (subs의 s)
	b.ne	LBB0_2          ; n != 0 이면 반복
	mov	x0, x8          ; 반환값 = sum
	ret
```

주목: 컴파일러가 `i`를 없앴다. 인덱스 `a[i]` 대신 포인터를 8씩 밀고(`[x0], #8`), `i < n` 대신 `n`을 감소시켜 0과 비교. 소스의 변수와 어셈블리의 레지스터는 1:1이 아니다.

### absval - 분기가 사라진다

```asm
_absval:
	cmp	x0, #0
	cneg	x0, x0, mi      ; 음수(mi)면 x0 = -x0, 아니면 그대로. 분기 없음!
	ret
```

`if`를 썼는데 분기 명령이 없다. **조건부 실행 명령**(cneg/csel, x86의 cmov)으로 변환 - 분기 예측 실패 비용([[branch-prediction]])을 아예 회피. 조건이 예측 불가능할 때 컴파일러가 즐겨 쓰는 수.

### scale - 곱셈도 사라진다

```asm
_scale:
	ldr	x8, [x0, x1, lsl #3]   ; x8 = p[i]  (i*8은 주소 지정 모드가 공짜로)
	lsl	x0, x8, #2             ; *4 = 왼쪽 시프트 2
	ret
```

`* 4`가 곱셈 명령이 아니라 `lsl #2`. 2의 거듭제곱 곱셈은 시프트로 대체 ([[bits-and-integers]]의 `<<` = ×2ᵏ 실전판).

### 직접 해보기

```bash
gcc -O1 -S asm_demo.c -o asm_demo.s   # 어셈블리 출력
objdump -d a.out                       # 실행 파일 역어셈블
```

- 온라인: [Compiler Explorer (godbolt.org)](https://godbolt.org) - 소스 ↔ 어셈블리 줄 매핑, x86과 ARM 비교에 최적
- `-O0`과 `-O1` 비교해보면 최적화가 뭘 지우는지 보임 (`-O0`은 모든 변수를 스택에 왕복시켜서 장황함)

## 읽는 요령 정리

1. 함수 심볼(`_sum_array:`)부터 `ret`까지가 한 함수
2. 반환값은 x0(rax)에 있다 - 끝에서 역추적
3. 루프 = 뒤로 가는 분기. 라벨과 `b.ne` 짝 찾기
4. 소스 변수 ≠ 레지스터. 컴파일러는 의미만 보존하고 형태는 다 바꾼다
5. 모르는 명령은 그때 찾기. 자주 나오는 20개(mov/ldr/str/add/sub/cmp/b.*/ret)가 대부분

## 연결

- 함수 호출과 스택 프레임 → [[procedures-and-stack]]
- 구조체/배열의 메모리 배치가 주소 지정과 만나는 지점 → [[data-layout]]
- 왜 RISC/CISC로 갈렸나 → [[isa-design]]
- cneg가 분기보다 나은 이유 → [[branch-prediction]]

## 궁금한 것 (나중에)

- [ ] 같은 코드를 x86-64로 컴파일하면? (godbolt에서 비교)
- [ ] `-O2`에서 sum_array가 SIMD로 벡터화되는지 확인 → [[simd]]
- [ ] 인라인 어셈블리 문법과 실제 쓰이는 곳 (커널, 암호 라이브러리)

## 출처

- CS:APP 3장 (3.1-3.6)
- ARM64 공식 ISA 문서, Compiler Explorer
