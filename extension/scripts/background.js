// let pages = [];

const catPage = (body) => {
  // if (!pages.length) return
  // const body = pages[0];

  fetch("http://localhost:3000/api/category", {
    method: "POST",
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((resJSON) => {
      console.log(resJSON);
      const { hostname, category } = resJSON;
      chrome.storage.local.get(["categoryData"]).then((data) => {
        const currentCategoryData = data.categoryData || {};
        // Update the category for this hostname
        const updatedCategoryData = {
          ...currentCategoryData,
          [hostname]: category,
        };
        chrome.storage.local.set({
          categoryData: updatedCategoryData,
        });
      });
      console.log(
        hostname,
        category
      );
    })
    .catch((error) => {
      console.log(error);
    });
  //   pages.shift();
};

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  //   pages.push(req);
  catPage(req);
  sendResponse({ success: "page received" });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  console.log("this is the background/service worker");
});

let sessionStartTime = {};
let activeTabId = null;

// initialize or get current data
chrome.storage.local.get(["siteData"], (result) => {
  const siteData = result ? result.siteData : {};
  chrome.storage.local.set({ siteData });
});

async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "ping" });
    return true;
  } catch (e) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["dist/content.js"],
      });
    } catch (error) {}
    return false;
  }
}

// track active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  ensureContentScript(activeInfo.tabId);
  const previousTabId = activeTabId;
  activeTabId = activeInfo.tabId;

  // if switching from a tab, record session duration
  if (previousTabId && sessionStartTime[previousTabId]) {
    const duration = (Date.now() - sessionStartTime[previousTabId]) / 1000;
    updateSessionDuration(previousTabId, duration);
  }
  // reset session start time for this tab
  sessionStartTime[activeTabId] = Date.now();
});

// handle navigation events
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    incrementPageView(tab.url);

    // reset session start time for this tab
    sessionStartTime[tabId] = Date.now();
  }
});

// handle tab close events
chrome.tabs.onRemoved.addListener((tabId) => {
  if (sessionStartTime[tabId]) {
    const duration = (Date.now() - sessionStartTime[tabId]) / 1000;
    updateSessionDuration(tabId, duration);
    delete sessionStartTime[tabId];
  }
});

// helper functions
// increment the page view counter for a URL
function incrementPageView(url) {
  try {
    const hostname = new URL(url).hostname;

    chrome.storage.local.get(["siteData"], (result) => {
      const siteData = result.siteData || {};
      if (!siteData[hostname]) {
        siteData[hostname] = {
          visits: 0,
          sessions: 0,
          totalDuration: 0,
          userId: null,
        };
      }
      siteData[hostname].visits += 1;

      chrome.storage.local.set({ siteData }, () => {
        // Make POST API call to sync data with backend
        fetch("http://localhost:3000/api/sitevisits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostname,
            siteData: siteData[hostname],
          }),
        }).catch((error) =>
          console.error("Error syncing with backend:", error)
        );
      });
    });
  } catch (e) {
    console.error("Error processing URL:", e);
  }
}

// update session duration for a tab
function updateSessionDuration(tabId, duration) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      return; // tab closed
    }

    try {
      const hostname = new URL(tab.url).hostname;

      chrome.storage.local.get(["siteData"], (result) => {
        const siteData = result ? result.siteData : {};

        if (!siteData[hostname]) {
          siteData[hostname] = {
            visits: 0,
            sessions: 0,
            totalDuration: 0,
            userId: null,
          };
        }

        siteData[hostname].totalDuration += duration;
        siteData[hostname].sessions += 1;
        chrome.storage.local.set({ siteData }, () => {
          // Make POST API call to sync TOTAL data with backend
          fetch("http://localhost:3000/api/sitevisits", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hostname,
              siteData: siteData[hostname],
            }),
          }).catch((error) =>
            console.error("Error syncing with backend:", error)
          );

          if (duration) {
            fetch("http://localhost:3000/api/sitevisit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                hostname,
                duration: duration,
              }),
            }).catch((error) =>
              console.error("Error syncing with backend:", error)
            );
          }
        });
      });
    } catch (e) {
      console.error("Error updating session data:", e);
    }
  });
}
