import { calculateHandScore } from './scoreCalculator.js';

/* ==========================================================
   Tile Data & Rendering
   ========================================================== */

/** 各牌の表示ラベル */
const TILE_LABELS = {
  // 萬子
  '1m': { num: '一', suit: '萬', type: 'm' },
  '2m': { num: '二', suit: '萬', type: 'm' },
  '3m': { num: '三', suit: '萬', type: 'm' },
  '4m': { num: '四', suit: '萬', type: 'm' },
  '5m': { num: '五', suit: '萬', type: 'm' },
  '6m': { num: '六', suit: '萬', type: 'm' },
  '7m': { num: '七', suit: '萬', type: 'm' },
  '8m': { num: '八', suit: '萬', type: 'm' },
  '9m': { num: '九', suit: '萬', type: 'm' },
  // 筒子
  '1p': { num: '1', suit: '筒', type: 'p' },
  '2p': { num: '2', suit: '筒', type: 'p' },
  '3p': { num: '3', suit: '筒', type: 'p' },
  '4p': { num: '4', suit: '筒', type: 'p' },
  '5p': { num: '5', suit: '筒', type: 'p' },
  '6p': { num: '6', suit: '筒', type: 'p' },
  '7p': { num: '7', suit: '筒', type: 'p' },
  '8p': { num: '8', suit: '筒', type: 'p' },
  '9p': { num: '9', suit: '筒', type: 'p' },
  // 索子
  '1s': { num: '1', suit: '索', type: 's' },
  '2s': { num: '2', suit: '索', type: 's' },
  '3s': { num: '3', suit: '索', type: 's' },
  '4s': { num: '4', suit: '索', type: 's' },
  '5s': { num: '5', suit: '索', type: 's' },
  '6s': { num: '6', suit: '索', type: 's' },
  '7s': { num: '7', suit: '索', type: 's' },
  '8s': { num: '8', suit: '索', type: 's' },
  '9s': { num: '9', suit: '索', type: 's' },
  // 字牌
  '1z': { label: '東', type: 'z' },
  '2z': { label: '南', type: 'z' },
  '3z': { label: '西', type: 'z' },
  '4z': { label: '北', type: 'z' },
  '5z': { label: '', type: 'z' },  // 白: 空の枠で表現
  '6z': { label: '發', type: 'z' },
  '7z': { label: '中', type: 'z' },
};

/**
 * 牌のHTML要素を生成
 * @param {string} tileId - '1m', '7z' etc.
 * @param {object} options - { isWinning, onClick }
 * @returns {HTMLElement}
 */
function createTileElement(tileId, options = {}) {
  const info = TILE_LABELS[tileId];
  if (!info) return null;

  const el = document.createElement('div');
  el.className = 'tile';
  el.dataset.tile = tileId;
  el.dataset.suit = info.type;

  if (info.type === 'z') {
    el.classList.add('jihai');
    const labelEl = document.createElement('span');
    labelEl.className = 'tile-label';
    labelEl.textContent = info.label;
    el.appendChild(labelEl);
  } else {
    const numEl = document.createElement('span');
    numEl.className = 'tile-num';
    numEl.textContent = info.num;
    el.appendChild(numEl);

    if (info.suit) {
      const suitEl = document.createElement('span');
      suitEl.className = 'tile-suit-label';
      suitEl.textContent = info.suit;
      el.appendChild(suitEl);
    }
  }

  if (options.isWinning) {
    el.classList.add('winning-tile');
  }

  if (options.onClick) {
    el.addEventListener('click', options.onClick);
  }

  return el;
}

/* ==========================================================
   Application
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  let hand = [];   // max 14
  let dora = [];
  let isDoraMode = false;

  // DOM refs
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

  /* ---------- Keyboard ---------- */
  function createKeyboard() {
    const tileIds = Object.keys(TILE_LABELS);
    tileIds.forEach(id => {
      const tile = createTileElement(id, {
        onClick: () => addTile(id),
      });
      if (!tile) return;

      const suit = id.slice(-1);
      if (suit === 'm') kbManzu.appendChild(tile);
      else if (suit === 'p') kbPinzu.appendChild(tile);
      else if (suit === 's') kbSozu.appendChild(tile);
      else if (suit === 'z') kbJihai.appendChild(tile);
    });
  }

  /* ---------- Add Tile ---------- */
  function addTile(tileId) {
    if (isDoraMode) {
      dora.push(tileId);
    } else {
      if (hand.length < 14) {
        hand.push(tileId);
      } else {
        // 14枚目（和了牌）を上書き
        hand[13] = tileId;
      }
    }
    renderTiles();
    triggerCalculate();
  }

  /* ---------- Render ---------- */
  function renderTiles() {
    handCountEl.textContent = `${hand.length} / 14`;

    // 手牌
    handTilesEl.innerHTML = '';
    if (hand.length > 0) {
      handTilesEl.classList.remove('empty');
      hand.forEach((t, i) => {
        const tile = createTileElement(t, { isWinning: i === 13 });
        if (tile) handTilesEl.appendChild(tile);
      });
    } else {
      handTilesEl.classList.add('empty');
    }

    // ドラ表示牌
    doraTilesEl.innerHTML = '';
    if (dora.length > 0) {
      doraTilesEl.classList.remove('empty');
      dora.forEach(t => {
        const tile = createTileElement(t);
        if (tile) doraTilesEl.appendChild(tile);
      });
    } else {
      doraTilesEl.classList.add('empty');
    }
  }

  /* ---------- Reset ---------- */
  function resetCalculation() {
    scoreNameEl.textContent = '未完成の手牌です';
    scoreNameEl.style.color = 'var(--text-secondary)';
    scoreTotalEl.textContent = '--';
    scoreBreakdownEl.textContent = '--';
    yakuListEl.innerHTML = '<li class="empty-yaku">役がありません</li>';
  }

  /* ---------- Calculate ---------- */
  function triggerCalculate() {
    if (hand.length < 14) {
      resetCalculation();
      return;
    }

    const isTsumo = document.getElementById('tsumo').checked;
    const jikazeStr = document.querySelector('input[name="wind"]:checked').value;
    const bakazeStr = document.querySelector('input[name="bakaze"]:checked').value;
    const isOya = (jikazeStr === '1');

    const hand13 = hand.slice(0, 13);
    const winTile = hand[13];

    // 特別役オプション
    let extraYaku = '';
    document.querySelectorAll('#extra-yaku-group input[type="checkbox"]:checked').forEach(chk => {
      extraYaku += chk.value;
    });

    const result = calculateHandScore(
      hand13, winTile, dora, isTsumo,
      parseInt(bakazeStr), parseInt(jikazeStr), extraYaku
    );

    if (result.error) {
      scoreNameEl.textContent = result.message;
      scoreNameEl.style.color = 'var(--danger-color)';
      scoreTotalEl.textContent = '--';
      scoreBreakdownEl.textContent = '--';
      yakuListEl.innerHTML = '<li class="empty-yaku">計算不可</li>';
      return;
    }

    scoreNameEl.style.color = 'var(--primary-color)';

    // 役一覧
    let yakuHtml = '';
    if (result.yaku && Object.keys(result.yaku).length > 0) {
      for (const [yakuName, han] of Object.entries(result.yaku)) {
        yakuHtml += `<li><span>${yakuName}</span><span class="yaku-han">${han}</span></li>`;
      }
    } else {
      yakuHtml = '<li class="empty-yaku">役なし</li>';
    }
    yakuListEl.innerHTML = yakuHtml;

    // タイトル（満貫等）
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
        scoreBreakdownEl.textContent = `子 各${result.oya[0].toLocaleString()}点`;
      } else {
        scoreBreakdownEl.textContent = `子 ${result.ko[1].toLocaleString()} / 親 ${result.ko[0].toLocaleString()} 点`;
      }
    } else {
      scoreBreakdownEl.textContent = 'ロン（放銃者が全額払い）';
    }

    // アニメーション
    scoreTotalEl.classList.remove('updated');
    void scoreTotalEl.offsetWidth;
    scoreTotalEl.classList.add('updated');
  }

  /* ---------- Event Listeners ---------- */
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
      btnToggleDora.textContent = 'ドラ入力: ON';
    } else {
      btnToggleDora.classList.remove('active');
      btnToggleDora.textContent = 'ドラ入力: OFF';
    }
  });

  document.querySelectorAll(
    'input[name="wind"], input[name="win-type"], input[name="bakaze"], #extra-yaku-group input[type="checkbox"]'
  ).forEach(el => {
    el.addEventListener('change', triggerCalculate);
  });

  /* ---------- Init ---------- */
  createKeyboard();
  renderTiles();
});
