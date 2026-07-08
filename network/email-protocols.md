# 이메일 프로토콜 (Email Protocols)

## 한 줄 요약

이메일은 보내기(SMTP)와 가져오기(IMAP/POP3)가 분리된 구조. 원래 인증이 없어 스팸·위조에 취약했고, SPF/DKIM/DMARC가 발신자 검증을 나중에 덧붙였다.

## 왜 필요한가

- 이메일이 실제로 어떻게 전달되나
- 왜 스팸/피싱이 이렇게 쉬운가 (프로토콜의 원죄)
- SPF/DKIM/DMARC가 뭘 검증하나

## 세 프로토콜의 분업

이메일은 **보내기와 받기가 다른 프로토콜**:

- **SMTP**(Simple Mail Transfer Protocol): 메일 **전송** (클라이언트→서버, 서버→서버). 밀어내기(push)
- **IMAP**(Internet Message Access Protocol): 메일 **가져오기/관리** (서버에 보관, 여러 기기 동기화)
- **POP3**: 메일 **다운로드** (기기로 내려받고 서버에서 삭제, 옛 방식)

```
발신자 → [SMTP] → 발신 서버 → [SMTP] → 수신 서버 → [IMAP] → 수신자
```

## SMTP 전달 과정

```
1. 클라이언트가 발신 서버(MSA)에 SMTP로 제출
2. 발신 서버가 수신 도메인의 MX 레코드 조회 (DNS → [[dns]])
3. 발신 서버 → 수신 서버로 SMTP 전달 (여러 홉 가능)
4. 수신 서버가 사용자 메일함에 저장
5. 수신자가 IMAP으로 조회
```

- **MX 레코드**([[dns]]): 도메인의 메일 서버 지정. 이메일 라우팅의 DNS 부분
- SMTP는 텍스트 기반 (HTTP처럼 사람이 읽을 수 있음)

## 원죄: 인증이 없었다

초기 SMTP(1982)는 **발신자를 검증 안 함**:

- **From 헤더를 아무거나** 쓸 수 있음 → 위조(spoofing) 쉬움
- 누구나 "boss@company.com에서 보냄"이라 주장 가능 → 피싱의 근원
- 릴레이 남용 → 스팸 폭증

신뢰 기반 설계(초기 인터넷은 서로 믿음)가 악용됨. 이후 검증을 **덧붙임**:

## 발신자 검증 3종

### SPF (Sender Policy Framework)

"이 도메인의 메일은 **이 IP들**에서만 보낸다"를 DNS TXT 레코드로 공표:

- 수신 서버가 발신 IP가 SPF 목록에 있나 확인
- IP 기반 검증. 전달(forwarding) 시 깨짐 (IP 바뀜)

### DKIM (DomainKeys Identified Mail)

발신 서버가 메일에 **디지털 서명** (security/[[digital-signatures]]):

- 도메인의 개인키로 서명, 공개키는 DNS에 게시
- 수신 서버가 서명 검증 → 내용 변조·위조 탐지
- 암호학적 검증 → security/[[crypto-basics]]

### DMARC

SPF/DKIM 결과로 **정책 결정** + 리포트:

- "SPF나 DKIM 실패하면 어떻게? (거부/격리/통과)"를 도메인이 지정
- From 헤더 도메인과 SPF/DKIM 도메인 정렬(alignment) 확인
- 실패 리포트를 도메인 소유자에게 → 위조 모니터링

세 개를 함께 써야 효과 (SPF만으론 전달에 약함, DKIM만으론 정책 없음).

## 스팸 필터링

프로토콜 검증 외에 내용 기반:

- 베이지안 필터 (단어 확률 → ai-ml/[[ml-fundamentals]], math/[[probability-basics]])
- 평판(reputation) 기반 (IP/도메인 신뢰도)
- 블랙리스트 (data-structures/[[bloom-filter]] 같은 구조로 대량 조회)
- 최근엔 ML 기반 → ai-ml/

## MIME

원래 SMTP는 ASCII 텍스트만. **MIME**(Multipurpose Internet Mail Extensions)가 확장:
- 첨부파일, 이미지, HTML, 비ASCII 문자
- Base64 인코딩으로 바이너리를 텍스트로 (computer-architecture/[[bits-and-integers]]의 인코딩)

## 연결

- MX 레코드 → [[dns]]
- TCP 위에서 → [[tcp-basics]]
- DKIM 서명 → security/[[digital-signatures]], [[crypto-basics]]
- 스팸 필터 ML → ai-ml/[[ml-fundamentals]]
- 대량 블랙리스트 조회 → data-structures/[[bloom-filter]]

## 궁금한 것 (나중에)

- [ ] DKIM 서명의 정확한 헤더 정규화
- [ ] BIMI (브랜드 로고 인증)
- [ ] 이메일 종단 암호화 (PGP, S/MIME)
- [ ] SMTP over TLS (STARTTLS)

## 출처

- Kurose & Ross 2.3 (전자 메일), RFC 5321/6376/7489
