// Content script to detect video elements on the page
function detectVideos() {
  const videos = Array.from(document.querySelectorAll('video, [data-video]'));
  const videoInfo = videos.map(video => {
    return {
      src: video.currentSrc || video.src,
      width: video.videoWidth || 0,
      height: video.videoHeight || 0,
      duration: video.duration || 0,
      size: estimateVideoSize(video)
    };
  }).filter(video => video.src); // Filter out videos without source

  // Send detected videos to background script
  chrome.runtime.sendMessage({
    type: 'VIDEO_DETECTED',
    videos: videoInfo
  });
}

function estimateVideoSize(video) {
  // Rough estimation based on resolution and duration
  if (!video.videoWidth || !video.videoHeight || !video.duration) return 0;
  
  const pixels = video.videoWidth * video.videoHeight;
  const duration = video.duration;
  const bitrate = pixels > 1920*1080 ? 4000000 : // 4K
                  pixels > 1280*720 ? 2000000 :  // HD
                  1000000;                       // SD
  
  return Math.floor((bitrate * duration) / 8); // Convert to bytes
}

// Listen for detection requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'DETECT_VIDEOS') {
    detectVideos();
  }
});

// Initial detection when page loads
if (document.readyState === 'complete') {
  detectVideos();
} else {
  window.addEventListener('load', detectVideos);
}