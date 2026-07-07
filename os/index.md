---
title: "os"
---

# 운영체제 syllabus

기준 교과서: **OSTEP** (Operating Systems: Three Easy Pieces, 무료 공개) + 공룡책 (Silberschatz) 보조.

OSTEP 구조 그대로 3부: 가상화 / 동시성 / 영속성.

## 1. 가상화 - CPU

- [x] [[process]] - 프로세스란, 상태 전이, fork/exec/wait, 좀비/고아
- [x] [[limited-direct-execution]] - 시스템 콜, 유저/커널 모드, 컨텍스트 스위치 비용
- [x] [[cpu-scheduling]] - FIFO/SJF/RR, MLFQ, 리눅스 CFS/EEVDF
- [x] [[process-vs-thread]] - 스레드 모델, 공유하는 것과 안 하는 것

## 2. 가상화 - 메모리

- [x] [[address-spaces]] - 주소 공간 추상화, 코드/힙/스택 배치
- [x] [[segmentation-and-paging]] - 세그멘테이션 → 페이징으로 온 이유
- [x] [[page-tables]] - 멀티레벨 페이지 테이블, TLB (하드웨어 관점은 computer-architecture/)
- [x] [[swapping]] - 페이지 폴트, 교체 정책 (LRU, clock), thrashing
- [x] [[memory-allocation]] - malloc 내부, free list, 단편화, buddy/slab

## 3. 동시성

- [x] [[threads-and-races]] - 경쟁 조건, 임계 구역, 원자성이 깨지는 지점
- [x] [[locks]] - 스핀락 vs 뮤텍스, futex, 락 구현 (test-and-set, CAS)
- [x] [[condition-variables]] - 생산자-소비자, 왜 while로 감싸나
- [x] [[semaphores]] - 세마포어로 락/CV 재현, reader-writer
- [x] [[deadlock]] - 4대 조건, 예방/회피/탐지, 락 순서 규칙
- [x] [[lock-free-basics]] - CAS 기반 자료구조 맛보기, ABA 문제

## 4. 영속성

- [x] [[io-devices]] - 인터럽트 vs 폴링, DMA, 디바이스 드라이버 구조
- [ ] [[file-system-basics]] - 파일/디렉토리 구현, inode, 하드/심볼릭 링크
- [ ] [[fast-file-system]] - 디스크 지역성, 블록 그룹
- [ ] [[crash-consistency]] - fsck, 저널링, copy-on-write (ZFS/btrfs)
- [ ] [[page-cache]] - 버퍼 캐시, mmap, write-back과 fsync
- [ ] [[ssd-internals]] - FTL, wear leveling, HDD와 다른 성능 특성

## 5. 심화

- [ ] [[virtualization-and-containers]] - VM vs 컨테이너, namespace/cgroup → devops/와 연결
- [ ] [[io-multiplexing]] - select/poll/epoll/kqueue, 이벤트 루프 → network/와 연결
