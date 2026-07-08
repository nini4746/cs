# 인젝션 (Injection)

## 한 줄 요약

사용자 입력을 코드/쿼리로 오인하게 만드는 공격. SQL 인젝션이 대표 - 입력이 쿼리 구조를 바꾼다. 근본 원인은 데이터와 코드를 섞는 것이고, 방어는 파라미터화(둘의 분리)다.

## 왜 필요한가

- SQL 인젝션이 정확히 어떻게 동작하나
- 왜 prepared statement가 막나
- 인젝션의 일반 원리 (SQL 외에도)

## SQL 인젝션 - 실증

사용자 입력을 쿼리에 **문자열 결합**하면:

```python
q = f"SELECT * FROM users WHERE name='{name}'"   # 취약!
```

공격 입력 `' OR '1'='1`:

실측:
```
취약 쿼리: SELECT * FROM users WHERE name='' OR '1'='1'
결과: [('alice','pw1'), ('bob','pw2')]   ← 전체 유출!
```

무슨 일:
- 입력의 `'`가 문자열을 닫고 → `OR '1'='1'`이 **쿼리 구조를 바꿈** → 항상 참 → 전체 반환
- 입력이 **데이터가 아니라 코드**로 해석됨
- 더 심하면: `'; DROP TABLE users; --` → 테이블 삭제

## 근본 원인: 데이터와 코드 혼합

인젝션의 본질 = **신뢰 못 할 데이터가 코드로 실행됨**:

- 쿼리 문자열에 입력을 끼우면 → 입력이 쿼리 구조의 일부가 됨
- 파서(database/[[query-execution]], programming-languages/[[parsing]])가 입력을 SQL 문법으로 해석
- automata/[[cfg-to-parsing]]의 파싱이 악용됨 - 입력이 문법 토큰이 되어버림

## 방어: 파라미터화 (prepared statement)

**데이터와 코드를 분리**:

```python
db.execute("SELECT * FROM users WHERE name=?", (name,))   # 안전
```

실측:
```
prepared로 같은 공격 (' OR '1'='1): []   ← 빈 결과 (방어됨!)
```

- `?`는 **데이터 자리** → 입력이 통째로 하나의 값으로 취급됨 (쿼리 구조 못 바꿈)
- DB가 쿼리 구조를 **먼저 파싱**하고 → 값을 나중에 바인딩 → 입력이 문법에 영향 못 줌
- `' OR '1'='1'`이 통째로 이름값으로 검색됨 → 그런 이름 없음 → 빈 결과

**근본 해결**: 데이터를 코드에서 분리. 이스케이프(입력 정제)보다 파라미터화가 확실 (이스케이프는 빠뜨리기 쉬움).

## 인젝션의 일반 형태

SQL만이 아님 - **입력이 코드/명령으로 해석되는 모든 곳**:

| 인젝션 | 대상 | 예 |
|---|---|---|
| **SQL** | DB 쿼리 | `' OR 1=1` |
| **명령(command)** | 셸 명령 | `; rm -rf /` (사용자 입력을 셸에) |
| **XSS** | HTML/JS | `<script>` (web/[[web-vulnerabilities]]) |
| **LDAP** | LDAP 쿼리 | 필터 조작 |
| **NoSQL** | NoSQL 쿼리 | `{$gt: ''}` (MongoDB) |
| **템플릿(SSTI)** | 템플릿 엔진 | `{{7*7}}` |
| **XXE** | XML 파서 | 외부 엔티티 |

전부 같은 원리: **신뢰 못 할 입력 + 그걸 실행하는 인터프리터**. 방어도 같음 - 데이터와 코드 분리.

## 방어 원칙

1. **파라미터화/prepared statement**: 근본 (SQL, NoSQL)
2. **입력을 명령에 안 넣기**: 셸 명령에 사용자 입력 금지 (필요하면 인자 배열로, 셸 안 거침)
3. **출력 이스케이프**: XSS는 렌더 시 이스케이프 (web/[[web-vulnerabilities]])
4. **최소 권한**: DB 계정 권한 최소화 → 뚫려도 피해 제한 ([[least-privilege]])
5. **allowlist 검증**: 허용된 값만 (blocklist보다 안전)
6. **ORM 사용**: 대부분 파라미터화 기본 제공 (하지만 raw 쿼리 주의)

## 왜 여전히 흔한가

SQL 인젝션은 20년 넘은 공격인데 여전히 OWASP 상위:
- 문자열 결합이 편해서 (실수하기 쉬움)
- 레거시 코드
- ORM 우회한 raw 쿼리
- **교훈**: 절대 입력을 쿼리/명령에 문자열로 끼우지 말 것. 항상 파라미터화.

## 연결

- 쿼리 파싱 → database/[[query-execution]], programming-languages/[[parsing]]
- 파싱 악용 → automata/[[cfg-to-parsing]]
- XSS → web/[[web-vulnerabilities]], [[xss-csrf]]
- 최소 권한 → [[least-privilege]]
- HashDoS도 복잡도 인젝션 → data-structures/[[hash-in-practice]]

## 궁금한 것 (나중에)

- [ ] blind SQL injection (결과 안 보여도 추측)
- [ ] second-order injection (저장 후 나중에 실행)
- [ ] SSTI (서버 사이드 템플릿 인젝션)
- [ ] prepared statement가 못 막는 경우 (동적 테이블명)

## 출처

- OWASP Injection, "The Web Application Hacker's Handbook"
