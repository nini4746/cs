# 셸 스크립팅 (Shell Scripting)

## 한 줄 요약

작은 명령들을 엮어 자동화하는 bash 스크립트. 강력하지만 함정(quoting, 에러 무시)이 많아 `set -euo pipefail`이 필수다. 복잡해지면 스크립트를 버리고 프로그래밍 언어로 가야 한다.

## 왜 필요한가

- 반복 작업 자동화 (배포·백업·설정)
- bash의 흔한 함정 피하기
- 언제 스크립트를 버릴지

## 셸 스크립트란

명령들을 파일에 모아 실행 ([[linux-essentials]]의 명령 조합):

```bash
#!/bin/bash        # shebang - 실행기 지정
set -euo pipefail  # 안전 옵션 (아래)
for f in *.log; do
    gzip "$f"      # 각 로그 압축
done
```

- 파이프·리다이렉션([[linux-essentials]])으로 도구 조합
- 자동화의 첫 도구 (배포·백업·정리)

## set -euo pipefail (필수)

bash의 기본 동작이 위험 → 안전 옵션:

- **`set -e`**: 명령 실패(비0 종료)하면 즉시 중단 (기본은 무시하고 계속 - 위험!)
- **`set -u`**: 정의 안 된 변수 사용 시 에러 (기본은 빈 문자열 - 버그 숨김)
- **`set -o pipefail`**: 파이프 중 하나라도 실패하면 실패 (기본은 마지막 것만 봄)

없으면: 중간 명령이 실패해도 스크립트가 계속 → 잘못된 상태로 진행 (예: `cd /wrong && rm -rf *` 에서 cd 실패하면 현재 디렉토리를 지움!). **모든 스크립트 첫 줄에 넣어야.**

## quoting 함정 (bash의 악명)

가장 흔한 버그 - **변수를 따옴표로 안 감싸면**:

```bash
file="my file.txt"
rm $file      # 나쁨: rm my file.txt → "my"와 "file.txt" 두 개로 분리!
rm "$file"    # 좋음: rm "my file.txt" → 하나로
```

- 공백·특수문자·빈 값이 단어 분리(word splitting)됨
- **항상 `"$var"`로 감싸기** (변수는 거의 항상 따옴표)
- `$@` vs `"$@"` (인자 전달 - 후자가 올바름)

## 종료 코드

명령의 성공/실패 ([[linux-essentials]]):

- **0 = 성공**, 비0 = 실패 (관례)
- `$?`로 직전 종료 코드
- `&&`(성공 시 다음), `||`(실패 시 다음)
- `set -e`가 이걸 활용해 실패 시 중단

## 흔한 패턴

```bash
# 인자 확인
if [ $# -lt 1 ]; then echo "usage: ..."; exit 1; fi
# 명령 결과를 변수로
count=$(ls | wc -l)
# 조건
if [ -f "$file" ]; then ...; fi   # 파일 존재?
# 반복
for x in "$@"; do ...; done
while read line; do ...; done < file
```

## 언제 스크립트를 버리나 (중요)

셸은 작은 것에 강하지만 커지면 지옥:

- **로직 복잡**: 조건·데이터 구조가 많아지면 (bash 배열·연관배열은 빈약)
- **에러 처리 필요**: bash 에러 처리가 원시적
- **테스트·유지보수**: bash는 테스트 어려움 (software-design/[[testing-strategy]])
- **~수십 줄 넘으면**: Python·Go 등으로 (가독성·구조)

**규칙**: 셸은 "명령 조합·간단한 자동화"까지. 로직이 생기면 프로그래밍 언어로. (CLAUDE.md의 "복잡하면 스크립트 파일로, 더 복잡하면 언어로"와 같은 원칙)

## 보안 주의

- **입력을 명령에 넣지 마라**: 셸 인젝션 (security/[[injection]]의 command injection)
  ```bash
  eval "$user_input"   # 절대 금지
  ```
- **시크릿을 스크립트에 하드코딩 금지** (security/[[secrets-management]])
- 권한 최소화 (security/[[least-privilege]])

## 디버깅

- **`set -x`**: 실행되는 명령 출력 (추적)
- **`bash -n`**: 문법만 검사 (실행 안 함)
- **shellcheck**: 정적 분석 도구 (함정 자동 탐지 - 필수) → software-design/[[refactoring-catalog]]의 도구

## 셀프 체크

> [!question]- `set -euo pipefail`의 각 옵션은 무엇을 하나?
> `-e`는 명령 실패(비0) 시 즉시 중단(기본은 무시하고 계속), `-u`는 정의 안 된 변수 사용 시 에러(기본은 빈 문자열), `-o pipefail`은 파이프 중 하나라도 실패하면 실패(기본은 마지막 것만 봄). 모든 스크립트 첫 줄에.

> [!question]- 변수를 따옴표로 감싸지 않으면 왜 위험한가?
> 공백·특수문자·빈 값이 단어 분리(word splitting)된다. 예: `file="my file.txt"`에서 `rm $file`은 `my`와 `file.txt` 두 인자가 된다. 항상 `"$var"`로 감싸고, 인자 전달은 `"$@"`를 쓴다.

> [!question]- 종료 코드와 &&·||는?
> 0=성공, 비0=실패(관례). `$?`가 직전 종료 코드. `&&`는 앞이 성공하면 다음, `||`는 실패하면 다음 실행. `set -e`가 이 종료 코드를 활용해 실패 시 중단한다.

> [!question]- 언제 셸 스크립트를 버리고 프로그래밍 언어로 가나?
> 로직이 복잡해질 때(bash 배열·연관배열은 빈약), 제대로 된 에러 처리가 필요할 때, 테스트·유지보수가 중요할 때, 대략 수십 줄을 넘을 때. 셸은 "명령 조합·간단한 자동화"까지.

> [!question]- 셸 스크립트의 대표적 보안 위험은?
> 셸 인젝션 - 사용자 입력을 명령에 넣는 것(특히 `eval "$user_input"`은 절대 금지). 시크릿 하드코딩 금지, 권한 최소화도 지킨다.

## 연습문제

> [!example]- 문제: 아래 백업 스크립트는 위험하다. `set` 옵션 부재와 quoting 문제를 지적하고 안전하게 고쳐라. `cd $BACKUP_DIR` / `rm -rf *` / `cp $SRC/* .`
> **풀이**
> 위험: `set -e/-u`가 없어 `cd`가 실패해도 계속 진행 → 엉뚱한(현재) 디렉토리에서 `rm -rf *` 실행. 변수 미인용으로 공백 경로가 분리되고, `$BACKUP_DIR`이 미정의면 빈 값이 됨.
> ```bash
> #!/bin/bash
> set -euo pipefail
> cd "$BACKUP_DIR"
> rm -rf ./*
> cp "$SRC"/* .
> ```
> `-u`로 미정의 변수 차단, `-e`로 cd 실패 시 즉시 중단, 변수 인용으로 단어 분리 방지. shellcheck로 추가 점검.

> [!example]- 문제: 인자로 받은 값을 처리하는 스크립트가 `eval`을 쓴다. 무슨 취약점이고 어떻게 없애나?
> **풀이**
> 취약점: command injection. `eval "$arg"`는 인자에 담긴 임의 명령(예: `; rm -rf /`)을 실행한다.
> 제거: eval을 쓰지 말고 값을 데이터로만 다룬다. 변수는 `"$arg"`로 인용해 명령이 아닌 인자로 전달하고, 필요한 동작은 직접 명령으로 표현한다. 입력 검증(허용 문자·경로 화이트리스트)도 추가.

## 파인만

> [!note]- 백지에 "안전한 bash 스크립트"의 필수 요소를 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) set -euo pipefail 세 옵션의 의미와 없을 때의 사고, (2) quoting·단어 분리, (3) 셸을 버려야 할 시점과 인젝션 방지.

## 연결

- 명령·파이프 → [[linux-essentials]]
- 스크립트→언어 전환 → software-design/[[testing-strategy]] (테스트성)
- command injection → security/[[injection]]
- 시크릿 → security/[[secrets-management]]
- CI에서 스크립트 → [[ci-cd-principles]]

## 궁금한 것 (나중에)

- [ ] bash 배열·연관배열 상세
- [ ] shellcheck 규칙
- [ ] POSIX sh vs bash 이식성
- [ ] trap (시그널·정리 핸들러)

## 출처

- "Bash Guide" (Greg's Wiki), shellcheck
