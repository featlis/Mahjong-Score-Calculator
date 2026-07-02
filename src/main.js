import { calculateScore } from './scoreCalculator.js';

document.addEventListener('DOMContentLoaded', () => {
  const hanSelect = document.getElementById('han-select');
  const fuSelect = document.getElementById('fu-select');
  const fuGroup = document.getElementById('fu-group');
  const scoreName = document.getElementById('score-name');
  const scoreTotal = document.getElementById('score-total');
  const scoreBreakdown = document.getElementById('score-breakdown');
  
  const oyaRadio = document.getElementById('oya');
  const tsumoRadio = document.getElementById('tsumo');

  function updateScore() {
    const han = parseInt(hanSelect.value, 10);
    const fu = parseInt(fuSelect.value, 10);
    const isOya = oyaRadio.checked;
    const isTsumo = tsumoRadio.checked;

    // 5飜以上なら符の選択を隠す（計算に影響しないため）
    if (han >= 5) {
      fuGroup.classList.add('hidden');
    } else {
      fuGroup.classList.remove('hidden');
    }

    const result = calculateScore(han, fu, isOya, isTsumo);

    // アニメーション用のクラス付け外し
    scoreTotal.classList.remove('updated');
    void scoreTotal.offsetWidth; // trigger reflow
    scoreTotal.classList.add('updated');

    scoreName.textContent = result.name;
    scoreTotal.textContent = result.total.toLocaleString();
    
    // 内訳表示の調整
    if (result.breakdown === "ロンあがり" || result.breakdown.includes("ALL")) {
      scoreBreakdown.textContent = result.breakdown;
    } else {
      scoreBreakdown.textContent = `子 ${result.breakdown.split(' / ')[0]} / 親 ${result.breakdown.split(' / ')[1]}`;
    }
  }

  // イベントリスナーの登録
  hanSelect.addEventListener('change', updateScore);
  fuSelect.addEventListener('change', updateScore);
  
  document.querySelectorAll('input[name="dealer"]').forEach(radio => {
    radio.addEventListener('change', updateScore);
  });
  
  document.querySelectorAll('input[name="win-type"]').forEach(radio => {
    radio.addEventListener('change', updateScore);
  });

  // 初期計算
  updateScore();
});
