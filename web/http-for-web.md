# 웹을 위한 HTTP (HTTP for Web)

## 한 줄 요약

브라우저 관점의 HTTP - 캐싱 헤더로 재요청을 줄이고, 압축으로 전송량을 줄이며, 우선순위로 중요 리소스를 먼저 받는다. network/[[http]]의 프로토콜을 웹 성능 관점으로.

## 왜 필요한가

- 캐싱 헤더를 어떻게 설정하나 (성능 직결)
- 브라우저가 리소스를 어떻게 캐싱하나
- network/[[http]]의 실전 웹 적용

## 캐싱: 재요청 줄이기

같은 리소스를 매번 받으면 낭비 → 브라우저 캐시. 헤더로 제어 (network/[[http]], network/[[cdn]]):

### Cache-Control

```
Cache-Control: max-age=3600        # 1시간 캐시 (재검증 없이 사용)
Cache-Control: no-cache            # 캐시하되 매번 재검증
Cache-Control: no-store            # 캐시 금지 (민감 데이터)
Cache-Control: public/private      # CDN 캐시 가능 여부
Cache-Control: immutable           # 절대 안 바뀜 (재검증도 skip)
```

### 재검증: ETag / Last-Modified

max-age 만료 후 "바뀌었나" 확인 (network/[[http]]의 304):

```
응답: ETag: "abc123"
재요청: If-None-Match: "abc123"
서버: 304 Not Modified (안 바뀜, 바디 없이) → 캐시 재사용, 대역폭 절약
```

- **ETag**: 콘텐츠 해시/버전 → 정확한 변경 감지
- **Last-Modified**: 수정 시각 → 초 단위 정밀도

### 캐시 무효화: 버전 URL

가장 강력한 전략 (network/[[cdn]]):
```
app.js → app.a1b2c3.js   (파일명에 콘텐츠 해시)
```
- 내용 바뀌면 파일명(URL) 바뀜 → 브라우저가 새 URL로 인식 → 자동으로 새 버전
- 정적 자산에 `immutable + 1년 max-age` + 해시 파일명 = 최강 조합 (안 바뀌면 영원히 캐시, 바뀌면 새 URL)

## 압축 (compression)

전송량 줄이기:

- **gzip**: 표준, 텍스트(HTML/CSS/JS)를 60~80% 압축
- **Brotli**: 더 나은 압축률 (구글), 정적 자산에 특히
- `Content-Encoding: gzip/br`, `Accept-Encoding`으로 협상
- 이미지·비디오는 이미 압축됨 (재압축 무의미) → 포맷 최적화(WebP/AVIF)로

## 우선순위와 로딩

브라우저가 리소스 로딩 순서 최적화:

- **critical 먼저**: CSS·중요 JS ([[critical-rendering-path]]의 블로킹)
- HTTP/2 멀티플렉싱으로 병렬 (network/[[http]])
- **리소스 힌트**:
  - `preload`: 곧 필요한 것 미리 (현재 페이지)
  - `prefetch`: 다음 페이지용 미리 (낮은 우선순위)
  - `preconnect`: 연결(DNS+TCP+TLS) 미리 → network/[[what-happens-url]]의 지연 절약
  - `dns-prefetch`: DNS만 미리 (network/[[dns]])

## 쿠키와 헤더 오버헤드

- 쿠키가 매 요청에 붙음 → 큰 쿠키 = 오버헤드 (HTTP/2 HPACK이 압축, network/[[http]])
- 정적 자산은 쿠키 없는 도메인에서 (cookieless domain) → 오버헤드 제거
- 헤더 최소화

## 조건부·범위 요청

- **조건부 요청**: If-None-Match/If-Modified-Since → 304 (위 재검증)
- **범위 요청**: `Range: bytes=0-1023` → 부분 다운로드 (비디오 스트리밍, 이어받기). network/[[cdn]]

## 실전 캐싱 전략

리소스 종류별:

| 리소스 | 전략 |
|---|---|
| 정적 자산 (해시 파일명) | `immutable, max-age=1년` |
| HTML | `no-cache` (항상 재검증, 최신 유지) |
| API 응답 | 상황별 (짧은 max-age or no-store) |
| 이미지 | 긴 max-age + 버전 |

## 셀프 체크

> [!question]- Cache-Control의 no-cache와 no-store는 어떻게 다른가?
> no-cache는 캐시는 하되 사용 전 매번 서버에 재검증(ETag 등)한다. no-store는 아예 캐시하지 않는다(민감 데이터용). 이름과 달리 no-cache가 캐시 금지가 아니라는 점이 핵심 함정이다.

> [!question]- ETag를 이용한 재검증이 대역폭을 아끼는 원리는?
> 응답에 ETag(콘텐츠 해시/버전)를 담아두고, max-age 만료 후 브라우저가 If-None-Match로 그 값을 보낸다. 서버 리소스가 안 바뀌었으면 304 Not Modified를 바디 없이 응답해 캐시를 재사용하게 한다. 바디 전송을 생략해 대역폭을 아낀다.

> [!question]- 해시 파일명 + immutable + 1년 max-age 조합이 "최강"인 이유는?
> 정적 자산에 immutable과 긴 max-age를 주면 브라우저가 재검증 없이 영원히 캐시한다. 내용이 바뀌면 콘텐츠 해시가 바뀌어 파일명(URL)이 바뀌므로 브라우저가 새 URL로 인식해 자동으로 새 버전을 받는다. 캐시 최대 활용과 즉시 갱신을 동시에 얻는다.

> [!question]- HTML에는 왜 보통 no-cache를 쓰나?
> HTML은 항상 최신이어야 하고, 그 안에 해시가 박힌 자산 URL을 참조한다. no-cache로 매번 재검증하면 HTML 자체는 최신을 유지하면서(안 바뀌면 304), 바뀐 자산은 새 해시 URL을 통해 갱신된다.

## 연습문제

> [!example]- 배포했는데 사용자 브라우저가 옛날 app.js를 계속 쓴다. 이 캐시 문제를 근본적으로 없애는 전략을 설계하라.
> **풀이**
> 원인: app.js 같은 고정 파일명에 긴 max-age를 주면, 내용이 바뀌어도 URL이 같아 브라우저가 캐시된 옛 버전을 계속 쓴다.
> 전략(버전 URL): 빌드 시 파일명에 콘텐츠 해시를 넣어 app.a1b2c3.js처럼 만든다. 내용이 바뀌면 해시가 바뀌어 URL이 바뀌므로 브라우저가 자동으로 새 파일을 받는다. 이 정적 자산에는 Cache-Control: immutable, max-age=31536000(1년)을 주고, 이들을 참조하는 HTML에는 no-cache를 줘 매번 재검증. 그러면 HTML만 갱신되면 새 해시 URL로 최신 JS가 따라온다.

> [!example]- 텍스트 API 응답과 이미 압축된 JPEG 이미지가 있다. 각각 gzip/Brotli 압축을 켜야 하는지 판단하고 이유를 설명하라.
> **풀이**
> 텍스트 API 응답(JSON/HTML/CSS/JS): 압축을 켠다. 텍스트는 gzip으로 60~80% 줄고, 정적 자산이면 Brotli가 더 낫다. Content-Encoding/Accept-Encoding으로 협상된다.
> JPEG 이미지: 켜지 않는다. 이미지·비디오는 이미 압축된 포맷이라 gzip/Brotli를 다시 적용해도 크기가 거의 안 줄고 CPU만 낭비한다. 대신 WebP/AVIF 같은 더 효율적인 포맷으로 바꾸는 게 실질적 최적화다.

## 파인만

> [!note]- 백지에 "브라우저가 한 리소스를 두 번째로 요청할 때 캐시 헤더를 따라 어떤 결정을 내리나"를 흐름도로 남에게 설명하듯 써보라. 막히면 그 분기만 다시.
> **점검 포인트**: 이해했다면 답할 수 있어야 하는 핵심 3가지 - (1) max-age/no-cache/no-store/immutable의 차이, (2) ETag 재검증과 304의 대역폭 절약 원리, (3) 해시 파일명이 캐시 무효화를 어떻게 해결하는지.

## 연결

- HTTP 프로토콜 → network/[[http]]
- CDN 캐싱 → network/[[cdn]]
- 리소스 로딩과 렌더 → [[critical-rendering-path]]
- 연결 지연 → network/[[what-happens-url]]
- 성능 종합 → [[web-performance]]

## 궁금한 것 (나중에)

- [ ] stale-while-revalidate (오래된 것 쓰며 갱신)
- [ ] Service Worker 캐싱 (프로그래밍 가능한 캐시)
- [ ] Vary 헤더 (캐시 키에 헤더 포함)
- [ ] 103 Early Hints

## 출처

- MDN HTTP 캐싱, web.dev
