/* ---------- Service Worker ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

/* ---------- Elements ---------- */
const chat = document.getElementById('chat');
const form = document.getElementById('chatForm');
const input = document.getElementById('msg');

let ttsOn = false;
let sttOn = false;

/* ---------- Mood tracking ---------- */
let moods = []; // stores numeric mood ratings

/* ---------- Utilities ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));

function addMsg(text, who='bot'){
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

/* ---------- Smart Offline AI Replies ---------- */
function smartReply(text){
  const lower = text.toLowerCase().trim();

  // Suicide helpline detection
  const suicideKeywords = ["suicide","kill myself","end my life","die","hopeless","self-harm"];
  if(suicideKeywords.some(k => lower.includes(k))){
    moods.push(0);
    return "I'm really concerned about your safety. Please contact a trained professional immediately:\n\nIndia: 9152987821 / 9152987822\nUSA: 1-800-273-TALK (8255)\nUK: 0800 689 5652\nYou are not alone. 💛";
  }

  // Emotional replies
  const replies = [
  {keywords: ["sad","upset","down"], response:"I’m here with you. Feeling sad can be heavy. Can you share more about what’s happening?"}, 
  {keywords: ["lonely","alone"], response:"Being alone can feel tough. Do you want to talk about how you’re feeling?"}, 
  {keywords: ["depressed","hopeless","empty"], response:"It’s okay to feel this way. Can you tell me more about your thoughts?"}, 
  {keywords: ["anxious","nervous","worried"], response:"Anxiety can be overwhelming. What’s making you feel anxious?"}, 
  {keywords: ["stressed","pressure","overwhelmed"], response:"Stress can weigh us down. What’s troubling you most right now?"}, 
  {keywords: ["tired","exhausted","fatigue"], response:"Feeling tired is normal. Can you tell me what’s been draining you?"}, 
  {keywords: ["scared","afraid","fear"], response:"Fear is natural. Can you share what’s scaring you?"}, 
  {keywords: ["angry","frustrated","mad"], response:"Anger is normal. What’s causing your frustration?"}, 
  {keywords: ["confused","lost","uncertain"], response:"Feeling lost can be tough. Would you like to talk about it?"}, 
  {keywords: ["guilty","shame"], response:"It’s okay to feel guilty sometimes. Do you want to explain what happened?"}, 
  {keywords: ["hurt","pain","betrayed"], response:"I hear you. Emotional pain is difficult. Can you share more?"}, 
  {keywords: ["worthless","hopeless"], response:"You matter, even if it feels hard to see. Can you tell me more about these feelings?"}, 
  {keywords: ["help"], response:"I’m listening. What’s troubling you right now?"}, 
  {keywords: ["sadness","crying"], response:"It’s okay to cry. Sharing helps. Can you tell me more?"}, 
  {keywords: ["panic"], response:"Panic can be scary. Let’s take a deep breath together. Can you describe what’s happening?"}, 
  {keywords: ["overthink","ruminate"], response:"Overthinking can be exhausting. What thoughts are on your mind?"}, 
  {keywords: ["loss","grief"], response:"Loss is very hard. I’m here to listen if you want to talk about it."}, 
  {keywords: ["rejected"], response:"Rejection hurts. It’s okay to feel this way. Can you share what happened?"}, 
  {keywords: ["panic attack"], response:"I understand. Try to breathe slowly. You’re safe here. Can you tell me more?"}, 
  {keywords: ["suicidal","end"], response:"I’m really concerned about your safety. Please contact a trained professional immediately. Call or chat with your local helpline."}, 
  {keywords: ["happy","joy"], response:"It’s wonderful to feel joy. Can you share what made you feel this way?"}, 
  {keywords: ["excited","thrilled"], response:"Excitement is great! What are you looking forward to?"}, 
  {keywords: ["motivated","inspired"], response:"Feeling inspired is amazing. What’s motivating you today?"}, 
  {keywords: ["grateful","thankful"], response:"Gratitude is powerful. What are you grateful for right now?"}, 
  {keywords: ["relaxed","calm"], response:"I’m glad you feel calm. What helps you feel relaxed?"}, 
  {keywords: ["confident","strong"], response:"Confidence feels great. What has helped you feel strong today?"}, 
  {keywords: ["lonely","isolated"], response:"Feeling lonely is hard. Can you share more about it?"}, 
  {keywords: ["nervous","anxious"], response:"Being nervous is okay. What’s causing your anxiety?"}, 
  {keywords: ["overwhelmed","stressed"], response:"Feeling overwhelmed happens. Can you tell me what’s on your plate?"}, 
  {keywords: ["hopeful","optimistic"], response:"Hope is important. What makes you feel hopeful today?"}
];
  for(let item of replies){
    if(item.keywords.some(k => lower.includes(k))){
      moods.push(1);
      return item.response;
    }
  }

  // General fallback
  moods.push(2);
  const starters = [
  "I hear you.", 
  "Thanks for sharing.", 
  "That sounds heavy.", 
  "You’re not alone.", 
  "It makes sense to feel this way.",
  "I understand.", 
  "I’m listening.", 
  "It’s okay to feel like this.", 
  "You’re being very honest, thank you.", 
  "I can imagine how that feels.",
  "Your feelings are valid.",
  "I’m here for you.",
  "It’s brave to express this.",
  "I appreciate your honesty.",
  "It’s okay to be vulnerable.",
  "You matter.",
  "Take your time, I’m listening.",
  "I see you.",
  "It’s okay to feel this way.",
  "I respect your feelings.",
  "I understand your struggle.",
  "Thank you for opening up.",
  "I feel for you.",
  "You’re doing your best.",
  "I’m here to support you.",
  "That must be hard for you.",
  "I hear your pain.",
  "It’s okay to share your thoughts.",
  "You’re not judged here.",
  "I’m with you."
];


const prompts = [
  "Can you tell me more?", 
  "What usually helps you feel calmer?", 
  "If a friend felt this, what would you tell them?", 
  "Would you like to share a bit more about it?", 
  "I’m listening, tell me what’s on your mind.", 
  "How long have you been feeling this way?", 
  "What’s been the hardest part for you?", 
  "Do you want to talk about what’s causing this?", 
  "Can you describe your feelings more?", 
  "Is there anything that made you feel better recently?", 
  "What support would help you right now?", 
  "Do you want to explore ways to cope with this?", 
  "How does this affect your daily life?", 
  "Do you want to share a recent experience that triggered this?", 
  "What thoughts are running through your mind?", 
  "Are there people you feel comfortable talking to?", 
  "What would make today a little easier?", 
  "Can you identify when these feelings started?", 
  "Would you like to try a breathing exercise together?", 
  "Do you want to express your feelings freely here?", 
  "What emotions are strongest for you right now?", 
  "How do you usually manage stress?", 
  "Can you tell me one positive thing today?", 
  "What would help you feel supported?", 
  "How does your body feel when stressed?", 
  "What’s worrying you the most currently?", 
  "Have you experienced this before?", 
  "What’s the most comforting thing you can think of?", 
  "Can you share a memory that brings peace?", 
  "What small step can help you feel better today?"
];

  const mirror = lower.length>120 ? lower.slice(0,120)+"…" : lower;
  return `${starters[Math.floor(Math.random()*starters.length)]} I hear: “${mirror}”. ${prompts[Math.floor(Math.random()*prompts.length)]}`;
}

/* ---------- Chat handling ---------- */
async function handleSend(e){
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;

  addMsg(text,'me');
  input.value='';

  const typing = addMsg("…",'bot');
  await sleep(500);
  const reply = smartReply(text);
  typing.textContent = reply;
  if(ttsOn) speak(reply);
}

/* ---------- TTS ---------- */
function speak(text){
  if(!ttsOn) return;
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* ---------- STT ---------- */
let recog=null;
function toggleSTT(){
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){
    alert("Speech recognition not supported."); return;
  }
  if(recog){ recog.stop(); recog=null; sttOn=false; return; }
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  recog = new R(); recog.lang='en-US'; recog.interimResults=false;
  recog.onresult = e => { input.value = (e.results[0][0].transcript||"").trim(); };
  recog.onend = () => { sttOn=false; recog=null; };
  recog.start(); sttOn=true;
}

/* ---------- Quotes ---------- */
const quotes = [
  "Every day may not be good, but there is something good in every day.",
  "Breathe in peace, breathe out stress.",
  "You are stronger than you think.",
  "This too shall pass.",
  "Take small steps, one at a time.",
  "Self-care is not selfish.",
  "Your feelings are valid.",
  "Healing takes time.",
  "You deserve love and care.",
  "Focus on what you can control.",
  "It's okay to ask for help.",
  "Be kind to yourself.",
  "Your emotions are part of you, not all of you.",
  "Small victories are still victories.",
  "You are not your mistakes.",
  "Progress, not perfection.",
  "Stay present, breathe deeply.",
  "Your worth is not measured by your productivity.",
  "Celebrate tiny joys.",
  "Keep going, one step at a time.",
  "Allow yourself to rest.",
  "You are capable of overcoming challenges.",
  "Happiness can be found in small moments.",
  "Be gentle with your mind.",
  "Gratitude can change your perspective.",
  "It’s okay to take a break.",
  "Find comfort in your breathing.",
  "You are resilient.",
  "Emotions are temporary, they will pass.",
  "Hope can be your anchor."
];


document.getElementById('btnQuote').addEventListener('click', () => {
  const quote = quotes[Math.floor(Math.random()*quotes.length)];
  document.getElementById('quoteDiv').textContent = `"${quote}"`;
});

/* ---------- Breathing ---------- */
const breathModal = document.getElementById('breathModal');
document.getElementById('btnBreath').addEventListener('click', () => {
  breathModal.style.display='block';
});
breathModal.querySelector('.close').addEventListener('click', () => {
  breathModal.style.display='none';
});

/* ---------- Mood History ---------- */
const moodModal = document.getElementById('moodModal');
document.getElementById('btnMood').addEventListener('click', () => {
  moodModal.style.display='block';
  renderMoodGraph();
});
moodModal.querySelector('.close').addEventListener('click', () => {
  moodModal.style.display='none';
});

function renderMoodGraph(){
  const ctx = document.getElementById('moodChart').getContext('2d');
  new Chart(ctx, {
    type:'line',
    data:{
      labels: moods.map((_,i)=>`Entry ${i+1}`),
      datasets:[{
        label:'Mood Levels (0=Suicidal,1=Sad,2=Neutral)',
        data:moods,
        borderColor:'#63b3ed',
        backgroundColor:'rgba(99,179,237,0.3)',
        fill:true,
        tension:0.4
      }]
    },
    options:{
      scales:{
        y:{min:0,max:2,ticks:{stepSize:1,callback:v=>{
          if(v===0)return 'Critical';
          if(v===1)return 'Sad';
          return 'Neutral';
        }}}
      }
    }
  });
}

/* ---------- TTS & STT toggle ---------- */
document.getElementById('btnTTS').addEventListener('click', ()=>{
  ttsOn = !ttsOn;
  alert(`TTS is now ${ttsOn ? 'ON' : 'OFF'}`);
});
document.getElementById('btnSTT').addEventListener('click', toggleSTT);

/* ---------- Event wiring ---------- */
form.addEventListener('submit', handleSend);
