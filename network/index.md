---
title: "network"
---

# 네트워크 syllabus

기준 교과서: **Kurose & Ross** (Computer Networking: A Top-Down Approach). 응용 계층에서 내려가는 순서.

## 1. 개요

- [x] [[internet-overview]] - 패킷 교환 vs 회선 교환, 지연 4종 (처리/큐잉/전송/전파), 계층 모델 (OSI vs TCP/IP)

## 2. 응용 계층

- [x] [[http]] - HTTP/1.1 → 2 → 3 진화, 헤더, 캐싱, keep-alive
- [x] [[dns]] - 재귀/반복 질의, 레코드 타입, TTL, 캐싱 계층
- [x] [[email-protocols]] - SMTP/IMAP, 스팸 방지 (SPF/DKIM/DMARC)
- [x] [[cdn]] - CDN 동작 원리, 엣지 캐싱, DNS 기반 라우팅

## 3. 전송 계층

- [ ] [[udp]] - 왜 UDP가 존재하나, 체크섬, UDP 위에 뭘 쌓나 (QUIC, DNS, 게임)
- [ ] [[tcp-basics]] - 3-way handshake, 상태 머신, TIME_WAIT의 이유
- [ ] [[tcp-reliability]] - 시퀀스 번호, 재전송, 슬라이딩 윈도우, 흐름 제어
- [ ] [[congestion-control]] - slow start, AIMD, cubic, BBR
- [ ] [[quic]] - TCP의 한계 (HOL blocking), QUIC 설계

## 4. 네트워크 계층

- [ ] [[ip-addressing]] - IPv4/IPv6, 서브넷, CIDR, NAT
- [ ] [[routing]] - 라우팅 테이블, OSPF vs BGP, 인터넷이 하나로 붙어 있는 이유
- [ ] [[icmp-and-tools]] - ping/traceroute 동작 원리

## 5. 링크 계층

- [ ] [[ethernet-and-arp]] - MAC 주소, ARP, 스위치 vs 라우터
- [ ] [[wifi]] - CSMA/CA, 무선이 유선과 다른 점

## 6. 실습·심화

- [ ] [[sockets]] - 소켓 프로그래밍, TCP 서버 직접 구현 → os/io-multiplexing과 연결
- [ ] [[tls]] - 핸드셰이크, 인증서 체인, 대칭/비대칭 조합 → security/와 연결
- [ ] [[packet-capture]] - tcpdump/Wireshark로 handshake 직접 관찰
- [ ] [[what-happens-url]] - 주소창에 URL 치면 일어나는 일 전체 종합 (졸업 시험)
