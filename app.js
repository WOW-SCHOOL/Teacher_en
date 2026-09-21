const app = document.getElementById('app');
const WEB3FORMS_KEY = window.WOW_WEB3FORMS_ACCESS_KEY || '';
const DESTINATION_EMAIL = window.WOW_TEACHER_FORM_EMAIL || 'wow.school.english@gmail.com';
const STORAGE_KEY = 'wow_teacher_profile_form_v2';

const slides = [
  {key:'start', title:'Teacher Application'},
  {key:'personal', title:'About You'},
  {key:'education', title:'Education'},
  {key:'experience', title:'Experience'},
  {key:'areas', title:'Specializations'},
  {key:'style', title:'Lessons'},
  {key:'strengths', title:'Strengths'},
  {key:'results', title:'Results'},
  {key:'sendInfo', title:'Submission'},
  {key:'review', title:'Review'},
];

const defaultData = {
  firstName:'', lastName:'', preferredName:'', age:'', country:'', city:'', phone:'', telegram:'', email:'',
  nativeSpeaker:'', englishLevel:'', russianLevel:'', otherLanguages:'',
  education:'', university:'', specialty:'', certificates:[], certificateDetails:'', englishEnvironment:'',
  yearsTeaching:'', audiences:[], minChildAge:'', teachingFormats:[], levels:[], workplaces:'', clubs:'',
  directions:[], exams:[], otherDirection:'',
  focus:[], methods:[], grammarStyle:'', correctionStyle:'', lessonDifference:'',
  strengths:[], otherStrength:'', qualities:[], hobbies:'', topics:'', funFact:'',
  studentResults:'', whyMe:'', importantNotes:'', photoVideoStatus:'',
  consent:false
};
let state = {screen:0, data:{...defaultData}, sent:false, pdfUrl:'', fileName:''};
try{
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if(saved?.data) state = {...state, ...saved, data:{...defaultData,...saved.data}};
}catch(e){}
state.screen = 0;

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function setVal(key,val){ state.data[key]=val; save(); }
function toggleArray(key,val,checked){ const s=new Set(state.data[key]||[]); checked?s.add(val):s.delete(val); state.data[key]=[...s]; save(); }
function checked(key,val){return (state.data[key]||[]).includes(val)?'checked':'';}
function selected(key,val){return state.data[key]===val?'selected':'';}

function header(){
  const pct = Math.max(0, Math.round((Math.max(0,state.screen)/(slides.length-1))*100));
  return `<div class="topbar">
    <div class="brand"><div class="logoTile"><img src="assets/images/wow-logo-white.png" alt="WOW SCHOOL"></div><div class="brandText"><strong>WOW SCHOOL</strong><span>teacher application</span></div></div>
    <div class="progressWrap"><div class="progressTrack"><i style="width:${pct}%"></i></div><div class="progressLabel">${state.screen===0?'Start':`${Math.min(state.screen,slides.length-1)}/${slides.length-1}`}</div></div>
  </div>`;
}
function visual(file,icon,title,copy){
  return `<aside class="visual"><div class="visualInner" data-visual="${esc(file)}">
    <img src="assets/images/${esc(file)}" alt="" onload="this.parentElement.classList.add('hasImage')" onerror="this.remove()">
    <div class="placeholderCopy"><div class="visualIcon">${icon}</div><strong>${title}</strong><p>${copy}</p><code>assets/images/${file}</code></div>
  </div></aside>`;
}
function shell(inner){return `<div class="shell">${header()}<section class="stage">${inner}</section></div>`;}
function kicker(n,text){return `<div class="stepKicker"><span class="stepDot">${n}</span>${text}</div>`;}
function field(label,key,type='text',opts={}){
  const value=esc(state.data[key]||''); const req=opts.required?'<span class="req">*</span>':''; const full=opts.full?' full':'';
  let control='';
  if(type==='textarea') control=`<textarea data-field="${key}" placeholder="${esc(opts.placeholder||'')}">${value}</textarea>`;
  else if(type==='select') control=`<select data-field="${key}"><option value="">Select an option</option>${opts.options.map(x=>`<option value="${esc(x)}" ${selected(key,x)}>${esc(x)}</option>`).join('')}</select>`;
  else control=`<input data-field="${key}" type="${type}" value="${value}" placeholder="${esc(opts.placeholder||'')}" ${opts.min?`min="${opts.min}"`:''}>`;
  return `<div class="field${full}"><label>${label} ${req}</label>${control}${opts.hint?`<div class="hint">${opts.hint}</div>`:''}</div>`;
}
function choices(key,items,{radio=false}={}){
  return `<div class="optionGroup">${items.map(item=>{
    const id=`${key}_${String(item).replace(/[^a-zA-Z0-9\u0400-\u04FF]+/g,'_')}`;
    const isChecked=radio?state.data[key]===item:(state.data[key]||[]).includes(item);
    return `<span class="option ${radio?'radio':''}"><input id="${esc(id)}" data-choice-key="${key}" data-choice-value="${esc(item)}" type="${radio?'radio':'checkbox'}" name="${radio?key:id}" ${isChecked?'checked':''}><label for="${esc(id)}">${esc(item)}</label></span>`;
  }).join('')}</div>`;
}
function tip(text){return `<div class="tip"><span class="tipIcon">💡</span><div>${text}</div></div>`;}
function actions({back=true,next='Next →',nextId='next',extra='' }={}){
  return `<div class="actions"><div>${back?'<button class="btn secondary" id="back">← Back</button>':''}</div><div style="display:flex;gap:9px;align-items:center">${extra}<button class="btn primary" id="${nextId}">${next}</button></div></div>`;
}
function bindCommon(){
  document.querySelectorAll('[data-field]').forEach(el=>{
    const ev=el.tagName==='SELECT'?'change':'input';
    el.addEventListener(ev,()=>setVal(el.dataset.field,el.value));
  });
  document.querySelectorAll('[data-choice-key]').forEach(el=>el.addEventListener('change',()=>{
    const key=el.dataset.choiceKey, value=el.dataset.choiceValue;
    if(el.type==='radio') setVal(key,value); else toggleArray(key,value,el.checked);
  }));
  const b=document.getElementById('back'); if(b) b.onclick=()=>{state.screen=Math.max(0,state.screen-1);save();render();};
}
function goNext(validate){
  const btn=document.getElementById('next'); if(!btn)return;
  btn.onclick=()=>{ const ok=validate?validate():true; if(ok){state.screen++;save();render();} };
}
function required(keys){
  let first=null;
  keys.forEach(k=>{const el=document.querySelector(`[data-field="${k}"]`); if(!String(state.data[k]||'').trim()&&el){el.style.borderColor='#e7546c'; if(!first)first=el;} });
  if(first){first.focus();first.scrollIntoView({behavior:'smooth',block:'center'});return false;} return true;
}

function start(){
  app.innerHTML=shell(`<div class="hero">
    <div><div class="heroBadge">WOW SCHOOL · teacher application</div><h1>Tell us about yourself — <span>briefly and to the point</span></h1>
    <p class="lead">We’ll use your answers to prepare your teacher profile for students. Most of the form can be completed with checkboxes — it usually takes 7–10 minutes.</p>
    <div class="heroPoints"><div class="heroPoint">✓ experience and education</div><div class="heroPoint">✓ who and what you teach</div><div class="heroPoint">✓ strengths and teaching style</div><div class="heroPoint">✓ contact details and important information</div></div>
    ${tip('<b>You don’t need to write promotional copy.</b> We need honest facts and your real strengths — we’ll prepare the final description ourselves.')}
    <div class="actions"><div></div><button class="btn primary" id="startBtn">Start the form →</button></div></div>
    <div class="heroVisual">${visual('teacher-form-preview.png','👩‍🏫','Cover image','A bright, versatile photo of a teacher or the WOW SCHOOL team can be placed here.')}</div>
  </div>`);
  document.getElementById('startBtn').onclick=()=>{state.screen=1;save();render();};
}

function personal(){
  app.innerHTML=shell(`<div class="slide"><div class="content">${kicker(1,'Basic information')}<h1>Let’s start with <span>you</span></h1><p class="lead">This information helps us present you accurately and contact you if needed.</p>
    <div class="formGrid">${field('First name','firstName','text',{required:true,placeholder:'For example: Anna'})}${field('Last name','lastName','text',{required:true})}${field('Preferred name','preferredName','text',{placeholder:'For example: Alexander → Sasha'})}${field('Age','age','number',{min:18})}${field('Country / citizenship','country','text',{required:true})}${field('Where do you currently live?','city','text')}${field('Phone','phone','tel',{required:true,placeholder:'+7 / +234 / ...'})}${field('Telegram','telegram','text',{placeholder:'@username'})}${field('Email','email','email',{required:true,full:true})}</div>
    <div class="sectionLabel">Are you a native English speaker?</div>${choices('nativeSpeaker',['Yes','No'],{radio:true})}
    <div class="formGrid" style="margin-top:14px">${field('English level','englishLevel','select',{options:['Native Speaker','C2','C1+','C1','B2–C1','B2','Other']})}${field('Russian level','russianLevel','select',{options:['I don’t speak Russian / barely understand it','A1','A2','B1','B2','C1 / fluent']})}${field('Other languages','otherLanguages','text',{full:true,placeholder:'If applicable'})}</div>
    ${actions()}</div>${visual('teacher-form-personal.png','🌍','Personal information','Image area: teachers from different countries in a modern international style.')}</div>`);
  bindCommon(); goNext(()=>{
    if(!required(['firstName','lastName','country','phone','email'])) return false;
    const emailEl=document.querySelector('[data-field="email"]');
    if(emailEl && !emailEl.checkValidity()){
      emailEl.style.borderColor='#e7546c';
      emailEl.reportValidity();
      emailEl.focus();
      return false;
    }
    return true;
  });
}

function education(){
  app.innerHTML=shell(`<div class="slide"><div class="content">${kicker(2,'Education and language background')}<h1>What supports your <span>expertise</span></h1><p class="lead">Please provide accurate information only. If you don’t have a degree in a related field, that’s okay — other strengths matter too.</p>
    <div class="formGrid">${field('Education','education','text',{placeholder:'University degree / incomplete degree / other'})}${field('Institution','university','text')}${field('Field of study','specialty','text',{full:true})}</div>
    <div class="sectionLabel">Certificates and exams</div>${choices('certificates',['TEFL','TESOL','CELTA','IELTS','TOEFL','DET','Cambridge','EF SET','Other'])}
    <div class="formGrid" style="margin-top:14px">${field('Results / certificate details','certificateDetails','textarea',{full:true,placeholder:'For example: IELTS 8.0, EF SET C1, TEFL 120 hours...'})}${field('Experience living / studying / working in an English-speaking environment','englishEnvironment','textarea',{full:true,placeholder:'Where, for how long, and how you used English'})}</div>
    ${actions()}</div>${visual('teacher-form-education.png','🎓','Education','Image area: certificate, academic environment, international experience.')}</div>`);
  bindCommon(); goNext();
}

function experience(){
  app.innerHTML=shell(`<div class="slide"><div class="content">${kicker(3,'Teaching experience')}<h1>Who have you already <span>worked with</span></h1><p class="lead">This section is especially important: students should immediately understand whether your experience and format are a good fit for them.</p>
    <div class="formGrid">${field('How many years have you been teaching?','yearsTeaching','number',{min:0,required:true})}${field('What is the youngest age you teach?','minChildAge','text',{placeholder:'For example: from age 7 / I don’t teach children'})}</div>
    <div class="sectionLabel">Who do you teach?</div>${choices('audiences',['Children','Teenagers','Adults','University students','Learners aged 50+'])}
    <div class="sectionLabel">Online formats</div>${choices('teachingFormats',['One-to-one','Pair lessons','Conversation clubs'])}
    <div class="sectionLabel">Student levels</div>${choices('levels',['A0 / complete beginner','A1','A2','B1','B2','C1','C2'])}
    <div class="formGrid" style="margin-top:14px">${field('Where have you taught / where do you currently teach?','workplaces','textarea',{full:true,placeholder:'Schools, language centres, university, private practice — no unnecessary details'})}${field('Conversation clubs / intensive courses / special projects','clubs','text',{full:true,placeholder:'If applicable'})}</div>
    ${actions()}</div>${visual('teacher-form-experience.png','🧩','Experience','Image area: a teacher with a teenager and an adult, showing online lesson formats.')}</div>`);
  bindCommon(); goNext(()=>required(['yearsTeaching']));
}

function areas(){
  app.innerHTML=shell(`<div class="slide"><div class="content">${kicker(4,'Specializations')}<h1>What can students <span>come to you for</span></h1><p class="lead">Select only the areas you are genuinely ready to teach. This information will appear in your teacher profile.</p>
    <div class="sectionLabel">Specializations</div>${choices('directions',['General English','Conversational English','English from scratch','For children','For teenagers','For adults','Business English','Academic English','English for work','English for travel','English for relocation','Job interview preparation','Medical English','Pronunciation / accent reduction'])}
    <div class="sectionLabel">Exams</div>${choices('exams',['OGE','EGE','IELTS','TOEFL','DET','PET','FCE','CAE','CPE','SAT','GRE','Other international exams'])}
    <div class="formGrid" style="margin-top:14px">${field('Other specialization','otherDirection','text',{full:true,placeholder:'If you did not find the right option'})}</div>
    ${actions()}</div>${visual('teacher-form-areas.png','🎯','Student goals','Image area: travel / career / exams / conversation in one modern collage.')}</div>`);
  bindCommon(); goNext();
}

function style(){
  app.innerHTML=shell(`<div class="slide"><div class="content">${kicker(5,'How lessons work')}<h1>Your teaching <span>style</span></h1><p class="lead">Choose the habits and tools you actually use rather than what simply “sounds good.”</p>
    <div class="sectionLabel">What do you focus on most often?</div>${choices('focus',['Speaking practice','Grammar','Listening','Pronunciation','Vocabulary','Writing','Reading','Exam strategies'])}
    <div class="sectionLabel">What do you use in your lessons?</div>${choices('methods',['Dialogues','Role plays','Video','Audio / podcasts','Games','Articles / news','Case studies','Projects','Flashcards / visuals','Discussions','Homework'])}
    <div class="formGrid" style="margin-top:14px">${field('How do you explain grammar to a student?','grammarStyle','textarea',{placeholder:'For example: I explain in Russian or English; give a simple rule and examples, then practise it through speaking and exercises'})}${field('How do you handle mistakes?','correctionStyle','textarea',{placeholder:'For example: I correct gently during speaking / review mistakes after the task'})}${field('What makes your lessons different?','lessonDifference','textarea',{full:true,placeholder:'1–3 specific features'})}</div>
    ${actions()}</div>${visual('teacher-form-style.png','💬','Lesson format','Image area: dialogue, video, flashcards, interactive activities.')}</div>`);
  bindCommon(); goNext();
}

function strengths(){
  app.innerHTML=shell(`<div class="slide"><div class="content">${kicker(6,'Strengths')}<h1>Why students will <span>enjoy learning with you</span></h1><p class="lead">Choose 3–6 genuine strengths — this helps us make your profile more personal.</p>
    <div class="sectionLabel">Strengths</div>${choices('strengths',['I work well with children','I connect easily with teenagers','I explain things in simple terms','I help students start speaking confidently','Strong pronunciation','Strong grammar','Up-to-date vocabulary','Exam preparation','Strong Russian language skills','Strong with beginners','I motivate and support students','I work well with shy students','Business English','English for work / career'])}
    <div class="sectionLabel">Which qualities describe you?</div>${choices('qualities',['Energetic','Calm','Patient','Positive','Well-organized','Friendly','Rigorous','Good sense of humor','Attentive','Communicative'])}
    <div class="formGrid" style="margin-top:14px">${field('Another strength','otherStrength','text',{full:true})}${field('Hobbies / interests','hobbies','text')}${field('Topics you enjoy discussing','topics','text')}${field('An interesting fact about you','funFact','text',{full:true})}</div>
    ${actions()}</div>${visual('teacher-form-strengths.png','✨','Teacher personality','Image area: a natural portrait or lifestyle photo of the teacher.')}</div>`);
  bindCommon(); goNext();
}

function results(){
  app.innerHTML=shell(`<div class="slide"><div class="content">${kicker(7,'Results and important details')}<h1>What else will help us <span>introduce you to students</span></h1><p class="lead">Specific results are stronger than general statements. If you don’t have any yet or prefer not to include them, you can skip this field.</p>
    <div class="formGrid one">${field('Student results','studentResults','textarea',{placeholder:'For example: IELTS 7.5, EGE 90+, passed a job interview, relocated and started communicating confidently...'})}${field('Why should a student try lessons with you?','whyMe','textarea',{placeholder:'2–4 sentences in your own words'})}${field('What should students know before choosing you?','importantNotes','textarea',{placeholder:'For example: I teach A2+ only, lessons are almost entirely in English, I don’t teach children under 10, etc.'})}</div>
    <div class="sectionLabel">Photo and video introduction</div>${choices('photoVideoStatus',['Already sent','I’ll send them separately','I need help / clarification'],{radio:true})}
    ${actions()}</div>${visual('teacher-form-results.png','🏆','Results','Image area: student progress, certificate, achievement of a goal.')}</div>`);
  bindCommon(); goNext();
}

function sendInfo(){
  app.innerHTML=shell(`<div class="slide"><div class="content">${kicker(8,'Submitting the form')}<h1>Just <span>one step left</span></h1><p class="lead">On the next screen, carefully review your answers. Before submitting, we recommend saving a text copy of the form to your device just in case. Then click “Submit application.”</p>
    <div class="sendSteps">
      <div class="sendStep"><span>1</span><div><b>Review your details</b><p>Name, contact details, experience, specializations, exams, and strengths.</p></div></div>
      <div class="sendStep"><span>2</span><div><b>Save a text copy</b><p>On the next screen, click “Download TXT” and save the application to your device just in case.</p></div></div>
      <div class="sendStep"><span>3</span><div><b>Submit the application</b><p>After reviewing your answers, click “Submit application.” It will be sent to WOW SCHOOL at <strong>${esc(DESTINATION_EMAIL)}</strong>.</p></div></div>
    </div>
    <div class="recipientCard"><div class="recipientIcon">✉️</div><div><small>Recipient</small><strong>${esc(DESTINATION_EMAIL)}</strong><span>A confirmation will appear on the screen after successful submission.</span></div></div>
    ${tip('<b>Photo and video introduction.</b> If you have already sent them to the manager, you do not need to send them again. If not, please send them separately after submitting the form.')}
    ${actions({next:'Review application →'})}</div>${visual('teacher-form-submit.png','📩','Submitting the form','Your answers will be organized in a structured format and sent to WOW SCHOOL.')}</div>`);
  bindCommon(); goNext();
}

function val(v, empty='—'){ if(Array.isArray(v))return v.length?v.join(', '):empty; return String(v||'').trim()||empty; }
function summary(){
  const d=state.data;
  return [
    `TEACHER: ${[d.firstName,d.lastName].filter(Boolean).join(' ')}`,
    `Preferred name: ${val(d.preferredName)}`,
    `Age: ${val(d.age)}`,
    `Country / city: ${val(d.country)} / ${val(d.city)}`,
    `Phone: ${val(d.phone)}`,
    `Telegram: ${val(d.telegram)}`,
    `Email: ${val(d.email)}`,
    `Native Speaker: ${val(d.nativeSpeaker)}`,
    `English level: ${val(d.englishLevel)}`,
    `Russian: ${val(d.russianLevel)}`,
    `Other languages: ${val(d.otherLanguages)}`,
    '',
    `EDUCATION: ${val(d.education)}`,
    `Institution: ${val(d.university)}`,
    `Field of study: ${val(d.specialty)}`,
    `Certificates: ${val(d.certificates)}`,
    `Certificate details: ${val(d.certificateDetails)}`,
    `English-speaking environment: ${val(d.englishEnvironment)}`,
    '',
    `EXPERIENCE: ${val(d.yearsTeaching)} year(s)`,
    `Students taught: ${val(d.audiences)}`,
    `Minimum child age: ${val(d.minChildAge)}`,
    `Online formats: ${val(d.teachingFormats)}`,
    `Levels: ${val(d.levels)}`,
    `Teaching experience at: ${val(d.workplaces)}`,
    `Clubs / intensive courses: ${val(d.clubs)}`,
    '',
    `SPECIALIZATIONS: ${val(d.directions)}`,
    `EXAMS: ${val(d.exams)}`,
    `Other: ${val(d.otherDirection)}`,
    '',
    `FOCUS AREAS: ${val(d.focus)}`,
    `METHODS: ${val(d.methods)}`,
    `Grammar: ${val(d.grammarStyle)}`,
    `Error correction: ${val(d.correctionStyle)}`,
    `What makes the lessons different: ${val(d.lessonDifference)}`,
    '',
    `STRENGTHS: ${val(d.strengths)}`,
    `Qualities: ${val(d.qualities)}`,
    `Another strength: ${val(d.otherStrength)}`,
    `Hobbies: ${val(d.hobbies)}`,
    `Favorite topics: ${val(d.topics)}`,
    `Interesting fact: ${val(d.funFact)}`,
    '',
    `STUDENT RESULTS: ${val(d.studentResults)}`,
    `Why choose this teacher: ${val(d.whyMe)}`,
    `Important notes: ${val(d.importantNotes)}`,
    `Photo / video: ${val(d.photoVideoStatus)}`,
  ].join('\n');
}
function review(){
  const d=state.data; const sum=summary();
  app.innerHTML=shell(`<div class="slide noVisual"><div class="content">${kicker(9,'Review and submit')}<h1>Review your <span>application</span></h1><p class="lead">After you click the button, your application will be sent automatically to WOW SCHOOL at <b>${esc(DESTINATION_EMAIL)}</b>. You do not need to send your answers separately.</p>
    <div class="reviewGrid">
      <div class="reviewCard"><h3>Contact details</h3><div class="reviewRows"><div class="reviewRow"><b>${esc(d.firstName)} ${esc(d.lastName)}</b></div><div class="reviewRow">📞 ${esc(val(d.phone))}</div><div class="reviewRow">✈️ ${esc(val(d.telegram))}</div><div class="reviewRow">✉️ ${esc(val(d.email))}</div></div></div>
      <div class="reviewCard"><h3>Key details</h3><div class="reviewRows"><div class="reviewRow">Experience: <b>${esc(val(d.yearsTeaching))} year(s)</b></div><div class="reviewRow">Levels: ${esc(val(d.levels))}</div><div class="reviewRow">Specializations: ${esc(val(d.directions))}</div><div class="reviewRow">Exams: ${esc(val(d.exams))}</div></div></div>
    </div>
    <div class="sectionLabel">Completed application</div><div class="summaryBox" id="summary">${esc(sum)}</div>
    <label class="consent"><input type="checkbox" id="consent" ${d.consent?'checked':''}><span>I confirm that the information I provided is accurate and authorize WOW SCHOOL to use it to prepare my teacher profile and contact me.</span></label>
    <div id="status" class="submitStatus neutral">${WEB3FORMS_KEY?`Everything is ready. After submission, the completed application will be sent automatically to ${esc(DESTINATION_EMAIL)}.`:`Automatic submission is not connected yet. When you click “Submit application,” a pre-filled email to ${esc(DESTINATION_EMAIL)} will open and a text copy will be saved to your device.`}</div>
    <div class="actions"><button class="btn secondary" id="back">← Back</button><div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end"><button class="btn secondary" id="copy">Copy</button><button class="btn secondary" id="download">Download TXT</button><button class="btn primary" id="send">Submit application →</button></div></div>
  </div></div>`);
  document.getElementById('back').onclick=()=>{state.screen=8;save();render();};
  document.getElementById('consent').onchange=e=>{setVal('consent',e.target.checked)};
  document.getElementById('copy').onclick=async()=>{await navigator.clipboard.writeText(sum);showStatus('The application has been copied to the clipboard.','good');};
  document.getElementById('download').onclick=()=>downloadText(sum);
  document.getElementById('send').onclick=submitForm;
}
function showStatus(text,type='neutral'){const el=document.getElementById('status');if(el){el.textContent=text;el.className=`submitStatus ${type}`;}}
function downloadText(text){
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=`WOW_teacher_${state.data.firstName||'profile'}_${state.data.lastName||''}.txt`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
async function submitForm(){
  if(!state.data.consent){showStatus('Please confirm your consent before submitting.','bad');return;}
  const btn=document.getElementById('send');
  const text=summary();

  // Fallback mode: if the Web3Forms Access Key has not been added yet,
  // save the TXT file and open a pre-filled email to WOW SCHOOL.
  if(!WEB3FORMS_KEY){
    downloadText(text);
    const subject=`WOW SCHOOL Teacher Application — ${state.data.firstName||''} ${state.data.lastName||''}`.trim();
    const body=`Hello!%0A%0AI am sending my completed WOW SCHOOL teacher application.%0A%0A${encodeURIComponent(text)}`;
    const gmail=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(DESTINATION_EMAIL)}&su=${encodeURIComponent(subject)}&body=${body}`;
    window.open(gmail,'_blank','noopener');
    showStatus('A pre-filled email has been opened. Please review it and click “Send.” A copy of the application has also been saved to your device.', 'good');
    return;
  }

  const email=String(state.data.email||'').trim();
  const emailProbe=document.createElement('input');
  emailProbe.type='email'; emailProbe.required=true; emailProbe.value=email;
  if(!emailProbe.checkValidity()){
    showStatus('Please enter a valid email address before submitting the application.','bad');
    return;
  }

  btn.disabled=true; btn.textContent='Sending…'; showStatus('Sending the application to WOW SCHOOL…','neutral');
  try{
    // Web3Forms recommends JSON for JavaScript submissions. botcheck is passed as a proper boolean.
    const payload={
      access_key: WEB3FORMS_KEY,
      name: `${state.data.firstName||''} ${state.data.lastName||''}`.trim(),
      email,
      message: text,
      phone: state.data.phone || '',
      telegram: state.data.telegram || '',
      subject: `New WOW SCHOOL Teacher Application — ${state.data.firstName||''} ${state.data.lastName||''}`.trim(),
      from_name: 'WOW SCHOOL — Teacher Application',
      botcheck: false
    };

    const response=await fetch('https://api.web3forms.com/submit',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(payload)
    });

    let result={};
    try{ result=await response.json(); }catch(e){}
    if(response.status===429){
      throw new Error('Web3Forms has temporarily rate-limited frequent submissions from the same IP. Please wait about an hour and try again.');
    }
    if(!response.ok || result.success!==true){
      throw new Error(result.message || result?.body?.message || result?.error || `Web3Forms error (${response.status})`);
    }

    state.sent=true; save(); state.screen=10; render();
  }catch(err){
    console.error(err);
    showStatus('The application could not be submitted automatically. Try again or download the TXT file — your entered data has been saved.', 'bad');
    btn.disabled=false; btn.textContent='Submit application →';
  }
}
function success(){
  app.innerHTML=shell(`<div class="success"><div><div class="successIcon">✓</div><h1>Application <span>submitted</span></h1><p>Thank you! Your completed application has been sent to WOW SCHOOL at <b>${esc(DESTINATION_EMAIL)}</b>. You do not need to send your answers separately.</p><div class="successNote">If you have not yet sent your photo or video introduction to the manager, please send them separately.</div><div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="btn secondary" id="download">Download text copy</button><button class="btn primary" id="new">Start over</button></div></div></div>`);
  document.getElementById('download').onclick=()=>downloadText(summary());
  document.getElementById('new').onclick=()=>{state={screen:0,data:{...defaultData},sent:false,pdfUrl:'',fileName:''};localStorage.removeItem(STORAGE_KEY);render();};
}
function render(){
  window.scrollTo({top:0,behavior:'instant'});
  ({0:start,1:personal,2:education,3:experience,4:areas,5:style,6:strengths,7:results,8:sendInfo,9:review,10:success}[state.screen]||start)();
}
render();
