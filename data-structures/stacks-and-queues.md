# 스택과 큐 (Stacks and Queues)

## 한 줄 요약

접근 순서를 제한한 자료구조. 스택은 LIFO(마지막이 먼저), 큐는 FIFO(처음이 먼저). 둘 다 배열이나 링크드 리스트로 O(1) 구현되며, 원형 버퍼가 큐의 실전 형태다.

## 왜 필요한가

- 가장 기본적인 접근 패턴 두 가지
- 함수 호출, 실행 취소, BFS, 작업 큐의 기반
- 왜 특정 문제에 특정 구조가 맞나

## 스택 (Stack, LIFO)

마지막에 넣은 게 먼저 나옴. 두 연산:

- **push**: 꼭대기에 추가
- **pop**: 꼭대기에서 제거
- (peek: 제거 없이 꼭대기 보기)

구현: 동적 배열([[arrays-and-dynamic-arrays]])의 끝 = 꼭대기. push=append, pop=끝 제거. 둘 다 O(1) (배열 끝은 밀기 없음).

### 어디에 쓰나

- **함수 호출 스택**: 호출이 LIFO → 스택 프레임 ([[procedures-and-stack]])
- **실행 취소(undo)**: 최근 작업부터 되돌림
- **괄호 매칭, 수식 평가**: 여는 괄호 push, 닫는 괄호에서 pop
- **DFS**: 방문할 노드를 스택에 → [[graph-traversal]] (재귀 = 암묵적 스택)
- **역추적(backtracking)**

## 큐 (Queue, FIFO)

처음 넣은 게 먼저 나옴. 두 연산:

- **enqueue**: 뒤에 추가
- **dequeue**: 앞에서 제거

구현 주의: 배열 앞에서 제거하면 뒤를 다 당겨야 O(n). 그래서 **원형 버퍼**를 씀.

### 원형 버퍼 (ring buffer)

고정 크기 배열 + head/tail 인덱스가 순환:

```
[_ _ C D E _ _ _]
     ↑     ↑
    head  tail
enqueue: tail 위치에 쓰고 tail=(tail+1)%size
dequeue: head에서 읽고 head=(head+1)%size
```

- enqueue/dequeue 둘 다 O(1), 밀기 없음
- 앞 제거로 생긴 빈 공간을 뒤가 재활용 (순환)
- 가득/빔 구분: 크기 카운터나 한 칸 비워둠
- 실전: 네트워크 패킷 버퍼, 오디오 버퍼, 생산자-소비자([[condition-variables]]의 bounded buffer), 로그 버퍼

### 어디에 쓰나

- **BFS**: 방문할 노드를 큐에 → [[graph-traversal]]
- **작업 큐**: 요청을 순서대로 처리 (스레드 풀, 메시지 큐 → distributed-systems/[[message-queues]])
- **스케줄링**: ready 큐 → os/[[cpu-scheduling]]
- **버퍼링**: 생산 속도 ≠ 소비 속도 완충

## 덱 (Deque, 양방향 큐)

양 끝에서 push/pop 모두 O(1). 스택+큐 통합. 원형 버퍼나 이중 연결 리스트로 구현. 슬라이딩 윈도우 최댓값 등에 유용.

## 우선순위 큐는 다르다

이름은 큐지만 FIFO 아님 - **우선순위 순**으로 나옴. 힙으로 구현 → [[heaps]]. 헷갈리지 말 것.

## 구현 선택: 배열 vs 리스트

| | 배열 기반 | 리스트 기반 |
|---|---|---|
| 캐시 | 좋음 ([[memory-hierarchy]]) | 나쁨 (pointer chasing) |
| 크기 | 재할당 or 고정(원형) | 무제한, 노드마다 할당 |
| 실전 | 대부분 이게 나음 | 드묾 |

[[linked-lists]]의 교훈대로 배열 기반(동적 배열/원형 버퍼)이 보통 빠름. 링크드 리스트 구현은 교과서에 흔하지만 실무 기본은 배열.

## 셀프 체크

> [!question]- 스택과 큐의 접근 순서 차이와 각각의 대표 용도는?
> 스택은 LIFO(마지막에 넣은 게 먼저 나옴)로 함수 호출 스택, 실행 취소, 괄호 매칭, DFS에 쓰인다. 큐는 FIFO(처음 넣은 게 먼저 나옴)로 BFS, 작업 큐, 스케줄링 ready 큐, 버퍼링에 쓰인다.

> [!question]- 큐를 단순 배열로 구현할 때의 문제와 원형 버퍼가 이를 어떻게 푸나?
> 배열 앞에서 dequeue하면 뒤 원소를 전부 당겨야 해 O(n)이 된다. 원형 버퍼는 고정 크기 배열에 head/tail 인덱스를 %size로 순환시켜, enqueue는 tail에 쓰고 tail을 전진, dequeue는 head에서 읽고 head를 전진한다. 앞 제거로 생긴 빈 공간을 뒤가 재활용해 둘 다 O(1), 밀기가 없다.

> [!question]- 우선순위 큐가 일반 큐와 무엇이 다른가?
> 이름은 큐지만 FIFO가 아니라 우선순위 순으로 나온다. 힙으로 구현한다. 스택/큐와 헷갈리지 말아야 한다.

> [!question]- 스택/큐 구현에서 배열 기반과 리스트 기반 중 실무 기본이 배열인 이유는?
> 배열 기반(동적 배열/원형 버퍼)은 연속 메모리라 캐시가 좋은 반면, 리스트 기반은 pointer chasing으로 캐시가 나쁘다. 링크드 리스트의 교훈대로 배열 밀기가 캐시 덕에 보통 더 빨라 실무 기본은 배열이다.

## 연습문제

> [!example]- 문제: 고정 크기 원형 버퍼로 큐를 직접 구현하고, 가득/빔을 구분하라.
> **풀이**
> 크기 N 배열 + head, tail, 그리고 개수 count를 둔다.
> - enqueue(x): count==N이면 가득(거부). 아니면 `buf[tail]=x; tail=(tail+1)%N; count++`.
> - dequeue(): count==0이면 빔(거부). 아니면 `x=buf[head]; head=(head+1)%N; count--; return x`.
> count 카운터를 두면 head==tail이 "빔"인지 "가득"인지 모호한 문제가 사라진다. 카운터 없이 하려면 한 칸을 항상 비워둬(`(tail+1)%N==head`가 가득) 용량이 N-1이 된다.

> [!example]- 문제: 스택 두 개로 큐를 구현하고 각 연산의 amortized 복잡도를 분석하라.
> **풀이**
> in 스택과 out 스택을 둔다.
> - enqueue: in에 push (O(1)).
> - dequeue: out이 비었으면 in의 모든 원소를 pop해 out에 push(뒤집힘), 그다음 out에서 pop.
> 각 원소는 평생 in-push, in-pop, out-push, out-pop을 최대 한 번씩만 겪는다. 따라서 옮기는 비용이 원소당 상수로 분산되어 dequeue는 amortized O(1)이다(최악 한 번은 O(n)). amortized 분석은 algorithms/[[asymptotic-analysis]] 참고.

> [!example]- 문제: 어떤 작업에 스택이 아니라 큐를 써야 하는지 자료구조 선택 근거를 대라 - BFS를 예로.
> **풀이**
> BFS는 시작점에서 가까운 노드부터 층별로 방문해야 최단 경로(간선 수)를 보장한다. 큐(FIFO)에 넣으면 먼저 발견된(더 가까운) 노드가 먼저 꺼내져 거리 순서가 유지된다. 스택(LIFO)을 쓰면 마지막에 발견된 노드부터 파고들어 DFS가 되고 층 순서가 깨진다. 즉 "먼저 온 것 먼저 처리"라는 요구가 FIFO를 강제한다 → [[graph-traversal]].

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지.
> 1. 스택 LIFO와 큐 FIFO의 차이를 접근 순서로 설명하고, 각각 push/pop, enqueue/dequeue가 왜 O(1)인지 말할 수 있는가.
> 2. 큐를 단순 배열로 만들면 왜 O(n)이 되고, 원형 버퍼가 head/tail 순환으로 이를 어떻게 O(1)로 만드는지 그릴 수 있는가.
> 3. 우선순위 큐가 왜 FIFO가 아닌지, 그리고 구현에서 배열 기반이 리스트 기반보다 실무 기본인 이유(캐시)를 댈 수 있는가.

## 연결

- 배열 기반 구현 → [[arrays-and-dynamic-arrays]]
- 리스트 기반 대안 → [[linked-lists]]
- 호출 스택 → [[procedures-and-stack]]
- BFS/DFS → [[graph-traversal]]
- 우선순위 큐 → [[heaps]]
- 작업 큐 → distributed-systems/[[message-queues]]
- 수식 파싱/괄호 매칭의 스택 → compilers/[[parsing]]
- 스택이 계산력을 정의하는 기계 → automata/[[pushdown-automata]]

## 궁금한 것 (나중에)

- [ ] 락프리 큐 (Michael-Scott) → os/[[lock-free-basics]]
- [ ] 원형 버퍼의 가득/빔 구분 기법들
- [ ] 덱으로 슬라이딩 윈도우 최댓값 O(n)
- [ ] 큐 두 개로 스택 만들기 (면접 고전)

## 출처

- CLRS 10장, Open Data Structures 2-3장
