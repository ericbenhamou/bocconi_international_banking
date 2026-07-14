(() => {
  "use strict";
  const DB_KEY = "bankingDesk.v1";
  const SESSION_KEY = "bankingDesk.session";
  const app = document.getElementById("app");
  const enc = new TextEncoder();
  const SUBJECTS = [
    {id:"accounting",day:"Monday",name:"Accounting"},
    {id:"strategy",day:"Tuesday",name:"Strategy"},
    {id:"law",day:"Wednesday",name:"Law"},
    {id:"management",day:"Thursday",name:"Management"},
    {id:"intl-banking",day:"Friday",name:"Intl Banking"},
    {id:"italian",day:"Saturday",name:"Italian"}
  ];
  const weekdaySubjects = {1:"accounting",2:"strategy",3:"law",4:"management",5:"intl-banking",6:"italian"};
  const recommendedSubject = () => weekdaySubjects[new Date().getDay()] || "strategy";
  const initialSubject = recommendedSubject();
  let state = { user: null, view: "dashboard", subject: initialSubject, quiz: null, reviewRun: null, isSummary: false, setup: defaultSetup(initialSubject) };

  function subjectInfo(id) { return SUBJECTS.find(subject => subject.id === id) || SUBJECTS[0]; }
  function questionsForSubject(id) { return QUESTION_BANK.filter(q => q.subject === id); }
  function categoriesForSubject(id) { return [...new Set(questionsForSubject(id).map(q => q.category))]; }
  function defaultSetup(subject=state?.subject || initialSubject) { const categories=categoriesForSubject(subject); return { subject, mode: "mixed", count: 10, categories: new Set(categories) }; }
  function db() { try { return JSON.parse(localStorage.getItem(DB_KEY)) || { profiles: {} }; } catch { return { profiles: {} }; } }
  function saveDb(value) { localStorage.setItem(DB_KEY, JSON.stringify(value)); }
  function profile() { return db().profiles[state.user]; }
  function mutateProfile(fn) { const data = db(); fn(data.profiles[state.user]); saveDb(data); }
  function normalizeUser(v) { return v.trim().toLowerCase(); }
  function esc(v) { return String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
  function uid() { return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`; }
  function bytesToHex(bytes) { return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,"0")).join(""); }
  function randomHex(size=16) { return bytesToHex(crypto.getRandomValues(new Uint8Array(size))); }
  async function sha256(value) { return bytesToHex(await crypto.subtle.digest("SHA-256", enc.encode(value))); }
  async function passwordHash(password, salt) {
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    return bytesToHex(await crypto.subtle.deriveBits({name:"PBKDF2", salt:enc.encode(salt), iterations:210000, hash:"SHA-256"}, key, 256));
  }
  function fmtDate(value) { return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)); }
  function shuffle(items) { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  function qById(id) { return QUESTION_BANK.find(q => q.id === id); }
  function toast(message) { const el=document.getElementById("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2800); }

  function shell(content, active="dashboard") {
    const p=profile(); const initials=(p.displayName || p.username).split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
    return `<div class="app-shell">
      <header class="topbar"><div class="brand"><span class="brand-mark">B</span><span>Bocconi Study Desk</span></div>
      <div class="top-nav">${nav(active)}</div>
      <div class="top-actions"><button class="user-chip" data-nav="settings"><span>${esc(p.displayName)}</span><b class="avatar">${esc(initials)}</b></button></div></header>
      <div class="content">${content}</div>
    </div>`;
  }
  function nav(active) { return `<div class="nav-pills" aria-label="Study navigation">
    <button class="nav-pill ${active==="dashboard"?"active":""}" data-nav="dashboard">Overview</button>
    <button class="nav-pill ${active==="setup"?"active":""}" data-nav="setup">New quiz</button>
    <button class="nav-pill ${active==="history"?"active":""}" data-nav="history">History</button>
  </div>`; }
  function hero(kicker,title,desc) { const compact=String(title).length>36?" long-title":""; return `<section class="hero"><div><span class="eyebrow">${kicker}</span><h1 class="${compact.trim()}">${title}</h1><p>${desc}</p></div></section>`; }

  function renderAuth(tab="login") {
    const create=tab==="create";
    app.innerHTML=`<section class="auth-shell">
      <div class="auth-story"><div class="brand"><span class="brand-mark">B</span><span>Bocconi Study Desk</span></div>
      <div class="auth-copy"><span class="eyebrow">Six subjects · Monday to Saturday</span><h1 class="serif">Turn revision into recall.</h1><p>Focused Bocconi exam practice that remembers every attempt, every hesitation and every question worth seeing again.</p>
      <div class="auth-schedule" aria-label="Weekly study schedule">${SUBJECTS.map(subject=>`<div><strong>${subject.day}</strong><span>${subject.name}</span></div>`).join("")}</div></div>
      <div class="feature-row"><span>${QUESTION_BANK.length} questions</span><span>Wrong-answer memory</span><span>Works offline</span></div></div>
      <div class="auth-panel"><div class="auth-card"><h2>${create?"Create your study profile":"Welcome back"}</h2><p>${create?"Your progress stays private on this device.":"Continue where you left off."}</p>
      <div class="tabs"><button class="tab ${!create?"active":""}" data-auth-tab="login">Sign in</button><button class="tab ${create?"active":""}" data-auth-tab="create">Create profile</button></div>
      <form id="auth-form" data-mode="${create?"create":"login"}">
        ${create?`<div class="field"><label for="display">Display name</label><input id="display" name="display" maxlength="50" required autocomplete="name" placeholder="e.g. Alex Martin"></div>`:""}
        <div class="field"><label for="username">Username</label><input id="username" name="username" minlength="3" maxlength="24" pattern="[A-Za-z0-9_-]+" required autocomplete="username" placeholder="Your username"></div>
        <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" minlength="8" required autocomplete="${create?"new-password":"current-password"}" placeholder="At least 8 characters"></div>
        <label class="checkbox"><input name="remember" type="checkbox" checked> Keep me signed in on this device</label>
        <button class="btn btn-primary btn-wide" type="submit">${create?"Create profile":"Sign in"}</button>
      </form><div class="fine-print">Passwords are protected with PBKDF2 and never stored in plain text. Study data is kept locally in this browser.</div></div></div>
    </section>`;
    bindCommon();
    document.querySelectorAll("[data-auth-tab]").forEach(b=>b.onclick=()=>renderAuth(b.dataset.authTab));
    document.getElementById("auth-form").onsubmit=handleAuth;
  }

  async function handleAuth(event) {
    event.preventDefault(); const form=new FormData(event.currentTarget); const username=normalizeUser(form.get("username")); const password=form.get("password"); const create=event.currentTarget.dataset.mode==="create";
    if(!/^[a-z0-9_-]{3,24}$/.test(username)) return toast("Use 3–24 letters, numbers, underscores or hyphens.");
    const data=db();
    if(create){
      if(data.profiles[username]) return toast("That username already exists on this device.");
      const salt=randomHex(); const hash=await passwordHash(password,salt);
      data.profiles[username]={username,displayName:String(form.get("display")).trim(),salt,hash,createdAt:new Date().toISOString(),history:[],mastery:{},activeQuiz:null,sessionHash:null}; saveDb(data);
    } else {
      const p=data.profiles[username]; if(!p || await passwordHash(password,p.salt)!==p.hash) return toast("Username or password not recognized.");
    }
    await startSession(username,form.get("remember")==="on"); state.user=username; state.view="dashboard"; render();
  }
  async function startSession(username,remember) {
    const token=randomHex(24), hash=await sha256(token); const data=db(); data.profiles[username].sessionHash=hash; saveDb(data);
    const store=remember?localStorage:sessionStorage; const other=remember?sessionStorage:localStorage; store.setItem(SESSION_KEY,JSON.stringify({username,token})); other.removeItem(SESSION_KEY);
  }
  async function restoreSession() {
    const raw=localStorage.getItem(SESSION_KEY)||sessionStorage.getItem(SESSION_KEY); if(!raw)return false;
    try{const s=JSON.parse(raw),p=db().profiles[s.username]; if(p&&p.sessionHash&&await sha256(s.token)===p.sessionHash){state.user=s.username;return true;}}catch{}
    localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);return false;
  }
  function logout(){localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);state={user:null,view:"dashboard",subject:recommendedSubject(),quiz:null,reviewRun:null,isSummary:false,setup:defaultSetup(recommendedSubject())};renderAuth();}

  function statsFor(p) {
    const answered=p.history.reduce((s,r)=>s+r.answers.length,0), correct=p.history.reduce((s,r)=>s+r.answers.filter(a=>a.correct).length,0);
    return {runs:p.history.length,answered,accuracy:answered?Math.round(correct/answered*100):0,weak:Object.values(p.mastery).filter(m=>m.wrong>0).length};
  }
  function subjectCards(selected) {
    return `<section class="subject-strip" aria-label="Weekly subjects">${SUBJECTS.map(subject=>{const count=questionsForSubject(subject.id).length;return `<button class="subject-card ${selected===subject.id?"active":""} ${count?"":"empty-subject"}" data-subject="${subject.id}" ${count?"":"disabled"}><span>${subject.day}</span><strong>${subject.name}</strong><small>${count?`${count} questions`:"Materials pending"}</small></button>`;}).join("")}</section>`;
  }
  function renderDashboard() {
    const p=profile(),s=statsFor(p),recent=p.history.slice().reverse().slice(0,3),current=subjectInfo(state.subject),subjectQs=questionsForSubject(state.subject),categories=categoriesForSubject(state.subject),weak=Object.entries(p.mastery).filter(([id,m])=>m.wrong>0&&qById(id)).sort((a,b)=>b[1].wrong-a[1].wrong).slice(0,4);
    const content=hero("Study overview",`Good ${new Date().getHours()<12?"morning":new Date().getHours()<18?"afternoon":"evening"}, ${esc(p.displayName.split(" ")[0])}.`,`Build consistency, then let the difficult questions find you.`,"dashboard")+
    subjectCards(state.subject)+`<section class="stats"><div class="stat-card"><div class="stat-label">Quizzes</div><div class="stat-value">${s.runs}</div></div><div class="stat-card"><div class="stat-label">Questions</div><div class="stat-value">${s.answered}</div></div><div class="stat-card"><div class="stat-label">Accuracy</div><div class="stat-value">${s.accuracy}%</div></div><div class="stat-card"><div class="stat-label">To review</div><div class="stat-value">${s.weak}</div></div></section>
    <section class="dashboard-grid"><div class="card launch-card"><div><span class="eyebrow">${p.activeQuiz?"Session saved":`${current.day} · ${current.name}`}</span><h2>${p.activeQuiz?"Your quiz is waiting":`Study ${current.name}`}</h2><p>${p.activeQuiz?`Resume at question ${p.activeQuiz.index+1} of ${p.activeQuiz.questionIds.length}. Every submitted answer is already safe.`:`Choose a topic mix, question count and practice mode from ${subjectQs.length} ${current.name} questions.`}</p></div><button class="btn" data-action="${p.activeQuiz?"resume":"new"}">${p.activeQuiz?"Resume quiz":"Set up a quiz"} →</button></div>
    <div class="card"><div class="card-head"><div><h2>Needs another look</h2><p>Questions you have missed before.</p></div></div><div class="weak-list">${weak.length?weak.map(([id,m])=>{const q=qById(id);return `<div class="weak-item"><div><strong>${esc(q.q)}</strong><span>${esc(q.category)}</span></div><b class="badge bad">${m.wrong} miss${m.wrong===1?"":"es"}</b></div>`}).join(""):`<div class="empty">No weak spots yet. Start a quiz to build your review queue.</div>`}</div></div>
    <div class="card"><div class="card-head"><div><h2>Recent activity</h2><p>Your last completed sessions.</p></div><button class="btn btn-ghost" data-nav="history">View all</button></div><div class="history-list">${recent.length?recent.map(historyRow).join(""):`<div class="empty">Completed quizzes will appear here.</div>`}</div></div>
    <div class="card"><div class="card-head"><div><h2>${current.name} question bank</h2><p>Coverage distilled from the supplied course and exam materials.</p></div></div><div class="weak-list">${categories.slice(0,5).map(c=>`<div class="weak-item"><strong>${esc(c)}</strong><span class="badge">${subjectQs.filter(q=>q.category===c).length}</span></div>`).join("")}<button class="btn btn-secondary btn-wide" data-nav="setup">Practice all ${subjectQs.length} ${current.name} questions</button></div></div></section>`;
    app.innerHTML=shell(content,"dashboard"); bindCommon();
    document.querySelectorAll("[data-subject]").forEach(button=>button.onclick=()=>{state.subject=button.dataset.subject;state.setup=defaultSetup(state.subject);renderDashboard();});
    document.querySelector('[data-action="new"]')?.addEventListener("click",()=>go("setup"));
    document.querySelector('[data-action="resume"]')?.addEventListener("click",resumeQuiz);
    bindReviewButtons();
  }

  function renderSetup() {
    const selected=state.setup.categories,categories=categoriesForSubject(state.setup.subject),subjectQs=questionsForSubject(state.setup.subject),subject=subjectInfo(state.setup.subject),counts=[...new Set([5,10,20,30,subjectQs.length].filter(n=>n>0&&n<=subjectQs.length))].sort((a,b)=>a-b);
    const content=hero("Build a session",`${subject.day}: ${subject.name}`,"Tune the mix to the way you want to revise today.","setup")+subjectCards(state.setup.subject)+`<section class="setup-grid">
      <div class="card"><div class="card-head"><div><h2>Practice mode</h2><p>How questions should be selected.</p></div></div><div class="option-grid">
      ${[["mixed","Mixed","Balanced random practice"],["wrong","Review misses","Questions missed before"],["unseen","Unseen","Questions not attempted yet"]].map(x=>`<button class="choice-card ${state.setup.mode===x[0]?"active":""}" data-mode="${x[0]}"><strong>${x[1]}</strong><small>${x[2]}</small></button>`).join("")}</div>
      <div class="field" style="margin-top:1.3rem"><label for="count">Number of questions</label><select id="count">${counts.map(n=>`<option value="${n}" ${state.setup.count===n?"selected":""}>${n===subjectQs.length?`All ${n}`:n}</option>`).join("")}</select></div></div>
      <div class="card"><div class="card-head"><div><h2>Topics</h2><p>Select at least one category.</p></div><button class="btn btn-ghost" id="toggle-all">${selected.size===categories.length?"Clear":"Select all"}</button></div><div class="category-checks">${categories.map(c=>`<label class="category-check"><input type="checkbox" value="${esc(c)}" ${selected.has(c)?"checked":""}> ${esc(c)}</label>`).join("")}</div></div>
      <div class="card" style="grid-column:1/-1"><div class="card-head"><div><h2>Ready when you are</h2><p>Your progress is saved after every submitted answer.</p></div><button class="btn btn-primary" id="start-quiz">Start quiz →</button></div></div></section>`;
    app.innerHTML=shell(content,"setup");bindCommon();
    document.querySelectorAll("[data-subject]").forEach(button=>button.onclick=()=>{state.subject=button.dataset.subject;state.setup=defaultSetup(state.subject);renderSetup();});
    document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{state.setup.mode=b.dataset.mode;renderSetup();});
    document.getElementById("count").onchange=e=>state.setup.count=Number(e.target.value);
    document.querySelectorAll(".category-check input").forEach(cb=>cb.onchange=()=>{cb.checked?selected.add(cb.value):selected.delete(cb.value);});
    document.getElementById("toggle-all").onclick=()=>{state.setup.categories=selected.size===categories.length?new Set():new Set(categories);renderSetup();};
    document.getElementById("start-quiz").onclick=startQuiz;
  }

  function candidateQuestions() {
    const p=profile(); let qs=QUESTION_BANK.filter(q=>q.subject===state.setup.subject&&state.setup.categories.has(q.category));
    if(state.setup.mode==="wrong") qs=qs.filter(q=>(p.mastery[q.id]?.wrong||0)>0);
    if(state.setup.mode==="unseen") qs=qs.filter(q=>!p.mastery[q.id]);
    return qs;
  }
  function startQuiz() {
    if(!state.setup.categories.size)return toast("Select at least one topic."); const candidates=candidateQuestions();
    if(!candidates.length)return toast(state.setup.mode==="wrong"?"No missed questions in those topics yet.":"You have already seen every question in those topics.");
    const ids=shuffle(candidates).slice(0,Math.min(state.setup.count,candidates.length)).map(q=>q.id);
    state.quiz={id:uid(),subject:state.setup.subject,mode:state.setup.mode,questionIds:ids,index:0,answers:[],startedAt:new Date().toISOString()};
    mutateProfile(p=>p.activeQuiz=state.quiz); renderQuiz();
  }
  function resumeQuiz(){state.quiz=profile().activeQuiz; if(!state.quiz)return go("dashboard");renderQuiz();}
  function currentAnswer(){return state.quiz.answers.find(a=>a.qid===state.quiz.questionIds[state.quiz.index]);}
  function renderQuiz() {
    const quiz=state.quiz,q=qById(quiz.questionIds[quiz.index]),done=currentAnswer(),pct=(quiz.index/quiz.questionIds.length)*100,current=subjectInfo(q.subject);
    app.innerHTML=`<div class="quiz-wrap"><div class="quiz-top"><div class="brand" style="color:var(--green)"><span class="brand-mark" style="border-color:var(--green)">B</span><span>${current.day}: ${current.name}</span></div><button class="btn btn-ghost" id="exit-quiz">Save & exit</button></div><div class="progress-track"><div class="progress-bar" style="width:${pct}%"></div></div>
    <article class="question-card"><div class="question-meta"><span class="badge">${esc(q.category)}</span><span>${quiz.index+1} / ${quiz.questionIds.length}</span></div><h1>${esc(q.q)}</h1><div class="answers">${q.o.map((o,i)=>`<button class="answer ${done?(i===q.a?"correct":i===done.selected?"incorrect":""):""}" data-answer="${i}" ${done?"disabled":""}><span class="answer-letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join("")}</div>
    ${done?`<div class="feedback ${done.correct?"":"bad"}"><strong>${done.correct?"Correct — nicely done.":"Not quite. Keep this one in rotation."}</strong>${esc(q.e)}</div>`:""}
    <div class="question-actions"><button class="btn btn-ghost" id="exit-bottom">Pause quiz</button>${done?`<button class="btn btn-primary" id="next-question">${quiz.index===quiz.questionIds.length-1?"Finish quiz":"Next question →"}</button>`:""}</div></article></div>`;
    bindCommon(); document.getElementById("exit-quiz").onclick=()=>go("dashboard");document.getElementById("exit-bottom").onclick=()=>go("dashboard");
    document.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>submitAnswer(Number(b.dataset.answer)));
    document.getElementById("next-question")?.addEventListener("click",nextQuestion);
  }
  function submitAnswer(selected) {
    if(currentAnswer())return; const qid=state.quiz.questionIds[state.quiz.index],q=qById(qid),correct=selected===q.a;
    state.quiz.answers.push({qid,selected,correct,answeredAt:new Date().toISOString()});
    mutateProfile(p=>{const m=p.mastery[qid]||{correct:0,wrong:0,lastSeenAt:null,lastWrongAt:null};m[correct?"correct":"wrong"]++;m.lastSeenAt=new Date().toISOString();if(!correct)m.lastWrongAt=m.lastSeenAt;p.mastery[qid]=m;p.activeQuiz=state.quiz;});renderQuiz();
  }
  function nextQuestion(){if(state.quiz.index<state.quiz.questionIds.length-1){state.quiz.index++;mutateProfile(p=>p.activeQuiz=state.quiz);renderQuiz();}else finishQuiz();}
  function finishQuiz(){
    const quiz=state.quiz,run={...quiz,completedAt:new Date().toISOString()};delete run.index; const correct=run.answers.filter(a=>a.correct).length;run.score=Math.round(correct/run.answers.length*100);
    mutateProfile(p=>{p.history.push(run);p.activeQuiz=null;});state.quiz=null;state.reviewRun=run;state.isSummary=true;renderReview();
  }

  function historyRow(r){const first=qById(r.questionIds?.[0]||r.answers?.[0]?.qid),subject=subjectInfo(r.subject||first?.subject||"intl-banking");return `<div class="history-item"><div class="score-ring">${r.score}%</div><div class="history-main"><strong>${subject.day}: ${subject.name} · ${r.answers.length}-question ${r.mode} quiz</strong><span class="history-meta">${fmtDate(r.completedAt)} · ${r.answers.filter(a=>!a.correct).length} to review</span></div><button class="btn btn-ghost" data-review="${r.id}">Review</button></div>`;}
  function renderHistory(){const p=profile();const content=hero("Your record","Quiz history","Every completed session, with its answers and explanations.","history")+`<section class="card"><div class="history-list">${p.history.length?p.history.slice().reverse().map(historyRow).join(""):`<div class="empty">No completed quizzes yet.</div>`}</div></section>`;app.innerHTML=shell(content,"history");bindCommon();bindReviewButtons();}
  function bindReviewButtons(){document.querySelectorAll("[data-review]").forEach(b=>b.onclick=()=>{state.reviewRun=profile().history.find(r=>r.id===b.dataset.review);state.isSummary=false;renderReview();});}
  function renderReview(){
    const r=state.reviewRun;if(!r)return go("history");const wrong=r.answers.filter(a=>!a.correct);const shown=state.isSummary?r.answers:wrong;
    const title=state.isSummary?`You scored ${r.score}%`:"Review missed answers";const desc=state.isSummary?`${r.answers.filter(a=>a.correct).length} correct out of ${r.answers.length}. ${wrong.length?"The missed questions are now in your review memory.":"A clean run — excellent work."}`:`${wrong.length} question${wrong.length===1?"":"s"} from ${fmtDate(r.completedAt)}.`;
    const content=hero(state.isSummary?"Session complete":"Quiz review",title,desc,"history")+`<section class="card"><div class="card-head"><div><h2>${state.isSummary?"Answer breakdown":"What to revisit"}</h2><p>Correct answers and explanations from the supplied course material.</p></div><button class="btn btn-primary" data-nav="setup">New quiz</button></div>${shown.length?shown.map(a=>{const q=qById(a.qid);return `<article class="review-question"><span class="badge">${esc(q.category)}</span><h3>${esc(q.q)}</h3>${!a.correct?`<div class="review-answer wrong">Your answer: ${esc(q.o[a.selected])}</div>`:""}<div class="review-answer correct">Correct answer: ${esc(q.o[q.a])}</div><p class="history-meta">${esc(q.e)}</p></article>`}).join(""):`<div class="empty">No wrong answers in this quiz.</div>`}</section>`;
    app.innerHTML=shell(content,"history");bindCommon();
  }

  function renderSettings(){const p=profile();const content=hero("Local profile","Settings & backup","Manage your study identity and keep a portable copy of your progress.","settings")+`<section class="setup-grid"><div class="card"><h2>Profile</h2><form id="profile-form" style="margin-top:1.2rem"><div class="field"><label for="display-name">Display name</label><input id="display-name" value="${esc(p.displayName)}" maxlength="50" required></div><div class="field"><label>Username</label><input value="${esc(p.username)}" disabled></div><button class="btn btn-primary">Save profile</button></form></div><div class="card"><h2>Data & session</h2><p class="history-meta">Your activity is stored only in this browser. Export a backup before clearing browser data or moving devices.</p><div class="settings-actions" style="margin-top:1.2rem"><button class="btn btn-secondary" id="export-data">Export backup</button><label class="btn btn-ghost">Import backup<input id="import-data" type="file" accept="application/json" hidden></label><button class="btn btn-ghost" id="logout">Sign out</button><button class="btn btn-danger" id="delete-profile">Delete profile</button></div></div></section>`;app.innerHTML=shell(content,"settings");bindCommon();
    document.getElementById("profile-form").onsubmit=e=>{e.preventDefault();mutateProfile(p=>p.displayName=document.getElementById("display-name").value.trim());toast("Profile updated.");renderSettings();};
    document.getElementById("export-data").onclick=exportData;document.getElementById("import-data").onchange=importData;document.getElementById("logout").onclick=logout;
    document.getElementById("delete-profile").onclick=()=>{if(!confirm("Delete this profile and all quiz history from this browser? This cannot be undone."))return;const data=db();delete data.profiles[state.user];saveDb(data);logout();};
  }
  function exportData(){const p=profile(),blob=new Blob([JSON.stringify({app:"Banking Desk",version:1,exportedAt:new Date().toISOString(),profile:{...p,hash:undefined,salt:undefined,sessionHash:undefined}},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`banking-desk-${p.username}-backup.json`;a.click();URL.revokeObjectURL(a.href);toast("Backup exported.");}
  async function importData(e){const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.app!=="Banking Desk"||!Array.isArray(data.profile?.history)||typeof data.profile?.mastery!=="object")throw new Error();if(!confirm("Replace this profile's quiz history and mastery with the imported backup?"))return;mutateProfile(p=>{p.history=data.profile.history;p.mastery=data.profile.mastery;p.activeQuiz=data.profile.activeQuiz||null;});toast("Backup imported.");renderSettings();}catch{toast("That file is not a valid Banking Desk backup.");}}

  function bindCommon(){document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>go(b.dataset.nav));}
  function go(view){state.view=view;state.reviewRun=null;state.isSummary=false;render();}
  function render(){if(!state.user)return renderAuth();if(state.view==="dashboard")renderDashboard();else if(state.view==="setup")renderSetup();else if(state.view==="history")renderHistory();else if(state.view==="settings")renderSettings();}

  async function init(){
    if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
    if(await restoreSession())render();else renderAuth();
  }
  init();
})();
