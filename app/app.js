// Leonida Trophy Guide: tracker, roadmap and spoiler-free mode.
// All data comes from data/trophies.json (same origin, no network). Progress
// lives in localStorage and can be exported to a file and imported back.
const KEY = 'gta6-trophy-progress-v1';
const SPOILER_KEY = 'gta6-trophy-spoiler-v1';

// The platinum roadmap, in the order to play it. Built from the official
// descriptions and PowerPyx's roadmap: story first, then side missions,
// activities, collectibles, and a money-and-mayhem clean-up before 100%.
const ROADMAP = [
  {
    title: 'Play the story — and do the one missable thing first',
    text: 'Finish Chapters 1 to 5 and the final mission (12 story trophies plus the gold for the finale). Keep a separate save at the start of each chapter: there is no mission replay. Leave cheats off — they disable trophies and saving. In Chapter 1, after the mission Down to Earth, do Lucia\u2019s balcony meditation (see Positive Mental Attitude): it is the one trophy that may be missable.',
    trophies: 'Just Like Paradise, Paradise Lost, T**s Ass Drug Money, Vice City, Baby!, Top Of The World, Ma, You Gotta Know When to Get Off, Trust, Break the Bank, Family Matters, DWNFALL, Hi-Jacked, Snow Storm',
  },
  {
    title: 'Side missions and strangers',
    text: 'Clear the five named side strands — Andy, Kenton, Billy, Randy and Tyrone — then answer the question-mark strangers across Leonida until 8 stranger strands are done. Quest givers can go quiet mid-story; they all return in free-roam afterwards, so never force it. Hunt Bret\u2019s unique animal on the way.',
    trophies: 'Road to Rehabilitation, This Was No Boat Accident, The Lone Rider, Supply & Demand, Spin On This!, Strangers & Freaks, Fair Game',
  },
  {
    title: 'Activities and challenges',
    text: 'Work the repeatable activities: gold all 42 Shooting Range challenges, win drone races at all 14 Top Fun locations, win 20 different races, beat Cal at fishing, finish an arcade game, bowl a full game at Kolt & Associates, meditate at all 18 spots, and rack up 250 stunts and 50 challenges. Try one of each of the nine activity types for Master of None.',
    trophies: 'The Shootist, Top Fun, Earn Cash, Not Kudos, Baited My Tackle, Stick Fiddler, Let\u2019s Go Bowling, Positive Mental Attitude, Cunning Stunts, One Last Thing, Master of None',
  },
  {
    title: 'Collectibles and exploration',
    text: 'Sweep the map: all 52 areas of Leonida, 100 vehicles discovered, 3 collectible card sets, and WAiNK photos at 100 locations. Buy the 8 garage properties and register 10 vehicles to the Scooter Bros app while you are at it. Scanning 200 of 277 vehicles and studying 100 of 255 animals through binoculars counts toward 100% — do it as you go.',
    trophies: 'The Goodtime State, Whip It Good, Don\u2019t Touch My Deck, You WAiNKer!, Little Boxes, On the Spot',
  },
  {
    title: 'Money, mayhem and the 100% checklist',
    text: 'Finish the crime trophies — 5 bank vaults, an armored truck, a stealth jewelry-store robbery, 5 takedowns in one Combat Focus, the 4-star escape with your partner, 3 shops back-to-back, one illegal operation per gang — then launder $250,000 of Marked Bills and spend $100,000 in shops. Finally open Progress > Stats > 100% Completion and close the checklist for A Long Road; the platinum pops with it. Only about 60% of true completion is needed, and any 70 of the 80 challenges will do.',
    trophies: 'Maximum Withdrawal, A Classic Blitz Play, Sneakthief, Gunslinger, Hot Together, Retail Therapy, Pest Control, Dime on the Dollar, Treat Yo Self, A Long Road, Vice Got a Price!',
  },
];

const SOURCES = [
  ['PowerPyx — GTA 6 Trophy Guide & Roadmap', 'https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/'],
  ['KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap', 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/'],
  ['GameMapa — GTA 6 Trophy List', 'https://gamemapa.com/en/gta-6/guides/gta-6-trophy-achievement-list/'],
  ['Mobalytics — GTA 6 Trophy Walkthrough', 'https://mobalytics.gg/gamebase/guides/grand-theft-auto-6-all-trophies'],
  ['games.gg — Complete GTA 6 Trophy List', 'https://games.gg/grand-theft-auto-vi/guides/complete-grand-theft-auto-6-trophy-list/'],
  ['Insider Gaming — Complete GTA 6 Trophy List', 'https://insider-gaming.com/complete-gta-6-trophy-list-how-to-get-all-trophies-achievements/'],
];

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const searchEl = $('search');
const kindEl = $('kind');
const gradeEl = $('grade');
const missableEl = $('missableOnly');
const hideEarnedEl = $('hideEarned');
const spoilerEl = $('spoiler');

let earned = new Set(loadEarned());
let doc = null;
let openId = null;

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}
function saveEarned() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function spoilerOn() {
  return spoilerEl.checked;
}
function trophySpoilered(t) {
  // Spoiler-free mode hides the names and descriptions of story trophies
  // until they are earned.
  return spoilerOn() && t.kind === 'story' && !earned.has(t.name);
}

function gradeLabel(t) {
  return t.grade === 'platinum' ? 'Platinum' : t.grade[0].toUpperCase() + t.grade.slice(1);
}

function renderProgress() {
  const total = doc.trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  $('progressCount').textContent = `${n} of ${total}`;
  const ring = $('progressRing');
  ring.textContent = `${pct}%`;
  ring.style.background = `conic-gradient(var(--teal) ${pct * 3.6}deg, #e5e7eb 0deg)`;
  ring.setAttribute('aria-label', `${n} of ${total} trophies earned, ${pct} percent`);
  const byGrade = {};
  for (const t of doc.trophies) {
    if (earned.has(t.name)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  }
  $('progressGrades').textContent =
    ['platinum', 'gold', 'silver', 'bronze']
      .map((g) => `${byGrade[g] ?? 0} ${g}`)
      .join(' · ');
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (missableEl.checked && !t.missable) return false;
  if (hideEarnedEl.checked && earned.has(t.name)) return false;
  return true;
}

function renderList() {
  listEl.replaceChildren();
  let shown = 0;
  for (const t of doc.trophies) {
    if (!trophyMatches(t)) continue;
    shown += 1;
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.name) ? ' earned' : '');
    li.dataset.trophyId = String(t.id);
    if (trophySpoilered(t)) li.classList.add('spoiler-hidden');
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'trophy-check';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveEarned();
      renderProgress();
      renderList();
    });
    const main = document.createElement('div');
    main.className = 'trophy-main';
    const name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = trophySpoilered(t) ? 'Hidden story trophy — earn it to reveal' : t.name;
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = trophySpoilered(t)
      ? 'Its name and description are hidden until earned.'
      : t.description;
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    const badge = document.createElement('span');
    badge.className = `badge ${t.grade}`;
    badge.textContent = gradeLabel(t);
    meta.append(badge);
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = t.kind === 'story' ? 'Story' : t.kind === 'side' ? 'Side mission' : t.kind === 'collectible' ? 'Collectible' : t.kind === 'activity' ? 'Activity' : t.kind === 'combat' ? 'Combat & crime' : t.kind === 'world' ? 'World & money' : 'Platinum';
    meta.append(kindTag);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'Possibly missable';
      meta.append(m);
    }
    if (t.hidden) {
      const h = document.createElement('span');
      h.className = 'tag hidden-tag';
      h.textContent = 'Hidden on PSN';
      meta.append(h);
    }
    if (t.count) {
      const c = document.createElement('span');
      c.className = 'tag count';
      c.textContent = `Target: ${t.count.toLocaleString('en-US')}`;
      meta.append(c);
    }
    main.append(name, desc, meta);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = openId === t.id ? 'Hide guide ▲' : 'Show guide ▼';
    toggle.setAttribute('aria-expanded', String(openId === t.id));
    toggle.addEventListener('click', () => {
      openId = openId === t.id ? null : t.id;
      renderList();
    });
    main.append(toggle);
    if (openId === t.id && !trophySpoilered(t)) {
      const guide = document.createElement('div');
      guide.className = 'guide';
      const p = document.createElement('p');
      p.textContent = t.guide;
      guide.append(p);
      if (t.guide.includes('UNCONFIRMED')) {
        const warn = document.createElement('p');
        warn.innerHTML = '<span class="unconfirmed">Unconfirmed:</span> the community guides have not pinned this one down yet — check the sources below for updates.';
        guide.append(warn);
      }
      const ol = document.createElement('ol');
      for (const step of t.steps) {
        const s = document.createElement('li');
        s.textContent = step;
        ol.append(s);
      }
      guide.append(ol);
      const src = document.createElement('p');
      src.className = 'guide-sources';
      src.textContent = 'Sources: ';
      t.sources.forEach((s, i) => {
        if (i > 0) src.append(document.createTextNode(' · '));
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        a.rel = 'noopener';
        src.append(a);
      });
      guide.append(src);
      main.append(guide);
    }
    head.append(box, main);
    li.append(head);
    listEl.append(li);
  }
  $('resultCount').textContent = `Showing ${shown} of ${doc.trophies.length} trophies · ${earned.size} earned`;
  $('emptyNote').hidden = shown !== 0;
}

function renderRoadmap() {
  const ol = $('roadmapList');
  ol.replaceChildren();
  for (const stage of ROADMAP) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const names = document.createElement('p');
    names.className = 'trophy-names';
    names.textContent = `Trophies: ${stage.trophies}.`;
    li.append(h, p, names);
    ol.append(li);
  }
}

function renderSources() {
  const ul = $('sourceList');
  ul.replaceChildren();
  for (const [name, url] of SOURCES) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.textContent = name;
    a.rel = 'noopener';
    li.append(a);
    ul.append(li);
  }
}

function showView(view) {
  for (const v of ['tracker', 'roadmap', 'about']) {
    $(`view-${v}`).hidden = v !== view;
    $(`tab${v[0].toUpperCase()}${v.slice(1)}`).classList.toggle('active', v === view);
  }
  if (view === 'roadmap') location.hash = '#roadmap';
  else if (location.hash === '#roadmap') history.replaceState(null, '', location.pathname + location.search);
}

function applyUrlState() {
  const params = new URLSearchParams(location.search);
  const trophyId = Number(params.get('trophy'));
  if (trophyId) openId = trophyId;
  if (params.get('spoiler') === '1') spoilerEl.checked = true;
  if (location.hash === '#roadmap') showView('roadmap');
}

for (const [id, fn] of [
  ['tabTracker', () => showView('tracker')],
  ['tabRoadmap', () => showView('roadmap')],
  ['tabAbout', () => showView('about')],
]) $(id).addEventListener('click', fn);

for (const el of [searchEl, kindEl, gradeEl, missableEl, hideEarnedEl, spoilerEl]) {
  el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', renderList);
}
spoilerEl.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? '1' : '0');
  renderList();
});
try {
  spoilerEl.checked = localStorage.getItem(SPOILER_KEY) === '1';
} catch { /* private mode: spoiler setting just does not persist */ }

$('missableAlert').querySelector('[data-open-trophy]').addEventListener('click', (e) => {
  openId = Number(e.currentTarget.dataset.openTrophy);
  showView('tracker');
  renderList();
  const target = listEl.querySelector('.trophy .guide-toggle');
  if (target) target.scrollIntoView({ block: 'center' });
});

$('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    earned = new Set(names.filter((n) => typeof n === 'string'));
    saveEarned();
    renderProgress();
    renderList();
  } catch {
    alert('That file is not a trophy progress export.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (!earned.size) return;
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveEarned();
    renderProgress();
    renderList();
  }
});

doc = await (await fetch('data/trophies.json')).json();
applyUrlState();
renderProgress();
renderRoadmap();
renderSources();
renderList();
// A deep link to one trophy (for example ?trophy=28) opens its guide and
// scrolls it into view, so the guide is what the reader lands on.
if (openId) {
  const target = listEl.querySelector(`[data-trophy-id="${openId}"]`);
  if (target) target.scrollIntoView({ block: 'start' });
}
