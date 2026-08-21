(() => {
  'use strict';

  const BUILD = '0.1.0';
  const STORE_KEY = 'executive_os_workspace_v01';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const nowISO = () => new Date().toISOString();
  const todayISO = () => new Date().toISOString().slice(0,10);
  const uid = (prefix='x') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmtDate = d => !d ? '—' : new Date(`${d}T00:00:00`).toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});
  const money = v => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(v||0));
  const initials = name => String(name||'').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'EX';
  const clamp = (n,min=0,max=100) => Math.max(min,Math.min(max,Number(n)||0));

  const MODULES = [
    {group:'Execute', id:'command', icon:'⌁', label:'Command Centre', eyebrow:'EXECUTIVE COMMAND CENTRE'},
    {group:'Execute', id:'inbox', icon:'◈', label:'Executive Inbox', eyebrow:'PRIORITIES & ATTENTION'},
    {group:'Execute', id:'work', icon:'✓', label:'Workboard', eyebrow:'TASKS & COMMITMENTS'},
    {group:'Direction', id:'strategy', icon:'◎', label:'Strategy & OKRs', eyebrow:'OBJECTIVES & OUTCOMES'},
    {group:'Direction', id:'portfolio', icon:'▦', label:'Portfolio & Projects', eyebrow:'PROGRAMME CONTROL'},
    {group:'Direction', id:'finance', icon:'₹', label:'Finance & Operations', eyebrow:'BUSINESS PERFORMANCE'},
    {group:'Control', id:'risks', icon:'△', label:'Risks & Issues', eyebrow:'ENTERPRISE ASSURANCE'},
    {group:'Control', id:'decisions', icon:'◆', label:'Decision Register', eyebrow:'DECISION INTELLIGENCE'},
    {group:'Control', id:'approvals', icon:'↗', label:'Approvals', eyebrow:'EXECUTIVE AUTHORITY'},
    {group:'Control', id:'governance', icon:'▤', label:'Governance', eyebrow:'COMPLIANCE & OBLIGATIONS'},
    {group:'People', id:'leadership', icon:'◉', label:'Leadership & Org', eyebrow:'PEOPLE & ACCOUNTABILITY'},
    {group:'People', id:'meetings', icon:'◷', label:'Meetings & Agenda', eyebrow:'EXECUTIVE CADENCE'},
    {group:'People', id:'stakeholders', icon:'◇', label:'Stakeholders', eyebrow:'RELATIONSHIP MANAGEMENT'},
    {group:'Intelligence', id:'reports', icon:'▥', label:'Reports & Briefs', eyebrow:'MANAGEMENT INTELLIGENCE'},
    {group:'Intelligence', id:'knowledge', icon:'◫', label:'Knowledge & Records', eyebrow:'ORGANIZATIONAL MEMORY'},
    {group:'Intelligence', id:'audit', icon:'≡', label:'Activity & Audit', eyebrow:'TRACEABILITY'},
    {group:'System', id:'settings', icon:'⚙', label:'Settings', eyebrow:'WORKSPACE CONTROL'}
  ];

  const ROLES = [
    'MD / CEO','Chief Technology Officer','Chief Strategy Officer','Chief Operating Officer',
    'Chief Financial Officer','Head — R&D / Design','Head — Operations / HR','Director'
  ];

  const seed = () => ({
    meta:{version:BUILD,organization:'Deep-Tech Fabless Semiconductor Company',role:'MD / CEO',updatedAt:nowISO()},
    objectives:[
      {id:'o1',title:'Convert research pipeline into licensable semiconductor IP',owner:'Technology',period:'FY26–27',status:'On Track',progress:62,metric:'IP assets qualified',current:5,target:8},
      {id:'o2',title:'Secure strategic government and institutional programmes',owner:'Strategy',period:'FY26–27',status:'At Risk',progress:45,metric:'Funded programmes',current:2,target:5},
      {id:'o3',title:'Establish repeatable design-to-commercialization operating system',owner:'Operations',period:'Q2–Q3',status:'On Track',progress:71,metric:'Process maturity',current:71,target:100},
      {id:'o4',title:'Build customer-qualified FPGA/ASIC accelerator portfolio',owner:'Technology',period:'FY26–27',status:'Watch',progress:38,metric:'Qualified accelerators',current:3,target:10}
    ],
    projects:[
      {id:'p1',name:'DLI 2.0 — Secure Edge Computing SoC',owner:'Sundaram',sponsor:'MD / CEO',stage:'Proposal / Architecture',health:'Amber',progress:48,budget:12000000,spent:1300000,next:'Architecture review',due:'2026-08-31'},
      {id:'p2',name:'C-DOT — ZK Proof Hardware Accelerator',owner:'VLSI Lead',sponsor:'CTO',stage:'Phase III Scoping',health:'Green',progress:72,budget:4500000,spent:2900000,next:'Board validation',due:'2026-09-05'},
      {id:'p3',name:'PowerLoop HIL — EV Inverter',owner:'Embedded Lead',sponsor:'CTO',stage:'Module development',health:'Amber',progress:34,budget:1800000,spent:420000,next:'Module technical review',due:'2026-08-24'},
      {id:'p4',name:'UMAEngine — Reconfigurable Modular Arithmetic',owner:'R&D',sponsor:'Strategy',stage:'Concept / IP',health:'Green',progress:26,budget:900000,spent:120000,next:'Novelty freeze',due:'2026-09-12'},
      {id:'p5',name:'Perovskite DRA — 5G/6G',owner:'Research',sponsor:'Director',stage:'Prototype evidence',health:'Green',progress:67,budget:650000,spent:315000,next:'Evidence package',due:'2026-08-28'}
    ],
    tasks:[
      {id:'t1',title:'Freeze DLI system architecture and ownership map',owner:'Sundaram',priority:'Critical',status:'In Progress',due:'2026-08-23',project:'p1'},
      {id:'t2',title:'Close PowerLoop technical blockers and milestone dates',owner:'Embedded Lead',priority:'High',status:'Open',due:'2026-08-24',project:'p3'},
      {id:'t3',title:'Complete ZK Phase III commercial scope',owner:'VLSI Lead',priority:'High',status:'In Progress',due:'2026-08-27',project:'p2'},
      {id:'t4',title:'Prepare IP filing triage for arithmetic architecture',owner:'R&D',priority:'High',status:'Open',due:'2026-08-29',project:'p4'},
      {id:'t5',title:'Review website leadership and high-resolution media update',owner:'Operations',priority:'Medium',status:'Blocked',due:'2026-08-25',project:''},
      {id:'t6',title:'Build monthly management operating review pack',owner:'Strategy',priority:'Medium',status:'Open',due:'2026-09-01',project:''}
    ],
    meetings:[
      {id:'m1',title:'Weekly Executive Operating Review',date:'2026-08-24',time:'10:00',owner:'MD / CEO',type:'Operating Review',agenda:'Portfolio health; blockers; commercial pipeline; hiring; cash; decisions required'},
      {id:'m2',title:'DLI Architecture War Room',date:'2026-08-22',time:'11:30',owner:'Technology',type:'Technical Review',agenda:'Subsystem boundaries; IP reuse; tapeout assumptions; PPA and verification plan'},
      {id:'m3',title:'PowerLoop HIL Technical Review',date:'2026-08-24',time:'15:00',owner:'Technology',type:'Project Review',agenda:'Module progress; simulation findings; blockers; timeline and milestones'},
      {id:'m4',title:'IP & Patent Council',date:'2026-08-27',time:'16:00',owner:'Strategy',type:'Governance',agenda:'Novelty screen; inventors; disclosures; filing priorities; commercialization route'}
    ],
    decisions:[
      {id:'d1',title:'Hold non-core C-DOT extra tasks until commercial relevance is established',owner:'MD / CEO',date:'2026-08-12',status:'Active',impact:'High',context:'Protect engineering capacity and contractual focus.'},
      {id:'d2',title:'Prioritize patentable low-capex R&D with licensing potential',owner:'Leadership',date:'2026-08-12',status:'Active',impact:'Strategic',context:'Align research with commercialization and cash discipline.'},
      {id:'d3',title:'Move company communication to domain email',owner:'Operations',date:'2026-08-10',status:'Implemented',impact:'Medium',context:'Institutional professionalism and records continuity.'}
    ],
    risks:[
      {id:'r1',title:'Execution capacity spread across too many simultaneous initiatives',owner:'MD / CEO',impact:'High',likelihood:'High',status:'Open',mitigation:'Portfolio gating, named owners, weekly red/amber escalation.'},
      {id:'r2',title:'Government programme evidence/compliance may delay approvals',owner:'Strategy',impact:'High',likelihood:'Medium',status:'Mitigating',mitigation:'Evidence matrix, owner per criterion, pre-submission review.'},
      {id:'r3',title:'Prototype-to-product gap for FPGA/ASIC IP commercialization',owner:'Technology',impact:'High',likelihood:'Medium',status:'Open',mitigation:'Qualification gates: verification, PPA, board validation, documentation, licensing package.'},
      {id:'r4',title:'Single-point leadership dependency in architecture and review',owner:'Operations',impact:'Medium',likelihood:'High',status:'Open',mitigation:'Decision records, design reviews, delegated technical ownership.'}
    ],
    approvals:[
      {id:'a1',title:'EDA / FPGA resource acquisition for accelerator verification',requestor:'Technology',type:'Capex',amount:275000,status:'Pending',due:'2026-08-25'},
      {id:'a2',title:'IP prior-art / patentability support',requestor:'R&D',type:'Professional Service',amount:80000,status:'Pending',due:'2026-08-26'},
      {id:'a3',title:'Institutional collaboration travel and review',requestor:'Strategy',type:'Operating Expense',amount:35000,status:'Approved',due:'2026-08-20'}
    ],
    people:[
      {id:'u1',name:'Suresh Kuppuswamy',role:'Co-Founder, MD & CEO',suite:'C-Suite',function:'Strategy & Executive',capacity:74,focus:'Institutional growth / commercial strategy'},
      {id:'u2',name:'Sundaram S S',role:'Technology / Design Process Lead',suite:'H-Suite',function:'Technology & R&D',capacity:92,focus:'Architecture / IP / execution system'},
      {id:'u3',name:'Senior Lead — VLSI',role:'VLSI Lead',suite:'H-Suite',function:'VLSI',capacity:81,focus:'RTL / verification / FPGA acceleration'},
      {id:'u4',name:'Senior Lead — Embedded',role:'Embedded & Power Lead',suite:'H-Suite',function:'Embedded / Power',capacity:78,focus:'HIL / embedded systems / PCB'},
      {id:'u5',name:'Head — Operations',role:'Operations / HR / Admin',suite:'H-Suite',function:'Operations',capacity:68,focus:'People / administration / operating cadence'},
      {id:'u6',name:'Director',role:'Founder / Director',suite:'D-Suite',function:'Corporate',capacity:55,focus:'Governance / strategic support'}
    ],
    stakeholders:[
      {id:'s1',name:'MeitY / DLI PMU',type:'Government',owner:'Strategy',status:'Active',next:'Financial/technical compliance follow-up',date:'2026-08-25'},
      {id:'s2',name:'C-DOT',type:'Customer / Programme',owner:'Technology',status:'Active',next:'Phase III scope and board validation',date:'2026-08-27'},
      {id:'s3',name:'PSG College of Technology',type:'Academic Partner',owner:'MD / CEO',status:'MoU Processing',next:'Track approval and collaboration plan',date:'2026-09-15'},
      {id:'s4',name:'IIITM-K / CHIPMAT',type:'Innovation Programme',owner:'R&D',status:'Developing',next:'UMAEngine proposal refinement',date:'2026-09-02'}
    ],
    governance:[
      {id:'g1',title:'DLI 2.0 compliance and supporting evidence',owner:'Strategy',category:'Government Programme',status:'In Progress',due:'2026-08-31'},
      {id:'g2',title:'DPIIT Deep Tech evidence package',owner:'Strategy',category:'Recognition',status:'At Risk',due:'2026-09-05'},
      {id:'g3',title:'IP disclosure and patentability review process',owner:'R&D',category:'Intellectual Property',status:'In Progress',due:'2026-08-29'},
      {id:'g4',title:'Company records / MoU / contract repository',owner:'Operations',category:'Corporate Governance',status:'Planned',due:'2026-09-10'}
    ],
    knowledge:[
      {id:'k1',title:'DLI 2.0 Architecture Baseline',type:'Architecture',owner:'Technology',version:'v0.4',updated:'2026-08-20',status:'Working'},
      {id:'k2',title:'C-DOT ZK Accelerator Phase I–III Scope',type:'Programme',owner:'VLSI',version:'v3.0',updated:'2026-08-14',status:'Controlled'},
      {id:'k3',title:'IP Commercialization Qualification Checklist',type:'Process',owner:'R&D',version:'v0.2',updated:'2026-08-18',status:'Working'},
      {id:'k4',title:'Weekly Operating Review Template',type:'Management',owner:'Operations',version:'v1.0',updated:'2026-08-12',status:'Controlled'}
    ],
    finance:{cashRunway:14,revenuePipeline:18500000,weightedPipeline:7350000,burnMonthly:640000,receivables:1200000,committedCapex:980000,utilization:76,commercialReadiness:43},
    audit:[{id:'log_seed',at:nowISO(),actor:'System',action:'Workspace initialized',detail:'Executive OS v0.1 demo operating dataset created.'}]
  });

  let state = load();
  let active = 'command';

  function load(){
    try{
      const x=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
      return x && x.meta ? x : seed();
    }catch{return seed()}
  }
  function save(action,detail){
    state.meta.updatedAt=nowISO();
    if(action) state.audit.unshift({id:uid('log'),at:nowISO(),actor:state.meta.role,action,detail});
    state.audit=state.audit.slice(0,250);
    localStorage.setItem(STORE_KEY,JSON.stringify(state));
  }
  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.add('hidden'),2400)}
  function statusClass(v=''){
    const s=String(v).toLowerCase();
    if(/green|track|approved|implemented|controlled|complete|done|active/.test(s)) return 'good';
    if(/red|critical|blocked|risk|overdue/.test(s)) return 'bad';
    if(/amber|watch|pending|progress|mitigating|developing|planned|working/.test(s)) return 'warn';
    return 'info';
  }
  function badge(v,extra=''){return `<span class="badge ${extra||statusClass(v)}">${esc(v)}</span>`}
  function avatar(name){return `<span class="avatar">${esc(initials(name))}</span>`}
  function ownerCell(name){return `<div class="owner">${avatar(name)}<span>${esc(name)}</span></div>`}
  function progress(n){return `<div class="progress"><span style="width:${clamp(n)}%"></span></div>`}
  function projectName(id){return state.projects.find(x=>x.id===id)?.name || 'General / Corporate'}
  function count(arr,fn){return arr.filter(fn).length}

  function nav(){
    const el=$('#nav'); let last='';
    el.innerHTML=MODULES.map(m=>{
      const g=m.group!==last?`<div class="nav-group">${esc(m.group)}</div>`:''; last=m.group;
      return `${g}<button class="nav-btn ${m.id===active?'active':''}" data-page="${m.id}"><span class="nav-icon">${m.icon}</span><span>${esc(m.label)}</span></button>`
    }).join('');
    $$('.nav-btn').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
    const dock=['command','inbox','work','portfolio','reports'];
    $('#mobileDock').innerHTML=dock.map(id=>{const m=MODULES.find(x=>x.id===id);return `<button class="dock-btn ${active===id?'active':''}" data-page="${id}"><span>${m.icon}</span>${m.label.split(' ')[0]}</button>`}).join('');
    $$('.dock-btn').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
  }

  function go(id){
    active=id; nav(); render(); closeNav();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function render(){
    const m=MODULES.find(x=>x.id===active)||MODULES[0];
    $('#pageTitle').textContent=m.label; $('#pageEyebrow').textContent=m.eyebrow;
    const root=$('#pageRoot');
    const map={command:renderCommand,inbox:renderInbox,work:renderWork,strategy:renderStrategy,portfolio:renderPortfolio,finance:renderFinance,risks:renderRisks,decisions:renderDecisions,approvals:renderApprovals,governance:renderGovernance,leadership:renderLeadership,meetings:renderMeetings,stakeholders:renderStakeholders,reports:renderReports,knowledge:renderKnowledge,audit:renderAudit,settings:renderSettings};
    root.innerHTML=(map[active]||renderCommand)();
    wirePage();
  }

  function section(title,sub,body,action=''){
    return `<section class="section"><div class="section-title"><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div>${action}</div>${body}</section>`;
  }
  function kpi(label,value,foot,cls=''){
    return `<div class="card kpi-card"><div class="kpi-label">${esc(label)}</div><div class="kpi-value ${cls}">${value}</div><div class="kpi-foot">${esc(foot)}</div></div>`
  }
  function attentionItem(title,sub,b='Action',tone='attention'){
    return `<div class="list-item ${tone}"><div class="list-item-main"><strong>${esc(title)}</strong><p>${esc(sub)}</p></div><div class="list-actions">${badge(b)}</div></div>`
  }

  function renderCommand(){
    const openTasks=count(state.tasks,x=>x.status!=='Done');
    const dueSoon=count(state.tasks,x=>x.status!=='Done' && x.due<=addDays(5));
    const atRisk=count(state.projects,x=>x.health!=='Green');
    const pending=count(state.approvals,x=>x.status==='Pending');
    const highRisk=count(state.risks,x=>x.status!=='Closed'&&x.impact==='High');
    const okr=Math.round(state.objectives.reduce((a,x)=>a+x.progress,0)/Math.max(1,state.objectives.length));
    const attention=[];
    state.tasks.filter(x=>x.status!=='Done'&&x.priority==='Critical').forEach(x=>attention.push(attentionItem(x.title,`${x.owner} · due ${fmtDate(x.due)}`,'Critical','critical')));
    state.projects.filter(x=>x.health==='Amber'||x.health==='Red').slice(0,3).forEach(x=>attention.push(attentionItem(x.name,`${x.stage} · next: ${x.next}`,'Review')));
    state.approvals.filter(x=>x.status==='Pending').slice(0,2).forEach(x=>attention.push(attentionItem(x.title,`${x.requestor} · ${money(x.amount)}`,'Approval')));
    const meetings=state.meetings.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).filter(x=>x.date>=todayISO()).slice(0,5);
    return `
      <div class="grid kpis section">
        ${kpi('Open commitments',openTasks,`${dueSoon} due within 5 days`,dueSoon>2?'kpi-warn':'')}
        ${kpi('Portfolio health',`${state.projects.length-atRisk}/${state.projects.length}`,'projects green',atRisk?'kpi-warn':'kpi-good')}
        ${kpi('Strategy execution',`${okr}%`,'average OKR progress','kpi-info')}
        ${kpi('High enterprise risks',highRisk,'require leadership ownership',highRisk>2?'kpi-bad':'kpi-warn')}
        ${kpi('Pending approvals',pending,'awaiting executive authority',pending?'kpi-warn':'kpi-good')}
        ${kpi('Weighted pipeline',money(state.finance.weightedPipeline),'commercial opportunity','kpi-good')}
      </div>
      <div class="grid two section">
        <div class="card"><div class="card-head"><div><h2>Executive attention queue</h2><p>Items most likely to need leadership intervention now</p></div>${badge(`${attention.length} items`,'gold')}</div><div class="list">${attention.join('')||'<div class="empty">No urgent items.</div>'}</div></div>
        <div class="card"><div class="card-head"><div><h2>Operating cadence</h2><p>Upcoming reviews, war rooms and decision forums</p></div><button class="mini-btn" data-go="meetings">Open calendar</button></div><div class="timeline">${meetings.map(x=>`<div class="timeline-item"><div class="timeline-time">${fmtDate(x.date).replace(/ \d{4}/,'')}<br>${esc(x.time)}</div><div><div class="timeline-title">${esc(x.title)}</div><div class="timeline-sub">${esc(x.type)} · ${esc(x.owner)}</div></div></div>`).join('')}</div></div>
      </div>
      <div class="grid three section">
        <div class="card"><div class="card-head"><div><h2>Strategic outcome pulse</h2><p>Progress against company-level objectives</p></div><button class="mini-btn" data-go="strategy">Details</button></div>${state.objectives.map(x=>`<div class="metric-row"><div><strong>${esc(x.title)}</strong><span>${esc(x.owner)} · ${esc(x.period)}</span>${progress(x.progress)}</div><div>${badge(`${x.progress}%`,statusClass(x.status))}</div></div>`).join('')}</div>
        <div class="card"><div class="card-head"><div><h2>Portfolio health</h2><p>Delivery posture across active initiatives</p></div><button class="mini-btn" data-go="portfolio">Portfolio</button></div><div class="health-grid"><div class="health-tile"><strong class="kpi-good">${count(state.projects,x=>x.health==='Green')}</strong><span>Green</span></div><div class="health-tile"><strong class="kpi-warn">${count(state.projects,x=>x.health==='Amber')}</strong><span>Amber</span></div><div class="health-tile"><strong class="kpi-bad">${count(state.projects,x=>x.health==='Red')}</strong><span>Red</span></div></div><div class="spark">${[32,46,40,58,66,61,73,69,78,82,76,86].map((h,i)=>`<i class="${i>8?'hot':''}" style="height:${h}%"></i>`).join('')}</div></div>
        <div class="card"><div class="card-head"><div><h2>Company control pulse</h2><p>Cash, capacity and commercialization</p></div><button class="mini-btn" data-go="finance">Business view</button></div><div class="metric-row"><strong>Cash runway</strong><span>${state.finance.cashRunway} months</span></div><div class="metric-row"><strong>Team utilization</strong><span>${state.finance.utilization}%</span></div><div class="metric-row"><strong>Commercial readiness</strong><span>${state.finance.commercialReadiness}%</span></div><div class="metric-row"><strong>Monthly burn</strong><span>${money(state.finance.burnMonthly)}</span></div></div>
      </div>`;
  }

  function renderInbox(){
    const items=[
      ...state.tasks.filter(x=>x.status!=='Done'&&['Critical','High'].includes(x.priority)).map(x=>({t:x.title,s:`Task · ${x.owner} · ${fmtDate(x.due)}`,b:x.priority,tone:x.priority==='Critical'?'critical':'attention'})),
      ...state.approvals.filter(x=>x.status==='Pending').map(x=>({t:x.title,s:`Approval · ${x.requestor} · ${money(x.amount)}`,b:'Approve / reject',tone:'attention'})),
      ...state.risks.filter(x=>x.status!=='Closed'&&x.impact==='High').map(x=>({t:x.title,s:`Risk · ${x.owner} · ${x.likelihood} likelihood`,b:'Review',tone:'critical'})),
      ...state.governance.filter(x=>['At Risk','In Progress'].includes(x.status)).map(x=>({t:x.title,s:`Governance · ${x.owner} · ${fmtDate(x.due)}`,b:x.status,tone:x.status==='At Risk'?'critical':'attention'}))
    ];
    return section('Unified attention queue','Critical tasks, approvals, risks and governance obligations that should not be buried in separate tools',`<div class="card"><div class="toolbar"><input id="pageFilter" class="grow" placeholder="Filter attention items…"><select id="toneFilter"><option value="">All</option><option>Critical</option><option>High</option><option>Review</option></select></div><div class="list" id="filterList">${items.map(x=>`<div class="list-item ${x.tone}" data-filter="${esc(`${x.t} ${x.s} ${x.b}`.toLowerCase())}"><div class="list-item-main"><strong>${esc(x.t)}</strong><p>${esc(x.s)}</p></div><div class="list-actions">${badge(x.b)}</div></div>`).join('')}</div></div>`);
  }

  function renderWork(){
    return section('Commitments workboard','Company tasks, assignments, deadlines, owners and project linkage',`<div class="card"><div class="toolbar"><input id="pageFilter" class="grow" placeholder="Search task, owner or project…"><select id="statusFilter"><option value="">All status</option><option>Open</option><option>In Progress</option><option>Blocked</option><option>Done</option></select><button class="primary mini-create" data-type="task">+ Task</button></div>${taskTable()}</div>`);
  }
  function taskTable(){
    const rows=state.tasks.slice().sort((a,b)=>a.due.localeCompare(b.due)).map(x=>`<tr data-filter="${esc(`${x.title} ${x.owner} ${projectName(x.project)} ${x.status}`.toLowerCase())}" data-status="${esc(x.status)}"><td><div class="cell-title">${esc(x.title)}</div><div class="cell-sub">${esc(projectName(x.project))}</div></td><td>${ownerCell(x.owner)}</td><td>${badge(x.priority,x.priority==='Critical'?'bad':x.priority==='High'?'warn':'info')}</td><td>${badge(x.status)}</td><td>${fmtDate(x.due)}</td><td><button class="mini-btn" data-action="toggle-task" data-id="${x.id}">${x.status==='Done'?'Reopen':'Complete'}</button></td></tr>`).join('');
    return `<div class="table-wrap"><table><thead><tr><th>Commitment</th><th>Owner</th><th>Priority</th><th>Status</th><th>Due</th><th>Action</th></tr></thead><tbody id="filterRows">${rows}</tbody></table></div>`;
  }

  function renderStrategy(){
    const cards=state.objectives.map(x=>`<div class="card"><div class="card-head"><div><div class="eyebrow">${esc(x.period)}</div><h2 style="margin-top:5px">${esc(x.title)}</h2><p>${esc(x.owner)} · ${esc(x.metric)}</p></div>${badge(x.status)}</div><div class="kpi-value">${x.progress}%</div>${progress(x.progress)}<div class="metric-row"><strong>Current</strong><span>${esc(x.current)}</span></div><div class="metric-row"><strong>Target</strong><span>${esc(x.target)}</span></div></div>`).join('');
    return section('Strategy execution system','Objectives, outcomes, KPIs and strategic accountability',`<div class="toolbar"><button class="primary mini-create" data-type="objective">+ Objective</button></div><div class="grid two">${cards}</div>`);
  }

  function renderPortfolio(){
    const rows=state.projects.map(x=>`<tr data-filter="${esc(`${x.name} ${x.owner} ${x.stage} ${x.health}`.toLowerCase())}" data-status="${esc(x.health)}"><td><div class="cell-title">${esc(x.name)}</div><div class="cell-sub">Next: ${esc(x.next)}</div></td><td>${ownerCell(x.owner)}</td><td>${esc(x.stage)}</td><td>${badge(x.health)}</td><td><strong>${x.progress}%</strong>${progress(x.progress)}</td><td><div class="cell-title">${money(x.spent)}</div><div class="cell-sub">of ${money(x.budget)}</div></td><td>${fmtDate(x.due)}</td></tr>`).join('');
    return section('Enterprise portfolio','One portfolio view for technical programmes, R&D, customer delivery and strategic initiatives',`<div class="card"><div class="toolbar"><input id="pageFilter" class="grow" placeholder="Search portfolio…"><select id="statusFilter"><option value="">All health</option><option>Green</option><option>Amber</option><option>Red</option></select><button class="primary mini-create" data-type="project">+ Project</button></div><div class="table-wrap"><table><thead><tr><th>Initiative</th><th>Owner</th><th>Stage</th><th>Health</th><th>Progress</th><th>Spend</th><th>Milestone</th></tr></thead><tbody id="filterRows">${rows}</tbody></table></div></div>`);
  }

  function renderFinance(){
    const f=state.finance;
    return `
      <div class="grid kpis section">${kpi('Cash runway',`${f.cashRunway} mo`,'estimated at current burn',f.cashRunway<9?'kpi-bad':'kpi-good')}${kpi('Revenue pipeline',money(f.revenuePipeline),'gross opportunity','kpi-info')}${kpi('Weighted pipeline',money(f.weightedPipeline),'probability adjusted','kpi-good')}${kpi('Monthly burn',money(f.burnMonthly),'operating burn','kpi-warn')}${kpi('Receivables',money(f.receivables),'outstanding','kpi-info')}${kpi('Committed capex',money(f.committedCapex),'approved / planned','kpi-warn')}</div>
      <div class="grid two section"><div class="card"><div class="card-head"><div><h2>Operating capacity</h2><p>Leadership view of utilization and delivery pressure</p></div>${badge(`${f.utilization}% utilized`,f.utilization>88?'bad':'good')}</div>${progress(f.utilization)}<div class="metric-row"><strong>Engineering utilization</strong><span>${f.utilization}%</span></div><div class="metric-row"><strong>Commercial readiness index</strong><span>${f.commercialReadiness}%</span></div><div class="metric-row"><strong>Active programme count</strong><span>${state.projects.length}</span></div></div><div class="card"><div class="card-head"><div><h2>Programme economics</h2><p>Budget exposure by active initiative</p></div></div>${state.projects.map(x=>`<div class="metric-row"><div><strong>${esc(x.name)}</strong><span>${Math.round((x.spent/Math.max(1,x.budget))*100)}% budget consumed</span></div><span>${money(x.spent)}</span></div>`).join('')}</div></div>`;
  }

  function renderRisks(){
    const rows=state.risks.map(x=>`<tr data-filter="${esc(`${x.title} ${x.owner} ${x.status} ${x.impact} ${x.likelihood}`.toLowerCase())}" data-status="${esc(x.status)}"><td><div class="cell-title">${esc(x.title)}</div><div class="cell-sub">${esc(x.mitigation)}</div></td><td>${ownerCell(x.owner)}</td><td>${badge(x.impact,x.impact==='High'?'bad':'warn')}</td><td>${badge(x.likelihood)}</td><td>${badge(x.status)}</td><td><button class="mini-btn" data-action="close-risk" data-id="${x.id}">${x.status==='Closed'?'Reopen':'Close'}</button></td></tr>`).join('');
    return section('Enterprise risks & issues','Risk ownership, impact, likelihood and mitigation actions',`<div class="card"><div class="toolbar"><input id="pageFilter" class="grow" placeholder="Search risks…"><select id="statusFilter"><option value="">All status</option><option>Open</option><option>Mitigating</option><option>Closed</option></select><button class="primary mini-create" data-type="risk">+ Risk</button></div><div class="table-wrap"><table><thead><tr><th>Risk / issue</th><th>Owner</th><th>Impact</th><th>Likelihood</th><th>Status</th><th>Action</th></tr></thead><tbody id="filterRows">${rows}</tbody></table></div></div>`);
  }

  function renderDecisions(){
    return section('Decision register','Institutional memory for what leadership decided, why, when and with what consequence',`<div class="toolbar"><button class="primary mini-create" data-type="decision">+ Decision</button></div><div class="grid two">${state.decisions.map(x=>`<div class="card"><div class="card-head"><div><div class="eyebrow">${fmtDate(x.date)}</div><h2 style="margin-top:5px">${esc(x.title)}</h2><p>${esc(x.owner)}</p></div>${badge(x.status)}</div><p style="color:var(--muted);line-height:1.6">${esc(x.context)}</p><div class="metric-row"><strong>Impact</strong><span>${esc(x.impact)}</span></div></div>`).join('')}</div>`);
  }

  function renderApprovals(){
    const rows=state.approvals.map(x=>`<tr data-filter="${esc(`${x.title} ${x.requestor} ${x.type} ${x.status}`.toLowerCase())}" data-status="${esc(x.status)}"><td><div class="cell-title">${esc(x.title)}</div><div class="cell-sub">${esc(x.type)}</div></td><td>${ownerCell(x.requestor)}</td><td>${money(x.amount)}</td><td>${fmtDate(x.due)}</td><td>${badge(x.status)}</td><td>${x.status==='Pending'?`<button class="mini-btn" data-action="approval" data-id="${x.id}" data-value="Approved">Approve</button> <button class="mini-btn" data-action="approval" data-id="${x.id}" data-value="Rejected">Reject</button>`:'—'}</td></tr>`).join('');
    return section('Executive approvals','Authority queue for capex, services, expenses, policy exceptions and management commitments',`<div class="card"><div class="toolbar"><input id="pageFilter" class="grow" placeholder="Search approvals…"><select id="statusFilter"><option value="">All status</option><option>Pending</option><option>Approved</option><option>Rejected</option></select><button class="primary mini-create" data-type="approval">+ Request</button></div><div class="table-wrap"><table><thead><tr><th>Request</th><th>Requestor</th><th>Value</th><th>Due</th><th>Status</th><th>Authority</th></tr></thead><tbody id="filterRows">${rows}</tbody></table></div></div>`);
  }

  function renderGovernance(){
    const rows=state.governance.map(x=>`<tr data-filter="${esc(`${x.title} ${x.owner} ${x.category} ${x.status}`.toLowerCase())}" data-status="${esc(x.status)}"><td><div class="cell-title">${esc(x.title)}</div><div class="cell-sub">${esc(x.category)}</div></td><td>${ownerCell(x.owner)}</td><td>${badge(x.status)}</td><td>${fmtDate(x.due)}</td></tr>`).join('');
    return section('Governance & compliance','Obligations spanning government programmes, IP, corporate records, contracts and institutional commitments',`<div class="card"><div class="toolbar"><input id="pageFilter" class="grow" placeholder="Search obligations…"><select id="statusFilter"><option value="">All status</option><option>In Progress</option><option>At Risk</option><option>Planned</option><option>Complete</option></select></div><div class="table-wrap"><table><thead><tr><th>Obligation</th><th>Owner</th><th>Status</th><th>Due</th></tr></thead><tbody id="filterRows">${rows}</tbody></table></div></div>`);
  }

  function renderLeadership(){
    return `${section('Leadership operating map','C-Suite, H-Suite and D-Suite accountability with workload visibility',`<div class="suite-row"><span class="suite-chip active">C-Suite · Enterprise authority</span><span class="suite-chip active">H-Suite · Functional authority</span><span class="suite-chip active">D-Suite · Direction / governance</span></div>`)}<div class="grid three">${state.people.map(x=>`<div class="card"><div class="card-head"><div class="owner">${avatar(x.name)}<div><h2>${esc(x.name)}</h2><p>${esc(x.role)}</p></div></div>${badge(x.suite,'gold')}</div><div class="metric-row"><strong>Function</strong><span>${esc(x.function)}</span></div><div class="metric-row"><strong>Current focus</strong><span>${esc(x.focus)}</span></div><div class="metric-row"><strong>Capacity load</strong><span class="${x.capacity>88?'kpi-bad':x.capacity>78?'kpi-warn':'kpi-good'}">${x.capacity}%</span></div>${progress(x.capacity)}</div>`).join('')}</div>`;
  }

  function renderMeetings(){
    const items=state.meetings.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    return section('Executive calendar & agenda system','Meetings become accountable forums: agenda, owner, decision capture and action conversion',`<div class="toolbar"><button class="primary mini-create" data-type="meeting">+ Meeting</button></div><div class="grid two">${items.map(x=>`<div class="card"><div class="card-head"><div><div class="eyebrow">${fmtDate(x.date)} · ${esc(x.time)}</div><h2 style="margin-top:5px">${esc(x.title)}</h2><p>${esc(x.type)} · ${esc(x.owner)}</p></div>${badge(x.date<todayISO()?'Past':'Scheduled')}</div><div class="metric-row"><div><strong>Agenda</strong><span>${esc(x.agenda)}</span></div></div><div class="form-actions"><button class="mini-btn" data-action="agenda-task" data-id="${x.id}">Create follow-up task</button></div></div>`).join('')}</div>`);
  }

  function renderStakeholders(){
    const rows=state.stakeholders.map(x=>`<tr data-filter="${esc(`${x.name} ${x.type} ${x.owner} ${x.status} ${x.next}`.toLowerCase())}" data-status="${esc(x.status)}"><td><div class="cell-title">${esc(x.name)}</div><div class="cell-sub">${esc(x.type)}</div></td><td>${ownerCell(x.owner)}</td><td>${badge(x.status)}</td><td>${esc(x.next)}</td><td>${fmtDate(x.date)}</td></tr>`).join('');
    return section('Strategic stakeholders','Government, customers, academic partners, investors, vendors and institutional relationships',`<div class="card"><div class="toolbar"><input id="pageFilter" class="grow" placeholder="Search stakeholders…"></div><div class="table-wrap"><table><thead><tr><th>Stakeholder</th><th>Owner</th><th>Status</th><th>Next move</th><th>Target date</th></tr></thead><tbody id="filterRows">${rows}</tbody></table></div></div>`);
  }

  function executiveBrief(){
    const critical=state.tasks.filter(x=>x.status!=='Done'&&['Critical','High'].includes(x.priority)).slice(0,5);
    const risks=state.risks.filter(x=>x.status!=='Closed'&&x.impact==='High').slice(0,4);
    const projects=state.projects.filter(x=>x.health!=='Green').slice(0,4);
    const approvals=state.approvals.filter(x=>x.status==='Pending');
    return `EXECUTIVE OPERATING BRIEF — ${new Date().toLocaleDateString(undefined,{dateStyle:'long'})}\n\n1. COMPANY PULSE\n• ${state.projects.length} active initiatives; ${count(state.projects,x=>x.health==='Green')} green, ${count(state.projects,x=>x.health==='Amber')} amber, ${count(state.projects,x=>x.health==='Red')} red.\n• ${state.tasks.filter(x=>x.status!=='Done').length} open commitments; ${critical.length} high/critical items in immediate focus.\n• ${risks.length} high-impact enterprise risks remain open.\n• ${approvals.length} executive approvals pending.\n• Cash runway: ${state.finance.cashRunway} months; weighted commercial pipeline: ${money(state.finance.weightedPipeline)}.\n\n2. PRIORITY EXECUTION\n${critical.map((x,i)=>`${i+1}. ${x.title} — ${x.owner}, due ${fmtDate(x.due)}.`).join('\n')||'No high-priority commitments.'}\n\n3. PORTFOLIO EXCEPTIONS\n${projects.map((x,i)=>`${i+1}. ${x.name} — ${x.health}; next: ${x.next}.`).join('\n')||'No portfolio exceptions.'}\n\n4. ENTERPRISE RISKS\n${risks.map((x,i)=>`${i+1}. ${x.title} — owner ${x.owner}; mitigation: ${x.mitigation}`).join('\n')||'No high-impact open risks.'}\n\n5. DECISIONS / AUTHORITY REQUIRED\n${approvals.map((x,i)=>`${i+1}. ${x.title} — ${money(x.amount)}, requested by ${x.requestor}.`).join('\n')||'No approvals pending.'}\n\nGenerated by Executive OS v${BUILD}.`;
  }

  function renderReports(){
    const brief=executiveBrief();
    return `${section('Executive reporting engine','Generate one consistent operating brief from live organizational data',`<div class="toolbar"><button id="copyBrief" class="primary">Copy executive brief</button><button id="downloadBrief" class="secondary">Download .txt</button></div><div class="brief" id="briefText">${esc(brief)}</div>`)}<div class="grid three"><div class="card"><h2>Weekly Operating Review</h2><p class="kpi-foot">Portfolio, blockers, people, commercial, finance, decisions.</p></div><div class="card"><h2>Board / Director Brief</h2><p class="kpi-foot">Strategy, cash, material risks, governance, milestones.</p></div><div class="card"><h2>Technical Leadership Review</h2><p class="kpi-foot">Architecture, verification, PPA, dependencies, IP readiness.</p></div></div>`;
  }

  function renderKnowledge(){
    const rows=state.knowledge.map(x=>`<tr data-filter="${esc(`${x.title} ${x.type} ${x.owner} ${x.status}`.toLowerCase())}" data-status="${esc(x.status)}"><td><div class="cell-title">${esc(x.title)}</div><div class="cell-sub">${esc(x.type)}</div></td><td>${ownerCell(x.owner)}</td><td>${esc(x.version)}</td><td>${fmtDate(x.updated)}</td><td>${badge(x.status)}</td></tr>`).join('');
    return section('Knowledge & controlled records','Management system for architecture baselines, processes, programme scope, policies and institutional memory',`<div class="card"><div class="toolbar"><input id="pageFilter" class="grow" placeholder="Search records…"></div><div class="table-wrap"><table><thead><tr><th>Record</th><th>Owner</th><th>Version</th><th>Updated</th><th>Control</th></tr></thead><tbody id="filterRows">${rows}</tbody></table></div></div>`);
  }

  function renderAudit(){
    return section('Activity & audit trail','Trace leadership actions and workspace changes',`<div class="card"><div class="timeline">${state.audit.map(x=>`<div class="timeline-item"><div class="timeline-time">${new Date(x.at).toLocaleString(undefined,{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</div><div><div class="timeline-title">${esc(x.action)}</div><div class="timeline-sub">${esc(x.actor)} · ${esc(x.detail)}</div></div></div>`).join('')}</div></div>`);
  }

  function renderSettings(){
    return `<div class="grid two"><div class="card"><div class="card-head"><div><h2>Organization workspace</h2><p>Brand and leadership context</p></div>${badge(`v${BUILD}`,'gold')}</div><div class="form-grid"><div class="field wide"><label>Organization name</label><input id="orgNameInput" value="${esc(state.meta.organization)}"></div><div class="field wide"><label>Current role context</label><select id="roleSettings">${ROLES.map(r=>`<option ${r===state.meta.role?'selected':''}>${esc(r)}</option>`).join('')}</select></div></div><div class="form-actions"><button id="saveSettings" class="primary">Save settings</button></div></div><div class="card"><div class="card-head"><div><h2>Platform architecture</h2><p>Current release posture</p></div></div><div class="metric-row"><strong>Responsive PWA</strong>${badge('Enabled','good')}</div><div class="metric-row"><strong>Offline local persistence</strong>${badge('Enabled','good')}</div><div class="metric-row"><strong>JSON backup / restore</strong>${badge('Enabled','good')}</div><div class="metric-row"><strong>Role-context switching</strong>${badge('Enabled','good')}</div><div class="metric-row"><strong>Cloud multi-user RBAC</strong>${badge('Next layer','warn')}</div><div class="metric-row"><strong>Enterprise SSO / MFA</strong>${badge('Next layer','warn')}</div><div class="metric-row"><strong>Realtime notifications</strong>${badge('Next layer','warn')}</div></div></div>`;
  }

  function addDays(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}

  function wirePage(){
    $$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
    $$('.mini-create').forEach(b=>b.addEventListener('click',()=>openCreate(b.dataset.type)));
    const pf=$('#pageFilter'), sf=$('#statusFilter');
    const applyFilter=()=>{
      const q=(pf?.value||'').trim().toLowerCase(), s=sf?.value||'';
      $$('[data-filter]').forEach(el=>{const okQ=!q||el.dataset.filter.includes(q);const okS=!s||el.dataset.status===s;el.style.display=okQ&&okS?'':'none'});
    };
    pf?.addEventListener('input',applyFilter);sf?.addEventListener('change',applyFilter);
    $$('[data-action="toggle-task"]').forEach(b=>b.addEventListener('click',()=>{const x=state.tasks.find(t=>t.id===b.dataset.id);if(!x)return;x.status=x.status==='Done'?'Open':'Done';save('Task status changed',`${x.title} → ${x.status}`);render();toast(`Task ${x.status.toLowerCase()}`)}));
    $$('[data-action="close-risk"]').forEach(b=>b.addEventListener('click',()=>{const x=state.risks.find(t=>t.id===b.dataset.id);if(!x)return;x.status=x.status==='Closed'?'Open':'Closed';save('Risk status changed',`${x.title} → ${x.status}`);render();toast(`Risk ${x.status.toLowerCase()}`)}));
    $$('[data-action="approval"]').forEach(b=>b.addEventListener('click',()=>{const x=state.approvals.find(t=>t.id===b.dataset.id);if(!x)return;x.status=b.dataset.value;save('Approval decision',`${x.title} → ${x.status}`);render();toast(`Request ${x.status.toLowerCase()}`)}));
    $$('[data-action="agenda-task"]').forEach(b=>b.addEventListener('click',()=>{const m=state.meetings.find(x=>x.id===b.dataset.id);if(!m)return;state.tasks.push({id:uid('t'),title:`Follow-up: ${m.title}`,owner:m.owner,priority:'Medium',status:'Open',due:addDays(2),project:''});save('Meeting follow-up created',m.title);toast('Follow-up task created')}));
    $('#copyBrief')?.addEventListener('click',async()=>{await navigator.clipboard.writeText(executiveBrief());toast('Executive brief copied')});
    $('#downloadBrief')?.addEventListener('click',()=>downloadText('executive-operating-brief.txt',executiveBrief(),'text/plain'));
    $('#saveSettings')?.addEventListener('click',()=>{state.meta.organization=$('#orgNameInput').value.trim()||state.meta.organization;state.meta.role=$('#roleSettings').value;save('Workspace settings updated',`Organization: ${state.meta.organization}; role: ${state.meta.role}`);initRole();$('#orgLabel').textContent=state.meta.organization;render();toast('Workspace settings saved')});
  }

  const FIELDS = {
    task:[['title','Commitment','text'],['owner','Owner','text'],['priority','Priority','select',['Critical','High','Medium','Low']],['status','Status','select',['Open','In Progress','Blocked','Done']],['due','Due date','date'],['project','Project','project']],
    project:[['name','Initiative / project','text'],['owner','Owner','text'],['sponsor','Sponsor','text'],['stage','Stage','text'],['health','Health','select',['Green','Amber','Red']],['progress','Progress %','number'],['budget','Approved budget','number'],['spent','Spend to date','number'],['next','Next milestone','text'],['due','Milestone date','date']],
    objective:[['title','Objective','text'],['owner','Owner','text'],['period','Period','text'],['status','Status','select',['On Track','Watch','At Risk']],['progress','Progress %','number'],['metric','Metric','text'],['current','Current','number'],['target','Target','number']],
    risk:[['title','Risk / issue','text'],['owner','Owner','text'],['impact','Impact','select',['High','Medium','Low']],['likelihood','Likelihood','select',['High','Medium','Low']],['status','Status','select',['Open','Mitigating','Closed']],['mitigation','Mitigation','textarea']],
    decision:[['title','Decision','text'],['owner','Decision owner','text'],['date','Decision date','date'],['status','Status','select',['Active','Implemented','Superseded']],['impact','Impact','select',['Strategic','High','Medium','Low']],['context','Rationale / context','textarea']],
    approval:[['title','Approval request','text'],['requestor','Requestor','text'],['type','Type','text'],['amount','Amount','number'],['status','Status','select',['Pending','Approved','Rejected']],['due','Decision due','date']],
    meeting:[['title','Meeting / forum','text'],['date','Date','date'],['time','Time','time'],['owner','Chair / owner','text'],['type','Meeting type','text'],['agenda','Agenda','textarea']]
  };
  const COLLECTION = {task:'tasks',project:'projects',objective:'objectives',risk:'risks',decision:'decisions',approval:'approvals',meeting:'meetings'};

  function openCreate(type='task'){
    const modal=$('#modal'); $('#modalTitle').textContent=`Create ${type}`;$('#modalEyebrow').textContent='EXECUTIVE WORKFLOW';
    const fields=FIELDS[type]||FIELDS.task;
    $('#modalBody').innerHTML=`<form id="createForm"><div class="form-grid">${fields.map(f=>fieldHTML(f)).join('')}</div><div class="form-actions"><button type="button" class="secondary" id="cancelCreate">Cancel</button><button class="primary" type="submit">Save ${esc(type)}</button></div></form>`;
    $('#cancelCreate').addEventListener('click',()=>modal.close());
    $('#createForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget),obj={id:uid(type[0])};fields.forEach(f=>{let v=fd.get(f[0]);if(f[2]==='number')v=Number(v||0);obj[f[0]]=v});state[COLLECTION[type]].push(obj);save(`${type[0].toUpperCase()+type.slice(1)} created`,obj.title||obj.name||type);modal.close();render();toast(`${type[0].toUpperCase()+type.slice(1)} created`)});
    modal.showModal();
  }
  function fieldHTML(f){
    const [name,label,type,options]=f; const cls=type==='textarea'?'wide':'';
    if(type==='select')return `<div class="field ${cls}"><label>${esc(label)}</label><select name="${name}">${options.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div>`;
    if(type==='project')return `<div class="field ${cls}"><label>${esc(label)}</label><select name="${name}"><option value="">General / Corporate</option>${state.projects.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></div>`;
    if(type==='textarea')return `<div class="field ${cls}"><label>${esc(label)}</label><textarea name="${name}" required></textarea></div>`;
    return `<div class="field ${cls}"><label>${esc(label)}</label><input name="${name}" type="${type}" ${type==='date'?`value="${addDays(7)}"`:''} ${name==='progress'?'min="0" max="100"':''} required></div>`;
  }

  function openSearch(){
    const modal=$('#modal');$('#modalTitle').textContent='Command search';$('#modalEyebrow').textContent='ORGANIZATION-WIDE FIND';
    $('#modalBody').innerHTML=`<div class="field"><label>Search projects, tasks, decisions, risks, people and records</label><input id="globalSearch" autofocus placeholder="Type anything…"></div><div id="searchResults" class="list" style="margin-top:12px"></div>`;
    const input=$('#globalSearch'), out=$('#searchResults');
    const search=()=>{const q=input.value.trim().toLowerCase();if(!q){out.innerHTML='<div class="empty">Start typing to search the executive workspace.</div>';return}const sets=[['Project',state.projects,'name'],['Task',state.tasks,'title'],['Objective',state.objectives,'title'],['Risk',state.risks,'title'],['Decision',state.decisions,'title'],['Meeting',state.meetings,'title'],['Person',state.people,'name'],['Stakeholder',state.stakeholders,'name'],['Record',state.knowledge,'title']];const hits=[];sets.forEach(([kind,arr,key])=>arr.forEach(x=>{if(JSON.stringify(x).toLowerCase().includes(q))hits.push({kind,title:x[key],sub:x.owner||x.role||x.type||''})}));out.innerHTML=hits.slice(0,30).map(x=>`<div class="list-item"><div class="list-item-main"><strong>${esc(x.title)}</strong><p>${esc(x.kind)} · ${esc(x.sub)}</p></div>${badge(x.kind,'info')}</div>`).join('')||'<div class="empty">No matching records.</div>'};
    input.addEventListener('input',search);search();modal.showModal();setTimeout(()=>input.focus(),50);
  }

  function exportWorkspace(){downloadText(`executive-os-backup-${todayISO()}.json`,JSON.stringify(state,null,2),'application/json');save('Workspace exported','JSON backup created');toast('Workspace backup exported')}
  function downloadText(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  async function importWorkspace(file){
    try{const x=JSON.parse(await file.text());if(!x?.meta||!Array.isArray(x.projects)||!Array.isArray(x.tasks))throw new Error('Invalid Executive OS backup');state=x;save('Workspace imported',file.name);initRole();render();toast('Workspace restored')}catch(e){toast(e.message||'Import failed')}
  }

  function openNav(){$('#sidebar').classList.add('open');$('#backdrop').classList.remove('hidden')}
  function closeNav(){$('#sidebar').classList.remove('open');$('#backdrop').classList.add('hidden')}
  function initRole(){const sel=$('#roleSelect');sel.innerHTML=ROLES.map(r=>`<option ${r===state.meta.role?'selected':''}>${esc(r)}</option>`).join('');sel.value=state.meta.role;sel.onchange=()=>{state.meta.role=sel.value;save('Role context changed',sel.value);render();toast(`Context: ${sel.value}`)}}

  function init(){
    $('#orgLabel').textContent=state.meta.organization;
    $('#todayLabel').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'2-digit',month:'long'});
    initRole();nav();render();
    $('#quickBtn').addEventListener('click',()=>openCreate('task'));
    $('#searchBtn').addEventListener('click',openSearch);
    $('#backupBtn').addEventListener('click',exportWorkspace);$('#exportBtn').addEventListener('click',exportWorkspace);
    $('#importInput').addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importWorkspace(f);e.target.value=''});
    $('#resetBtn').addEventListener('click',()=>{if(confirm('Reset Executive OS to the demo operating dataset?')){state=seed();save('Workspace reset','Demo dataset restored');initRole();render();toast('Demo workspace reset')}});
    $('#navOpen').addEventListener('click',openNav);$('#navClose').addEventListener('click',closeNav);$('#backdrop').addEventListener('click',closeNav);
    window.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape')closeNav()});
    if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
    setTimeout(()=>{$('#boot').classList.add('hidden');$('#app').classList.remove('hidden')},550);
  }

  document.addEventListener('DOMContentLoaded',init);
})();
