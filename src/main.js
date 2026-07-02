import { calculateHandScore } from './scoreCalculator.js';

const TILE_UNICODE = {
  '1m': '🀇', '2m': '🀈', '3m': '🀉', '4m': '🀊', '5m': '🀋', '6m': '🀌', '7m': '🀍', '8m': '🀎', '9m': '🀏',
  '1p': '🀙', '2p': '🀚', '3p': '🀛', '4p': '🀜', '5p': '🀝', '6p': '🀞', '7p': '🀟', '8p': '🀠', '9p': '🀡',
  '1s': '🀐', '2s': '🀑', '3s': '🀒', '4s': '🀓', '5s': '🀔', '6s': '🀕', '7s': '🀖', '8s': '🀗', '9s': '🀘',
  '1z': '🀀', '2z': '🀁', '3z': '🀂', '4z': '🀃', '5z': '🀆', '6z': '🀅', '7z': '🀄'
};

document.addEventListener('DOMContentLoaded', () => {
  let hand = []; // max 14
  let dora = []; // 
  let isDoraMode = false;

  const handCountEl = document.getElementById('hand-count');
  const handTilesEl = document.getElementById('hand-tiles');
  const doraTilesEl = document.getElementById('dora-tiles');
  
  const kbManzu = document.getElementById('kb-manzu');
  const kbPinzu = document.getElementById('kb-pinzu');
  const kbSozu = document.getElementById('kb-sozu');
  const kbJihai = document.getElementById('kb-jihai');

  const btnBackspace = document.getElementById('btn-backspace');
  const btnClear = document.getElementById('btn-clear');
  const btnToggleDora = document.getElementById('btn-toggle-dora');

  const scoreNameEl = document.getElementById('score-name');
  const scoreTotalEl = document.getElementById('score-total');
  const scoreBreakdownEl = document.getElementById('score-breakdown');
  const yakuListEl = document.getElementById('yaku-list');

  // キーボード生成
  function createKeyboard() {
    const keys = Object.keys(TILE_UNICODE);
    keys.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'tile-btn';
      btn.dataset.tile = key;
      btn.textContent = TILE_UNICODE[key];
      btn.addEventListener('click', () => addTile(key));

      if (key.endsWith('m')) kbManzu.appendChild(btn);
      else if (key.endsWith('p')) kbPinzu.appendChild(btn);
      else if (key.endsWith('s')) kbSozu.appendChild(btn);
      else if (key.endsWith('z')) kbJihai.appendChild(btn);
    });
  }

  // 牌を追加
  function addTile(tileId) {
    if (isDoraMode) {
      dora.push(tileId);
    } else {
      if (hand.length < 14) {
        hand.push(tileId);
      } else {
        // すでに14枚なら最後の1枚（和了牌）を上書き
        hand[13] = tileId;
      }
    }
    renderTiles();
    triggerCalculate();
  }

  // 描画
  function renderTiles() {
    handCountEl.textContent = `${hand.length} / 14`;
    
    // 手牌の描画 (13枚はソートして、14枚目はあがり牌として右に離すのが一般的だが、今回はそのままかソートするか)
    // わかりやすさのため、入力順を保持する。または自動理牌するか。
    // 自動理牌するなら最後の1枚だけ特別扱いする。
    let displayHand = [...hand];
    if (displayHand.length > 0) {
      handTilesEl.classList.remove('empty');
      let html = '';
      displayHand.forEach((t, i) => {
        if (i === 13) {
          html += `<span class="mahjong-tile winning-tile">${TILE_UNICODE[t]}</span>`;
        } else {
          html += `<span class="mahjong-tile">${TILE_UNICODE[t]}</span>`;
        }
      });
      handTilesEl.innerHTML = html;
    } else {
      handTilesEl.classList.add('empty');
      handTilesEl.innerHTML = '';
    }

    // ドラ表示牌の描画
    if (dora.length > 0) {
      doraTilesEl.classList.remove('empty');
      let html = '';
      dora.forEach((t) => {
        html += `<span class="mahjong-tile">${TILE_UNICODE[t]}</span>`;
      });
      doraTilesEl.innerHTML = html;
    } else {
      doraTilesEl.classList.add('empty');
      doraTilesEl.innerHTML = '';
    }
  }

  function resetCalculation() {
    scoreNameEl.textContent = '未完成の手牌です';
    scoreNameEl.style.color = 'var(--text-secondary)';
    scoreTotalEl.textContent = '--';
    scoreBreakdownEl.textContent = '--';
    yakuListEl.innerHTML = '<li class="empty-yaku">役がありません</li>';
  }

  // 計算の実行
  function triggerCalculate() {
    if (hand.length < 14) {
      resetCalculation();
      return;
    }

    const isTsumo = document.getElementById('tsumo').checked;
    
    const jikazeStr = document.querySelector('input[name="wind"]:checked').value;
    const bakazeStr = document.querySelector('input[name="bakaze"]:checked').value;
    const isOya = (jikazeStr === '1'); // 東が親

    const hand13 = hand.slice(0, 13);
    const winTile = hand[13];

    // 特別役オプションの取得
    let extraYaku = '';
    document.querySelectorAll('#extra-yaku-group input[type="checkbox"]:checked').forEach(chk => {
      extraYaku += chk.value;
    });

    const result = calculateHandScore(hand13, winTile, dora, isTsumo, parseInt(bakazeStr), parseInt(jikazeStr), extraYaku);

    if (result.error) {
      scoreNameEl.textContent = result.message;
      scoreNameEl.style.color = 'var(--danger-color)';
      scoreTotalEl.textContent = '--';
      scoreBreakdownEl.textContent = '--';
      yakuListEl.innerHTML = '<li class="empty-yaku">計算不可</li>';
      return;
    }

    scoreNameEl.style.color = 'var(--primary-color)';
    
    // 役一覧の表示
    let yakuHtml = '';
    if (result.yaku && Object.keys(result.yaku).length > 0) {
      for (const [yakuName, han] of Object.entries(result.yaku)) {
        yakuHtml += `<li><span>${yakuName}</span><span class="yaku-han">${han}</span></li>`;
      }
    } else {
      yakuHtml = '<li class="empty-yaku">役なし</li>';
    }
    yakuListEl.innerHTML = yakuHtml;

    // 点数の名前（満貫など）
    // riichiパッケージはtextプロパティに全体サマリが入るか、独自で判定するか。
    // han と fu を表示
    let title = '';
    if (result.name) {
      title = result.name;
    } else {
      title = `${result.han}飜 ${result.fu}符`;
    }
    
    scoreNameEl.textContent = title;
    scoreTotalEl.textContent = result.ten.toLocaleString();

    // 内訳
    if (isTsumo) {
      if (isOya) {
        scoreBreakdownEl.textContent = `子 各${result.oya[0]}払い`;
      } else {
        scoreBreakdownEl.textContent = `子 ${result.ko[1]} / 親 ${result.ko[0]} 払い`;
      }
    } else {
      scoreBreakdownEl.textContent = 'ロンあがり (放銃者が全額払い)';
    }

    // アニメーション用
    scoreTotalEl.classList.remove('updated');
    void scoreTotalEl.offsetWidth;
    scoreTotalEl.classList.add('updated');
  }

  // イベントリスナー
  btnBackspace.addEventListener('click', () => {
    if (isDoraMode && dora.length > 0) {
      dora.pop();
    } else if (!isDoraMode && hand.length > 0) {
      hand.pop();
    }
    renderTiles();
    triggerCalculate();
  });

  btnClear.addEventListener('click', () => {
    hand = [];
    dora = [];
    renderTiles();
    triggerCalculate();
  });

  btnToggleDora.addEventListener('click', () => {
    isDoraMode = !isDoraMode;
    if (isDoraMode) {
      btnToggleDora.classList.add('active');
      btnToggleDora.textContent = 'ドラ入力モード: ON';
    } else {
      btnToggleDora.classList.remove('active');
      btnToggleDora.textContent = 'ドラ入力モード: OFF';
    }
  });

  document.querySelectorAll('input[name="wind"], input[name="win-type"], input[name="bakaze"], #extra-yaku-group input[type="checkbox"]').forEach(el => {
    el.addEventListener('change', triggerCalculate);
  });

  // 初期化
  createKeyboard();
  renderTiles();
});
