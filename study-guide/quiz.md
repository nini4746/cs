---
title: "데일리 퀴즈"
---

# 데일리 퀴즈 - 2026-07-17

> [!warning] 💀 학습 기록 없음 - 오늘이 1일 · Lv.1 (0 XP) · 밀린 복습 **0개**
> 👉 [오늘의 레슨](today) · [데일리 퀴즈](quiz) · [학습 경로](path) · [대시보드](dashboard)

> 매일 자동 출제 (학습한 노트 3 + 미학습 2). **펼치기 전에 소리 내서 답하기.** 막힌 노트는 오늘 복습 대상.

## Q1. 정보이론

> [!question]- 가우시안 R(D)=½log₂(σ²/D)에서 "6dB/비트 법칙"이 나오는 과정은?
> 비트율을 1비트 늘리면 로그 인자가 2 증가, 즉 D가 4배 감소한다. MSE(전력)가 4배 줄면 SNR은 `10log₁₀4 ≈ 6dB` 개선. 곧 양자화 비트 하나가 SNR 약 6dB에 해당한다.

출처: [[information-theory/rate-distortion|율-왜곡 이론 (Rate-Distortion)]] (미학습 - 맛보기)

## Q2. 네트워크

> [!question]- 실시간 통신에서 "늦은 데이터 = 죽은 데이터"라는 말과 head-of-line blocking은 어떻게 연결되는가?
> TCP는 순서 보장을 위해 앞 패킷이 손실되면 뒤 패킷이 도착해도 앱에 넘기지 않고 막는다(HOL blocking). 화상통화에서는 0.5초 전 프레임이 재전송돼 도착해도 이미 쓸모없으므로, 옛 패킷을 기다리며 막는 것이 오히려 독이다. UDP는 손실을 무시하고 최신 데이터를 진행시켜 실시간에 맞는다.

출처: [[network/udp|UDP]] (미학습 - 맛보기)

## Q3. 계산 복잡도

> [!question]- 시간 계층 정리에 log 인수가 붙는 이유는 무엇인가?
> 대각선 언어를 판정하려면 범용 TM이 Mᵢ의 한 단계를 시뮬레이션해야 하는데, 이 시뮬레이션 오버헤드가 log f(n) 인수를 낳는다. 그래서 `TIME(f) ⊊ TIME(f log f)`.

출처: [[complexity-theory/hierarchy-theorems|계층 정리 (Hierarchy Theorems)]] (미학습 - 맛보기)

## Q4. 웹

> [!question]- HTTP가 실시간 푸시에 부적합한 근본 이유는?
> HTTP는 pull 모델이라 클라이언트가 요청해야만 서버가 응답한다. 서버가 먼저 데이터를 보낼 수 없어, 새 메시지·알림이 생겨도 클라이언트가 물어보기 전까지 알 수 없다. 그래서 채팅·주식·알림 같은 실시간엔 별도 수단이 필요하다.

출처: [[web/websockets-sse|WebSocket과 SSE (실시간 통신)]] (미학습 - 맛보기)

## Q5. DevOps

> [!question]- reset --hard로 커밋을 "날렸는데" 복구할 수 있는 이유는?
> 커밋 객체는 삭제해도 GC 전까지 남고, reflog가 HEAD/ref가 거쳐온 모든 위치를 기록한다. reflog에서 이전 커밋을 찾아 되돌리면 거의 항상 복구된다.

출처: [[devops/git-internals|Git 내부 (Git Internals)]] (미학습 - 맛보기)
