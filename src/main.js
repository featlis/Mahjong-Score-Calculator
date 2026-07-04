import { calculateHandScore } from './scoreCalculator.js';

/* ====== Tile Data ====== */
const MAN = ['','一','二','三','四','五','六','七','八','九'];
const JI = {'1z':'東','2z':'南','3z':'西','4z':'北','5z':'','6z':'發','7z':'中'};
const ALL_TILES = [
  '1m','2m','3m','4m','5m','6m','7m','8m','9m',
  '1p','2p','3p','4p','5p','6p','7p','8p','9p',
  '1s','2s','3s','4s','5s','6s','7s','8s','9s',
  '1z','2z','3z','4z','5z','6z','7z'
];

/* Pinzu circle layouts: [cx, cy, radius] */
const PIN = {
  1:[[13,17,6]],
  2:[[13,10,3.8],[13,24,3.8]],
  3:[[7,7,3.2],[13,17,3.2],[19,27,3.2]],
  4:[[8,9,3.2],[18,9,3.2],[8,25,3.2],[18,25,3.2]],
  5:[[8,8,2.8],[18,8,2.8],[13,17,2.8],[8,26,2.8],[18,26,2.8]],
  6:[[8,7,2.6],[18,7,2.6],[8,17,2.6],[18,17,2.6],[8,27,2.6],[18,27,2.6]],
  7:[[8,5.5,2.3],[18,5.5,2.3],[8,13.5,2.3],[18,13.5,2.3],[8,21.5,2.3],[18,21.5,2.3],[13,29,2.3]],
  8:[[8,5.5,2.2],[18,5.5,2.2],[8,13,2.2],[18,13,2.2],[8,20.5,2.2],[18,20.5,2.2],[8,28,2.2],[18,28,2.2]],
  9:[[7,6,2],[13,6,2],[19,6,2],[7,17,2],[13,17,2],[19,17,2],[7,28,2],[13,28,2],[19,28,2]],
};

/* Souzu bamboo layouts: [cx, cy] */
const SOU = {
  1:[[13,17]],
  2:[[9,17],[17,17]],
  3:[[7,17],[13,17],[19,17]],
  4:[[9,10],[17,10],[9,24],[17,24]],
  5:[[9,8],[17,8],[13,17],[9,26],[17,26]],
  6:[[9,7],[17,7],[9,17],[17,17],[9,27],[17,27]],
  7:[[8,5.5],[18,5.5],[8,13.5],[18,13.5],[8,21.5],[18,21.5],[13,29]],
  8:[[8,5.5],[18,5.5],[8,13],[18,13],[8,20.5],[18,20.5],[8,28],[18,28]],
  9:[[7,6],[13,6],[19,6],[7,17],[13,17],[19,17],[7,28],[13,28],[19,28]],
};

/* ====== SVG Generators ====== */
const R='#d32f2f', G='#2e7d32', B='#1565c0', DG='#1b5e20';

function pinzuSVG(n) {
  if (n===1) return `<svg viewBox="0 0 26 34"><circle cx="13" cy="17" r="7" fill="none" stroke="${R}" stroke-width="2"/><circle cx="13" cy="17" r="4.5" fill="none" stroke="${B}" stroke-width="1.5"/><circle cx="13" cy="17" r="2.2" fill="${R}"/></svg>`;
  let s='<svg viewBox="0 0 26 34">';
  PIN[n].forEach(([cx,cy,r],i)=>{
    const c=i%2===0?R:G;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${r*.35}" fill="${c}"/>`;
  });
  return s+'</svg>';
}

function souzuSVG(n) {
  if (n===1) return `<svg viewBox="0 0 26 34"><circle cx="13" cy="17" r="7" fill="${G}" opacity=".85"/><circle cx="13" cy="17" r="4.5" fill="none" stroke="${DG}" stroke-width="1.2"/><circle cx="13" cy="17" r="2" fill="${R}"/></svg>`;
  const sw=3.5, sh=n>=7?5.5:n>=4?7:9;
  let s='<svg viewBox="0 0 26 34">';
  SOU[n].forEach(([cx,cy])=>{
    const x=cx-sw/2, y=cy-sh/2;
    s+=`<rect x="${x}" y="${y}" width="${sw}" height="${sh}" rx=".8" fill="${G}"/>`;
    s+=`<line x1="${x+.4}" y1="${cy-sh/4}" x2="${x+sw-.4}" y2="${cy-sh/4}" stroke="${DG}" stroke-width=".6"/>`;
    s+=`<line x1="${x+.4}" y1="${cy+sh/4}" x2="${x+sw-.4}" y2="${cy+sh/4}" stroke="${DG}" stroke-width=".6"/>`;
  });
  return s+'</svg>';
}

/* ====== Tile Element Factory ====== */
function createTileElement(tileId, opts={}) {
  const el=document.createElement('div');
  el.className='tile';
  el.dataset.tile=tileId;
  const suit=tileId[1], num=parseInt(tileId[0]);
  el.dataset.suit=suit;

  if (suit==='m') {
    el.innerHTML=`<span class="tile-num">${MAN[num]}</span><span class="tile-suit-label">萬</span>`;
  } else if (suit==='p') {
    el.classList.add('tile-svg');
    el.innerHTML=pinzuSVG(num);
  } else if (suit==='s') {
    el.classList.add('tile-svg');
    el.innerHTML=souzuSVG(num);
  } else {
    el.classList.add('jihai');
    el.innerHTML=`<span class="tile-label">${JI[tileId]}</span>`;
  }
  if (opts.isWinning) el.classList.add('winning-tile');
  if (opts.onClick) el.addEventListener('click', opts.onClick);
  return el;
}

/* ====== Application ====== */
document.addEventListener('DOMContentLoaded', () => {
  let hand=[], dora=[], isDoraMode=false;
  const $ = id => document.getElementById(id);
  const handCountEl=$('hand-count'), handTilesEl=$('hand-tiles'), doraTilesEl=$('dora-tiles');
  const kbM=$('kb-manzu'), kbP=$('kb-pinzu'), kbS=$('kb-sozu'), kbJ=$('kb-jihai');
  const scoreNameEl=$('score-name'), scoreTotalEl=$('score-total');
  const scoreBreakdownEl=$('score-breakdown'), yakuListEl=$('yaku-list');
  const btnBack=$('btn-backspace'), btnClear=$('btn-clear'), btnDora=$('btn-toggle-dora');

  function createKeyboard() {
    ALL_TILES.forEach(id=>{
      const t=createTileElement(id,{onClick:()=>addTile(id)});
      ({m:kbM,p:kbP,s:kbS,z:kbJ})[id[1]].appendChild(t);
    });
  }

  function addTile(id) {
    if (isDoraMode) dora.push(id);
    else if (hand.length<14) hand.push(id);
    else hand[13]=id;
    renderTiles(); triggerCalculate();
  }

  function renderTiles() {
    handCountEl.textContent=`${hand.length} / 14`;
    handTilesEl.innerHTML='';
    if (hand.length) {
      handTilesEl.classList.remove('empty');
      hand.forEach((t,i)=>handTilesEl.appendChild(createTileElement(t,{isWinning:i===13})));
    } else handTilesEl.classList.add('empty');
    doraTilesEl.innerHTML='';
    if (dora.length) {
      doraTilesEl.classList.remove('empty');
      dora.forEach(t=>doraTilesEl.appendChild(createTileElement(t)));
    } else doraTilesEl.classList.add('empty');
  }

  function resetCalc() {
    scoreNameEl.textContent='未完成の手牌です'; scoreNameEl.style.color='var(--text-secondary)';
    scoreTotalEl.textContent='--'; scoreBreakdownEl.textContent='--';
    yakuListEl.innerHTML='<li class="empty-yaku">役がありません</li>';
  }

  function triggerCalculate() {
    if (hand.length<14){resetCalc();return;}
    const isTsumo=$('tsumo').checked;
    const jikaze=document.querySelector('input[name="wind"]:checked').value;
    const bakaze=document.querySelector('input[name="bakaze"]:checked').value;
    const isOya=jikaze==='1';
    let extra='';
    document.querySelectorAll('#extra-yaku-group input:checked').forEach(c=>extra+=c.value);
    const res=calculateHandScore(hand.slice(0,13),hand[13],dora,isTsumo,parseInt(bakaze),parseInt(jikaze),extra);
    if (res.error) {
      scoreNameEl.textContent=res.message; scoreNameEl.style.color='var(--danger-color)';
      scoreTotalEl.textContent='--'; scoreBreakdownEl.textContent='--';
      yakuListEl.innerHTML='<li class="empty-yaku">計算不可</li>'; return;
    }
    scoreNameEl.style.color='var(--primary-color)';
    let yh='';
    if (res.yaku&&Object.keys(res.yaku).length)
      for (const [n,h] of Object.entries(res.yaku)) yh+=`<li><span>${n}</span><span class="yaku-han">${h}</span></li>`;
    else yh='<li class="empty-yaku">役なし</li>';
    yakuListEl.innerHTML=yh;
    scoreNameEl.textContent=res.name||`${res.han}飜 ${res.fu}符`;
    scoreTotalEl.textContent=res.ten.toLocaleString();
    if (isTsumo) scoreBreakdownEl.textContent=isOya?`子 各${res.oya[0].toLocaleString()}点`:`子 ${res.ko[1].toLocaleString()} / 親 ${res.ko[0].toLocaleString()} 点`;
    else scoreBreakdownEl.textContent='ロン（放銃者が全額払い）';
    scoreTotalEl.classList.remove('updated'); void scoreTotalEl.offsetWidth; scoreTotalEl.classList.add('updated');
  }

  btnBack.addEventListener('click',()=>{
    if (isDoraMode&&dora.length) dora.pop(); else if(!isDoraMode&&hand.length) hand.pop();
    renderTiles(); triggerCalculate();
  });
  btnClear.addEventListener('click',()=>{hand=[];dora=[];renderTiles();triggerCalculate();});
  btnDora.addEventListener('click',()=>{
    isDoraMode=!isDoraMode;
    btnDora.classList.toggle('active',isDoraMode);
    btnDora.textContent=`ドラ入力: ${isDoraMode?'ON':'OFF'}`;
  });
  document.querySelectorAll('input[name="wind"],input[name="win-type"],input[name="bakaze"],#extra-yaku-group input')
    .forEach(el=>el.addEventListener('change',triggerCalculate));

  createKeyboard(); renderTiles();
});
