document.addEventListener("DOMContentLoaded",()=>{
  document.body.style.backgroundImage="url('https://i.ibb.co.com/gLFbSs9D/gta-6-game-art-5k-3840x2160-14300.jpg')";
  document.body.style.backgroundSize="cover";
  document.body.style.backgroundPosition="center center";
  document.body.style.backgroundRepeat="no-repeat";
  document.body.style.backgroundAttachment="fixed";
});

function loadJS(url){
  const s=document.createElement("script");
  s.src=url;
  s.defer=true;
  document.head.appendChild(s);
}

loadJS("https://cdn.jsdelivr.net/npm/@clappr/player@latest/dist/clappr.min.js");
loadJS("https://cdn.jsdelivr.net/npm/hls.js@latest");

function loadScript(u){
  return new Promise(r=>{
    const s=document.createElement("script");
    s.src=u;
    s.onload=r;
    document.head.appendChild(s);
  });
}

Promise.all([
  loadScript("https://cdn.jsdelivr.net/npm/@clappr/player@latest/dist/clappr.min.js"),
  loadScript("https://cdn.jsdelivr.net/npm/hls.js@latest")
]).then(()=>window.CLAPPR_READY=true);

const urls=[
  "https://raw.githubusercontent.com/munim-sah75/Cofs_TV/refs/heads/main/fancode.m3u",
  "https://raw.githubusercontent.com/biostartvworld/playlist/refs/heads/main/playlist.m3u"
];

let channels=[];
let player=null;
let userInteracted=false;

document.addEventListener("click",()=>{
  userInteracted=true;
  if(player){
    try{
      player.unmute();
      player.setVolume(100);
      player.play();
    }catch(e){}
  }
});

Promise.all(urls.map(u=>fetch(u).then(r=>r.text()))).then(txts=>{
  txts.forEach(t=>{
    let l=t.split("\n");
    for(let i=0;i<l.length;i++){
      if(l[i].startsWith("#EXTINF")){
        let name=l[i].split(",").pop();
        let logo=(l[i].match(/tvg-logo="(.*?)"/)||[])[1]||"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgk-F1cUOHYKYpUPSS1L05FzI2joFOzyBA7SOYaCHZPy6XSqm5Wj8ojeDG9ba4r8g8xYjX3V5FgiQ9Lq21TNIpspCg5y6fEUl9zYOuszosQsW5INiYIlHxeo6fogknIvL2mNyikKdxLLnjdc6y-ozTDv5hJUgl9aL0DOxE4wxF7j6XUTGb5XH8evlfkE61-/s320/LOGO-LAST.webp";
        let cat=(l[i].match(/group-title="(.*?)"/)||[])[1]||"Others";
        let stream=l[i+1];
        if(stream&&stream.startsWith("http")){
          channels.push({name,logo,cat,stream});
        }
      }
    }
  });
  renderCategory();
  renderList(channels);
});

function renderCategory(){
  const b=document.getElementById("category");
  b.innerHTML="";
  ["All",...new Set(channels.map(c=>c.cat))].forEach(c=>{
    let d=document.createElement("div");
    d.className="catBtn";
    d.innerText=c;
    d.onclick=()=>renderList(c==="All"?channels:channels.filter(x=>x.cat===c));
    b.appendChild(d);
  });
}

function renderList(arr){
  const b=document.getElementById("list");
  b.innerHTML="";
  arr.forEach(c=>{
    let d=document.createElement("div");
    d.className="channelItem";
    d.innerHTML=`<img src="${c.logo}">`;
    d.onclick=()=>play(c,d);
    b.appendChild(d);
  });
}

function play(c,el){
  if(!window.CLAPPR_READY)return;

  document.querySelectorAll(".channelItem").forEach(x=>x.classList.remove("active"));
  el.classList.add("active");

  document.getElementById("left").style.display="flex";
  document.getElementById("backBtn").style.display="block";

  const nameBox=document.getElementById("currentName");
  nameBox.innerText=c.name;

  document.getElementById("currentLogo").src=c.logo;
  document.getElementById("posterImg").src=c.logo;
  document.getElementById("poster").style.display="flex";

  if(player){
    player.destroy();
    player=null;
  }

  player=new Clappr.Player({
    source:c.stream,
    parentId:"#player",
    width:"100%",
    height:"100%",
    autoPlay:true,
    mute:!userInteracted,
    volume:100,
    playback:{playInline:true,autoPlay:true},
    events:{
      onReady:()=>{
        try{
          player.play();
          if(userInteracted){
            player.unmute();
            player.setVolume(100);
          }
        }catch(e){}
      },
      onPlay:()=>{
        document.getElementById("poster").style.display="none";
        if(userInteracted){
          try{
            player.unmute();
            player.setVolume(100);
          }catch(e){}
        }
      }
    }
  });

  window.scrollTo({top:0,behavior:"smooth"});
}

function goBack(){
  if(player){
    player.destroy();
    player=null;
  }
  document.getElementById("left").style.display="none";
  document.getElementById("backBtn").style.display="none";
}

function toggleSearch(){
  let s=document.getElementById("searchBox");
  s.style.display=s.style.display==="block"?"none":"block";
}

function searchChannel(){
  let q=document.getElementById("searchInput").value.toLowerCase();
  renderList(channels.filter(c=>c.name.toLowerCase().includes(q)));
}

document.addEventListener("DOMContentLoaded",()=>{
  const timeBox=document.createElement("div");
  timeBox.id="timeBox";
  timeBox.style.position="fixed";
  timeBox.style.top="20px";
  timeBox.style.right="20px";
  timeBox.style.background="rgba(0,0,0,0.5)";
  timeBox.style.color="#fff";
  timeBox.style.padding="10px 9px";
  timeBox.style.borderRadius="10px";
  timeBox.style.fontFamily="Arial";
  timeBox.style.fontSize="9px";
  timeBox.style.fontWeight="bold";
  timeBox.style.zIndex="9999";
  timeBox.style.whiteSpace="nowrap";
  document.body.appendChild(timeBox);

  const updateTime=()=>{
    const n=new Date();
    let h=n.getHours();
    const m=n.getMinutes().toString().padStart(2,"0");
    const s=n.getSeconds().toString().padStart(2,"0");
    const ap=h>=12?"PM":"AM";
    h=h%12||12;
    const t=`${h.toString().padStart(2,"0")}:${m}:${s} ${ap}`;
    const d=n.toLocaleDateString("en-US",{weekday:"long"});
    const da=n.toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});
    timeBox.innerText=`${t} | ${d} | ${da}`;
  };

  setInterval(updateTime,1000);
  updateTime();

  const tg=document.createElement("a");
  tg.href="https://t.me/paidiptvbd2026";
  tg.target="_blank";
  tg.style.position="fixed";
  tg.style.bottom="20px";
  tg.style.right="20px";
  tg.style.zIndex="9999";

  const img=document.createElement("img");
  img.src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg";
  img.style.width="48px";
  img.style.height="48px";
  img.style.borderRadius="50%";
  img.style.boxShadow="0 4px 10px rgba(0,0,0,0.4)";

  tg.appendChild(img);
  document.body.appendChild(tg);
});
