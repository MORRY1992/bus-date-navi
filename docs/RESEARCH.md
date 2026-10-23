# 初版調査記録

確認日：2026-10-23（日本時間）。取得できた公式公開情報を基準とする。各サイトの将来の変更は自動反映しない。

## 日付表記の一次資料

| 出典 | 確認した内容 | 仕様への反映 |
|---|---|---|
| [WILLER公式FAQ](https://faq.willer.co.jp/s/article/1470) | 夜行便は到着日の前日を出発日として検索・予約。12/31 25時 → 1/1 午前1時の例 | 24時以上の翌日換算と、予約日自体の判定を区別 |
| [さくら高速バス公式FAQ](https://www.489.fm/faq/reserve/p12.html) | 24時を過ぎる夜行便は到着日の前日を選択、最終確認画面の到着日を確認 | 結果に到着日と予約元の照合を明示 |
| [ミルキーウェイ公式](https://www.milkyway-ex.com/news92) | 夜行便は到着日の前日で検索、予約詳細メール・履歴で確認 | 誤解しやすい「乗車日」の意味を説明 |
| [ミルキーウェイの具体例](https://www.milkyway-ex.com/news70) | 大宮23:15・東京24:20・名古屋5:50の例。途中停留所では日付が変わる | 始発地だけで判断せず自身の停留所を確認する案内 |

これら3社の説明を全事業者の共通ルールとは扱わない。特に00〜23時入力は「入力した日付の時刻」という計算上の仮定を常に提示。「翌日」などの注記・運行日を自動推定しない。24:00→翌日00:00、24:30→翌日00:30、25:00→翌日01:00は暦上の換算。

## 競合・代替手段

検索語：夜行バス 日付 変換 計算 ツール 24時 25時／「夜行バス」「日付変換」／「24時」「変換」「計算ツール」。検索結果と対象ページ本文を確認。2026-10-23。

| 名称 | URL | 確認できた機能・立ち位置 |
|---|---|---|
| 計算ツール.jp「時刻の足し算・引き算」 | https://keisantool.jp/tools/time-add-calculator/ | 時分秒の加減算、翌日・前日の表示。汎用計算の代替手段。夜行バス固有の予約条件判定は確認できず |
| サクッとツール「時間計算」 | https://saku-tools.com/jikan/ | 基準時刻＋経過時間、時間の足し引き、日またぎ。汎用代替手段 |
| バス比較なび「深夜0時以降に出発する夜行バスの予約」 | https://www.bushikaku.net/article/49377/ | 予約サイトごとの日付説明記事。情報面の競合。検索結果上の分類は2024年5月調査であり、本サービスの事業者別ルールとして採用しない |
| トラベルコFAQ | https://www.tour.ne.jp/faq/j_bus/74.html | 24時以降の出発日の説明。FAQによる代替手段 |

この調査範囲では本サービスと完全一致する「出発日の変換＋ホテル予定比較」専用ツールは確認できなかった。市場全体に競合がない、競争が弱い、需要が大きいという結論にはしない。検索数・需要量・広告単価・承認率は未計測。SEO語句は仮説。

## 無料運用の公式条件

- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/): Freeは同時1ビルド、月500ビルド、20,000ファイル、1ファイル25MiB。上限はアカウントの他プロジェクトとも関係するため無制限の更新を約束しない。
- [Cloudflare Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/): Functionsを呼ばない静的アセットのリクエストは無料・無制限。本プロジェクトにFunctions、Worker、DB、有料APIは不要。
- [GitHub Actions billing](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions): パブリックリポジトリ＋標準GitHub-hosted runnerのActions利用は無料。large runner等は使わない。
- Cloudflareアカウントの現在の契約画面・新規Pagesの稼働設定はログイン待ちにつき未確認。有料プラン変更は実施していない。

## AdSense

- [新規サイトの追加](https://support.google.com/adsense/answer/12169212?hl=en): サイト追加→所有権確認→審査依頼。方法は広告コード／ads.txt／metaタグ。初版は広告通信を避けるためmetaタグを用意。
- [登録できるサイト種別](https://support.google.com/adsense/answer/12170421?hl=en): Public Suffix List上のプラットフォームのサブドメインは登録対象。
- [Public Suffix List](https://publicsuffix.org/list/public_suffix_list.dat): 取得版2026-10-22で `pages.dev` 掲載を確認。したがって `bus-date-navi.pages.dev` は形式上の対象となるとの判断。管理画面での実際の追加成功・審査合格を意味しない。
- [サイト接続・承認](https://support.google.com/adsense/answer/7584263?hl=en): サイト全体の審査が必要。承認前の広告配信を報告しない。
- [CMP要件](https://support.google.com/adsense/answer/13554116?hl=en)／[欧州規制メッセージ](https://support.google.com/adsense/answer/11546682?hl=en): EEA・英国・スイス向けの対象広告にはGoogle認定CMP等の要件がある。広告導入前に既存AdSenseの「プライバシーとメッセージ」等で適用を確認し、必要なメッセージを設定する。初版は広告スクリプトも解析も読み込まない。
- `MORRY1992/f-sp-tools/dist/index.html` の現行ソースで `ca-pub-2422278081062267` を確認。新サイトに同IDの所有権確認用metaとads.txtを準備。既存サイトは変更していない。アカウントの本人確認・サイト承認状態・入金状態は未確認。
