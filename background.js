// Background service worker for video download helper
chrome.runtime.onInstalled.addListener(() => {
  console.log('Video Download Helper installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'VIDEO_DETECTED') {
    // Store video info
    chrome.storage.local.set({ videos: request.videos });
    // Update badge to show detected videos
    chrome.action.setBadgeText({ text: request.videos.length.toString() });
  }
});

// Handle download requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'DOWNLOAD_VIDEO') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      conflictAction: 'uniquify'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
      }
    });
  }
});