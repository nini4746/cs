# 컴파일러 최적화의 한계 (Optimization Blockers)

## 한 줄 요약

컴파일러는 "관측 가능한 동작을 절대 안 바꾼다"는 규칙에 묶여 있다. 그래서 두 포인터가 겹칠 수 있으면(aliasing), 함수가 부작용을 가질 수 있으면 최적화를 포기한다. 이 한계를 알면 왜 내 코드가 최적화 안 되는지 보인다.

## 왜 필요한가

- `-O2`를 켰는데 왜 이 코드는 안 빨라지나
- `restrict`, `const`, 지역변수 캐싱이 왜 성능을 바꾸나
- "컴파일러가 알아서 해주겠지"가 통하는 경계

## 최적화의 대원칙

컴파일러는 **관측 가능한 동작(observable behavior)을 보존하는 한** 뭐든 한다. 뒤집으면, 동작이 바뀔 **가능성만 있어도** 최적화를 포기한다. 최적화를 막는 두 주범:

## 1. 메모리 aliasing

두 포인터가 같은 메모리를 가리킬 수 있으면(alias), 컴파일러는 최악을 가정해야 한다.

```c
void twice(long *a, long *b) {
    *a += *b;
    *a += *b;
}
```

`*b`를 한 번만 읽어 두 번 쓰면 될 것 같지만 - **b가 a를 가리키면** 첫 줄이 `*b`를 바꾼다. 컴파일러는 이 가능성 때문에 `*b`를 두 번 로드해야 한다.

이 머신 `-O2` 실물:

```asm
_twice:
	ldr	x8, [x1]      ; *b 첫 로드
	ldr	x9, [x0]
	add	x8, x9, x8
	str	x8, [x0]      ; *a 갱신
	ldr	x9, [x1]      ; *b 다시 로드! (aliasing 때문)
	add	x8, x9, x8
	str	x8, [x0]
```

### restrict로 약속하면

`restrict`는 "이 포인터로만 이 메모리에 접근한다(안 겹친다)"는 프로그래머의 약속:

```c
void twice(long *restrict a, long *restrict b) { *a += *b; *a += *b; }
```

같은 머신 `-O2` 실물:

```asm
_twice_restrict:
	ldr	x8, [x1]      ; *b 한 번만 로드
	ldr	x9, [x0]
	add	x8, x9, x8, lsl #1   ; a + b*2 를 한 방에
	str	x8, [x0]
```

로드가 절반, 명령어가 7개 → 4개. `restrict`가 최적화를 푼 것. C의 `memcpy`가 `restrict` 시그니처인 이유이기도.

## 2. 함수 호출과 부작용

```c
long strlen_bad(char *s) {
    long i = 0;
    for (i = 0; strlen(s) > i; i++)  // 매 반복 strlen 재호출!
        ...
}
```

`strlen(s)`가 루프마다 불림. 컴파일러가 "s가 안 바뀌니 한 번만 부르자"를 못 하는 이유: 루프 본체가 s를 바꿀 수도 있고, strlen이 부작용을 가질 수도 있다고 (컴파일러가 정의를 못 보면) 가정. → **루프 불변 계산은 손으로 밖으로 빼라**:

```c
long n = strlen(s);
for (i = 0; i < n; i++) ...
```

## 3. 메모리보다 레지스터 - 지역변수 캐싱

전역/포인터 경유 값은 aliasing 때문에 매번 메모리 재로드. 루프에서 누적할 값은 지역변수에 모으면 컴파일러가 레지스터에 유지:

```c
// 나쁨: *result를 매 반복 읽고 씀 (aliasing 의심)
for (i = 0; i < n; i++) *result += a[i];

// 좋음: 지역 누적 후 한 번 쓰기
long sum = 0;
for (i = 0; i < n; i++) sum += a[i];
*result = sum;
```

[[memory-hierarchy]]의 지역성과 별개로, 이건 aliasing 회피가 핵심.

## 컴파일러를 돕는 도구

| 도구 | 효과 |
|---|---|
| `restrict` | 포인터 비-aliasing 약속 → 재로드 제거 |
| `const` | 값 불변 표시 (다만 aliasing은 못 막음) |
| 지역변수 | 누적값을 레지스터에 유지 |
| 함수 정의 노출 (inline, LTO) | 부작용 없음을 컴파일러가 확인 → 최적화 가능 |
| `-ffast-math` | 부동소수점 재배열 허용 ([[floating-point]] 결합법칙) |

## 핵심 교훈

컴파일러는 **못 하는 게 아니라 안전하지 않아서 안 하는 것**이 많다. 최적화가 안 되면 "컴파일러가 이걸 위험하다고 볼 이유가 뭔가"를 물어라 - 대개 aliasing 아니면 미지의 부작용.

## 연결

- 최적화된 어셈블리를 읽는 법 → [[assembly-basics]]
- 명령어 재배열과 해저드 → [[hazards]]
- 부동소수점 재배열이 막히는 이유 → [[floating-point]]
- 병렬 실행을 위한 의존성 끊기 → [[instruction-level-parallelism]]

## 궁금한 것 (나중에)

- [ ] LTO(링크 타임 최적화)가 실제로 뭘 더 볼 수 있게 하나 → [[linking]]
- [ ] strict aliasing 규칙과 `-fno-strict-aliasing`의 트레이드오프
- [ ] C++ `__restrict__`, Rust는 왜 이 문제가 원천적으로 적나 (소유권)

## 출처

- CS:APP 5.1-5.6
