# 公開の残作業

2026-10-23：GitHubの新規独立リポジトリへ実装保存済み。Cloudflareの認証フォームを安全な認証機能で送信したが、画面に `API Request Failed: post https://dash.cloudflare.com/api/v4/login (403)` が表示された。パスワード誤りやbot検知とは断定しない。以後の認証試行や別方式への切り替えは実施していない。

## 本人の環境で公開を進める場合

1. 既存のCloudflareアカウントで Workers & Pages の新規Pages作成へ進む（ダッシュボードの名称は変更される場合あり）。
2. GitHubの `MORRY1992/bus-date-navi` だけを接続する。権限拡大が必要なら対象をこのリポジトリに限定する。
3. 名前候補 `bus-date-navi`、production branch `main`、Framework `None`、Build command `npm test && npm run check`、出力 `dist`、Node 22以上。Functions・DB・有料プラン・有料ドメインは不要。
4. 実際に発行されたURLを記録する。候補と違えば `scripts/build-content.py` のoriginを修正して再生成し、SEO設定を合わせる。
5. 実URLでフォーム・任意比較・コピー・不正入力を操作確認する。HTMLを取得できるだけで合格としない。
6. 公開ヘッダー、sitemap、robots.txt、ads.txt、404、内部リンクを確認する。

本人の通常ブラウザーとWorkのクラウドブラウザーは別セッション。通常ブラウザーのログインだけでWorkのログインが復旧するとは案内しない。

公開・確認後にREADME/QA/ADSENSEの状態を実態に合わせて更新する。AdSense審査は公開サイトの確認後。
