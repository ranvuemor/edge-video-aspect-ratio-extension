function getVideoId(video) {
  if (!video.dataset.aspectControllerId) {
    video.dataset.aspectControllerId = String(nextVideoId);
    nextVideoId += 1;
  }

  return video.dataset.aspectControllerId;
}

function setActiveVideo(video) {
  activeVideoId = getVideoId(video);
  updateControlStates();
}

function getActiveVideo() {
  if (activeVideoId) {
    const activeVideo = document.querySelector(`video[data-aspect-controller-id="${activeVideoId}"]`);

    if (activeVideo) {
      return activeVideo;
    }
  }

  return getLargestVisibleVideo();
}

function isValidVideo(video) {
  if (video.closest && video.closest('ytd-thumbnail, ytd-video-preview, #inline-preview-player, #inline-player, ytd-inline-preview-ui')) {
    return false;
  }
  return true;
}

function getLargestVisibleVideo() {
  return Array.from(document.querySelectorAll('video')).reduce((largestVideo, video) => {
    if (!isValidVideo(video)) return largestVideo;

    const rect = video.getBoundingClientRect();
    const area = rect.width * rect.height;

    if (rect.width <= 0 || rect.height <= 0) {
      return largestVideo;
    }

    if (!largestVideo || area > largestVideo.area) {
      return {
        video,
        area
      };
    }

    return largestVideo;
  }, null)?.video || null;
}

function createControlButton(label, title, onClick, variant = 'default') {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.title = title;
  button.className = variant === 'reset' ? 'var-button var-button-reset' : 'var-button';

  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  return button;
}

function createControlGroup(title) {
  const group = document.createElement('div');
  group.className = 'var-group';

  const heading = document.createElement('div');
  heading.textContent = title;
  heading.className = 'var-heading';

  const row = document.createElement('div');
  row.className = 'var-row var-row-3';

  group.appendChild(heading);
  group.appendChild(row);

  return {
    group,
    row
  };
}

function createButtonRow(columns = 3) {
  const row = document.createElement('div');
  row.className = `var-row var-row-${columns}`;

  return row;
}

function createResetRow(label, title, onClick) {
  const row = createButtonRow(1);
  row.appendChild(createControlButton(label, title, onClick, 'reset'));

  return row;
}

function setPanelOpen(entry, isOpen) {
  entry.isOpen = isOpen;
  entry.controls.dataset.panelOpen = isOpen ? 'true' : 'false';
}

function createVideoControls(video) {
  if (!isValidVideo(video)) {
    return;
  }

  const videoId = getVideoId(video);

  if (videoControls.has(videoId)) {
    return;
  }

  const controls = document.createElement('div');
  controls.dataset.aspectControllerFor = videoId;
  controls.className = 'var-controller';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.textContent = 'AR';
  trigger.title = 'Video controls';
  trigger.className = 'var-trigger';
  trigger.style.cssText = [
    'backdrop-filter: blur(8px)',
    'background: rgba(0, 0, 0, 0.42)',
    'border: 1px solid rgba(255, 255, 255, 0.36)',
    'border-radius: 999px',
    'box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22)',
    'color: #fff',
    'cursor: pointer',
    'font: 12px Arial, sans-serif',
    'height: 36px',
    'letter-spacing: 0',
    'line-height: 34px',
    'padding: 0',
    'text-align: center',
    'text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5)',
    'transition: opacity 150ms ease, transform 150ms ease',
    'width: 36px'
  ].join(';');
  trigger.style.setProperty('position', 'relative', 'important');
  trigger.style.setProperty('top', '0', 'important');
  trigger.style.setProperty('transform', 'none', 'important');
  trigger.style.setProperty('margin', '0', 'important');

  const panel = document.createElement('div');
  panel.className = 'var-panel';
//   panel.style.maxHeight = 'calc(100vh - 48px)';
//   panel.style.overflowY = 'auto';

  const closeButton = createControlButton('x', 'Close video controls', () => {
    const entry = videoControls.get(videoId);

    if (entry) {
      setPanelOpen(entry, false);
      updateControlPositions();
    }
  });
  closeButton.classList.add('var-close');

  const aspectGroup = createControlGroup('Aspect');
  ASPECT_PRESETS.forEach(aspect => {
    aspectGroup.row.appendChild(createControlButton(aspect, `Set ${aspect} aspect ratio`, () => {
      setActiveVideo(video);
      applyAspectPreset(video, aspect);
      updateControlPositions();
    }));
  });

  const aspectNudgeRow1 = createButtonRow(2);
  aspectNudgeRow1.style.display = 'grid';
  aspectNudgeRow1.style.gridTemplateColumns = 'repeat(2, 1fr)';
  aspectNudgeRow1.appendChild(createControlButton('Width -', 'Decrease width by 1%', () => {
    setActiveVideo(video);
    nudgeAspectScale(video, 'width', -1);
    updateControlPositions();
  }));
  aspectNudgeRow1.appendChild(createControlButton('Width +', 'Increase width by 1%', () => {
    setActiveVideo(video);
    nudgeAspectScale(video, 'width', 1);
    updateControlPositions();
  }));

  const aspectNudgeRow2 = createButtonRow(2);
  aspectNudgeRow2.style.display = 'grid';
  aspectNudgeRow2.style.gridTemplateColumns = 'repeat(2, 1fr)';
  aspectNudgeRow2.appendChild(createControlButton('Height -', 'Decrease height by 1%', () => {
    setActiveVideo(video);
    nudgeAspectScale(video, 'height', -1);
    updateControlPositions();
  }));
  aspectNudgeRow2.appendChild(createControlButton('Height +', 'Increase height by 1%', () => {
    setActiveVideo(video);
    nudgeAspectScale(video, 'height', 1);
    updateControlPositions();
  }));
  aspectGroup.group.appendChild(aspectNudgeRow1);
  aspectGroup.group.appendChild(aspectNudgeRow2);
  aspectGroup.group.appendChild(createResetRow('Reset Aspect', 'Reset aspect ratio', () => {
    setActiveVideo(video);
    resetVideoStyle(video);
    updateControlPositions();
  }));

  const orientationGroup = createControlGroup('Orientation');
  orientationGroup.row.remove();
  
  const orientationRow1 = createButtonRow(2);
  orientationRow1.style.display = 'grid';
  orientationRow1.style.gridTemplateColumns = 'repeat(2, 1fr)';
  orientationRow1.appendChild(createControlButton('Flip X', 'Flip horizontally', () => {
    setActiveVideo(video);
    toggleFlip(video, 'x');
    updateControlPositions();
  }));
  orientationRow1.appendChild(createControlButton('Flip Y', 'Flip vertically', () => {
    setActiveVideo(video);
    toggleFlip(video, 'y');
    updateControlPositions();
  }));
  
  const orientationRow2 = createButtonRow(3);
  orientationRow2.style.display = 'grid';
  orientationRow2.style.gridTemplateColumns = 'repeat(3, 1fr)';
  orientationRow2.appendChild(createControlButton('+90°', 'Rotate +90 degrees', () => {
    setActiveVideo(video); addRotation(video, 90); updateControlPositions();
  }));
  orientationRow2.appendChild(createControlButton('-90°', 'Rotate -90 degrees', () => {
    setActiveVideo(video); addRotation(video, -90); updateControlPositions();
  }));
  orientationRow2.appendChild(createControlButton('180°', 'Rotate 180 degrees', () => {
    setActiveVideo(video); addRotation(video, 180); updateControlPositions();
  }));
  
  orientationGroup.group.appendChild(orientationRow1);
  orientationGroup.group.appendChild(orientationRow2);
  orientationGroup.group.appendChild(createResetRow('Reset Orientation', 'Reset orientation', () => {
    setActiveVideo(video);
    resetOrientation(video);
    updateControlPositions();
  }));

  const speedGroup = createControlGroup('Speed');
  SPEED_PRESETS.forEach(speed => {
    speedGroup.row.appendChild(createControlButton(`${speed}x`, `Set ${speed}x playback speed`, () => {
      setActiveVideo(video);
      video.playbackRate = speed;
    }));
  });

  const speedNudgeRow = createButtonRow(2);
  speedNudgeRow.style.display = 'grid';
  speedNudgeRow.style.gridTemplateColumns = 'repeat(2, 1fr)';
  speedNudgeRow.appendChild(createControlButton('-0.1x', 'Decrease speed by 0.1x', () => {
    setActiveVideo(video);
    nudgePlaybackSpeed(video, -0.1);
  }));
  speedNudgeRow.appendChild(createControlButton('+0.1x', 'Increase speed by 0.1x', () => {
    setActiveVideo(video);
    nudgePlaybackSpeed(video, 0.1);
  }));
  speedGroup.group.appendChild(speedNudgeRow);
  speedGroup.group.appendChild(createResetRow('Reset Speed', 'Reset playback speed', () => {
    setActiveVideo(video);
    video.playbackRate = 1;
  }));

  trigger.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    setActiveVideo(video);
    const entry = videoControls.get(videoId);

    if (entry) {
      setPanelOpen(entry, true);
    }

    updateControlPositions();
  });

  panel.appendChild(closeButton);
  panel.appendChild(aspectGroup.group);
  panel.appendChild(orientationGroup.group);
  panel.appendChild(speedGroup.group);
  controls.appendChild(panel);
  controls.appendChild(trigger);

  controls.addEventListener('mouseenter', () => setActiveVideo(video));
  video.addEventListener('mouseenter', () => setActiveVideo(video));
  video.addEventListener('focus', () => setActiveVideo(video));
  video.addEventListener('click', () => setActiveVideo(video), true);

  document.body.appendChild(controls);
  videoControls.set(videoId, {
    controls,
    panel,
    trigger,
    isOpen: false,
    video
  });
}

function getControlsHost(video) {
  const fullscreenElement = document.fullscreenElement;

  if (fullscreenElement && fullscreenElement !== video && fullscreenElement.contains(video)) {
    return fullscreenElement;
  }

  return document.body;
}

function updateControlPosition(entry) {
  const {controls, panel, video} = entry;

  if (!document.documentElement.contains(video)) {
    controls.remove();
    videoControls.delete(video.dataset.aspectControllerId);
    return;
  }

  const rect = video.getBoundingClientRect();

  const isOutOfView = (
    rect.bottom <= 0 ||
    rect.top >= window.innerHeight ||
    rect.right <= 0 ||
    rect.left >= window.innerWidth
  );

  if (!isValidVideo(video) || rect.width <= 0 || rect.height <= 0 || isOutOfView) {
    controls.style.display = 'none';
    return;
  }

  const host = getControlsHost(video);

  if (controls.parentElement !== host) {
    host.appendChild(controls);
  }

  if (activeVideoId !== video.dataset.aspectControllerId && panel && entry.isOpen) {
    setPanelOpen(entry, false);
  }

  controls.style.setProperty('display', 'flex', 'important');
  controls.style.setProperty('position', 'fixed', 'important');
  controls.style.setProperty('align-items', 'flex-start', 'important');
  controls.style.setProperty('transform', 'none', 'important');
  controls.style.setProperty('margin', '0', 'important');
  controls.style.setProperty('padding', '0', 'important');

  const controlsWidth = entry.isOpen ? PANEL_WIDTH : 36;
  const idealPanelHeight = 520;
  const maxPanelHeight = window.innerHeight - 16;
  const controlsHeight = entry.isOpen ? Math.min(idealPanelHeight, maxPanelHeight) : 36;
  const right = Math.max(8, Math.min(
    window.innerWidth - controlsWidth - 8,
    window.innerWidth - rect.right + 8
  ));

  const isFullscreen = isVideoInFullscreen(video);
  const snapToViewportY = entry.isOpen || isFullscreen;
  const minTop = snapToViewportY ? 8 : -Infinity;
  const maxTop = snapToViewportY ? window.innerHeight - controlsHeight - 8 : Infinity;

  const top = Math.max(minTop, Math.min(maxTop, rect.top + 8));

  controls.style.setProperty('left', 'auto', 'important');
  controls.style.setProperty('bottom', 'auto', 'important');
  controls.style.setProperty('right', `${right}px`, 'important');
  controls.style.setProperty('top', `${top}px`, 'important');
  controls.style.setProperty('opacity', activeVideoId === video.dataset.aspectControllerId ? '1' : '0.35', 'important');

}

function updateControlPositions() {
  videoControls.forEach(updateControlPosition);
}

function updateControlStates() {
  updateControlPositions();
}