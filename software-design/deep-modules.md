# 깊은 모듈 (Deep Modules)

## 한 줄 요약

Ousterhout의 핵심 개념 - 좋은 모듈은 단순한 인터페이스 뒤에 강력한 기능을 감춘다(깊다). 얕은 모듈(인터페이스가 기능만큼 복잡)은 추상화의 이득이 없다. 복잡도 관리가 설계의 본질.

## 왜 필요한가

- SOLID·패턴 남발이 왜 오히려 나쁜가 ([[solid]]의 과용 경계)
- 좋은 추상화의 기준
- 복잡도를 실제로 줄이는 법

## 복잡도가 적

Ousterhout("A Philosophy of Software Design")의 전제: **소프트웨어 설계의 근본 목표 = 복잡도 관리**:

- 복잡도 = 이해하고 수정하기 어렵게 만드는 모든 것
- 증상: 변경 증폭(하나 바꾸면 여러 곳), 인지 부하(많이 알아야), 미지의 미지(어디를 바꿔야 할지 모름)
- 좋은 설계 = 복잡도를 **줄이거나 감추는** 것

## 모듈의 깊이

모듈을 **인터페이스 vs 기능**으로:

```
깊은 모듈 (좋음):        얕은 모듈 (나쁨):
┌──────────┐            ┌──────────┐
│ 작은 IF   │            │ 큰 IF     │
├──────────┤            ├──────────┤
│          │            │ 작은 기능 │
│ 큰 기능   │            └──────────┘
│          │
└──────────┘
```

- **깊은 모듈**: 단순한 인터페이스 + 강력한 기능 → 많은 복잡도를 감춤 = 큰 이득
- **얕은 모듈**: 인터페이스가 기능만큼 복잡 → 감추는 게 없음 = 추상화 이득 없음 (오히려 계층만 추가)

## 예시

### 깊은 모듈

- **유닉스 파일 I/O**: `open/read/write/close` 5개 함수 (단순 IF) 뒤에 디스크·캐시·권한·파일시스템 전부 감춤 (os/[[file-system-basics]]) → 매우 깊음
- **가비지 컬렉터**: 인터페이스 0 (자동) 뒤에 거대한 복잡도 (programming-languages/[[garbage-collection]])
- 좋은 라이브러리: 쓰기 쉬운데 강력

### 얕은 모듈

- **불필요한 getter/setter**: `getX()/setX()`가 그냥 필드 노출 → 인터페이스만 늘고 감추는 게 없음
- **한 줄 래퍼**: `addToList(x)` 안이 `list.add(x)` 한 줄 → 계층만 추가
- **과도한 추상 계층**: 인터페이스 뒤에 구현 하나뿐 (미래 대비 과신)

## SOLID 남발과의 관계

[[solid]]의 과용 경계가 여기서 명확:

- SOLID·패턴을 맹목 적용 → **얕은 모듈 양산** (인터페이스·계층만 늘고 기능은 그대로)
- "인터페이스 하나에 구현 하나"는 얕음 → 이득 없이 복잡도만
- **classes should be deep**: 작은 클래스 여러 개보다 깊은 클래스 몇 개가 나을 때가 많음 (SRP를 과하게 쪼개면 얕아짐)
- 원칙은 복잡도를 줄일 때만 적용 → 목적(복잡도↓)이 수단(SOLID)보다 우선

## 인터페이스 vs 구현 복잡도

- **인터페이스 복잡도**: 사용자가 알아야 할 것 (모든 사용처에 부담)
- **구현 복잡도**: 내부에만 (한 곳)
- **복잡도를 구현으로 밀어넣어라**: 인터페이스를 단순하게, 어려움은 안으로
- "It is more important for a module to have a simple interface than a simple implementation" - 구현이 복잡해도 인터페이스가 단순하면 이득 (사용자 다수 > 구현자 소수)

## 정보 은닉 (information hiding)

깊은 모듈의 수단 - **설계 결정을 모듈 안에 감춤**:

- 내부 자료구조·알고리즘을 인터페이스에 노출 안 함
- 바뀔 것 같은 것을 감춤 (변경이 인터페이스 안 건드리게)
- **정보 유출(leakage)**: 같은 지식이 여러 모듈에 → 결합 ([[coupling-cohesion]])
- 캡슐화(programming-languages/[[oop-under-the-hood]])의 본질

## 실전 지침

1. **인터페이스를 작게, 기능을 크게** (깊게)
2. **얕은 래퍼 경계**: 계층 추가가 복잡도를 줄이나?
3. **복잡도를 아래로**: 어려움을 구현에 밀어넣기
4. **바뀔 것을 감추기** (정보 은닉)
5. **과도한 추상화 경계**: 구현 하나뿐인 인터페이스는 의심 ([[solid]])
6. 이름(programming-languages) + 깊이가 좋은 API의 핵심

## 연결

- SOLID 과용 경계 → [[solid]]
- 결합·응집 (정보 유출) → [[coupling-cohesion]]
- 캡슐화 → programming-languages/[[oop-under-the-hood]]
- 깊은 모듈 예 (파일 I/O) → os/[[file-system-basics]]
- API 설계 → [[api-design-principles]]
- 이름·가독성 → [[naming-and-readability]]

## 궁금한 것 (나중에)

- [ ] "tactical vs strategic programming" (Ousterhout)
- [ ] 얕은 모듈을 깊게 리팩토링하는 법
- [ ] 예외를 줄여 인터페이스 단순화 (define errors out of existence)
- [ ] 언제 계층이 정당한가

## 출처

- John Ousterhout "A Philosophy of Software Design"
