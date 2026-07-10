#!/usr/bin/env node
// 각 과목 index.md의 체크박스(- [x] / - [ ] [[note]])를 집계해 진도 대시보드 마크다운을 생성한다.
// 사용: node scripts/gen-dashboard.mjs [repoRoot] [outFile]
// 기본 출력: <repoRoot>/study-guide/dashboard.md
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import { join } from "node:path"

const repoRoot = process.argv[2] || "."
const outFile = process.argv[3] || join(repoRoot, "study-guide", "dashboard.md")

const SKIP = new Set([".git", ".github", "node_modules", "scripts", "study-guide"])

function titleOf(indexPath, fallback) {
  const text = readFileSync(indexPath, "utf8")
  const m = text.match(/^title:\s*"?(.+?)"?\s*$/m)
  return m ? m[1].trim() : fallback
}

function countChecks(indexPath) {
  const text = readFileSync(indexPath, "utf8")
  let done = 0, total = 0
  for (const line of text.split("\n")) {
    // 노트 항목만: "- [x] [[...]]" / "- [ ] [[...]]"
    const m = line.match(/^\s*-\s*\[( |x|X)\]\s*\[\[/)
    if (!m) continue
    total++
    if (m[1].toLowerCase() === "x") done++
  }
  return { done, total }
}

function bar(done, total, width = 20) {
  if (total === 0) return "─".repeat(width)
  const filled = Math.round((done / total) * width)
  return "█".repeat(filled) + "░".repeat(width - filled)
}

const rows = []
for (const name of readdirSync(repoRoot).sort()) {
  if (SKIP.has(name)) continue
  const dir = join(repoRoot, name)
  let st
  try { st = statSync(dir) } catch { continue }
  if (!st.isDirectory()) continue
  const indexPath = join(dir, "index.md")
  try { statSync(indexPath) } catch { continue }
  const { done, total } = countChecks(indexPath)
  if (total === 0) continue
  rows.push({ name, title: titleOf(indexPath, name), done, total })
}

const totalDone = rows.reduce((a, r) => a + r.done, 0)
const totalAll = rows.reduce((a, r) => a + r.total, 0)
const pct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0

// 완료율 낮은 순으로 정렬 (다음에 볼 것이 위로)
rows.sort((a, b) => a.done / a.total - b.done / b.total || a.title.localeCompare(b.title))

const lines = []
lines.push("---")
lines.push('title: "진도 대시보드"')
lines.push("---")
lines.push("")
lines.push("# 진도 대시보드")
lines.push("")
lines.push("> 이 페이지는 각 과목 `index.md`의 체크박스에서 빌드 시 자동 생성됩니다. 직접 편집하지 마세요.")
lines.push("")
lines.push(`## 전체: ${totalDone} / ${totalAll} (${pct}%)`)
lines.push("")
lines.push("```")
lines.push(`${bar(totalDone, totalAll, 40)} ${pct}%`)
lines.push("```")
lines.push("")
lines.push("완료율 낮은 순 (다음에 볼 과목이 위로).")
lines.push("")
lines.push("| 과목 | 진행 | 완료 |")
lines.push("|---|---|---|")
for (const r of rows) {
  const p = Math.round((r.done / r.total) * 100)
  lines.push(`| [${r.title}](../${r.name}/) | \`${bar(r.done, r.total)}\` | ${r.done}/${r.total} (${p}%) |`)
}
lines.push("")

writeFileSync(outFile, lines.join("\n"))
console.error(`wrote ${outFile}: ${rows.length} subjects, ${totalDone}/${totalAll} (${pct}%)`)
