#!/usr/bin/env node
// Writes the data behind the Learn Hub Tracker dashboard: one row per lesson (live and planned), one per
// path, one per module, plus site totals and branch status.
//
//   node scripts/dev/tracker.js [out-dir]     default out-dir: /tmp/learn-tracker
//
// Branch rows come from `merge-queue.js status --json`, so run it from the repo root with the
// content/* branches fetched (merge-queue fetches them itself).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const out = path.resolve(process.argv[2] || '/tmp/learn-tracker');
fs.mkdirSync(out, { recursive: true });
const FILES = ['concepts', 'regression', 'classification', 'clustering', 'neural', 'sequences', 'language', 'statistics', 'datascience', 'mltoolbox', 'deeplearning', 'vision', 'nlp', 'ai'];
const TRACKS = { stats: 'Statistics', ml: 'Machine learning', ds: 'Data science', dl: 'Deep learning', cv: 'Computer vision', nlp: 'NLP', ai: 'AI' };
const LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced'];
const SITE = 'https://yogesh660.github.io/ml-model-zoo/';
const slug = t => t.replace(/ ⚙$/, '').normalize('NFKD').toLowerCase().replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const plain = s => String(s || '').replace(/\$+([^$]*)\$+/g, '$1').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const byId = {};
for (const f of FILES) for (const l of require(path.resolve('content', f))) byId[l.id] = { ...l, file: f };
const curriculum = require(path.resolve('content/curriculum.js'));
// curriculum.js swaps a planned entry for its id once the lesson is written, which drops its tier; load a copy
// that keeps every entry as [title, tier] to recover it. Lessons listed by id from the start are "Original".
const TIER = {};
{
  const src = fs.readFileSync('content/curriculum.js', 'utf8').replace("LIVE.has(slug(x)) ? slug(x) : [x, tier]", '[x, tier]');
  const m = { exports: {} };
  new Function('module', 'exports', 'require', src)(m, m.exports, f => require(path.resolve('content', f)));
  for (const p of m.exports) for (const md of p.modules) for (const e of md.lessons) if (Array.isArray(e)) TIER[slug(e[0])] = e[1];
}

// a lesson is "Complete" once it is live with a full levelled quiz (12 questions, every one tagged d:1–3)
const lessons = [];
for (const p of curriculum) p.modules.forEach((m, mi) => m.lessons.forEach(e => {
  const base = { path: `${p.num} ${p.title}`, path_id: p.id, track: TRACKS[p.track], module: m.title, module_no: mi + 1, order: lessons.length + 1 };
  if (Array.isArray(e)) {
    const id = slug(e[0]);
    lessons.push({ ...base, id, title: e[0].replace(/ ⚙$/, ''), status: 'Planned', tier: e[1], kind: 'Concept', level: '', minutes: null, questions: 0, q_easy: 0, q_medium: 0, q_hard: 0, q_untagged: 0, lab: /⚙$/.test(e[0]) ? 'Planned' : 'No', walkthrough: 'No', diagram: 'No', real_data: 'No', file: '', url: `${SITE}concepts/${id}/` });
    return;
  }
  const l = byId[e], q = l.quiz || [], d = [0, 0, 0, 0];
  q.forEach(x => d[[1, 2, 3].includes(x.d) ? x.d : 0]++);
  const kind = l.task === 'concepts' ? 'concepts' : 'models';
  const status = q.length >= 12 && d[0] === 0 ? 'Complete' : 'Live';
  lessons.push({ ...base, id: l.id, title: plain(l.title), status, tier: TIER[l.id] || 'Original', kind: kind === 'models' ? 'Model' : 'Concept', level: LEVELS[l.level], minutes: l.minutes, questions: q.length, q_easy: d[1], q_medium: d[2], q_hard: d[3], q_untagged: d[0], lab: l.noLab ? 'No' : 'Yes', walkthrough: l.explainer ? 'Yes' : 'No', diagram: l.architecture ? 'Yes' : 'No', real_data: fs.existsSync(`models/${l.id}/metrics.json`) ? 'Yes' : 'No', file: `content/${l.file}.js`, url: `${SITE}${kind}/${l.id}/` });
}));

const tally = rows => {
  const live = rows.filter(r => r.status !== 'Planned');
  const n = k => live.reduce((s, r) => s + (r[k] || 0), 0);
  return {
    lessons: rows.length, live: live.length, complete: rows.filter(r => r.status === 'Complete').length, live_only: rows.filter(r => r.status === 'Live').length, planned: rows.length - live.length,
    planned_core: rows.filter(r => r.status === 'Planned' && r.tier === 'Core').length, planned_extended: rows.filter(r => r.status === 'Planned' && r.tier === 'Extended').length, planned_capstone: rows.filter(r => r.status === 'Planned' && r.tier === 'Capstone').length,
    beginner: live.filter(r => r.level === 'Beginner').length, intermediate: live.filter(r => r.level === 'Intermediate').length, advanced: live.filter(r => r.level === 'Advanced').length,
    minutes: n('minutes'), questions: n('questions'), q_easy: n('q_easy'), q_medium: n('q_medium'), q_hard: n('q_hard'), q_untagged: n('q_untagged'),
    labs: live.filter(r => r.lab === 'Yes').length, labs_planned: rows.filter(r => r.lab === 'Planned').length, walkthroughs: live.filter(r => r.walkthrough === 'Yes').length, diagrams: live.filter(r => r.diagram === 'Yes').length, real_data: live.filter(r => r.real_data === 'Yes').length,
    short_quiz: live.filter(r => r.questions < 12).length,
  };
};
const paths = curriculum.map(p => ({ path: `${p.num} ${p.title}`, path_id: p.id, track: TRACKS[p.track], modules: p.modules.length, ...tally(lessons.filter(r => r.path_id === p.id)) }));
const modules = [];
curriculum.forEach(p => p.modules.forEach((m, mi) => modules.push({ key: `${p.id}/${mi + 1}`, path: `${p.num} ${p.title}`, module: m.title, ...tally(lessons.filter(r => r.path_id === p.id && r.module_no === mi + 1)) })));

const mq = JSON.parse(execSync('node scripts/dev/merge-queue.js status --json', { maxBuffer: 1 << 26 }).toString());
const onGithub = new Set(mq.branches.map(b => b.branch));
let prev = [];
try { prev = JSON.parse(fs.readFileSync(path.join(out, 'branches.json'), 'utf8')); } catch (e) { /* first run */ }
const branches = mq.branches.map(b => ({
  branch: b.branch, kind: b.kind === 'quizzes' ? 'Quizzes' : b.kind === 'lessons' ? 'Lessons' : 'Other',
  new_lessons: b.kind === 'lessons' ? b.total : null, merged: b.kind === 'lessons' ? b.merged : null, pending: b.kind === 'lessons' ? b.pending : (b.ahead || 0),
  status: b.done ? 'Ready to delete' : 'In progress', on_github: true,
}));
// branches that were tracked before but have since been deleted on GitHub stay in the list as "Deleted"
for (const r of prev) if (!onGithub.has(r.branch)) branches.push({ ...r, status: 'Deleted', on_github: false, pending: 0 });

const t = tally(lessons);
const summary = [{ live_lessons: t.live, planned_left: t.planned, written_not_merged: mq.summary.writtenButNotMerged, total_lessons: t.lessons, complete: t.complete, questions: t.questions, minutes: t.minutes, paths: paths.length, modules: modules.length, commit: execSync('git rev-parse --short HEAD').toString().trim(), generated: new Date().toISOString() }];

for (const [name, rows] of Object.entries({ lessons, paths, modules, branches, summary })) fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(rows));
console.log(`wrote ${out}: ${lessons.length} lessons (${t.live} live, ${t.complete} complete, ${t.planned} planned), ${paths.length} paths, ${modules.length} modules, ${branches.length} branches`);
