import Riichi from 'riichi';

/**
 * 手牌の配列からriichiパッケージ用の文字列に変換する
 * @param {string[]} tiles - ['1m', '9s', '1z'...]
 * @returns {string} 
 */
function formatTiles(tiles) {
  const suits = { m: [], p: [], s: [], z: [] };
  tiles.forEach(t => {
    if (t.length === 2) {
      suits[t[1]].push(t[0]);
    }
  });

  let str = '';
  for (const suit of ['m', 'p', 's', 'z']) {
    if (suits[suit].length > 0) {
      suits[suit].sort();
      str += suits[suit].join('') + suit;
    }
  }
  return str;
}

/**
 * ドラ表示牌を実際のドラ牌に変換する
 * @param {string} indicator - '1m', '9s', '1z' など
 * @returns {string} 実際のドラ牌
 */
function getDoraTile(indicator) {
  const num = parseInt(indicator[0], 10);
  const suit = indicator[1];
  
  if (suit === 'm' || suit === 'p' || suit === 's') {
    return (num % 9 + 1) + suit; // 1->2, 9->1
  } else if (suit === 'z') {
    if (num >= 1 && num <= 4) { // 風牌
      return (num % 4 + 1) + suit; // 1->2, 4->1
    } else if (num >= 5 && num <= 7) { // 三元牌
      return ((num - 5 + 1) % 3 + 5) + suit; // 5->6, 7->5
    }
  }
  return indicator;
}

/**
 * 役・点数を計算する
 * @param {string[]} handTiles - 13枚の手牌配列
 * @param {string} winTile - 1枚のあがり牌
 * @param {string[]} doraIndicators - ドラ表示牌の配列
 * @param {boolean} isTsumo - ツモかどうか
 * @param {number} bakaze - 場風 (1:東, 2:南)
 * @param {number} jikaze - 自風 (1:東, 2:南, 3:西, 4:北)
 * @param {string} extraYaku - 追加役（r:リーチ, t:天和 など）
 * @returns {object} 計算結果
 */
export function calculateHandScore(handTiles, winTile, doraIndicators, isTsumo, bakaze, jikaze, extraYaku = '') {
  if (handTiles.length !== 13 || !winTile) {
    return { error: true, message: '手牌は14枚にしてください。' };
  }

  const handStr = formatTiles(handTiles);
  const winStr = isTsumo ? winTile : '+' + winTile;

  let query = handStr + winStr;

  // ドラ追加
  if (doraIndicators && doraIndicators.length > 0) {
    // 表示牌を実際のドラ牌に変換して渡す
    const actualDoras = doraIndicators.map(getDoraTile);
    query += '+d' + formatTiles(actualDoras);
  }

  // 特別役 + 場風自風 + ローカル役フラグ(o)
  // 例: +rt11 (リーチ、天和、場風東、自風東)
  query += `+${extraYaku}o${bakaze}${jikaze}`;

  console.log('Riichi Query:', query);
  
  try {
    const riichi = new Riichi(query);
    const result = riichi.calc();
    
    if (result.error) {
      return { error: true, message: '役がありません（またはフリテン、条件未達）' };
    }
    
    if (!result.isAgari) {
      return { error: true, message: 'あがりの形になっていません' };
    }

    return {
      error: false,
      isAgari: true,
      ten: result.ten,
      han: result.han,
      fu: result.fu,
      name: result.name,
      yaku: result.yaku,
      text: result.text,
      oya: result.oya,
      ko: result.ko
    };

  } catch (e) {
    console.error(e);
    return { error: true, message: '計算エラーが発生しました' };
  }
}
