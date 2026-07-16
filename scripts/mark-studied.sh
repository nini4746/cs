#!/usr/bin/env bash
# 노트 학습/복습 기록 헬퍼.
# 사용: bash scripts/mark-studied.sh <과목>/<노트슬러그> [날짜]
#   예: bash scripts/mark-studied.sh os/process
#       bash scripts/mark-studied.sh os/process 2026-07-16
# 첫 기록이면 frontmatter에 `studied: <날짜>` 추가,
# 이미 studied가 있으면 `reviewed: [...]` 목록에 날짜 추가.
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
note="${1:?사용법: mark-studied.sh <과목>/<노트슬러그> [날짜]}"
date="${2:-$(date +%F)}"

file="$repo_root/${note%.md}.md"
if [ ! -f "$file" ]; then
  echo "노트 없음: $file" >&2
  exit 1
fi

if ! head -1 "$file" | grep -q '^---$'; then
  # frontmatter 없으면 새로 만든다
  printf -- '---\nstudied: %s\n---\n\n' "$date" | cat - "$file" > "$file.tmp"
  mv "$file.tmp" "$file"
  echo "studied: $date 기록됨 (frontmatter 생성) -> $note"
  exit 0
fi

if ! sed -n '2,/^---$/p' "$file" | grep -q '^studied:'; then
  # 첫 학습: studied 추가
  sed -i '' "1a\\
studied: $date
" "$file"
  echo "studied: $date 기록됨 -> $note"
elif sed -n '2,/^---$/p' "$file" | grep -q '^reviewed:'; then
  # 복습 목록에 추가
  if sed -n '2,/^---$/p' "$file" | grep '^reviewed:' | grep -q "$date"; then
    echo "이미 오늘($date) 복습 기록 있음 -> $note"
  else
    sed -i '' "s/^reviewed: \[\(.*\)\]/reviewed: [\1, $date]/" "$file"
    echo "reviewed에 $date 추가됨 -> $note"
  fi
else
  # 첫 복습: reviewed 생성
  sed -i '' "/^studied:/a\\
reviewed: [$date]
" "$file"
  echo "첫 복습 기록: reviewed: [$date] -> $note"
fi
