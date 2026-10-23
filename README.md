# 日付まちがい防止ナビ

夜行バス・遠征の出発表記をカレンダー上の日本時間へ換算する無料ツール。F計画SPの独立プロジェクト。

## 状態

2026-10-23：実装とローカルブラウザー検証を完了。Cloudflareへのログインが必要なため一般公開は未完了。`https://bus-date-navi.pages.dev` は候補であり発行確認済みURLではありません。

## 構成・無料運用

- 配信物：`dist/`（HTML/CSS/ES modules。ビルド不要）
- パッケージ依存なし、サーバー処理なし、Functionsなし、外部API・フォント・解析・広告通信なし
- 入力日時はブラウザー内で処理。Cookie/LocalStorage/URLへの予定保存はしない
- `core.mjs` はUTCメソッドと固定JSTオフセットだけで処理。端末のローカル時刻パースは使わない
- 00〜29時の表記の換算と予約会社の運行日判定は別。予約内容は保証しない
- 最小対応：Node 22以上（テストのみ）。配信時にNodeは不要

## 検証

```sh
npm test
npm run check
```

68テスト合格・失敗0。指定の8ケース、うるう年、月末・年末、00〜29時、不正入力、全角、ホテル比較、コピー成功/失敗、6タイムゾーンを確認。1テスト内で1900〜2100年の73,414日の連続性も検証。別途静的構造・リンク検査146項目。

ブラウザーでの検証範囲と未検証事項は [docs/QA.md](docs/QA.md)。

## Cloudflare Pagesへの接続

新規プロジェクトに `MORRY1992/bus-date-navi` を接続。既存の f-sp-games / f-sp-tools / tsukiakari-web は変更しない。

- Production branch: `main`
- Framework preset: `None`
- Build command: `npm test && npm run check`（デプロイ前の必須チェック）
- Build output directory: `dist`
- Node: `22` 以上
- Project name候補: `bus-date-navi`（空き状況はPagesで確認）
- Functions、ストレージ、有料サービス、独自ドメインを追加しない
- 自動デプロイ時の失敗は公開しない。標準のPages無料枠を使う

正式ホスト名が候補と異なる場合は `scripts/build-content.py` のoriginを変更して実行し、再テストしてから公開。Pagesは `.html` を拡張子なしへリダイレクトするため、canonical・sitemapは拡張子なしを指定。

運用上の再生成：`python scripts/build-content.py`。通常のCloudflareビルドではPythonは不要で、コミット済みdistを配信する。

## 資料

- [公式・競合・費用調査](docs/RESEARCH.md)
- [広告の段階別準備](docs/ADSENSE.md)
- [AIによる10観点レビュー](docs/REVIEW.md)
- [検証記録](docs/QA.md)

定期の記事自動生成や日次更新は不要。運行会社の案内・規約が変わったときは説明を見直す。利用数・検索流入・不具合を確認してから、追加機能の優先順位を決める。
