# 🀄 麻雀点数計算

<div align="center">

[![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![riichi](https://img.shields.io/badge/riichi-1.2.0-10b981)](https://www.npmjs.com/package/riichi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**手牌入力 → 即座に点数計算。SVG描画の麻雀牌キーボード搭載のElectronデスクトップアプリ。**

[インストール](#-クイックスタート) · [使い方](#-使い方) · [ビルド](#-配布用exeのビルド)

</div>

---

## 特徴

- **SVG描画の牌キーボード** — 萬子（漢数字）・筒子（丸パターン）・索子（竹パターン）・字牌をリアルに再現
- **リアルタイム計算** — 手牌・ドラ・条件を変えると即座に再計算
- **正確な役判定** — [riichi](https://www.npmjs.com/package/riichi) ライブラリで天和〜数え役満まで完全対応
- **ダークモードUI** — グラスモーフィズムデザイン

---

## クイックスタート

```bash
git clone https://github.com/featlis/Mahjong-Score-Calculator.git
cd Mahjong-Score-Calculator
npm install
npm run start   # Vite + Electron を同時起動
```

> Node.js 16 以上が必要です。

---

## 使い方

### 1. 手牌を入力する

牌キーボード（萬子 / 筒子 / 索子 / 字牌）から牌をクリックして手牌を追加します。  
**14枚目が和了牌**として扱われます。

| ボタン | 動作 |
|--------|------|
| ⌫ 1枚消す | 最後の牌を削除 |
| ✖ すべて消す | 手牌・ドラをリセット |
| ドラ入力: OFF/ON | ドラ表示牌の入力モードを切り替え |

### 2. ドラ表示牌を設定する

「ドラ入力: OFF」ボタンを押してONにし、ドラ表示牌をクリック。  
複数枚の設定に対応しています。ドラは実際のドラ牌（表示牌の次）に自動変換されます。

### 3. 条件を設定する

| 設定 | 選択肢 |
|------|--------|
| 自風 | 東（親）/ 南・西・北（子） |
| あがり方 | ツモ / ロン |
| 場風 | 東 / 南 |
| 特別役 | リーチ・一発・Wリーチ・天和系・海底系・嶺上/槍槓 |

> **天和系**チェック時：親+ツモ → 天和、子+ツモ → 地和 として計算されます。

### 4. 計算結果を確認する

14枚揃った瞬間に点数が表示されます。

```
3飜 30符
  5,900点
子 1,000 / 親 2,000 点

成立役
  門前清自摸和  1飜
  断么九       1飜
  三色同順     2飜（喰い-1）
```

---

## 対応役

標準的な日本麻雀の全役に対応（フリテン・無役はエラー表示）。

| カテゴリ | 対応内容 |
|----------|----------|
| 役満 | 天和・地和・国士・四暗刻・大四喜・清老頭・九蓮宝燈 など |
| 跳満〜数え役満 | 飜数に応じて自動判定 |
| ドラ | 表ドラ複数枚・赤ドラ |
| 特殊あがり | 嶺上開花・槍槓・海底・河底 |

---

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run start` | Electron + Vite 開発モード起動 |
| `npm run dev` | Vite のみ起動（ブラウザで確認） |
| `npm run build` | Vite ビルド |
| `npm run pack` | Electron ポータブル版作成 |
| `npm run dist` | Windows インストーラー作成 |

---

## 配布用EXEのビルド

```bash
npm run dist
# → dist-electron/MahjongScore Setup 1.0.0.exe
```

インストーラーはインストール先の変更・全ユーザー向けインストールに対応しています。

---

## 技術スタック

| | |
|---|---|
| **Electron 28** | デスクトップアプリフレームワーク |
| **Vite 5** | フロントエンドビルド |
| **riichi 1.2.0** | 麻雀点数計算ライブラリ |
| **Vanilla JS + CSS** | UIロジック・SVG牌描画 |

---

## プロジェクト構成

```
Mahjong-Score-Calculator/
├── src/
│   ├── main.js           # 牌SVG生成 + アプリロジック
│   ├── scoreCalculator.js # riichi ライブラリへのブリッジ
│   └── style.css         # ダークモードUI + 牌スタイル
├── electron/
│   └── main.js           # Electron メインプロセス
├── index.html
└── package.json
```

---

## ライセンス

MIT
