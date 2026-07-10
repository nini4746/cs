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

## 셀프 체크

> [!question]- 이메일에서 보내기와 받기 프로토콜이 분리된 이유와 각 역할은?
> SMTP는 메일을 밀어내는(push) 전송용으로 클라이언트→서버, 서버→서버 전달을 담당한다. IMAP은 서버에 메일을 보관한 채 여러 기기에서 동기화하며 관리한다. POP3는 기기로 다운로드하고 서버에서 삭제하는 옛 방식이다. 전송과 조회는 성격이 달라 프로토콜이 나뉜다.

> [!question]- SMTP의 "원죄"가 피싱과 스팸의 근원인 이유는?
> 초기 SMTP(1982)는 발신자를 검증하지 않아 From 헤더에 아무 주소나 쓸 수 있다. 누구나 boss@company.com을 사칭할 수 있어 위조(spoofing)가 쉽고, 릴레이 남용으로 스팸이 폭증했다. 서로 믿는다는 초기 인터넷의 신뢰 기반 설계가 악용된 것이다.

> [!question]- SPF, DKIM, DMARC를 함께 써야 하는 이유는?
> SPF는 IP 기반 검증이라 전달(forwarding)로 IP가 바뀌면 깨진다. DKIM은 서명으로 내용 변조/위조를 잡지만 실패 시 어떻게 할지 정책이 없다. DMARC는 SPF/DKIM 결과로 정책(거부/격리/통과)을 정하고 From 도메인 정렬을 확인하며 리포트를 준다. 셋이 상호 보완한다.

> [!question]- MIME이 필요했던 이유는?
> 원래 SMTP는 ASCII 텍스트만 전송할 수 있었다. MIME이 첨부파일, 이미지, HTML, 비ASCII 문자를 담을 수 있게 확장했다. 바이너리는 Base64 인코딩으로 텍스트로 변환해 전송한다.

## 연습문제

> [!example]- 문제: alice@a.com이 bob@b.com에게 메일을 보낼 때 발신부터 수신까지 프로토콜과 DNS 조회를 포함해 흐름을 추적하라.
> **풀이**
> 1. Alice의 클라이언트 → a.com 발신 서버(MSA)에 SMTP로 제출.
> 2. 발신 서버가 b.com의 MX 레코드를 DNS 조회해 수신 메일 서버를 찾음.
> 3. 발신 서버 → b.com 수신 서버로 SMTP 전달(중간 홉 가능).
> 4. 수신 서버가 Bob의 메일함에 저장.
> 5. Bob이 IMAP으로 서버에서 조회(POP3면 다운로드 후 삭제).
> 핵심은 전달이 SMTP, 최종 조회가 IMAP이며 라우팅의 DNS 부분이 MX 레코드라는 점이다.

> [!example]- 문제: 수신 서버가 도착한 메일을 검증할 때 SPF와 DKIM이 각각 무엇을 확인하고, 전달된 메일에서 왜 결과가 갈리는지 설명하라.
> **풀이**
> - SPF: 메일을 보낸 IP가 발신 도메인의 DNS TXT에 공표된 허용 IP 목록에 있는지 확인한다. 메일이 중간 서버를 거쳐 전달되면 발신 IP가 전달 서버 IP로 바뀌어 SPF는 실패한다.
> - DKIM: 발신 서버가 개인키로 서명한 것을 수신 서버가 DNS의 공개키로 검증한다. 서명은 메일 내용에 걸려 있어 전달돼도 내용이 그대로면 유효하다.
> - 따라서 전달 시 SPF는 깨지고 DKIM은 살아남는 경우가 많아, DMARC 정렬에서 DKIM 통과로 구제될 수 있다.

## 파인만

> [!note]- 백지에 이 노트 핵심을 남에게 설명하듯 써보라. 막히면 그 부분만 다시.
> **점검 포인트**: (1) SMTP(전송)와 IMAP/POP3(조회)의 분업과 MX 레코드의 역할. (2) SMTP에 인증이 없어 위조가 쉬웠던 원죄. (3) SPF/DKIM/DMARC가 각각 무엇을 검증하고 왜 함께 써야 하는가.

## 연결

- MX 레코드 → [[dns]]
- TCP 위에서 → [[tcp-basics]]
- DKIM 서명 → security/[[digital-signatures]], [[crypto-basics]]
- 스팸 필터 ML → ai-ml/[[ml-fundamentals]]
- 대량 블랙리스트 조회 → data-structures/[[bloom-filter]]
- 베이지안 스팸 필터의 단어 확률 → math/[[probability-basics]]

## 궁금한 것 (나중에)

- [ ] DKIM 서명의 정확한 헤더 정규화
- [ ] BIMI (브랜드 로고 인증)
- [ ] 이메일 종단 암호화 (PGP, S/MIME)
- [ ] SMTP over TLS (STARTTLS)

## 출처

- Kurose & Ross 2.3 (전자 메일), RFC 5321/6376/7489
