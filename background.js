async function onClicked() {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  tabs.forEach((tab) => {
    browser.tabs.sendMessage(tab.id, {});
  });
}

browser.browserAction.onClicked.addListener(onClicked);
