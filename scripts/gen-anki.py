#!/usr/bin/env python3
"""각 노트의 셀프 체크(question)와 연습문제(example) 콜아웃을 Anki 덱(.apkg)으로 변환한다.

사용:
    python3 scripts/gen-anki.py [repoRoot] [outFile]        # .apkg 생성 (genanki 필요)
    python3 scripts/gen-anki.py --dry-run [repoRoot]         # 파싱만, 카드 수 출력 (genanki 불필요)

카드: 앞면 = 질문/문제, 뒷면 = 답/풀이. GUID는 (노트 경로 + 인덱스)로 고정 → 재실행 시 갱신.
과목별 서브덱, type:셀프체크 / type:연습문제 태그로 구분.
"""
import hashlib
import html
import os
import re
import sys


def stable_id(text):
    """프로세스 간 고정 정수 id (Python hash는 랜덤화되므로 사용 불가)."""
    return int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:12], 16)

SKIP_DIRS = {".git", ".github", "node_modules", "scripts", "study-guide", "github-trending"}
CALLOUT_RE = re.compile(r"^>\s*\[!(question|example)\]-\s*(.*)$")
TITLE_RE = re.compile(r'^title:\s*"?(.+?)"?\s*$', re.M)
TYPE_LABEL = {"question": "셀프체크", "example": "연습문제"}


def subject_title(index_path, fallback):
    try:
        with open(index_path, encoding="utf-8") as f:
            m = TITLE_RE.search(f.read())
        return m.group(1).strip() if m else fallback
    except OSError:
        return fallback


def md_to_html(lines):
    """콜아웃 본문 줄 리스트(선행 '> ' 제거된 상태)를 최소 HTML로 변환."""
    out, in_code = [], False
    buf = []
    for ln in lines:
        fence = ln.strip().startswith("```")
        if fence:
            if not in_code:
                in_code = True
                buf = []
            else:
                in_code = False
                code = html.escape("\n".join(buf))
                out.append(f"<pre><code>{code}</code></pre>")
            continue
        if in_code:
            buf.append(ln)
            continue
        esc = html.escape(ln)
        esc = re.sub(r"`([^`]+)`", lambda m: f"<code>{m.group(1)}</code>", esc)
        out.append(esc)
    if in_code and buf:  # 닫히지 않은 코드펜스 방어
        out.append("<pre><code>" + html.escape("\n".join(buf)) + "</code></pre>")
    # 연속 문단은 <br>로, <pre> 블록은 그대로
    parts, para = [], []
    for chunk in out:
        if chunk.startswith("<pre>"):
            if para:
                parts.append("<br>".join(para)); para = []
            parts.append(chunk)
        elif chunk.strip() == "":
            if para:
                parts.append("<br>".join(para)); para = []
        else:
            para.append(chunk)
    if para:
        parts.append("<br>".join(para))
    return "".join(parts) if len(parts) == 1 else "<br>".join(parts)


def parse_callouts(path):
    """(type, front_html, back_html) 목록 반환."""
    with open(path, encoding="utf-8") as f:
        lines = f.read().split("\n")
    cards, i, n = [], 0, len(lines)
    while i < n:
        m = CALLOUT_RE.match(lines[i])
        if not m:
            i += 1
            continue
        ctype, front = m.group(1), m.group(2).strip()
        body, i = [], i + 1
        while i < n and (lines[i].startswith(">")):
            body.append(re.sub(r"^>\s?", "", lines[i]))
            i += 1
        # 연습문제 front의 "문제: " 접두, 풀이 본문 그대로
        front_clean = re.sub(r"^문제:\s*", "", front)
        cards.append((ctype, md_to_html([front_clean]), md_to_html(body)))
    return cards


def collect(repo_root):
    """[(subject_title, subject_dir, note_basename, ctype, front, back)]."""
    rows = []
    for name in sorted(os.listdir(repo_root)):
        if name in SKIP_DIRS:
            continue
        d = os.path.join(repo_root, name)
        if not os.path.isdir(d):
            continue
        idx = os.path.join(d, "index.md")
        if not os.path.exists(idx):
            continue
        stitle = subject_title(idx, name)
        for fn in sorted(os.listdir(d)):
            if not fn.endswith(".md") or fn == "index.md":
                continue
            path = os.path.join(d, fn)
            for ctype, front, back in parse_callouts(path):
                rows.append((stitle, name, fn[:-3], ctype, front, back))
    return rows


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    repo_root = args[0] if args else "."
    out_file = args[1] if len(args) > 1 else os.path.join(repo_root, "study-guide", "cs-notes.apkg")

    rows = collect(repo_root)
    by_type = {}
    for r in rows:
        by_type[r[3]] = by_type.get(r[3], 0) + 1
    sys.stderr.write(
        f"parsed {len(rows)} cards "
        f"(셀프체크 {by_type.get('question', 0)}, 연습문제 {by_type.get('example', 0)}) "
        f"from {len({(r[1], r[2]) for r in rows})} notes\n"
    )
    if dry:
        return

    import genanki

    MODEL = genanki.Model(
        1607392319,  # 고정 model id
        "CS 노트 Q/A",
        fields=[{"name": "Front"}, {"name": "Back"}],
        templates=[{
            "name": "Card",
            "qfmt": "{{Front}}",
            "afmt": '{{FrontSide}}<hr id="answer">{{Back}}',
        }],
        css=".card{font-family:sans-serif;font-size:18px;line-height:1.6;}"
            "pre{background:#f4f4f4;padding:8px;border-radius:6px;overflow-x:auto;}"
            "code{background:#f4f4f4;padding:1px 4px;border-radius:4px;}",
    )

    decks = {}
    for stitle, sdir, note, ctype, front, back in rows:
        deck_name = f"CS 공부 노트::{stitle}"
        if deck_name not in decks:
            decks[deck_name] = genanki.Deck(stable_id(deck_name), deck_name)
        guid = genanki.guid_for(sdir, note, ctype, front)
        decks[deck_name].add_note(genanki.Note(
            model=MODEL,
            fields=[front, back],
            tags=[sdir, f"type::{TYPE_LABEL[ctype]}"],
            guid=guid,
        ))

    genanki.Package(list(decks.values())).write_to_file(out_file)
    sys.stderr.write(f"wrote {out_file}: {len(decks)} subdecks\n")


if __name__ == "__main__":
    main()
