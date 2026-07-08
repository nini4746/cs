# 이름과 가독성 (Naming and Readability)

## 한 줄 요약

코드는 쓰기보다 읽기가 훨씬 많다. 좋은 이름은 최고의 문서이고, 작은 함수·적은 주석·명확한 구조가 가독성을 만든다. 주석은 "왜"를 설명하지 "무엇"을 반복하지 않는다.

## 왜 필요한가

- 왜 가독성이 성능·영리함보다 중요한가
- 좋은 이름의 기준
- 주석을 언제 쓰나

## 코드는 읽기가 더 많다

핵심 전제: **코드는 한 번 쓰고 여러 번 읽힌다** (본인·동료가):

- 작성 시간 << 읽고 이해하고 수정하는 시간
- 그래서 **읽는 사람을 위해** 최적화 (쓰기 편의 아니라)
- 영리한 한 줄보다 명확한 세 줄 (유지보수)
- 가독성 = 복잡도 관리([[deep-modules]])의 미시 버전

## 이름이 최고의 문서

좋은 이름은 주석보다 강력:

```
나쁨: d, tmp, data, foo, processData()
좋음: elapsedDays, userCount, validateEmail()
```

- **의도를 드러냄**: 이름이 "무엇/왜"를 말함 (주석 불필요)
- **검색 가능**: 고유한 이름 (grep)
- **발음 가능**: 소통
- **일관**: 같은 개념은 같은 단어 (get vs fetch vs retrieve 혼용 금지 → [[api-design-principles]])
- **범위에 맞게**: 짧은 범위는 짧게(`i`), 넓으면 서술적

이름 짓기가 어려운 건 **개념이 불명확**하다는 신호 - 이름이 안 떠오르면 설계를 다시.

## 작은 함수

- **한 가지 일** (SRP [[solid]], 응집 [[coupling-cohesion]])
- 함수 이름이 하는 일을 정확히 (이름 > 주석)
- 깊이(중첩) 얕게 (early return, guard clause)
- 인자 적게 (많으면 구조체나 빌더 [[creational-patterns]])
- 부작용 명확 (순수 선호 programming-languages/[[functional-programming]])

## 주석: 왜, 무엇이 아니라

주석의 올바른 용도:

```
나쁨 (무엇 - 코드 반복): 
  i++;  // i를 1 증가

좋음 (왜 - 코드가 못 말하는 것):
  retryCount++;  // API가 가끔 500 반환 - 3회까지 재시도 (지원팀 확인)
```

- **왜(why)**: 코드가 못 말하는 의도·맥락·제약 (이 노트 CLAUDE.md의 원칙과 같음)
- **무엇(what)을 반복 금지**: 코드가 이미 말함 → 좋은 이름이면 불필요
- **주석은 썩는다**: 코드 바뀌는데 주석 안 바뀌면 거짓말 → 최소화
- **문서 주석**: 공개 API는 계약 문서화 ([[api-design-principles]])

## 가독성을 해치는 것

- **매직 넘버**: `if (x > 86400)` → `if (x > SECONDS_PER_DAY)`
- **깊은 중첩**: if 안에 if 안에... → early return으로 평탄화
- **긴 함수**: 스크롤해야 하면 쪼개기
- **불명확한 이름**: 위
- **죽은 코드**: 안 쓰는 것 삭제 (주석 처리 말고 - git이 기억 devops/[[git-internals]])
- **영리한 트릭**: 이해 어려운 최적화 (측정 없이)

## 일관성과 관례

- **팀 컨벤션**: 스타일 통일 (린터·포매터로 자동화 → devops/[[ci-cd-principles]])
- **언어 관례 따르기**: Python PEP8, Go gofmt (관용구 idiom)
- **일관 > 개인 취향**: 팀이 정한 대로 (이 노트 저장소도 일관된 구조)
- 자동 포매터로 스타일 논쟁 종결

## 리팩토링과의 관계

가독성이 나빠지면 리팩토링([[refactoring-catalog]]) 신호:
- 이해에 오래 걸림 → 이름·구조 개선
- 주석으로 설명해야 함 → 코드로 표현 시도
- "나중에 이해할 수 있나?" 자문

## 왜 중요한가 (종합)

- **유지보수**: 대부분 시간이 기존 코드 이해 → 가독성이 생산성
- **버그↓**: 명확한 코드가 버그 적음 (오해 없음)
- **협업**: 남이 읽을 수 있어야
- **복잡도 관리**([[deep-modules]])의 코드 레벨

## 연결

- 복잡도 관리 → [[deep-modules]]
- SRP·응집 → [[solid]], [[coupling-cohesion]]
- 순수 함수 → programming-languages/[[functional-programming]]
- API 문서 → [[api-design-principles]]
- 리팩토링 → [[refactoring-catalog]]
- 포매터·린터 → devops/[[ci-cd-principles]]
- 죽은 코드·git → devops/[[git-internals]]

## 궁금한 것 (나중에)

- [ ] "Clean Code" 논쟁 (일부 조언 비판)
- [ ] 인지 부하 이론과 코드
- [ ] 자기 문서화 코드의 한계
- [ ] 코드 리뷰에서 가독성 피드백

## 출처

- "Clean Code" (Martin), "A Philosophy of Software Design" (Ousterhout, 주석 관점)
