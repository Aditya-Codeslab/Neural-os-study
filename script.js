/* ---------------- storage ---------------- */
const STORE_KEY = 'fieldbook_data_v1';
const defaultData = {
  profile:{name:'',course:'',sem:'',college:'',roll:''},
  studylog:[], goals:[], subjects:[], coding:[], revision:[],
  habits:[], habitLog:{}, money:[], cgpa:[], exams:[], notes:[], theme:'fieldbook',
  customBg:null, customBgGallery:[], activeBgId:null, bgRandomOnLoad:false
};
function loadData(){
  try{ const raw = localStorage.getItem(STORE_KEY); return raw ? {...defaultData, ...JSON.parse(raw)} : {...defaultData}; }
  catch(e){ return {...defaultData}; }
}
let data = loadData();
if(data.customBg && (!data.customBgGallery || !data.customBgGallery.length)){
  const migrated = {id:uid(), src:data.customBg, name:'background', kind:'image'};
  data.customBgGallery = [migrated];
  data.activeBgId = migrated.id;
}
if(!data.customBgGallery) data.customBgGallery = [];
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(data)); if(fileHandle) writeToFile(); }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

/* ---------------- nav ---------------- */
const sections = [
  {id:'dashboard', label:'Dashboard'},
  {id:'profile', label:'Student Profile'},
  {id:'studylog', label:'Daily Study Log'},
  {id:'goals', label:'Goals'},
  {id:'subjects', label:'Subjects'},
  {id:'coding', label:'Coding Tracker'},
  {id:'revision', label:'Revision Tracker'},
  {id:'habits', label:'Habit Tracker'},
  {id:'money', label:'Money Manager'},
  {id:'cgpa', label:'CGPA Tracker'},
  {id:'exams', label:'Upcoming Exams'},
  {id:'notes', label:'Notes'},
  {id:'focus', label:'Focus Mode'},
  {id:'backup', label:'Backup & Restore'},
  {id:'appearance', label:'Appearance'},
];
const navEl = document.getElementById('nav');
sections.forEach(s=>{
  const b = document.createElement('button');
  b.innerHTML = `<span class="dot"></span>${s.label}`;
  b.dataset.id = s.id;
  b.onclick = ()=>showSection(s.id);
  navEl.appendChild(b);
});
function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active', s.dataset.section===id));
  document.querySelectorAll('.rail-nav button').forEach(b=>b.classList.toggle('active', b.dataset.id===id));
  const s = sections.find(x=>x.id===id);
  document.getElementById('section-title').textContent = s.label;
  if(id==='dashboard') renderDashboard();
}

/* ---------------- clock ---------------- */
function tickClock(){
  const now = new Date();
  document.getElementById('clock-time').textContent = now.toLocaleTimeString('en-GB');
  document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US',{weekday:'long', day:'numeric', month:'long', year:'numeric'});
}
setInterval(tickClock, 1000); tickClock();

/* ---------------- profile ---------------- */
function fillProfile(){
  document.getElementById('p-name').value = data.profile.name||'';
  document.getElementById('p-course').value = data.profile.course||'';
  document.getElementById('p-sem').value = data.profile.sem||'';
  document.getElementById('p-college').value = data.profile.college||'';
  document.getElementById('p-roll').value = data.profile.roll||'';
}
function saveProfile(){
  data.profile = {
    name:document.getElementById('p-name').value,
    course:document.getElementById('p-course').value,
    sem:document.getElementById('p-sem').value,
    college:document.getElementById('p-college').value,
    roll:document.getElementById('p-roll').value,
  };
  save();
}

/* ---------------- study log ---------------- */
function addStudyLog(e){
  e.preventDefault();
  data.studylog.unshift({
    id:uid(),
    date:document.getElementById('sl-date').value,
    subject:document.getElementById('sl-subject').value,
    hours:parseFloat(document.getElementById('sl-hours').value)||0,
    notes:document.getElementById('sl-notes').value
  });
  e.target.reset(); save(); renderStudyLog();
}
function deleteItem(list, id, rerender){ data[list] = data[list].filter(x=>x.id!==id); save(); rerender(); }
function renderStudyLog(){
  const el = document.getElementById('sl-list');
  if(!data.studylog.length){ el.innerHTML='<p class="empty">No study sessions logged yet.</p>'; return; }
  el.innerHTML = data.studylog.map(it=>`
    <div class="row">
      <div><div class="row-main">${esc(it.subject)}</div><div class="row-sub">${it.date} · ${it.hours} hrs${it.notes?' · '+esc(it.notes):''}</div></div>
      <button class="btn btn-ghost btn-sm" onclick="deleteItem('studylog','${it.id}',renderStudyLog)">Remove</button>
    </div>`).join('');
}

/* ---------------- goals ---------------- */
function addGoal(e){
  e.preventDefault();
  data.goals.unshift({id:uid(), title:document.getElementById('g-title').value, due:document.getElementById('g-due').value, done:false});
  e.target.reset(); save(); renderGoals();
}
function toggleGoal(id){ const g=data.goals.find(x=>x.id===id); g.done=!g.done; save(); renderGoals(); }
function renderGoals(){
  const el = document.getElementById('g-list');
  if(!data.goals.length){ el.innerHTML='<p class="empty">No goals yet — add your first one above.</p>'; return; }
  el.innerHTML = data.goals.map(g=>`
    <div class="row">
      <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
        <input type="checkbox" ${g.done?'checked':''} onchange="toggleGoal('${g.id}')">
        <span style="${g.done?'text-decoration:line-through;color:var(--ink-soft);':''}">${esc(g.title)}</span>
        ${g.due?`<span class="row-sub">due ${g.due}</span>`:''}
      </label>
      <button class="btn btn-ghost btn-sm" onclick="deleteItem('goals','${g.id}',renderGoals)">Remove</button>
    </div>`).join('');
}

/* ---------------- subjects ---------------- */
function addSubject(e){
  e.preventDefault();
  data.subjects.unshift({id:uid(), name:document.getElementById('sub-name').value, progress:parseInt(document.getElementById('sub-progress').value)||0});
  e.target.reset(); save(); renderSubjects();
}
function renderSubjects(){
  const el = document.getElementById('sub-list');
  if(!data.subjects.length){ el.innerHTML='<p class="empty">No subjects added yet.</p>'; return; }
  el.innerHTML = data.subjects.map(s=>`
    <div class="row" style="display:block;">
      <div style="display:flex; justify-content:space-between;">
        <span class="row-main">${esc(s.name)}</span>
        <span class="row-sub">${s.progress}% <button class="btn btn-ghost btn-sm" style="margin-left:8px;" onclick="deleteItem('subjects','${s.id}',renderSubjects)">Remove</button></span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${s.progress}%;"></div></div>
    </div>`).join('');
}

/* ---------------- coding ---------------- */
function addCoding(e){
  e.preventDefault();
  data.coding.unshift({id:uid(), date:document.getElementById('cd-date').value, platform:document.getElementById('cd-platform').value, count:parseInt(document.getElementById('cd-count').value)||0});
  e.target.reset(); save(); renderCoding();
}
function renderCoding(){
  const days = last7Days();
  const counts = days.map(d=> data.coding.filter(c=>c.date===d).reduce((a,b)=>a+b.count,0));
  const labels = days.map(d=> new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}));
  renderBarChart('cd-chart', labels, counts, 'var(--accent)');
  const el = document.getElementById('cd-list');
  if(!data.coding.length){ el.innerHTML='<p class="empty">No coding sessions logged yet.</p>'; return; }
  el.innerHTML = data.coding.map(c=>`
    <div class="row">
      <div><div class="row-main">${esc(c.platform)}</div><div class="row-sub">${c.date} · ${c.count} solved</div></div>
      <button class="btn btn-ghost btn-sm" onclick="deleteItem('coding','${c.id}',renderCoding)">Remove</button>
    </div>`).join('');
}

/* ---------------- revision ---------------- */
function addRevision(e){
  e.preventDefault();
  data.revision.unshift({id:uid(), topic:document.getElementById('rv-topic').value, status:document.getElementById('rv-status').value});
  e.target.reset(); save(); renderRevision();
}
function cycleRevision(id){
  const r = data.revision.find(x=>x.id===id);
  const order=['pending','revising','done'];
  r.status = order[(order.indexOf(r.status)+1)%order.length];
  save(); renderRevision();
}
function renderRevision(){
  const el = document.getElementById('rv-list');
  if(!data.revision.length){ el.innerHTML='<p class="empty">No topics added yet.</p>'; return; }
  const cls={pending:'bad',revising:'warn',done:'good'};
  el.innerHTML = data.revision.map(r=>`
    <div class="row">
      <div class="row-main">${esc(r.topic)}</div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="tag ${cls[r.status]}" style="cursor:pointer;" onclick="cycleRevision('${r.id}')">${r.status}</span>
        <button class="btn btn-ghost btn-sm" onclick="deleteItem('revision','${r.id}',renderRevision)">Remove</button>
      </div>
    </div>`).join('');
}

/* ---------------- habits ---------------- */
function weekKey(){
  const d = new Date();
  const day = (d.getDay()+6)%7; // Monday=0
  const monday = new Date(d); monday.setDate(d.getDate()-day);
  return monday.toISOString().slice(0,10);
}
function addHabit(e){
  e.preventDefault();
  data.habits.push({id:uid(), name:document.getElementById('h-name').value});
  e.target.reset(); save(); renderHabits();
}
function toggleHabitDay(hid, dayIdx){
  const wk = weekKey();
  data.habitLog[wk] = data.habitLog[wk] || {};
  data.habitLog[wk][hid] = data.habitLog[wk][hid] || [false,false,false,false,false,false,false];
  data.habitLog[wk][hid][dayIdx] = !data.habitLog[wk][hid][dayIdx];
  save(); renderHabits();
}
function renderHabits(){
  const head = document.getElementById('habit-head');
  head.innerHTML = '<span></span>'+['M','T','W','T','F','S','S'].map(d=>`<span>${d}</span>`).join('')+'<span></span>';
  const el = document.getElementById('h-list');
  if(!data.habits.length){ el.innerHTML='<p class="empty">No habits tracked yet.</p>'; return; }
  const wk = weekKey();
  const wkLog = data.habitLog[wk] || {};
  el.innerHTML = data.habits.map(h=>{
    const days = wkLog[h.id] || [false,false,false,false,false,false,false];
    const boxes = days.map((on,i)=>`<div class="day-box ${on?'on':''}" onclick="toggleHabitDay('${h.id}',${i})">${on?'✓':''}</div>`).join('');
    return `<div class="habit-row"><span class="row-main">${esc(h.name)}</span>${boxes}<button class="btn btn-ghost btn-sm" onclick="deleteItem('habits','${h.id}',renderHabits)">✕</button></div>`;
  }).join('');
}

/* ---------------- money ---------------- */
function addMoney(e){
  e.preventDefault();
  data.money.unshift({id:uid(), date:document.getElementById('mn-date').value, type:document.getElementById('mn-type').value, desc:document.getElementById('mn-desc').value, amount:parseFloat(document.getElementById('mn-amount').value)||0});
  e.target.reset(); save(); renderMoney();
}
function renderMoney(){
  const income = data.money.filter(m=>m.type==='income').reduce((a,b)=>a+b.amount,0);
  const expense = data.money.filter(m=>m.type==='expense').reduce((a,b)=>a+b.amount,0);
  document.getElementById('m-income').textContent = '₹'+income.toLocaleString();
  document.getElementById('m-expense').textContent = '₹'+expense.toLocaleString();
  document.getElementById('m-balance').textContent = '₹'+(income-expense).toLocaleString();
  renderDonut('mn-donut', [{label:'Income',value:income,colorVar:'var(--good)'},{label:'Expense',value:expense,colorVar:'var(--bad)'}], ((income-expense)>=0?'₹':'-₹')+Math.abs(income-expense).toLocaleString());
  renderLegend('mn-legend', [{label:'Income',value:income,colorVar:'var(--good)'},{label:'Expense',value:expense,colorVar:'var(--bad)'}]);
  const el = document.getElementById('mn-list');
  if(!data.money.length){ el.innerHTML='<p class="empty">No transactions yet.</p>'; return; }
  el.innerHTML = data.money.map(m=>`
    <div class="row">
      <div><div class="row-main">${esc(m.desc)}</div><div class="row-sub">${m.date}</div></div>
      <div style="display:flex; align-items:center; gap:10px;">
        <span class="mono" style="color:${m.type==='income'?'var(--good)':'var(--bad)'};">${m.type==='income'?'+':'-'}₹${m.amount.toLocaleString()}</span>
        <button class="btn btn-ghost btn-sm" onclick="deleteItem('money','${m.id}',renderMoney)">Remove</button>
      </div>
    </div>`).join('');
}

/* ---------------- cgpa ---------------- */
function addCgpa(e){
  e.preventDefault();
  data.cgpa.push({id:uid(), sem:document.getElementById('cg-sem').value, gpa:parseFloat(document.getElementById('cg-gpa').value)||0});
  e.target.reset(); save(); renderCgpa();
}
function renderCgpa(){
  const el = document.getElementById('cg-list');
  if(!data.cgpa.length){ el.innerHTML='<p class="empty">No semesters added yet.</p>'; document.getElementById('cg-overall').textContent='—'; document.getElementById('cg-chart').innerHTML=''; return; }
  el.innerHTML = data.cgpa.map(c=>`
    <div class="row">
      <div class="row-main">${esc(c.sem)}</div>
      <div style="display:flex; align-items:center; gap:10px;">
        <span class="mono">${c.gpa.toFixed(2)}</span>
        <button class="btn btn-ghost btn-sm" onclick="deleteItem('cgpa','${c.id}',renderCgpa)">Remove</button>
      </div>
    </div>`).join('');
  const avg = data.cgpa.reduce((a,b)=>a+b.gpa,0)/data.cgpa.length;
  document.getElementById('cg-overall').textContent = avg.toFixed(2);
  renderBarChart('cg-chart', data.cgpa.map(c=>c.sem), data.cgpa.map(c=>c.gpa), 'var(--accent)');
}

/* ---------------- exams ---------------- */
function addExam(e){
  e.preventDefault();
  data.exams.push({id:uid(), name:document.getElementById('ex-name').value, date:document.getElementById('ex-date').value});
  e.target.reset(); save(); renderExams();
}
function daysLeft(dateStr){
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(dateStr);
  return Math.round((d-now)/86400000);
}
function renderExams(){
  const el = document.getElementById('ex-list');
  const sorted = [...data.exams].sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(!sorted.length){ el.innerHTML='<p class="empty">No exams scheduled yet.</p>'; return; }
  el.innerHTML = sorted.map(x=>{
    const dl = daysLeft(x.date);
    const cls = dl<0 ? 'bad' : dl<=7 ? 'warn' : 'good';
    const label = dl<0 ? 'passed' : dl===0 ? 'today' : dl+' days left';
    return `<div class="row">
      <div><div class="row-main">${esc(x.name)}</div><div class="row-sub">${x.date}</div></div>
      <div style="display:flex; align-items:center; gap:10px;">
        <span class="tag ${cls}">${label}</span>
        <button class="btn btn-ghost btn-sm" onclick="deleteItem('exams','${x.id}',renderExams)">Remove</button>
      </div>
    </div>`;
  }).join('');
}

/* ---------------- notes ---------------- */
function addNote(e){
  e.preventDefault();
  data.notes.unshift({id:uid(), title:document.getElementById('n-title').value, body:document.getElementById('n-body').value, date:new Date().toISOString().slice(0,10)});
  e.target.reset(); save(); renderNotes();
}
function renderNotes(){
  const el = document.getElementById('n-list');
  if(!data.notes.length){ el.innerHTML='<p class="empty">No notes yet.</p>'; return; }
  el.innerHTML = data.notes.map(n=>`
    <div class="row" style="display:block;">
      <div style="display:flex; justify-content:space-between;">
        <span class="row-main">${esc(n.title)}</span>
        <span><span class="row-sub">${n.date}</span> <button class="btn btn-ghost btn-sm" onclick="deleteItem('notes','${n.id}',renderNotes)">Remove</button></span>
      </div>
      ${n.body?`<p style="font-size:.82rem; margin:6px 0 0; color:var(--ink);">${esc(n.body)}</p>`:''}
    </div>`).join('');
}

/* ---------------- charts (dependency-free inline SVG) ---------------- */
function last7Days(){
  const days=[];
  for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); days.push(d.toISOString().slice(0,10)); }
  return days;
}
function renderBarChart(containerId, labels, values, colorVar){
  const el = document.getElementById(containerId); if(!el) return;
  const max = Math.max(1, ...values);
  const w=320, h=130, n=Math.max(values.length,1), gap=w/n, barW=Math.min(34, gap*0.55);
  const bars = values.map((v,i)=>{
    const bh = max ? (v/max)*(h-30) : 0;
    const x = i*gap + (gap-barW)/2;
    const y = h-26-bh;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(bh,v>0?2:0).toFixed(1)}" rx="3" style="fill:${colorVar}"></rect>
      <text x="${(x+barW/2).toFixed(1)}" y="${h-10}" text-anchor="middle" font-size="9" style="fill:var(--ink-soft)" font-family="'JetBrains Mono',monospace">${labels[i]}</text>
      ${v>0?`<text x="${(x+barW/2).toFixed(1)}" y="${(y-4).toFixed(1)}" text-anchor="middle" font-size="9" style="fill:var(--ink)" font-family="'JetBrains Mono',monospace">${v}</text>`:''}`;
  }).join('');
  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%; height:140px; display:block;">${bars}</svg>`;
}
function renderDonut(containerId, segments, centerLabel){
  const el = document.getElementById(containerId); if(!el) return;
  const total = segments.reduce((a,b)=>a+b.value,0);
  const r=44, cx=60, cy=60, strokeW=15;
  const circumference = 2*Math.PI*r;
  let offsetDeg = -90, circles = '';
  if(total>0){
    circles = segments.filter(s=>s.value>0).map(seg=>{
      const frac = seg.value/total;
      const dash = frac*circumference;
      const gapLen = circumference-dash;
      const rotate = offsetDeg;
      offsetDeg += frac*360;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:${seg.colorVar}" stroke-width="${strokeW}" stroke-dasharray="${dash.toFixed(1)} ${gapLen.toFixed(1)}" transform="rotate(${rotate.toFixed(1)} ${cx} ${cy})"></circle>`;
    }).join('');
  }
  el.innerHTML = `<svg viewBox="0 0 120 120" style="width:120px; height:120px;">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--paper-line)" stroke-width="${strokeW}"></circle>
    ${circles}
    <text x="60" y="65" text-anchor="middle" font-size="13" font-weight="700" style="fill:var(--ink)" font-family="'JetBrains Mono',monospace">${centerLabel}</text>
  </svg>`;
}
function renderLegend(containerId, segments){
  const el = document.getElementById(containerId); if(!el) return;
  el.innerHTML = segments.map(s=>`
    <div style="display:flex; align-items:center; gap:6px; margin-bottom:5px; font-size:.78rem;">
      <span style="width:9px; height:9px; border-radius:50%; background:${s.colorVar}; display:inline-block;"></span>
      <span style="color:var(--ink-soft);">${s.label}</span>
      <span class="mono" style="margin-left:auto; color:var(--ink);">₹${s.value.toLocaleString()}</span>
    </div>`).join('');
}
function renderRadial(containerId, pct, colorVar, label){
  const el = document.getElementById(containerId); if(!el) return;
  const r=44, cx=60, cy=60, strokeW=13;
  const circumference = 2*Math.PI*r;
  const dash = (Math.max(0,Math.min(100,pct))/100)*circumference;
  el.innerHTML = `<div style="text-align:center;">
    <svg viewBox="0 0 120 120" style="width:120px; height:120px;">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--paper-line)" stroke-width="${strokeW}"></circle>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:${colorVar}" stroke-width="${strokeW}" stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${circumference.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"></circle>
      <text x="60" y="66" text-anchor="middle" font-size="17" font-weight="700" style="fill:var(--ink)" font-family="'JetBrains Mono',monospace">${Math.round(pct)}%</text>
    </svg>
    <p style="font-size:.72rem; color:var(--ink-soft); margin:2px 0 0;">${label}</p>
  </div>`;
}

/* ---------------- dashboard ---------------- */
function computeStreak(){
  const dates = new Set(data.studylog.map(l=>l.date));
  let streak=0; let d = new Date(); d.setHours(0,0,0,0);
  while(dates.has(d.toISOString().slice(0,10))){ streak++; d.setDate(d.getDate()-1); }
  return streak;
}
function renderDashboard(){
  document.getElementById('d-streak').textContent = computeStreak()+' days';
  const totalHrs = data.studylog.reduce((a,b)=>a+b.hours,0);
  document.getElementById('d-hours').textContent = totalHrs;
  document.getElementById('d-goals').textContent = data.goals.filter(g=>!g.done).length;
  const upcoming = [...data.exams].filter(x=>daysLeft(x.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
  document.getElementById('d-exam').textContent = upcoming ? `${upcoming.name} — ${daysLeft(upcoming.date)}d` : '—';

  const today = new Date().toISOString().slice(0,10);
  const todays = data.studylog.filter(l=>l.date===today);
  const dtl = document.getElementById('d-today-list');
  dtl.innerHTML = todays.length ? todays.map(t=>`<div class="row"><span class="row-main">${esc(t.subject)}</span><span class="row-sub">${t.hours} hrs</span></div>`).join('') : '<p class="empty">Nothing logged for today yet.</p>';

  const dsl = document.getElementById('d-subjects-list');
  dsl.innerHTML = data.subjects.length ? data.subjects.slice(0,6).map(s=>`
    <div style="margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; font-size:.82rem;"><span>${esc(s.name)}</span><span class="row-sub">${s.progress}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${s.progress}%;"></div></div>
    </div>`).join('') : '<p class="empty">Add subjects to see progress here.</p>';

  const days = last7Days();
  const dayTotals = days.map(d=> data.studylog.filter(l=>l.date===d).reduce((a,b)=>a+b.hours,0));
  const dayLabels = days.map(d=> new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}));
  renderBarChart('wk-chart', dayLabels, dayTotals, 'var(--accent)');

  const dInc = data.money.filter(m=>m.type==='income').reduce((a,b)=>a+b.amount,0);
  const dExp = data.money.filter(m=>m.type==='expense').reduce((a,b)=>a+b.amount,0);
  const dBal = dInc-dExp;
  renderDonut('d-money-donut', [{label:'Income',value:dInc,colorVar:'var(--good)'},{label:'Expense',value:dExp,colorVar:'var(--bad)'}], (dBal>=0?'₹':'-₹')+Math.abs(dBal).toLocaleString());
  renderLegend('d-money-legend', [{label:'Income',value:dInc,colorVar:'var(--good)'},{label:'Expense',value:dExp,colorVar:'var(--bad)'}]);

  const wk = weekKey();
  const wkLog = data.habitLog[wk] || {};
  let checked=0, possible=0;
  data.habits.forEach(h=>{ const dd = wkLog[h.id] || [false,false,false,false,false,false,false]; possible+=7; checked += dd.filter(Boolean).length; });
  renderRadial('d-habit-radial', possible ? (checked/possible*100) : 0, 'var(--accent)', checked+' of '+possible+' this week');
}

/* ---------------- pomodoro ---------------- */
let timerInterval=null, remaining=25*60, onBreak=false;
function fmt(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=(sec%60).toString().padStart(2,'0'); return m+':'+s; }
function renderTimer(){ document.getElementById('tm-display').textContent = fmt(remaining); }
function timerStart(){
  if(timerInterval) return;
  document.getElementById('tm-status').textContent = onBreak ? 'On a break.' : 'Focusing...';
  timerInterval = setInterval(()=>{
    remaining--;
    if(remaining<=0){
      onBreak = !onBreak;
      remaining = (onBreak ? parseInt(document.getElementById('tm-break').value)||5 : parseInt(document.getElementById('tm-focus').value)||25) * 60;
      document.getElementById('tm-status').textContent = onBreak ? 'Break time.' : 'Back to focus.';
    }
    renderTimer();
  }, 1000);
}
function timerPause(){ clearInterval(timerInterval); timerInterval=null; document.getElementById('tm-status').textContent='Paused.'; }
function timerReset(){
  clearInterval(timerInterval); timerInterval=null; onBreak=false;
  remaining = (parseInt(document.getElementById('tm-focus').value)||25)*60;
  renderTimer(); document.getElementById('tm-status').textContent='Ready when you are.';
}

/* ---------------- backup ---------------- */
function exportData(){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,10);
  a.href = url; a.download = `fieldbook-backup-${stamp}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  document.getElementById('bk-last').textContent = 'Last backup: '+new Date().toLocaleString();
}
function importData(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    try{
      const parsed = JSON.parse(evt.target.result);
      data = {...defaultData, ...parsed};
      save();
      renderAll();
      alert('Backup restored.');
    }catch(err){
      alert('Could not read that file — make sure it is a Fieldbook backup .json file.');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
}
function renderAll(){
  fillProfile();
  renderStudyLog(); renderGoals(); renderSubjects(); renderCoding();
  renderRevision(); renderHabits(); renderMoney(); renderCgpa();
  renderExams(); renderNotes(); renderTimer(); renderDashboard();
  document.documentElement.setAttribute('data-theme', (data.theme && data.theme!=='fieldbook') ? data.theme : '');
  renderThemeGrid();
  applyCustomBg();
}

/* ---------------- live drive sync ---------------- */
let fileHandle = null;
const fsSupported = 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
function initFsUi(){
  if(fsSupported){
    document.getElementById('fs-support-msg').textContent =
      'Keep the actual data file on a pendrive (or any folder) instead of in the browser. Once connected, every change saves straight to that file — plug the drive into any Chrome or Edge computer, connect to the same file, and you\'re back where you left off.';
    document.getElementById('fs-controls').style.display = 'flex';
  }
}
async function connectExistingDriveFile(){
  try{
    const [handle] = await window.showOpenFilePicker({
      types:[{description:'Fieldbook backup', accept:{'application/json':['.json']}}]
    });
    fileHandle = handle;
    const file = await handle.getFile();
    const text = await file.text();
    if(text.trim()){
      data = {...defaultData, ...JSON.parse(text)};
      save();
      renderAll();
    }
    updateFsStatus('Connected: '+handle.name+' — saving live to this file');
  }catch(err){
    if(err.name !== 'AbortError') alert('Could not open that file: '+err.message);
  }
}
async function createDriveFile(){
  try{
    const handle = await window.showSaveFilePicker({
      suggestedName:'fieldbook-data.json',
      types:[{description:'Fieldbook backup', accept:{'application/json':['.json']}}]
    });
    fileHandle = handle;
    await writeToFile();
    updateFsStatus('Connected: '+handle.name+' — saving live to this file');
  }catch(err){
    if(err.name !== 'AbortError') alert('Could not create that file: '+err.message);
  }
}
async function writeToFile(){
  if(!fileHandle) return;
  try{
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    updateFsStatus('Connected: '+fileHandle.name+' — last saved '+new Date().toLocaleTimeString());
  }catch(err){
    updateFsStatus('Connected, but the last write failed — check the drive is still plugged in.');
  }
}
function updateFsStatus(msg){
  const el = document.getElementById('fs-status');
  if(el) el.textContent = msg;
}

/* ---------------- appearance ---------------- */
const themes = [
  {id:'fieldbook', label:'Fieldbook', desc:'Warm notebook, olive & rust', colors:['#16241f','#f4efe4','#c4622d']},
  {id:'nightlab', label:'Night Lab', desc:'Dark console, teal accent', colors:['#0d0f16','#1a1f2e','#2dd4bf']},
  {id:'morning', label:'Morning Light', desc:'Bright & airy, forest green', colors:['#e7ece5','#ffffff','#3c6e47']},
  {id:'chalkboard', label:'Chalkboard', desc:'Matte charcoal, amber chalk', colors:['#202b28','#2c3a36','#e0a458']},
  {id:'slate', label:'Mono Slate', desc:'Minimal grayscale, blue accent', colors:['#1a1b1f','#26272c','#5b8def']},
  {id:'cyber', label:'Cyber Grid', desc:'Neon perspective grid, magenta glow', colors:['#0a0a12','#161225','#2de0ff']},
  {id:'cosmos', label:'Deep Space', desc:'Starfield with an orbiting ring', colors:['#05070f','#10162a','#6d8cff']},
  {id:'sakura', label:'Sakura Dream', desc:'Soft pastel sky, falling petals', colors:['#ffe6ef','#fff8fa','#ec6a9c']},
];
function applyTheme(id){
  document.documentElement.setAttribute('data-theme', id==='fieldbook' ? '' : id);
  data.theme = id; save();
  renderThemeGrid();
}
function renderThemeGrid(){
  const el = document.getElementById('theme-grid');
  const current = data.theme || 'fieldbook';
  el.innerHTML = themes.map(t=>`
    <button class="theme-card ${t.id===current?'selected':''}" onclick="applyTheme('${t.id}')">
      <div class="theme-swatch">${t.colors.map(c=>`<span style="background:${c};"></span>`).join('')}</div>
      <div class="theme-card-label">${t.label}</div>
      <div class="theme-card-desc">${t.desc}</div>
    </button>`).join('');
}
async function handleCustomBgUpload(e){
  const files = Array.from(e.target.files || []);
  if(!files.length) return;
  for(const file of files){
    if(file.type.startsWith('video/')){
      const id = uid();
      try{
        await idbPut(id, file);
        const poster = await captureVideoPoster(file);
        const item = {id, name:file.name, kind:'video', poster};
        data.customBgGallery.push(item);
        if(!data.activeBgId) data.activeBgId = item.id;
      }catch(err){
        alert(`Could not store "${file.name}": `+err.message);
      }
    } else if(file.type.startsWith('image/')){
      if(file.size > 4*1024*1024){
        alert(`"${file.name}" is over 4MB — skipping it. Please keep images under 4MB.`);
        continue;
      }
      const dataUrl = await new Promise(resolve=>{
        const reader = new FileReader();
        reader.onload = ()=> resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const item = {id:uid(), name:file.name, kind:'image', src:dataUrl};
      data.customBgGallery.push(item);
      if(!data.activeBgId) data.activeBgId = item.id;
    }
  }
  save();
  applyCustomBg();
  e.target.value = '';
}
function selectBgImage(id){ data.activeBgId = id; save(); applyCustomBg(); }
async function removeBgImage(id){
  const item = data.customBgGallery.find(g=>g.id===id);
  data.customBgGallery = data.customBgGallery.filter(g=>g.id!==id);
  if(data.activeBgId===id){ data.activeBgId = data.customBgGallery.length ? data.customBgGallery[0].id : null; }
  save(); applyCustomBg();
  if(item && item.kind==='video'){ try{ await idbDelete(item.id); }catch(e){} }
}
function shuffleBackground(){
  if(!data.customBgGallery.length) return;
  const pool = data.customBgGallery.filter(g=>g.id!==data.activeBgId);
  const source = pool.length ? pool : data.customBgGallery;
  data.activeBgId = source[Math.floor(Math.random()*source.length)].id;
  save(); applyCustomBg();
}
function toggleRandomOnLoad(e){ data.bgRandomOnLoad = e.target.checked; save(); }
async function applyCustomBg(){
  const imgLayer = document.getElementById('custom-bg-layer');
  const videoLayer = document.getElementById('custom-bg-video');
  const active = data.customBgGallery.find(g=>g.id===data.activeBgId);
  if(active && active.kind==='video'){
    imgLayer.style.backgroundImage = ''; imgLayer.classList.remove('active');
    try{
      const blob = await idbGet(active.id);
      if(blob){
        videoLayer.src = URL.createObjectURL(blob);
        videoLayer.classList.add('active');
        videoLayer.play().catch(()=>{});
      }else{
        videoLayer.classList.remove('active');
      }
    }catch(err){ videoLayer.classList.remove('active'); }
  } else if(active && active.kind==='image'){
    videoLayer.classList.remove('active'); videoLayer.pause();
    imgLayer.style.backgroundImage = `url("${active.src}")`;
    imgLayer.classList.add('active');
  } else {
    imgLayer.style.backgroundImage = ''; imgLayer.classList.remove('active');
    videoLayer.classList.remove('active'); videoLayer.pause();
  }
  renderGallery();
}
function renderGallery(){
  const el = document.getElementById('bg-gallery');
  if(!el) return;
  const toggle = document.getElementById('bg-random-toggle');
  if(toggle) toggle.checked = !!data.bgRandomOnLoad;
  if(!data.customBgGallery.length){ el.innerHTML = '<p class="empty">No images or videos added yet.</p>'; return; }
  el.innerHTML = data.customBgGallery.map(g=>`
    <div class="bg-thumb ${g.id===data.activeBgId?'selected':''}" onclick="selectBgImage('${g.id}')" title="${esc(g.name||'')}">
      <img src="${g.kind==='video' ? (g.poster||'') : g.src}" alt="">
      ${g.kind==='video' ? '<span class="bg-video-badge">VIDEO</span>' : ''}
      <button class="bg-remove" onclick="event.stopPropagation(); removeBgImage('${g.id}')">✕</button>
    </div>`).join('');
}

/* ---------------- video storage (IndexedDB — too large for localStorage/JSON) ---------------- */
const IDB_NAME='fieldbook_media', IDB_STORE='videos';
function idbOpen(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(IDB_NAME,1);
    req.onupgradeneeded = ()=>{ req.result.createObjectStore(IDB_STORE); };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}
async function idbPut(id, blob){
  const db = await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(IDB_STORE,'readwrite');
    tx.objectStore(IDB_STORE).put(blob, id);
    tx.oncomplete = ()=> resolve();
    tx.onerror = ()=> reject(tx.error);
  });
}
async function idbGet(id){
  const db = await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(IDB_STORE,'readonly');
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = ()=> resolve(req.result || null);
    req.onerror = ()=> reject(req.error);
  });
}
async function idbDelete(id){
  const db = await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(IDB_STORE,'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = ()=> resolve();
    tx.onerror = ()=> reject(tx.error);
  });
}
function captureVideoPoster(file){
  return new Promise((resolve)=>{
    const v = document.createElement('video');
    v.preload = 'metadata'; v.muted = true;
    v.src = URL.createObjectURL(file);
    v.addEventListener('loadeddata', ()=>{ try{ v.currentTime = Math.min(0.5,(v.duration||1)/2); }catch(e){ resolve(null); } });
    v.addEventListener('seeked', ()=>{
      try{
        const c = document.createElement('canvas');
        c.width = 160; c.height = Math.round(160*((v.videoHeight/v.videoWidth)||0.6));
        c.getContext('2d').drawImage(v,0,0,c.width,c.height);
        const poster = c.toDataURL('image/jpeg',0.7);
        URL.revokeObjectURL(v.src);
        resolve(poster);
      }catch(e){ resolve(null); }
    }, {once:true});
    v.addEventListener('error', ()=> resolve(null));
  });
}

/* ---------------- utils ---------------- */
function esc(str){ const d=document.createElement('div'); d.textContent=str||''; return d.innerHTML; }

/* ---------------- init ---------------- */
function initDefaults(){
  const t = new Date().toISOString().slice(0,10);
  ['sl-date','cd-date','mn-date'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=t; });
}
fillProfile();
renderStudyLog(); renderGoals(); renderSubjects(); renderCoding();
renderRevision(); renderHabits(); renderMoney(); renderCgpa();
renderExams(); renderNotes(); renderTimer(); initDefaults();
initFsUi();
document.documentElement.setAttribute('data-theme', (data.theme && data.theme!=='fieldbook') ? data.theme : '');
renderThemeGrid();
if(data.bgRandomOnLoad && data.customBgGallery.length){ shuffleBackground(); } else { applyCustomBg(); }
showSection('dashboard');
