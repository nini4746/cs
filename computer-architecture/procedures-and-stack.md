# 함수 호출과 스택 (Procedures and the Stack)

## 한 줄 요약

함수 호출은 "인자를 약속된 레지스터에 넣고, 복귀 주소를 저장하고, 점프"다. 스택은 이 호출들이 쌓이고 풀리는 LIFO 구조고, 재귀가 되는 이유 전부가 여기 있다.

## 왜 필요한가

- 재귀가 "그냥 되는" 게 아니라 **왜** 되는지 - 호출마다 지역변수가 독립인 메커니즘
- 디버거의 backtrace가 어떻게 만들어지는지
- 스택 오버플로우가 뭘 넘친 건지
- [[buffer-overflow]] 공격 = 이 노트의 구조를 악용하는 것. 전제 지식

## 스택: 아래로 자라는 LIFO

```
높은 주소  ┌──────────────┐
          │ main의 프레임  │
          ├──────────────┤
          │ f의 프레임     │   f가 g를 호출하면
          ├──────────────┤ ← sp
          │ g의 프레임     │   ↓ 이 방향으로 자람 (주소 감소)
낮은 주소  └──────────────┘
```

- **sp (스택 포인터)**: 현재 스택 꼭대기. push = sp 감소, pop = sp 증가
- 함수 호출의 수명이 정확히 LIFO라서 (나중에 불린 게 먼저 반환) 스택과 완벽하게 맞음
- 프로세스당 크기 제한 있음 - 이 머신 실측: `ulimit -s` = **8176KB (~8MB)**. 무한 재귀가 segfault 나는 이유

## 호출 규약 (calling convention)

"인자는 어디에, 반환값은 어디에, 어느 레지스터는 누가 지키나"의 약속. ISA마다 표준 존재 (ARM64: AAPCS64, x86-64: System V ABI).

| | ARM64 | x86-64 (System V) |
|---|---|---|
| 인자 1~N | x0~x7 (8개) | rdi, rsi, rdx, rcx, r8, r9 (6개) |
| 그 이상 | 스택으로 | 스택으로 |
| 반환값 | x0 | rax |
| 복귀 주소 | **lr (x30) 레지스터** | **스택에 push** |
| caller-saved | x0~x17 (호출하면 깨질 수 있음) | rax, rcx, rdx, rsi, rdi, r8~r11 |
| callee-saved | x19~x28 (쓰려면 복원 책임) | rbx, rbp, r12~r15 |

**caller-saved vs callee-saved**: 함수 호출 후에도 살아야 할 값을 caller-saved 레지스터에 두면 호출자가 백업해야 하고, callee-saved에 두면 피호출자가 백업 책임. 컴파일러의 레지스터 배분 전략이 여기서 갈림.

### call/return 메커니즘 - ARM과 x86의 큰 차이

- **ARM64**: `bl f` = 복귀 주소를 **lr 레지스터**에 넣고 점프. `ret` = lr로 점프. 메모리 접근 0회
- **x86-64**: `call f` = 복귀 주소를 **스택에 push**하고 점프. `ret` = 스택에서 pop해서 점프

ARM64에서도 f가 다른 함수를 부르면 lr이 덮이니까 결국 lr을 스택에 저장 - 그래서 leaf가 아닌 함수는 프롤로그에서 `stp x29, x30, [sp, ...]`가 나온다.

## 프레임 해부 - 실물

`fact` 재귀를 이 머신에서 `gcc -O0 -S`로 컴파일한 실제 출력:

```c
long fact(long n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}
```

```asm
_fact:
	sub	sp, sp, #48             ; ① 프레임 48바이트 확보
	stp	x29, x30, [sp, #32]     ; ② 이전 fp(x29)와 복귀주소 lr(x30) 백업
	add	x29, sp, #32            ; ③ 새 프레임 포인터 설정
	str	x0, [sp, #16]           ; ④ 인자 n을 지역 슬롯에 저장
	ldr	x8, [sp, #16]
	subs	x8, x8, #1
	b.gt	LBB1_2                  ; n > 1 이면 재귀 경로로
LBB1_1:                             ; 기저: 반환값 1
	mov	x8, #1
	stur	x8, [x29, #-8]
	b	LBB1_3
LBB1_2:                             ; 재귀 경로
	ldr	x8, [sp, #16]
	str	x8, [sp, #8]            ; n을 스택에 백업 (호출하면 레지스터 깨지니까)
	ldr	x8, [sp, #16]
	subs	x0, x8, #1              ; 인자 = n - 1
	bl	_fact                   ; ⑤ 재귀 호출! lr에 복귀주소 넣고 점프
	ldr	x8, [sp, #8]            ; 백업해둔 n 복원
	mul	x8, x8, x0              ; n * fact(n-1)  (x0 = 반환값)
	stur	x8, [x29, #-8]
LBB1_3:
	ldur	x0, [x29, #-8]          ; 반환값을 x0에
	ldp	x29, x30, [sp, #32]     ; ⑥ fp, lr 복원
	add	sp, sp, #48             ; ⑦ 프레임 해제
	ret                             ; ⑧ lr로 복귀
```

①~④ = **프롤로그**, ⑥~⑧ = **에필로그**. 재귀 호출마다 이 48바이트 프레임이 새로 쌓임 → `fact(5)`는 프레임 5개가 동시에 존재, 각각 자기 `n`을 가짐. **재귀의 지역변수가 독립인 이유가 이것 전부다.**

### fp 체인 = backtrace의 원리

각 프레임의 x29(fp)는 이전 프레임의 fp를 가리킴 → 연결 리스트. 디버거는 이 체인을 따라가며 backtrace 출력. `-fomit-frame-pointer`가 이걸 끊어서 프로파일링을 방해하는 이유.

## 최적화가 이 그림을 바꾼다

같은 코드를 `-O1`로 컴파일하면:

```asm
_fact:                              ; 프레임 없음!
	mov	x8, x0
	mov	w0, #1
	cmp	x8, #2
	b.lt	LBB1_2
LBB1_1:
	mul	x0, x0, x8              ; 재귀가 사라지고
	sub	x8, x8, #1              ; 그냥 루프가 됨
	cmp	x8, #2
	b.ge	LBB1_1
LBB1_2:
	ret
```

관찰 (전부 이 머신 실제 출력):

1. **재귀 → 루프 변환**: `bl`이 없다. 스택 사용 0, 오버플로우 불가능
2. **leaf 함수는 프레임 생략**: `add3` 같은 단순 함수는 `-O1`에서 프롤로그/에필로그 자체가 없음 (lr 안 건드리니까)
3. **인라인**: `caller(x) { return add3(x,10,20)*2; }`가 `lsl x8, x0, #1; add x0, x8, #60`으로 - 호출이 아예 사라지고 산술로 접힘

"스택 프레임은 개념 모델, 컴파일러는 의미만 지키면 뭐든 한다."

## 인자가 레지스터를 넘치면

인자 10개 함수의 `-O1` 실물:

```asm
_many_args:
	ldp	x9, x8, [sp]            ; 9, 10번째 인자는 스택에서 로드
	add	x10, x1, x0             ; 1~8번째는 x0~x7 그대로
	...
```

ARM64는 8개까지 레지스터, 초과분은 호출자가 스택에 놓고 부름. 인자 적게 유지하라는 조언의 하드웨어적 근거.

## 직접 해보기

```bash
gcc -O0 -S proc_demo.c -o O0.s   # 프레임 풀 버전
gcc -O1 -S proc_demo.c -o O1.s   # 최적화 버전과 비교
ulimit -s                         # 스택 한계 확인
lldb ./a.out → bt                 # backtrace = fp 체인 걷기
```

## 연결

- 명령어/레지스터 기초 → [[assembly-basics]]
- 이 구조를 악용하는 공격 (복귀 주소 덮어쓰기) → [[buffer-overflow]]
- 스택 vs 힙, 프로세스 주소 공간 전체 그림 → [[address-spaces]]
- 지역변수 배치와 정렬 → [[data-layout]]

## 궁금한 것 (나중에)

- [ ] tail call 최적화는 언어마다 보장이 다른 이유 (Scheme 필수, C 임의, Python 거부)
- [ ] stack canary는 프레임 어디에 들어가나 → [[buffer-overflow]]에서
- [ ] setjmp/longjmp는 이 모델을 어떻게 우회하나
- [ ] 코루틴/green thread의 "스택 바꿔치기"는 어떻게 구현되나

## 출처

- CS:APP 3.7
- AAPCS64 (Procedure Call Standard for ARM 64-bit)
