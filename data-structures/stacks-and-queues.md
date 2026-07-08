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

## 연결

- 배열 기반 구현 → [[arrays-and-dynamic-arrays]]
- 리스트 기반 대안 → [[linked-lists]]
- 호출 스택 → [[procedures-and-stack]]
- BFS/DFS → [[graph-traversal]]
- 우선순위 큐 → [[heaps]]
- 작업 큐 → distributed-systems/[[message-queues]]

## 궁금한 것 (나중에)

- [ ] 락프리 큐 (Michael-Scott) → os/[[lock-free-basics]]
- [ ] 원형 버퍼의 가득/빔 구분 기법들
- [ ] 덱으로 슬라이딩 윈도우 최댓값 O(n)
- [ ] 큐 두 개로 스택 만들기 (면접 고전)

## 출처

- CLRS 10장, Open Data Structures 2-3장
