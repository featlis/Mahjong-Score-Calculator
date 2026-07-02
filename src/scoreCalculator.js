/**
 * Calculate the Mahjong score based on han, fu, dealer status, and win type.
 * @param {number} han - 飜数 (1-13)
 * @param {number} fu - 符数 (20-110)
 * @param {boolean} isOya - 親かどうか
 * @param {boolean} isTsumo - ツモあがりかどうか
 * @returns {object} { name: string, total: number, breakdown: string }
 */
export function calculateScore(han, fu, isOya, isTsumo) {
  // 満貫以上の判定
  let basePoint = 0;
  let name = "";

  if (han >= 13) {
    basePoint = 8000; // 役満
    name = "役満";
  } else if (han >= 11) {
    basePoint = 6000; // 三倍満
    name = "三倍満";
  } else if (han >= 8) {
    basePoint = 4000; // 倍満
    name = "倍満";
  } else if (han >= 6) {
    basePoint = 3000; // 跳満
    name = "跳満";
  } else if (han >= 5) {
    basePoint = 2000; // 満貫
    name = "満貫";
  } else {
    // 1〜4飜の場合の基本点計算
    basePoint = fu * Math.pow(2, han + 2);
    // 満貫打ち切り (基本点が2000を超える場合は満貫とする。※切り上げ満貫ルールなどは考慮せず標準的なルール)
    if (basePoint >= 2000) {
      basePoint = 2000;
      name = "満貫";
    } else if (han === 4 && fu >= 40) {
      basePoint = 2000;
      name = "満貫";
    } else if (han === 3 && fu >= 70) {
      basePoint = 2000;
      name = "満貫";
    } else {
      name = `${han}飜 ${fu}符`;
    }
  }

  // 切り上げ処理
  const ceil100 = (num) => Math.ceil(num / 100) * 100;

  let total = 0;
  let breakdown = "";

  if (isOya) {
    // 親の場合
    if (isTsumo) {
      const perKo = ceil100(basePoint * 2);
      total = perKo * 3;
      breakdown = `${perKo} ALL`;
    } else {
      total = ceil100(basePoint * 6);
      breakdown = "ロンあがり";
    }
  } else {
    // 子の場合
    if (isTsumo) {
      const fromOya = ceil100(basePoint * 2);
      const fromKo = ceil100(basePoint);
      total = fromOya + fromKo * 2;
      breakdown = `${fromKo} / ${fromOya}`;
    } else {
      total = ceil100(basePoint * 4);
      breakdown = "ロンあがり";
    }
  }

  // 例外処理：七対子のツモは25符固定
  if (han === 1 && fu === 20 && !isTsumo) {
    // 1飜20符（平和ツモ以外はありえないので一応ガード）
  }

  // 例外：喰い平和の30符1飜は特例で1000点等、様々なローカルルールがあるが一般的なMリーグルールベース
  // 平和ツモ = 20符
  // ツモは+2符されるが20符は平和ツモのみ
  // ピンフロンは30符

  return {
    name,
    total,
    breakdown
  };
}
