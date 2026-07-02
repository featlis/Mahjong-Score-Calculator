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
      // 念のためソートする
      suits[suit].sort();
      str += suits[suit].join('') + suit;
    }
  }
  return str;
}

/**
 * 役・点数を計算する
 * @param {string[]} handTiles - 13枚の手牌配列
 * @param {string} winTile - 1枚のあがり牌
 * @param {string[]} doraTiles - ドラ表示牌の配列
 * @param {boolean} isTsumo - ツモかどうか
 * @param {number} bakaze - 場風 (1:東, 2:南)
 * @param {number} jikaze - 自風 (1:東, 2:南, 3:西, 4:北)
 * @returns {object} 計算結果
 */
export function calculateHandScore(handTiles, winTile, doraTiles, isTsumo, bakaze, jikaze) {
  if (handTiles.length !== 13 || !winTile) {
    return { error: true, message: '手牌は14枚にしてください。' };
  }

  // 手牌の文字列構築
  const handStr = formatTiles(handTiles);
  
  // 和了牌の文字列構築
  // ツモならそのまま結合、ロンなら "+" を付ける
  const winStr = isTsumo ? winTile : '+' + winTile;

  let query = handStr + winStr;

  // ドラ追加
  if (doraTiles && doraTiles.length > 0) {
    query += '+d' + formatTiles(doraTiles);
  }

  // 場風・自風の追加 (1:東, 2:南, 3:西, 4:北)
  query += `+${bakaze}${jikaze}`;

  console.log('Riichi Query:', query);
  
  try {
    const riichi = new Riichi(query);
    const result = riichi.calc();
    
    if (result.error) {
      return { error: true, message: '役がありません（または多牌/少牌等）' };
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
      name: result.name, // 満貫などの名前（riichiライブラリではテキストの場合もある）
      yaku: result.yaku, // { 'リーチ': '1飜', ... }
      text: result.text,
      oya: result.oya,
      ko: result.ko
    };

  } catch (e) {
    console.error(e);
    return { error: true, message: '計算エラーが発生しました' };
  }
}
