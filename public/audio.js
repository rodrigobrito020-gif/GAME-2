// Small synthesized cues, created only after the player enables sound.
export function createFarmAudio(){
 let context,enabled=false;
 try{enabled=localStorage.getItem('game2-sound')==='on';}catch{}
 const init=()=>{try{context??=new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{});}catch{}};
 function play(type){
  if(!enabled)return;init();if(!context||context.state!=='running')return;
  const t=context.currentTime;
  if(['water','weed','spray'].includes(type)){
   const buffer=context.createBuffer(1,context.sampleRate*.28,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=type==='water'?1700:700;gain.gain.setValueAtTime(.035,t);gain.gain.exponentialRampToValueAtTime(.001,t+.28);source.connect(filter).connect(gain).connect(context.destination);source.start();return;
  }
  const notes=['sell','sellAll','deliverOrder'].includes(type)?[660,880,1100]:type==='harvest'?[523,784]:[440,554];
  notes.forEach((frequency,i)=>{const oscillator=context.createOscillator(),gain=context.createGain(),start=t+i*.075;oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.001,start);gain.gain.exponentialRampToValueAtTime(.045,start+.015);gain.gain.exponentialRampToValueAtTime(.001,start+.15);oscillator.connect(gain).connect(context.destination);oscillator.start(start);oscillator.stop(start+.16);});
 }
 return {get enabled(){return enabled;},unlock(){if(enabled)init();},toggle(){enabled=!enabled;try{localStorage.setItem('game2-sound',enabled?'on':'off');}catch{}if(enabled){init();play('plant');}return enabled;},play};
}
