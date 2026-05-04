function registerVideos() {
  document.querySelectorAll('video').forEach(createVideoControls);

  if (!activeVideoId) {
    const largestVideo = getLargestVisibleVideo();

    if (largestVideo) {
      activeVideoId = getVideoId(largestVideo);
    }
  }

  updateControlPositions();
}

const observer = new MutationObserver(registerVideos);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

window.addEventListener('scroll', updateControlPositions, true);
window.addEventListener('resize', () => {
  if (document.fullscreenElement) {
    handleFullscreenAspectFrame();
    return;
  }

  updateControlPositions();
});
document.addEventListener('fullscreenchange', () => {
  registerVideos();
  handleFullscreenAspectFrame();

  if (document.fullscreenElement) {
    window.setTimeout(handleFullscreenAspectFrame, 100);
    return;
  }

  window.setTimeout(() => {
    clearAllVideoAspectOverrides();
    updateControlPositions();
  }, 100);
  window.setTimeout(() => {
    clearAllVideoAspectOverrides();
    updateControlPositions();
  }, 500);
});

registerVideos();
window.setInterval(registerVideos, 1500);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const targetVideo = getActiveVideo();

  if (!targetVideo) {
    return;
  }

  setActiveVideo(targetVideo);

  if (message.action === 'setAspectRatio') {
    applyContainedAspectRatio(targetVideo, message.width, message.height, message.ratio);
    updateControlPositions();
  }

  if (message.action === 'resetAspectRatio') {
    resetVideoStyle(targetVideo);
    updateControlPositions();
  }

  if (message.action === 'setPlaybackSpeed') {
    targetVideo.playbackRate = message.speed;
  }

  if (message.action === 'resetPlaybackSpeed') {
    targetVideo.playbackRate = 1;
  }
  
  if (message.action === 'setOrientation') {
    if (message.flipX) toggleFlip(targetVideo, 'x');
    if (message.flipY) toggleFlip(targetVideo, 'y');
    if (message.rotate) addRotation(targetVideo, message.rotate);
    updateControlPositions();
  }
  
  if (message.action === 'resetOrientation') {
    resetOrientation(targetVideo);
    updateControlPositions();
  }
});
