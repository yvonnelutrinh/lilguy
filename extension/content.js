import { Readability } from "@mozilla/readability";

(async () => {
  const docClone = document.cloneNode(true);
  const reader = new Readability(docClone);
  const page = reader.parse();
  const pageText = page.textContent.trim();
  const message = { pageText, pageName: window.location.href };
  const res = await chrome.runtime.sendMessage(message);
  console.log(res);
})();
