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
