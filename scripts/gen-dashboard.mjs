#!/usr/bin/env node
// 듀오링고식 학습 시스템 생성기.
// 진실의 원천 = 각 노트 frontmatter:
//   studied: YYYY-MM-DD          (처음 제대로 학습한 날)
//   reviewed: [YYYY-MM-DD, ...]  (복습한 날들)
// 기록: bash scripts/mark-studied.sh <과목>/<노트>
//
// 생성물 (outFile과 같은 디렉토리):
//   dashboard.md - 복습 큐 + 과목별 학습률 + XP/레벨/스트릭
//   today.md     - 오늘의 레슨 (다음 미학습 노트 자동 지정) + 밀린 복습
//   quiz.md      - 데일리 퀴즈 (날짜 시드 랜덤 5문제, 답 접힘)
//   path.md      - 학습 경로 (선수과목 기반 유닛 잠금/해제 스킬트리)
// syncRoot 지정 시:
//   - 각 과목 index.md 체크박스를 studied 기준으로 [x] 동기화
//   - syncRoot/index.md (홈) 상단에 스트릭/독촉 배너 주입
//
// 사용: node scripts/gen-dashboard.mjs [repoRoot] [outFile] [syncRoot]
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import { join, dirname } from "node:path"

const repoRoot = process.argv[2] || "."
const outFile = process.argv[3] || join(repoRoot, "study-guide", "dashboard.md")
const syncRoot = process.argv[4] || null
const outDir = dirname(outFile)

const SKIP = new Set([".git", ".github", "node_modules", "scripts", "study-guide", "private"])

// 스페이스드 리피티션 간격(일)
const INTERVALS = [1, 3, 7, 21, 60]
// XP 규칙
const XP_STUDY = 10
const XP_REVIEW = 5
const XP_PER_LEVEL = 100
// 유닛 해제 조건: 모든 선수 과목 학습률 >= UNLOCK_PCT
const UNLOCK_PCT = 0.6

// 선수과목 지도 (study-guide/index.md의 mermaid와 동일). 순서 = 학습 경로 순서.
const PREREQS = {
  "math": [],
  "automata": [],
  "programming-languages": [],
  "computer-architecture": [],
  "software-design": [],
  "data-structures": ["math"],
  "algorithms": ["math", "data-structures"],
  "information-theory": ["math"],
  "os": ["computer-architecture"],
  "compilers": ["automata", "programming-languages"],
  "cryptography": ["math"],
  "complexity-theory": ["algorithms", "automata"],
  "database": ["algorithms"],
  "concurrency-parallelism": ["computer-architecture", "os"],
  "network": ["os"],
  "signal-processing": ["math", "information-theory"],
  "ai-ml": ["math", "information-theory"],
  "quantum-computing": ["math"],
  "web": ["network"],
  "security": ["network", "cryptography"],
  "distributed-systems": ["algorithms", "os", "network"],
  "devops": ["distributed-systems"],
}

// ---------- 유틸 ----------
const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }))
today.setHours(0, 0, 0, 0)

function parseDate(s) {
  const m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}
const daysBetween = (a, b) => Math.round((b - a) / 86400000)
function fmtDate(d) {
  const p = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
// 날짜 시드 결정적 난수 (mulberry32) - 같은 날은 같은 퀴즈
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(Number(fmtDate(today).replace(/-/g, "")))
function pick(arr, n) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}
function bar(done, total, width = 20) {
  if (total === 0) return "─".repeat(width)
  const filled = Math.round((done / total) * width)
  return "█".repeat(filled) + "░".repeat(width - filled)
}

// ---------- 노트 파싱 ----------
function frontmatterOf(text) {
  if (!text.startsWith("---")) return null
  const end = text.indexOf("\n---", 3)
  return end === -1 ? null : text.slice(3, end)
}

function noteInfo(notePath) {
  let text
  try { text = readFileSync(notePath, "utf8") } catch { return null }
  const fm = frontmatterOf(text) || ""
  const sm = fm.match(/^studied:\s*(\S+)/m)
  const studied = sm ? parseDate(sm[1]) : null
  const reviews = []
  const rm = fm.match(/^reviewed:\s*\[([^\]]*)\]/m)
  if (rm) for (const part of rm[1].split(",")) { const d = parseDate(part); if (d) reviews.push(d) }
  reviews.sort((a, b) => a - b)
  const hm = text.match(/^#\s+(.+)$/m)
  const heading = hm ? hm[1].trim() : null
  // 셀프체크 질문 콜아웃 블록 추출 (제목 줄 + 이어지는 "> " 본문)
  const questions = []
  const lines = text.split("\n")
  for (let i = 0; i < lines.length; i++) {
    if (!/^>\s*\[!question\]-/.test(lines[i])) continue
    const block = [lines[i]]
    let j = i + 1
    while (j < lines.length && /^>/.test(lines[j])) { block.push(lines[j]); j++ }
    questions.push(block.join("\n"))
    i = j - 1
  }
  return { studied, reviews, heading, questions }
}

function titleOf(indexPath, fallback) {
  const m = readFileSync(indexPath, "utf8").match(/^title:\s*"?(.+?)"?\s*$/m)
  return m ? m[1].trim() : fallback
}

function notesOf(indexPath) {
  const notes = []
  for (const line of readFileSync(indexPath, "utf8").split("\n")) {
    const m = line.match(/^\s*-\s*\[( |x|X)\]\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\](\s*-\s*(.+))?/)
    if (!m) continue
    notes.push({ slug: m[2].trim(), label: (m[3] || m[2]).trim(), desc: (m[5] || "").trim() })
  }
  return notes
}

// ---------- 수집 ----------
const bySubject = new Map()
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
    const info = noteInfo(join(dir, `${n.slug}.md`)) || { studied: null, reviews: [], heading: null, questions: [] }
    return { ...n, subject: name, ...info }
  })
  bySubject.set(name, { name, title: titleOf(indexPath, name), notes: enriched })
}
const subjects = [...bySubject.values()]
const allNotes = subjects.flatMap((s) => s.notes)

// ---------- 지표 ----------
const studiedNotes = allNotes.filter((n) => n.studied)
const totalReviews = allNotes.reduce((a, n) => a + n.reviews.length, 0)
const xp = studiedNotes.length * XP_STUDY + totalReviews * XP_REVIEW
const level = Math.floor(xp / XP_PER_LEVEL) + 1
const xpInLevel = xp % XP_PER_LEVEL

// 스트릭: studied/reviewed 날짜 기준 연속 학습일 (오늘 또는 어제까지)
const activeDays = new Set()
for (const n of allNotes) {
  if (n.studied) activeDays.add(fmtDate(n.studied))
  for (const r of n.reviews) activeDays.add(fmtDate(r))
}
let streak = 0
{
  const cur = new Date(today)
  if (!activeDays.has(fmtDate(cur))) cur.setDate(cur.getDate() - 1) // 오늘 아직 안 했으면 어제부터
  while (activeDays.has(fmtDate(cur))) { streak++; cur.setDate(cur.getDate() - 1) }
}
const studiedToday = activeDays.has(fmtDate(today))
const lastActive = [...activeDays].sort().pop() || null
const daysSinceActive = lastActive ? daysBetween(parseDate(lastActive), today) : null

// 복습 큐
const queue = []
for (const n of allNotes) {
  if (!n.studied) continue
  const last = n.reviews.length ? n.reviews[n.reviews.length - 1] : n.studied
  const due = new Date(last)
  due.setDate(due.getDate() + INTERVALS[Math.min(n.reviews.length, INTERVALS.length - 1)])
  if (due <= today) queue.push({ ...n, due, overdue: daysBetween(due, today) })
}
queue.sort((a, b) => b.overdue - a.overdue)

// 유닛(과목) 상태: 학습률 + 잠금
function rateOf(name) {
  const s = bySubject.get(name)
  if (!s) return 1 // 지도에 있는데 폴더 없으면 통과 취급
  return s.notes.filter((n) => n.studied).length / s.notes.length
}
const pathOrder = [...Object.keys(PREREQS), ...subjects.map((s) => s.name).filter((n) => !(n in PREREQS))]
const units = pathOrder.filter((n) => bySubject.has(n)).map((name) => {
  const s = bySubject.get(name)
  const prereqs = PREREQS[name] || []
  const unlocked = prereqs.every((p) => rateOf(p) >= UNLOCK_PCT)
  const done = s.notes.filter((n) => n.studied).length
  const status = !unlocked ? "locked" : done === s.notes.length ? "done" : done > 0 ? "active" : "open"
  return { ...s, prereqs, unlocked, done, status }
})

// 오늘의 레슨: 해제된 유닛 중 경로 순서상 첫 미학습 노트
let lesson = null
const upNext = []
for (const u of units) {
  if (!u.unlocked) continue
  for (const n of u.notes) {
    if (n.studied) continue
    if (!lesson) lesson = { ...n, subjectTitle: u.title }
    else if (upNext.length < 2) upNext.push({ ...n, subjectTitle: u.title })
  }
  if (lesson && upNext.length >= 2) break
}

// ---------- 공통 조각 ----------
const STATUS_ICON = { done: "✅", active: "🟢", open: "⭕", locked: "🔒" }
function banner(prefix) {
  const fire = studiedToday
    ? `🔥 스트릭 **${streak}일** - 오늘 완료!`
    : streak > 0
      ? `🔥 스트릭 **${streak}일** - 오늘 아직 안 함, 끊기기 전에!`
      : daysSinceActive === null
        ? `💀 학습 기록 없음 - 오늘이 1일`
        : `💀 스트릭 끊김 (마지막 학습 ${daysSinceActive}일 전)`
  const l = []
  l.push(`> [!${studiedToday ? "success" : "warning"}] ${fire} · Lv.${level} (${xp} XP) · 밀린 복습 **${queue.length}개**`)
  l.push(`> 👉 [오늘의 레슨](${prefix}today) · [데일리 퀴즈](${prefix}quiz) · [학습 경로](${prefix}path) · [대시보드](${prefix}dashboard)`)
  return l.join("\n")
}
const genNote = "> 빌드 시 노트 frontmatter(`studied`/`reviewed`)에서 자동 생성. 직접 편집 금지. 기록: [비공개 사이트](https://notes.nini4746.uk)에서 노트 우하단 **✅ 학습/복습 완료** 버튼 클릭 (CLI 대안: `bash scripts/mark-studied.sh <과목>/<노트>`)"

// ---------- today.md ----------
{
  const l = []
  l.push("---", 'title: "오늘의 레슨"', "---", "")
  l.push(`# 오늘의 레슨 - ${fmtDate(today)}`, "")
  l.push(banner(""), "")
  l.push(genNote, "")
  // 1) 복습 먼저 (듀오링고도 복습 우선)
  l.push(`## 1교시 - 밀린 복습 (${queue.length})`, "")
  if (queue.length === 0) {
    l.push("밀린 복습 없음. 바로 새 레슨으로.", "")
  } else {
    l.push("| 노트 | 과목 | 밀린 일수 |", "|---|---|---|")
    for (const q of queue.slice(0, 5)) {
      const subjectTitle = bySubject.get(q.subject).title
      l.push(`| [[${q.subject}/${q.slug}\\|${q.heading || q.label}]] | ${subjectTitle} | ${q.overdue === 0 ? "오늘" : `+${q.overdue}일`} |`)
    }
    if (queue.length > 5) l.push("", `...외 ${queue.length - 5}개는 [대시보드](dashboard)에서.`)
    l.push("")
  }
  // 2) 새 레슨
  l.push("## 2교시 - 새 레슨", "")
  if (!lesson) {
    l.push("해제된 유닛의 노트를 전부 학습했습니다. [학습 경로](path)에서 다음 유닛을 확인하세요.", "")
  } else {
    l.push(`> [!todo] 오늘의 노트: [[${lesson.subject}/${lesson.slug}|${lesson.heading || lesson.label}]] (${lesson.subjectTitle})`)
    if (lesson.desc) l.push(`> ${lesson.desc}`)
    l.push(`> 완료 보상: +${XP_STUDY} XP`, "")
    l.push("**완료 조건** - 전부 만족해야 학습으로 침:", "")
    l.push("1. 노트를 읽고 **덮은 뒤** `## 셀프 체크` 질문에 먼저 스스로 답한다 (그다음 펼쳐서 확인)")
    l.push("2. `## 연습문제`를 풀이 보기 전에 푼다")
    l.push("3. `## 파인만` - 백지에 남에게 설명하듯 쓴다. 막히면 그 부분만 다시")
    l.push(`4. 통과했으면 [비공개 사이트에서 이 노트](https://notes.nini4746.uk/${lesson.subject}/${lesson.slug})를 열고 우하단 **✅ 학습/복습 완료** 버튼 클릭 - 커밋·리빌드·XP 전부 자동`, "")
    if (upNext.length) {
      l.push("**다음 대기:** " + upNext.map((n) => `[[${n.subject}/${n.slug}|${n.heading || n.label}]]`).join(" → "), "")
    }
  }
  // 3) 퀴즈
  l.push("## 3교시 - 데일리 퀴즈", "")
  l.push("[오늘의 퀴즈 5문제](quiz) - 답 보기 전에 소리 내서 답할 것.", "")
  writeFileSync(join(outDir, "today.md"), l.join("\n"))
}

// ---------- quiz.md ----------
{
  // 학습한 노트 우선 3 + 나머지 아무거나 2 (풀 부족하면 채움)
  const qStudied = studiedNotes.flatMap((n) => n.questions.map((q) => ({ q, n })))
  const qRest = allNotes.filter((n) => !n.studied).flatMap((n) => n.questions.map((q) => ({ q, n })))
  let picked = [...pick(qStudied, 3), ...pick(qRest, 2)]
  if (picked.length < 5) picked = [...picked, ...pick(qStudied.concat(qRest).filter((x) => !picked.includes(x)), 5 - picked.length)]
  const l = []
  l.push("---", 'title: "데일리 퀴즈"', "---", "")
  l.push(`# 데일리 퀴즈 - ${fmtDate(today)}`, "")
  l.push(banner(""), "")
  l.push("> 매일 자동 출제 (학습한 노트 3 + 미학습 2). **펼치기 전에 소리 내서 답하기.** 막힌 노트는 오늘 복습 대상.", "")
  picked.forEach(({ q, n }, i) => {
    l.push(`## Q${i + 1}. ${bySubject.get(n.subject).title}`, "")
    l.push(q, "")
    l.push(`출처: [[${n.subject}/${n.slug}|${n.heading || n.label}]]${n.studied ? "" : " (미학습 - 맛보기)"}`, "")
  })
  if (picked.length === 0) l.push("출제할 셀프체크 질문이 없습니다.")
  writeFileSync(join(outDir, "quiz.md"), l.join("\n"))
}

// ---------- path.md ----------
{
  const l = []
  l.push("---", 'title: "학습 경로"', "---", "")
  l.push("# 학습 경로", "")
  l.push(banner(""), "")
  l.push(`> 선수과목을 **${Math.round(UNLOCK_PCT * 100)}% 이상** 학습해야 다음 유닛이 열립니다. 🔒 잠김 / ⭕ 열림 / 🟢 진행 중 / ✅ 완료`, "")
  l.push("| | 유닛 | 진행 | 학습 | 선수과목 |", "|---|---|---|---|---|")
  for (const u of units) {
    const p = Math.round((u.done / u.notes.length) * 100)
    const prereqTxt = u.prereqs.length
      ? u.prereqs.map((pr) => {
          const ps = bySubject.get(pr)
          const ok = rateOf(pr) >= UNLOCK_PCT
          return `${ok ? "✅" : "❌"} ${ps ? ps.title : pr}`
        }).join("<br>")
      : "-"
    const link = u.status === "locked" ? u.title : `[${u.title}](../${u.name}/)`
    l.push(`| ${STATUS_ICON[u.status]} | ${link} | \`${bar(u.done, u.notes.length, 15)}\` | ${u.done}/${u.notes.length} (${p}%) | ${prereqTxt} |`)
  }
  l.push("")
  l.push(`잠긴 유닛도 노트는 열람 가능하지만, 경로 순서대로 가는 게 기억에 남습니다. [오늘의 레슨](today)이 항상 다음 한 걸음을 골라줍니다.`, "")
  writeFileSync(join(outDir, "path.md"), l.join("\n"))
}

// ---------- dashboard.md ----------
{
  const sorted = [...subjects].sort((a, b) => {
    const pa = a.notes.filter((n) => n.studied).length / a.notes.length
    const pb = b.notes.filter((n) => n.studied).length / b.notes.length
    return pa - pb || a.title.localeCompare(b.title)
  })
  const pct = allNotes.length ? Math.round((studiedNotes.length / allNotes.length) * 100) : 0
  const l = []
  l.push("---", 'title: "학습 대시보드"', "---", "")
  l.push("# 학습 대시보드", "")
  l.push(banner(""), "")
  l.push(genNote, "")
  l.push(`## 레벨 & XP`, "")
  l.push(`- **Lv.${level}** - 다음 레벨까지 ${XP_PER_LEVEL - xpInLevel} XP`)
  l.push(`- \`${bar(xpInLevel, XP_PER_LEVEL, 30)}\` ${xpInLevel}/${XP_PER_LEVEL}`)
  l.push(`- 학습 +${XP_STUDY} XP · 복습 +${XP_REVIEW} XP · 총 ${xp} XP (학습 ${studiedNotes.length}, 복습 ${totalReviews})`, "")
  l.push(`## 오늘 복습할 노트 (${queue.length})`, "")
  if (queue.length === 0) {
    l.push(studiedNotes.length === 0
      ? "아직 학습 기록이 없습니다. [오늘의 레슨](today)부터 시작하세요."
      : "복습할 노트가 없습니다. [오늘의 레슨](today)으로. 🎉")
  } else {
    l.push("| 노트 | 과목 | 예정일 | 밀린 일수 |", "|---|---|---|---|")
    for (const q of queue) {
      l.push(`| [[${q.subject}/${q.slug}\\|${q.heading || q.label}]] | ${bySubject.get(q.subject).title} | ${fmtDate(q.due)} | ${q.overdue === 0 ? "오늘" : `+${q.overdue}일`} |`)
    }
  }
  l.push("")
  l.push(`## 학습 진도: ${studiedNotes.length} / ${allNotes.length} (${pct}%)`, "")
  l.push("```", `${bar(studiedNotes.length, allNotes.length, 40)} ${pct}%`, "```", "")
  l.push("| 과목 | 진행 | 학습 | 복습 횟수 |", "|---|---|---|---|")
  for (const s of sorted) {
    const done = s.notes.filter((n) => n.studied).length
    const reviews = s.notes.reduce((a, n) => a + n.reviews.length, 0)
    const p = Math.round((done / s.notes.length) * 100)
    l.push(`| [${s.title}](../${s.name}/) | \`${bar(done, s.notes.length)}\` | ${done}/${s.notes.length} (${p}%) | ${reviews} |`)
  }
  l.push("", `복습 간격: ${INTERVALS.join("일 → ")}일 (이후 ${INTERVALS[INTERVALS.length - 1]}일 반복).`, "")
  writeFileSync(outFile, l.join("\n"))
}

console.error(`level ${level} (${xp} XP), streak ${streak}, studied ${studiedNotes.length}/${allNotes.length}, queue ${queue.length}, lesson: ${lesson ? `${lesson.subject}/${lesson.slug}` : "none"}`)

// ---------- syncRoot: 체크박스 동기화 + 홈 배너 ----------
if (syncRoot) {
  let synced = 0
  for (const s of subjects) {
    const idx = join(syncRoot, s.name, "index.md")
    let text
    try { text = readFileSync(idx, "utf8") } catch { continue }
    const studiedSlugs = new Set(s.notes.filter((n) => n.studied).map((n) => n.slug))
    const out = text.split("\n").map((line) => {
      const m = line.match(/^(\s*-\s*)\[( |x|X)\]\s*\[\[([^\]|]+)/)
      if (!m) return line
      return line.replace(/^(\s*-\s*)\[( |x|X)\]/, `$1[${studiedSlugs.has(m[3].trim()) ? "x" : " "}]`)
    }).join("\n")
    if (out !== text) { writeFileSync(idx, out); synced++ }
  }
  const home = join(syncRoot, "index.md")
  try {
    const text = readFileSync(home, "utf8")
    const end = text.startsWith("---") ? text.indexOf("\n---", 3) : -1
    const insertAt = end === -1 ? 0 : end + 4
    const withBanner = text.slice(0, insertAt) + "\n\n" + banner("study-guide/") + "\n" + text.slice(insertAt)
    writeFileSync(home, withBanner)
    console.error("injected banner into home index.md")
  } catch { /* 홈 없으면 생략 */ }
  console.error(`synced checkboxes in ${synced} index files`)
}
