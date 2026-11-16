(function(){

const $=id=>document.getElementById(id);

const wrap=document.createElement("div");

wrap.innerHTML=`<button class="chat-fab" id="cfab" aria-label="Chat with us">💬<span class="chat-dot hide" id="cdot"></span></button>

<section class="chat-panel hide" id="cpanel" aria-label="Chat">

<div class="chat-head"><div><b>Chat with us</b><small>We reply as soon as we can</small></div><button id="cclose" aria-label="Close chat">✕</button></div>

<div class="chat-msgs" id="cmsgs"></div><div class="chat-err" id="cerr"></div>

<div class="chat-name hide" id="cnamebox"><input id="cname" maxlength="40" placeholder="Your name"></div>

<form class="chat-form" id="cform"><input id="ctext" maxlength="1000" placeholder="Type a message" autocomplete="off"><button class="btn pri" type="submit">Send</button></form></section>`;

document.body.appendChild(wrap);

const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};

let me=null,msgs=[],ready=false,open=false,unread=0;

const fmt=d=>new Date(d).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});

function draw(){

  $("cmsgs").innerHTML=msgs.length?msgs.map(m=>`<div class="m ${m.sender==="buyer"?"me":"them"}">${esc(m.body)}<time>${fmt(m.created_at)}</time></div>`).join(""):`<p class="chat-hint">Hi! Ask us anything about our items.</p>`;

  $("cmsgs").scrollTop=$("cmsgs").scrollHeight;

  $("cnamebox").classList.toggle("hide",!!store.get("chat_name")||msgs.length>0);

}

function add(m){

  if(msgs.some(x=>x.id===m.id))return;

  msgs.push(m);

  if(m.sender==="admin"&&!open){unread++;$("cdot").classList.remove("hide")}

  draw();

}

async function init(){

  if(ready)return;ready=true;$("cerr").textContent="";

  try{

    let{data:{session}}=await sb.auth.getSession();

    if(!session){const r=await sb.auth.signInAnonymously();if(r.error)throw r.error;session=r.data.session}

    me=session.user.id;

    const{data,error}=await sb.from("messages").select("*").eq("convo_id",me).order("created_at");

    if(error)throw error;

    msgs=data;draw();

    sb.channel("chat-"+me).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"convo_id=eq."+me},p=>add(p.new)).subscribe();

  }catch(e){ready=false;$("cerr").textContent="Chat is unavailable right now. Please try again later."}

}

$("cfab").onclick=()=>{open=true;unread=0;$("cdot").classList.add("hide");$("cpanel").classList.remove("hide");$("cfab").classList.add("hide");init()};

$("cclose").onclick=()=>{open=false;$("cpanel").classList.add("hide");$("cfab").classList.remove("hide")};

$("cform").onsubmit=async e=>{

  e.preventDefault();

  const body=$("ctext").value.trim();if(!body)return;

  if(!me)await init();if(!me)return;

  let name=store.get("chat_name");

  if(!name&&msgs.length===0){

    name=$("cname").value.trim();

    if(!name){$("cerr").textContent="Please enter your name first.";return}

    store.set("chat_name",name);

  }

  $("cerr").textContent="";$("ctext").value="";

  const m={id:crypto.randomUUID(),convo_id:me,sender:"buyer",body,created_at:new Date().toISOString()};

  add(m);

  const conv={id:me,last_text:body.slice(0,80),last_at:m.created_at,unread:true};

  if(name)conv.name=name;

  const a=await sb.from("conversations").upsert(conv);

  const b=a.error?a:await sb.from("messages").insert({id:m.id,convo_id:me,sender:"buyer",body});

  if(b.error){msgs=msgs.filter(x=>x.id!==m.id);draw();$("ctext").value=body;$("cerr").textContent="Couldn't send. Check your connection and try again."}

};

})();
