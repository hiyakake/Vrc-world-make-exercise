const menuButton = document.getElementById('menuButton');
const menu = document.getElementById('menu');
const sections = document.querySelectorAll('.section');
menuButton.addEventListener('click', () => menu.classList.toggle('hidden'));
menu.addEventListener('click', e => {
  if (e.target.dataset.section) {
    sections.forEach(sec => sec.classList.add('hidden'));
    document.getElementById(e.target.dataset.section).classList.remove('hidden');
    menu.classList.add('hidden');
    if(e.target.dataset.section==='exercise') inputBar.classList.remove('hidden');
    else inputBar.classList.add('hidden');
  }
});

const inputBar = document.getElementById('inputBar');
inputBar.addEventListener('click', e => {
  if (e.target.dataset.insert) {
    insertAtCursor(code, e.target.dataset.insert);
  } else if (e.target.dataset.snippet) {
    insertAtCursor(code, e.target.dataset.snippet);
  } else if (e.target.dataset.tab) {
    document.querySelectorAll('#inputBar .tabs button').forEach(btn=>btn.classList.remove('active'));
    e.target.classList.add('active');
    document.querySelectorAll('#inputBar .tabContent').forEach(div=>div.classList.add('hidden'));
    document.getElementById(e.target.dataset.tab).classList.remove('hidden');
  }
});

function insertAtCursor(textArea, text) {
  const start = textArea.selectionStart;
  const end = textArea.selectionEnd;
  textArea.value = textArea.value.substring(0,start) + text + textArea.value.substring(end);
  textArea.selectionStart = textArea.selectionEnd = start + text.length;
  textArea.focus();
}

const code = document.getElementById('code');
code.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    insertAtCursor(code, '    ');
  }
});

const submit = document.getElementById('submit');
const result = document.getElementById('result');
submit.addEventListener('click', () => {
  const text = code.value;
  const pass = text.includes('hello');
  result.textContent = pass ? '合格' : '不合格';
  historyList.innerHTML += `<li>${escapeHtml(text)} - ${result.textContent}</li>`;
  const history = JSON.parse(localStorage.getItem('history')||'[]');
  history.push({code:text,result:pass});
  localStorage.setItem('history',JSON.stringify(history));
  updateStampCard(pass);
});

function escapeHtml(str){return str.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));}

const stampCard = document.getElementById('stampCard');
function updateStampCard(pass){
  const stamps=JSON.parse(localStorage.getItem('stamps')||'[]');
  stamps.push(pass);
  localStorage.setItem('stamps',JSON.stringify(stamps));
  renderStamps();
}
function renderStamps(){
  const stamps=JSON.parse(localStorage.getItem('stamps')||'[]');
  stampCard.innerHTML='';
  stamps.forEach(s=>{
    const span=document.createElement('span');
    if(s) span.classList.add('earned');
    stampCard.appendChild(span);
  });
}
renderStamps();

const historyList=document.getElementById('historyList');
function renderHistory(){
  const history=JSON.parse(localStorage.getItem('history')||'[]');
  historyList.innerHTML='';
  history.forEach(h=>{
    const li=document.createElement('li');
    li.textContent=`${h.code} - ${h.result?'合格':'不合格'}`;
    historyList.appendChild(li);
  });
}
renderHistory();

document.getElementById('clearHistory').addEventListener('click',()=>{
  localStorage.removeItem('history');
  renderHistory();
});

// AI assistant
const askBtn=document.getElementById('ask');
askBtn.addEventListener('click',()=>{
  const q=document.getElementById('question').value;
  fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+(localStorage.getItem('openai_key')||'')},
    body:JSON.stringify({model:'gpt-3.5-turbo',messages:[{role:'user',content:q}]})
  }).then(r=>r.json()).then(d=>{
    document.getElementById('answer').textContent=d.choices&&d.choices[0].message.content||'エラー';
  }).catch(()=>{document.getElementById('answer').textContent='エラー';});
});

// data export/import
const exportBtn=document.getElementById('export');
exportBtn.addEventListener('click',()=>{
  const data={history:JSON.parse(localStorage.getItem('history')||'[]'),stamps:JSON.parse(localStorage.getItem('stamps')||'[]')};
  const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='data.json';
  a.click();
});

document.getElementById('import').addEventListener('click',()=>{
  const file=document.getElementById('importFile').files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const data=JSON.parse(e.target.result);
    if(data.history) localStorage.setItem('history',JSON.stringify(data.history));
    if(data.stamps) localStorage.setItem('stamps',JSON.stringify(data.stamps));
    renderHistory();
    renderStamps();
  };
  reader.readAsText(file);
});
