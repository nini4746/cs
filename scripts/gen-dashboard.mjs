#!/usr/bin/env node
// 학습 대시보드 생성기.
// 진실의 원천 = 각 노트 frontmatter:
//   studied: YYYY-MM-DD          (처음 제대로 학습한 날)
//   reviewed: [YYYY-MM-DD, ...]  (복습한 날들)
// 과목 index.md의 체크박스는 표시용 파생물 - syncRoot를 주면 빌드 시
// studied 있는 노트만 [x]로 자동 체크한다 (repo 원본은 항상 [ ]).
//
// 사용: node scripts/gen-dashboard.mjs [repoRoot] [outFile] [syncRoot]
//   repoRoot: 노트 repo 루트 (기본 ".")
//   outFile:  대시보드 출력 경로 (기본 <repoRoot>/study-guide/dashboard.md)
//   syncRoot: 체크박스를 동기화할 콘텐츠 사본 루트 (예: quartz/content). 생략 시 동기화 안 함.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import { join } from "node:path"

const repoRoot = process.argv[2] || "."
const outFile = process.argv[3] || join(repoRoot, "study-guide", "dashboard.md")
const syncRoot = process.argv[4] || null

const SKIP = new Set([".git", ".github", "node_modules", "scripts", "study-guide", "private"])

// 스페이스드 리피티션 간격(일): n번째 복습까지 완료 후 다음 복습까지.
const INTERVALS = [1, 3, 7, 21, 60]

// 오늘 날짜 (KST 기준 - CI는 UTC라서 명시 변환)
const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }))
today.setHours(0, 0, 0, 0)

function parseDate(s) {
  const m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000)
}

function frontmatterOf(text) {
  if (!text.startsWith("---")) return null
  const end = text.indexOf("\n---", 3)
  return end === -1 ? null : text.slice(3, end)
}

// 노트의 학습 상태: { studied: Date|null, reviews: Date[] }
function studyStateOf(notePath) {
  let text
  try { text = readFileSync(notePath, "utf8") } catch { return null }
  const fm = frontmatterOf(text)
  if (!fm) return { studied: null, reviews: [] }
  const sm = fm.match(/^studied:\s*(\S+)/m)
  const studied = sm ? parseDate(sm[1]) : null
  const reviews = []
  const rm = fm.match(/^reviewed:\s*\[([^\]]*)\]/m)
  if (rm) {
    for (const part of rm[1].split(",")) {
      const d = parseDate(part)
      if (d) reviews.push(d)
    }
  }
  reviews.sort((a, b) => a - b)
  return { studied, reviews }
}

function titleOf(indexPath, fallback) {
  const text = readFileSync(indexPath, "utf8")
  const m = text.match(/^title:\s*"?(.+?)"?\s*$/m)
  return m ? m[1].trim() : fallback
}

// index.md에서 체크박스 노트 항목 추출: [{ slug, label }]
function notesOf(indexPath) {
  const text = readFileSync(indexPath, "utf8")
  const notes = []
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*-\s*\[( |x|X)\]\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/)
    if (!m) continue
    notes.push({ slug: m[2].trim(), label: (m[3] || m[2]).trim() })
  }
  return notes
}

function bar(done, total, width = 20) {
  if (total === 0) return "─".repeat(width)
  const filled = Math.round((done / total) * width)
  return "█".repeat(filled) + "░".repeat(width - filled)
}

function fmtDate(d) {
  const p = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// 과목별 수집
const subjects = []
for (const name of readdirSync(repoRoot).sort()) {
  if (SKIP.has(name)) continue
  const dir = join(repoRoot, name)
  let st
  try { st = statSync(dir) } catch { continue }
  if (!st.isDirectory()) continue
  const indexPath = join(dir, "index.md")
  try { statSync(indexPath) } catch { continue }
  const notes = notesOf(indexPath)
  if (notes.length === 0) continue

  const enriched = notes.map((n) => {
    const state = studyStateOf(join(dir, `${n.slug}.md`)) || { studied: null, reviews: [] }
    return { ...n, subject: name, ...state }
  })
  subjects.push({ name, title: titleOf(indexPath, name), notes: enriched })
}

// 복습 큐 계산: studied 노트의 마지막 학습/복습일 + 간격 <= 오늘이면 due
const queue = []
for (const s of subjects) {
  for (const n of s.notes) {
    if (!n.studied) continue
    const last = n.reviews.length ? n.reviews[n.reviews.length - 1] : n.studied
    const interval = INTERVALS[Math.min(n.reviews.length, INTERVALS.length - 1)]
    const due = new Date(last)
    due.setDate(due.getDate() + interval)
    if (due <= today) {
      queue.push({ ...n, subjectTitle: s.title, due, overdue: daysBetween(due, today), interval })
    }
  }
}
queue.sort((a, b) => b.overdue - a.overdue)

const totalStudied = subjects.reduce((a, s) => a + s.notes.filter((n) => n.studied).length, 0)
const totalAll = subjects.reduce((a, s) => a + s.notes.length, 0)
const pct = totalAll ? Math.round((totalStudied / totalAll) * 100) : 0

subjects.sort((a, b) => {
  const pa = a.notes.filter((n) => n.studied).length / a.notes.length
  const pb = b.notes.filter((n) => n.studied).length / b.notes.length
  return pa - pb || a.title.localeCompare(b.title)
})

const lines = []
lines.push("---")
lines.push('title: "학습 대시보드"')
lines.push("---")
lines.push("")
lines.push("# 학습 대시보드")
lines.push("")
lines.push("> 빌드 시 각 노트 frontmatter(`studied`, `reviewed`)에서 자동 생성. 직접 편집 금지.")
lines.push("> 학습 완료 기록: `bash scripts/mark-studied.sh <과목>/<노트>` (복습이면 자동으로 reviewed에 추가).")
lines.push("")

// 1) 오늘의 복습 큐
lines.push(`## 오늘 복습할 노트 (${queue.length})`)
lines.push("")
if (queue.length === 0) {
  lines.push(totalStudied === 0
    ? "아직 학습 기록이 없습니다. 노트를 공부한 뒤 `mark-studied.sh`로 기록하세요."
    : "복습할 노트가 없습니다. 새 노트를 학습하세요. 🎉")
} else {
  lines.push("| 노트 | 과목 | 예정일 | 밀린 일수 |")
  lines.push("|---|---|---|---|")
  for (const q of queue) {
    lines.push(`| [[${q.subject}/${q.slug}\\|${q.label}]] | ${q.subjectTitle} | ${fmtDate(q.due)} | ${q.overdue === 0 ? "오늘" : `+${q.overdue}일`} |`)
  }
}
lines.push("")

// 2) 학습 진도 (노트 작성 여부와 무관하게, 실제 학습 기준)
lines.push(`## 학습 진도: ${totalStudied} / ${totalAll} (${pct}%)`)
lines.push("")
lines.push("```")
lines.push(`${bar(totalStudied, totalAll, 40)} ${pct}%`)
lines.push("```")
lines.push("")
lines.push("학습률 낮은 순 (다음에 볼 과목이 위로). 노트는 전부 작성돼 있으니 진도 = 실제 학습만 집계.")
lines.push("")
lines.push("| 과목 | 진행 | 학습 | 복습 횟수 |")
lines.push("|---|---|---|---|")
for (const s of subjects) {
  const done = s.notes.filter((n) => n.studied).length
  const reviews = s.notes.reduce((a, n) => a + n.reviews.length, 0)
  const p = Math.round((done / s.notes.length) * 100)
  lines.push(`| [${s.title}](../${s.name}/) | \`${bar(done, s.notes.length)}\` | ${done}/${s.notes.length} (${p}%) | ${reviews} |`)
}
lines.push("")
lines.push(`복습 간격: ${INTERVALS.join("일 → ")}일 (이후 ${INTERVALS[INTERVALS.length - 1]}일 반복).`)
lines.push("")

writeFileSync(outFile, lines.join("\n"))
console.error(`wrote ${outFile}: ${subjects.length} subjects, studied ${totalStudied}/${totalAll} (${pct}%), review queue ${queue.length}`)

// 3) 체크박스 동기화: syncRoot의 index.md에서 studied 노트만 [x]
if (syncRoot) {
  let synced = 0
  for (const s of subjects) {
    const idx = join(syncRoot, s.name, "index.md")
    let text
    try { text = readFileSync(idx, "utf8") } catch { continue }
    const studiedSlugs = new Set(s.notes.filter((n) => n.studied).map((n) => n.slug))
    const out = text.split("\n").map((line) => {
      const m = line.match(/^(\s*-\s*)\[( |x|X)\](\s*\[\[([^\]|]+))/)
      if (!m) return line
      const slug = m[4].trim()
      const mark = studiedSlugs.has(slug) ? "x" : " "
      return line.replace(/^(\s*-\s*)\[( |x|X)\]/, `$1[${mark}]`)
    }).join("\n")
    if (out !== text) { writeFileSync(idx, out); synced++ }
  }
  console.error(`synced checkboxes in ${synced} index files under ${syncRoot}`)
}
