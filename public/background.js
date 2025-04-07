chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    console.log('this is the background worker');
    console.log('i think we put serviceworker(s) here?');
});
