# 検索の入口と旅行準備の導線（2026-10-28）

- ホームのtitle・OG title・description・OG description・h1で24時/25時の換算用途を明示。
- 本文に、持ち物リスト・ホテル総額比較・夜行バス2便の手入力比較への通常リンクを追加。
- ホテル日程ガイドから持ち物・宿泊費比較へ直接案内。旅行予定をURLへ埋め込まず、自動転送しない旨を明記。
- 変更したホーム・ガイドだけsitemapのlastmodを更新。既存canonical、広告確認用タグ、計算・共有・保存の処理は維持。
- 生成元scripts/build-content.pyと配信HTMLに同じ変更を反映。今回、既存の別更新を巻き戻さないため全ページの再生成はしていない。

検証：既存Nodeテスト89件・静的検査146項目が成功。Python生成スクリプトの構文を確認。入力処理JSに差分なし。

公開先：https://bus-date-navi.pages.dev/
関連先：https://tabishitaku-rakuchinder.pages.dev/ 、https://rakuchin-stay.morry92.chatgpt.site/ 、https://nightbus-finder.pages.dev/
持ち物と夜行バスはクラウドChromeの公開画面・既存リンク遷移で確認。公開への反映、検索インデックスと流入改善は別確認。Search Consoleの所有権タグを他サイトから流用しない。
