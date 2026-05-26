export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game') || '';
  const theme = searchParams.get('theme') || 'dark';

  const isLight = theme === 'light';
  const bg = isLight ? '#ffffff' : '#0a0a0a';
  const bg2 = isLight ? '#f8f9fa' : '#111111';
  const text = isLight ? '#111111' : '#e0e0e0';
  const textDim = isLight ? '#666666' : '#888888';
  const primary = isLight ? '#1B6B1B' : '#00ff88';
  const border = isLight ? '#ddd' : '#222';
  const hoverBg = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(0,255,136,0.03)';

  const gameParam = game ? `?game=${encodeURIComponent(game)}` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ADAM Leaderboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Courier New",monospace;background:${bg};color:${text};overflow:hidden}
.lb{border:1px solid ${border};border-radius:8px;overflow:hidden;background:${bg2}}
.lb-h{display:grid;grid-template-columns:40px 1fr 70px 70px;padding:10px 14px;background:rgba(${isLight ? '0,0,0' : '0,255,136'},0.04);border-bottom:1px solid ${border};color:${textDim};font-size:11px;letter-spacing:1px}
.lb-r{display:grid;grid-template-columns:40px 1fr 70px 70px;padding:8px 14px;font-size:12px;transition:background .3s;border-bottom:1px solid rgba(${isLight ? '0,0,0' : '255,255,255'},0.02)}
.lb-r:hover{background:${hoverBg}}
.lb-rnk{text-align:center}
.lb-p{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lb-g{color:${textDim}}
.lb-s{color:${primary};text-align:right;font-weight:bold}
.lb-e{color:${textDim};padding:24px;text-align:center;font-size:12px}
.lb-f{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(${isLight ? '0,0,0' : '0,255,136'},0.02);border-top:1px solid ${border};font-size:10px}
.lb-pulse{color:${primary}}@keyframes b{50%{opacity:0}}.lb-pulse{animation:b 1s infinite}
.lb-upd{color:${textDim};margin-left:auto}
</style>
</head>
<body>
<div class="lb" id="lb"></div>
<script>
const G={pong:'PONG',snake:'SNAKE','space-invaders':'INVADER',tetris:'TETRIS','flappy-bird':'BIRD','2048':'2048'};
const E={};
async function load(){
try{const r=await fetch('/api/scores${gameParam}');const d=await r.json();
if(d.success){
const t=d.scores.slice(0,5);
E.innerHTML='';
let h='<div class="lb-h"><span>RNK</span><span>PLAYER</span><span>GAME</span><span>SCORE</span></div>';
if(t.length===0)h+='<div class="lb-e">&gt; No scores yet</div>';
else t.forEach((s,i)=>{const m=i===0?'\\u{1f947}':i===1?'\\u{1f948}':i===2?'\\u{1f949}':'#'+(i+1);
h+='<div class="lb-r"><span class="lb-rnk">'+m+'</span><span class="lb-p">'+s.name+'</span><span class="lb-g">'+(G[s.game]||s.game)+'</span><span class="lb-s">'+s.score.toLocaleString()+'</span></div>';
});
h+='<div class="lb-f"><span class="lb-pulse">\\u25cf LIVE</span><span class="lb-upd">'+new Date().toLocaleTimeString()+'</span></div>';
E.innerHTML=h;
}}catch(e){}}
E=document.getElementById('lb');load();setInterval(load,15000);
</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=30, s-maxage=60',
    },
  });
}
