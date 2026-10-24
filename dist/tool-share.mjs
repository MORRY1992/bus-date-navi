import {copyText} from './core.mjs';

// Deliberately independent of form values, results, location and document metadata.
const site = Object.freeze({
  title: '日付まちがい防止ナビ',
  text: '夜行バスの24時・25時表記を実際の日本時間の日付・時刻に変換。到着とホテルの予定も比較できる無料ツールです。',
  url: 'https://bus-date-navi.pages.dev/'
});
export const toolShareData = () => ({...site});
export const toolShareText = () => [site.title, site.text, site.url].join('\n');

export function initToolShare({button, show, status, fallback, text}, nav = navigator) {
  const reveal = () => {
    fallback.hidden = false;
    text.value = toolShareText();
    text.focus();
    text.select();
  };
  show.addEventListener('click', reveal);
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    button.disabled = true;
    fallback.hidden = true;
    status.textContent = '';
    try {
      if (typeof nav.share === 'function') {
        try {
          // Invoke directly within the click gesture, before any asynchronous work.
          await nav.share(toolShareData());
          status.textContent = '共有先へ紹介内容を渡しました。';
          return;
        } catch (error) {
          if (error?.name === 'AbortError') {
            status.textContent = '共有を中止しました。紹介文はコピーしていません。';
            return;
          }
        }
      }
      if (await copyText(toolShareText(), nav.clipboard)) {
        status.textContent = 'このツールの紹介文とURLをコピーしました。';
      } else {
        status.textContent = '自動コピーができませんでした。下の紹介文を選択してコピーしてください。';
        reveal();
      }
    } finally {
      button.disabled = false;
    }
  });
}
