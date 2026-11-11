# 集中ゾーン④ QA記録

実施日：2026-11-12 JST。基準main `9c404ab44bce250b18ce24d4eca9e729967d9cff`、PR #3。

## 開発検査
- Node 24.22.1：90試験合格（既存89＋結果UI回帰1）。6タイムゾーン、1900〜2100年全日付、年末/月末/うるう年/00〜29時/全角/不正日付・時刻を含む。
- 生成元から再生成し、同じ配信物が生成されることを確認。
- core.mjs、_headers、ads.txt、privacy.html、terms.html、tool-share.mjsは基準mainとバイト一致。既存canonical・所有確認metaを維持。
- 初回ブラウザー起動はPlaywrightの付属実行ファイルなし、システムChromiumもsocket権限制約。検査を省略せず、CloudflareブランチプレビューとクラウドChromeを使用。

## ブランチプレビュー
- `75e9914`：Cloudflare成功、PC実入力 11/7 24:20→11/8 00:20。キーボードEnter送信、結果見出し→Tab→コピー、Enterコピー、実Clipboard本文、条件変更とフォーカス/旧結果消去を確認。
- `6bd454f` / https://d7489e5e.bus-date-navi.pages.dev/ ：84ブラウザー検査、失敗0。320/375/390/1280pxのiframeで初期/結果/エラーのはみ出し、8日時ケース×4幅、例示の識別、修正、コピー拒否/全文選択、ホテル8時間・乗車6時間40分、任意欄不正、空欄、200% CSS zoomを検証。
- 390px結果と320pxガイドを目視。320pxガイドの本文clientWidth/scrollWidthはともに305px（スクロールバー15px）。
- 初回QAハーネスのEvent生成構文エラーを修正後に全件実行。製品の計算エラーではない。
- 目視後、入力欄直下にもエラーを追加。最終 `7d6f64d` / https://eb79d7ce.bus-date-navi.pages.dev/ でも84項目すべて合格。入力欄直下のエラー表示とフォーカスを375pxで目視確認。ブラウザー本体の拡大キーはこの環境では表示幅が変わらず、200%はCSS zoomでの確認に限定。

## 検査用資産
`scripts/make-browser-qa.py` + `scripts/browser-qa.mjs` から一時 `dist/__qa.*` を生成。合成の例示値のみ使用。noindex付き・CSPを緩和せずsame-origin srcdocを使用。__qa配信物はmainマージ前に削除し、再利用可能な生成手順をscriptsに残す。

## 限界
Android/iPhone実機、TalkBack/VoiceOver、OS文字サイズ、ネイティブ共有シート、.icsのOS取込は今回未検証。CSS zoomの200%はブラウザー本体のズーム/OS文字拡大の代替保証ではない。実利用CWV・一般利用者の行動・ASP成果は未計測。関連ツールの広告はクリックしていない。
