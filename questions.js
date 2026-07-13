/* Question bank distilled from the supplied 2025–2026 International Banking exam notes. */
window.QUESTION_BANK = [
  {id:"intro-01",category:"Banking foundations",q:"Which activity is most characteristic of a commercial bank serving households and SMEs?",o:["Taking deposits and making loans","Underwriting only sovereign bonds","Operating a stock exchange","Issuing corporate credit ratings"],a:0,e:"Commercial banks provide payment and savings products and transform deposits into lending for households and businesses."},
  {id:"intro-02",category:"Banking foundations",q:"Which service is most closely associated with investment banking?",o:["Securities underwriting","Retail current accounts","Deposit insurance","Cash withdrawals at branches"],a:0,e:"Investment banks commonly underwrite debt and equity issues and provide advisory, valuation, trading and risk-management services."},
  {id:"intro-03",category:"Banking foundations",q:"A universal bank is best described as a bank that…",o:["Combines commercial and investment banking activities","Accepts deposits but cannot lend","Operates in only one country","Is owned by a central bank"],a:0,e:"Universal banking combines a broad commercial-banking franchise with investment-banking and other financial services."},
  {id:"intro-04",category:"Banking foundations",q:"What is the core economic role of maturity transformation?",o:["Funding longer-term assets with shorter-term liabilities","Replacing all loans with securities","Matching every asset with equity","Eliminating credit risk through diversification"],a:0,e:"Banks typically fund relatively illiquid, long-term loans with shorter-term and more liquid deposits, creating liquidity and maturity risk."},
  {id:"intro-05",category:"Banking foundations",q:"A bank's net interest income equals…",o:["Interest income minus interest expense","Fee income minus operating expenses","Revenue minus loan-loss provisions","Assets minus liabilities"],a:0,e:"Net interest income is the spread-based income from interest-earning assets after the cost of interest-bearing liabilities."},
  {id:"intro-06",category:"Banking foundations",q:"Which item is normally classified as non-interest income?",o:["Account service fees","Interest on mortgages","Coupon income on bonds","Interest paid on deposits"],a:0,e:"Fees, service charges and other service revenues are non-interest income."},

  {id:"fs-01",category:"Financial statements & ratios",q:"Which statement presents a bank's assets, liabilities and shareholders' equity at a point in time?",o:["Balance sheet","Income statement","Cash-flow statement","Statement of comprehensive income only"],a:0,e:"The balance sheet is the point-in-time statement of financial position."},
  {id:"fs-02",category:"Financial statements & ratios",q:"Return on equity (ROE) is generally calculated as…",o:["Net income divided by average equity","Net income divided by total deposits","Operating income divided by RWAs","Equity divided by total assets"],a:0,e:"ROE measures the earnings produced for shareholders relative to their average book equity."},
  {id:"fs-03",category:"Financial statements & ratios",q:"A lower cost-income ratio generally indicates…",o:["Greater operating efficiency","Higher credit risk","Lower capitalization","More wholesale funding"],a:0,e:"The ratio compares operating costs with operating income; a lower figure generally means better cost efficiency."},
  {id:"fs-04",category:"Financial statements & ratios",q:"Risk-weighted asset density is commonly measured as…",o:["RWAs divided by total assets","CET1 divided by RWAs","Net income divided by RWAs","Loans divided by deposits"],a:0,e:"RWA density shows how risk-intensive the asset base is by comparing risk-weighted assets with total assets."},
  {id:"fs-05",category:"Financial statements & ratios",q:"Which valuation relationship is most directly relevant to a bank's price-to-tangible-book multiple?",o:["Expected ROE relative to the cost of equity","Revenue relative to deposits","LCR relative to NSFR","Loan growth relative to GDP"],a:0,e:"Sustainable ROE above the cost of equity supports a price above tangible book value; the opposite tends to depress it."},
  {id:"fs-06",category:"Financial statements & ratios",q:"Tangible shareholders' equity excludes…",o:["Goodwill and other intangible assets","Retained earnings","Common shares","Cash reserves"],a:0,e:"Tangible equit…6808 tokens truncated…e</div></section>
    <section class="dashboard-grid"><div class="card launch-card"><div><span class="eyebrow">${p.activeQuiz?"Session saved":"Recommended next"}</span><h2>${p.activeQuiz?"Your quiz is waiting":"Start a focused study run"}</h2><p>${p.activeQuiz?`Resume at question ${p.activeQuiz.index+1} of ${p.activeQuiz.questionIds.length}. Every submitted answer is already safe.`:"Choose a topic mix, question count and practice mode. Missed questions stay in your review memory."}</p></div><button class="btn" data-action="${p.activeQuiz?"resume":"new"}">${p.activeQuiz?"Resume quiz":"Set up a quiz"} →</button></div>
    <div class="card"><div class="card-head"><div><h2>Needs another look</h2><p>Questions you have missed before.</p></div></div><div class="weak-list">${weak.length?weak.map(([id,m])=>{const q=qById(id);return `<div class="weak-item"><div><strong>${esc(q.q)}</strong><span>${esc(q.category)}</span></div><b class="badge bad">${m.wrong} miss${m.wrong===1?"":"es"}</b></div>`}).join(""):`<div class="empty">No weak spots yet. Start a quiz to build your review queue.</div>`}</div></div>
    <div class="card"><div class="card-head"><div><h2>Recent activity</h2><p>Your last completed sessions.</p></div><button class="btn btn-ghost" data-nav="history">View all</button></div><div class="history-list">${recent.length?recent.map(historyRow).join(""):`<div class="empty">Completed quizzes will appear here.</div>`}</div></div>
    <div class="card"><div class="card-head"><div><h2>Question bank</h2><p>Coverage distilled from the supplied exam material.</p></div></div><div class="weak-list">${categories.slice(0,5).map(c=>`<div class="weak-item"><strong>${esc(c)}</strong><span class="badge">${QUESTION_BANK.filter(q=>q.category===c).length}</span></div>`).join("")}<button class="btn btn-secondary btn-wide" data-nav="setup">Practice all ${QUESTION_BANK.length} questions</button></div></div></section>`;
    app.innerHTML=shell(content,"dashboard"); bindCommon();
    document.querySelector('[data-action="new"]')?.addEventListener("click",()=>go("setup"));
    document.querySelector('[data-action="resume"]')?.addEventListener("click",resumeQuiz);
    bindReviewButtons();
  }

  function renderSetup() {
    const selected=state.setup.categories;
    const content=hero("Build a session","New quiz","Tune the mix to the way you want to revise today.","setup")+`<section class="setup-grid">
      <div class="card"><div class="card-head"><div><h2>Practice mode</h2><p>How questions should be selected.</p></div></div><div class="option-grid">
      ${[["mixed","Mixed","Balanced random practice"],["wrong","Review misses","Questions missed before"],["unseen","Unseen","Questions not attempted yet"]].map(x=>`<button class="choice-card ${state.setup.mode===x[0]?"active":""}" data-mode="${x[0]}"><strong>${x[1]}</strong><small>${x[2]}</small></button>`).join("")}</div>
      <div class="field" style="margin-top:1.3rem"><label for="count">Number of questions</label><select id="count">${[5,10,20,30,54].map(n=>`<option value="${n}" ${state.setup.count===n?"selected":""}>${n===54?"All 54":n}</option>`).join("")}</select></div></div>
      <div class="card"><div class="card-head"><div><h2>Topics</h2><p>Select at least one category.</p></div><button class="btn btn-ghost" id="toggle-all">${selected.size===categories.length?"Clear":"Select all"}</button></div><div class="category-checks">${categories.map(c=>`<label class="category-check"><input type="checkbox" value="${esc(c)}" ${selected.has(c)?"checked":""}> ${esc(c)}</label>`).join("")}</div></div>
      <div class="card" style="grid-column:1/-1"><div class="card-head"><div><h2>Ready when you are</h2><p>Your progress is saved after every submitted answer.</p></div><button class="btn btn-primary" id="start-quiz">Start quiz →</button></div></div></section>`;
    app.innerHTML=shell(content,"setup");bindCommon();
    document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{state.setup.mode=b.dataset.mode;renderSetup();});
    document.getElementById("count").onchange=e=>state.setup.count=Number(e.target.value);
    document.querySelectorAll(".category-check input").forEach(cb=>cb.onchange=()=>{cb.checked?selected.add(cb.value):selected.delete(cb.value);});
    document.getElementById("toggle-all").onclick=()=>{state.setup.categories=selected.size===categories.length?new Set():new Set(categories);renderSetup();};
    document.getElementById("start-quiz").onclick=startQuiz;
  }

  function candidateQuestions() {
    const p=profile(); let qs=QUESTION_BANK.filter(q=>state.setup.categories.has(q.category));
    if(state.setup.mode==="wrong") qs=qs.filter(q=>(p.mastery[q.id]?.wrong||0)>0);
    if(state.setup.mode==="unseen") qs=qs.filter(q=>!p.mastery[q.id]);
    return qs;
  }
  function startQuiz() {
    if(!state.setup.categories.size)return toast("Select at least one topic."); const candidates=candidateQuestions();
    if(!candidates.length)return toast(state.setup.mode==="wrong"?"No missed questions in those topics yet.":"You have already seen every question in those topics.");
    const ids=shuffle(candidates).slice(0,Math.min(state.setup.count,candidates.length)).map(q=>q.id);
    state.quiz={id:uid(),mode:state.setup.mode,questionIds:ids,index:0,answers:[],startedAt:new Date().toISOString()};
    mutateProfile(p=>p.activeQuiz=state.quiz); renderQuiz();
  }
  function resumeQuiz(){state.quiz=profile().activeQuiz; if(!state.quiz)return go("dashboard");renderQuiz();}
  function currentAnswer(){return state.quiz.answers.find(a=>a.qid===state.quiz.questionIds[state.quiz.index]);}
  function renderQuiz() {
    const quiz=state.quiz,q=qById(quiz.questionIds[quiz.index]),done=currentAnswer(),pct=(quiz.index/quiz.questionIds.length)*100;
    app.innerHTML=`<div class="quiz-wrap"><div class="quiz-top"><div class="brand" style="color:var(--green)"><span class="brand-mark" style="border-color:var(--green)">B</span><span>Banking Desk</span></div><button class="btn btn-ghost" id="exit-quiz">Save & exit</button></div><div class="progress-track"><div class="progress-bar" style="width:${pct}%"></div></div>
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

  function historyRow(r){return `<div class="history-item"><div class="score-ring">${r.score}%</div><div class="history-main"><strong>${r.answers.length}-question ${r.mode} quiz</strong><span class="history-meta">${fmtDate(r.completedAt)} · ${r.answers.filter(a=>!a.correct).length} to review</span></div><button class="btn btn-ghost" data-review="${r.id}">Review</button></div>`;}
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
