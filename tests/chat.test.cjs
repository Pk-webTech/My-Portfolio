const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(endpoint='',fetch=async()=>{throw Error('offline')}) {
  class El {
    constructor(){this.children=[];this.attrs={};this.listeners={};this.value='';this.dataset={};this.disabled=false;this.classList={add(){},remove(){},contains(){return true},toggle(){return false}};}
    addEventListener(event,fn){this.listeners[event]=fn;}
    setAttribute(k,v){this.attrs[k]=v;} removeAttribute(k){delete this.attrs[k];}
    appendChild(el){this.children.push(el);el.parent=this;} remove(){this.parent.children=this.parent.children.filter(x=>x!==this);}
    querySelector(){return this.button ||=new El();} querySelectorAll(){return this.buttons||=[];} focus(){} contains(){return false;}
    get firstElementChild(){return this.children[0]} get childElementCount(){return this.children.length}
  }
  const els={}; const get=k=>els[k] ||=new El();
  const context={window:{PORTFOLIO_CHAT_ENDPOINT:endpoint},document:{getElementById:get,querySelector:get,querySelectorAll:()=>[],addEventListener(){},createElement:()=>new El()},location:{href:'https://portfolio.example',protocol:'https:'},fetch,URL,AbortController,setTimeout,clearTimeout,console};
  vm.createContext(context);
  for(const file of ['chat-knowledge.js','script.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
  async function submit(text){get('chatbotInput').value=text;get('chatbotForm').listeners.submit({preventDefault(){}});await new Promise(r=>setImmediate(r));}
  return {context,get,submit};
}
test('local guide matches projects, ATERNET, and graduation without substring collisions',()=>{
 const {context}=setup();const answer=s=>context.portfolioAnswer(s);
 assert.match(answer('What projects have you built?'),/ATERNET/);
 assert.match(answer('solar forecast'),/weather/);
 assert.match(answer('When does he graduate?'),/2027/);
 assert.doesNotMatch(answer('this window'),/Hey!|winning/);
});
test('local guide responds without fetching',async()=>{
 let requests=0; const s=setup('',()=>requests++);await s.submit('skills');assert.equal(requests,0);assert.match(s.get('chatbotMessages').children.at(-1).textContent,/Python/);
});
test('provider failure and malformed reply show local fallback and restore send button',async()=>{
 for(const fetch of [async()=>{throw Error('offline')},async()=>({ok:true,json:async()=>({reply:{bad:true}})})]){
 const s=setup('https://api.example/chat',fetch);await s.submit('ATERNET');assert.match(s.get('.chatbot-status').textContent,/using local answers/);assert.match(s.get('chatbotMessages').children.at(-1).textContent,/solar/);assert.equal(s.get('chatbotForm').button.disabled,false);
 }
});
test('AI requests are serialized and subsequent requests include conversation history',async()=>{
 let resolve;const calls=[];const s=setup('https://api.example/chat',async(url,init)=>{calls.push(JSON.parse(init.body));return new Promise(r=>resolve=r)});
 await s.submit('skills');await s.submit('projects');assert.equal(calls.length,1);
 resolve({ok:true,json:async()=>({reply:'Python and Django'})});await new Promise(r=>setImmediate(r));
 await s.submit('Tell me more');assert.equal(calls[1].history.length,2);
 resolve({ok:true,json:async()=>({reply:'More details'})});await new Promise(r=>setImmediate(r));
 assert.match(s.get('.chatbot-status').textContent,/connected/);
});
test('HTML from provider remains text',async()=>{
 const s=setup('https://api.example/chat',async()=>({ok:true,json:async()=>({reply:'<img src=x onerror=alert(1)>'})}));await s.submit('skills');const last=s.get('chatbotMessages').children.at(-1);assert.equal(last.textContent,'<img src=x onerror=alert(1)>');assert.equal(last.innerHTML,undefined);
});
