document.addEventListener('DOMContentLoaded', () => {
  const videoList = document.getElementById('video-list');
  const refreshBtn = document.getElementById('refresh-btn');

  // Load detected videos from storage
  chrome.storage.local.get(['videos'], (result) => {
    updateVideoList(result.videos || []);
  });

  // Request fresh video detection
  refreshBtn.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'DETECT_VIDEOS'});
      }
    });
  });

  // Listen for video updates from background
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'VIDEOS_UPDATED') {
      updateVideoList(request.videos);
    }
  });

  function updateVideoList(videos) {
    if (videos.length === 0) {
      videoList.innerHTML = '<p>No videos detected on this page</p>';
      return;
    }

    videoList.innerHTML = '';
    videos.forEach((video, index) => {
      const videoItem = document.createElement('div');
      videoItem.className = 'video-item';
      
      videoItem.innerHTML = `
        <div class="video-info">
          <div class="video-title">Video ${index + 1}</div>
          <div class="video-resolution">${video.width}x${video.height}</div>
        </div>
        <button class="download-btn" data-url="${video.src}">
          Download (${formatBytes(video.size)})
        </button>
      `;

      videoList.appendChild(videoItem);
    });

    // Add download event listeners
    document.querySelectorAll('.download-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const url = e.target.getAttribute('data-url');
        const filename = `video_${Date.now()}.${getFileExtension(url)}`;
        chrome.runtime.sendMessage({
          type: 'DOWNLOAD_VIDEO',
          url: url,
          filename: filename
        });
      });
    });
  }

  function getFileExtension(url) {
    const match = url.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
    return match ? match[1] : 'mp4';
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
});