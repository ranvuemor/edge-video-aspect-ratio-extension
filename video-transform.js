function saveOriginalInlineStyle(video) {
  if (video.dataset.originalInlineStyleSaved) {
    return;
  }

  video.dataset.originalInlineStyleSaved = 'true';
  video.dataset.originalInlineStyle = video.getAttribute('style') || '';
  video.dataset.originalInlineTransform = video.style.transform || '';
}

function toggleFlip(video, axis) {
  saveOriginalInlineStyle(video);
  saveAspectFrame(video);
  const key = axis === 'x' ? 'orientationFlipX' : 'orientationFlipY';
  const current = parseInt(video.dataset[key] || '1', 10);
  if (current === -1) {
    delete video.dataset[key];
  } else {
    video.dataset[key] = '-1';
  }
  applyTransform(video);
}

function addRotation(video, degrees) {
  saveOriginalInlineStyle(video);
  saveAspectFrame(video);
  const current = parseInt(video.dataset.orientationRotate || '0', 10);
  let next = (current + degrees) % 360;
  if (next <= -180) next += 360;
  else if (next > 180) next -= 360;
  
  if (next === 0) {
    delete video.dataset.orientationRotate;
  } else {
    video.dataset.orientationRotate = String(next);
  }
  applyTransform(video);
}

function resetOrientation(video) {
  delete video.dataset.orientationFlipX;
  delete video.dataset.orientationFlipY;
  delete video.dataset.orientationRotate;
  applyTransform(video);
}

function getStoredOrientationState(video) {
  if (video.dataset.orientationRotate || video.dataset.orientationFlipX || video.dataset.orientationFlipY) {
    return {
      rotate: video.dataset.orientationRotate || '0',
      flipX: video.dataset.orientationFlipX || '1',
      flipY: video.dataset.orientationFlipY || '1'
    };
  }
  return null;
}

function reapplyOrientationState(video, state) {
  if (!state) return;
  video.dataset.orientationRotate = state.rotate;
  video.dataset.orientationFlipX = state.flipX;
  video.dataset.orientationFlipY = state.flipY;
  applyTransform(video);
}

function applyTransform(video) {
  const scaleX = parseFloat(video.style.getPropertyValue('--var-scale-x') || '1');
  const scaleY = parseFloat(video.style.getPropertyValue('--var-scale-y') || '1');
  const flipX = parseInt(video.dataset.orientationFlipX || '1', 10);
  const flipY = parseInt(video.dataset.orientationFlipY || '1', 10);
  const rotate = parseInt(video.dataset.orientationRotate || '0', 10);

  let finalScaleX = scaleX * flipX;
  let finalScaleY = scaleY * flipY;

  if (Math.abs(rotate) % 180 === 90) {
    const frameWidth = parseFloat(video.dataset.aspectFrameWidth || video.clientWidth || video.videoWidth);
    const frameHeight = parseFloat(video.dataset.aspectFrameHeight || video.clientHeight || video.videoHeight);

    if (frameWidth > 0 && frameHeight > 0) {
      const fitScale = Math.min(frameWidth / frameHeight, frameHeight / frameWidth);
      finalScaleX *= fitScale;
      finalScaleY *= fitScale;
    }
  }

  let transformStr = '';

  if (video.dataset.fullscreenAspectFrame === 'true') {
    transformStr += 'translate(-50%, -50%) ';
  }

  if (rotate !== 0) transformStr += `rotate(${rotate}deg) `;
  if (finalScaleX !== 1 || finalScaleY !== 1) transformStr += `scale(${finalScaleX}, ${finalScaleY})`;

  if (transformStr) {
    video.style.setProperty('transform', transformStr.trim(), 'important');
  } else {
    video.style.removeProperty('transform');
    if (video.dataset.originalInlineTransform) {
      video.style.setProperty('transform', video.dataset.originalInlineTransform);
    }
  }

  if (transformStr || video.dataset.aspectMode) {
    video.style.setProperty('object-fit', 'contain', 'important');
    video.style.setProperty('object-position', 'center center', 'important');
    video.style.setProperty('transform-origin', 'center center', 'important');
  } else if (video.dataset.fullscreenAspectFrame !== 'true') {
    video.style.removeProperty('object-fit');
    video.style.removeProperty('object-position');
    video.style.removeProperty('transform-origin');
  }

  applyFullscreenPositioning(video);
}

function saveAspectFrame(video) {
  if (video.dataset.aspectFrameWidth && video.dataset.aspectFrameHeight) {
    return;
  }

  updateAspectFrame(video);
}

function updateAspectFrame(video, frameRect) {
  const rect = frameRect || video.getBoundingClientRect();
  const frameWidth = rect.width || video.clientWidth || video.videoWidth;
  const frameHeight = rect.height || video.clientHeight || video.videoHeight;

  if (frameWidth > 0 && frameHeight > 0) {
    video.dataset.aspectFrameWidth = String(frameWidth);
    video.dataset.aspectFrameHeight = String(frameHeight);
  }
}

function getFullscreenFrameRect(video) {
  const fullscreenElement = document.fullscreenElement;

  if (!fullscreenElement) {
    return null;
  }

  if (fullscreenElement === video || fullscreenElement.contains(video)) {
    const rect = fullscreenElement.getBoundingClientRect();

    return {
      width: rect.width || window.innerWidth,
      height: rect.height || window.innerHeight
    };
  }

  return null;
}

function isVideoInFullscreen(video) {
  const fullscreenElement = document.fullscreenElement;

  return Boolean(fullscreenElement && (fullscreenElement === video || fullscreenElement.contains(video)));
}

function removeAspectVariables(video) {
  video.style.removeProperty('--var-aspect-ratio');
  video.style.removeProperty('--var-frame-width');
  video.style.removeProperty('--var-frame-height');
  video.style.removeProperty('--var-scale-x');
  video.style.removeProperty('--var-scale-y');
}

function removeExtensionLayoutProperties(video) {
  video.style.removeProperty('aspect-ratio');
  video.style.removeProperty('bottom');
  video.style.removeProperty('display');
  video.style.removeProperty('height');
  video.style.removeProperty('inset');
  video.style.removeProperty('left');
  video.style.removeProperty('margin');
  video.style.removeProperty('max-height');
  video.style.removeProperty('max-width');
  video.style.removeProperty('min-height');
  video.style.removeProperty('min-width');
  video.style.removeProperty('object-fit');
  video.style.removeProperty('object-position');
  video.style.removeProperty('padding');
  video.style.removeProperty('position');
  video.style.removeProperty('right');
  video.style.removeProperty('top');
  video.style.removeProperty('transform');
  video.style.removeProperty('transform-origin');
  video.style.removeProperty('width');
  video.style.removeProperty('z-index');
}

function clearAspectState(video) {
  delete video.dataset.aspectFrameWidth;
  delete video.dataset.aspectFrameHeight;
  delete video.dataset.aspectScaleWidth;
  delete video.dataset.aspectScaleHeight;
  delete video.dataset.aspectMode;
  delete video.dataset.aspectTargetWidth;
  delete video.dataset.aspectTargetHeight;
  delete video.dataset.aspectTargetRatio;
  delete video.dataset.fullscreenAspectFrame;
  delete video.dataset.windowedAspectFrameWidth;
  delete video.dataset.windowedAspectFrameHeight;
}

function savePreFullscreenInlineStyle(video) {
  if (video.dataset.preFullscreenInlineStyleSaved) {
    return;
  }

  video.dataset.preFullscreenInlineStyleSaved = 'true';
  video.dataset.preFullscreenHadInlineStyle = video.hasAttribute('style') ? 'true' : 'false';
  video.dataset.preFullscreenInlineStyle = video.getAttribute('style') || '';
}

function restorePreFullscreenInlineStyle(video) {
  if (!video.dataset.preFullscreenInlineStyleSaved) {
    return;
  }

  if (video.dataset.preFullscreenHadInlineStyle === 'true') {
    video.setAttribute('style', video.dataset.preFullscreenInlineStyle || '');
  } else {
    video.removeAttribute('style');
  }

  delete video.dataset.preFullscreenInlineStyleSaved;
  delete video.dataset.preFullscreenHadInlineStyle;
  delete video.dataset.preFullscreenInlineStyle;
}

function getStoredAspectState(video) {
  if (video.dataset.aspectMode === 'ratio') {
    return {
      mode: 'ratio',
      width: parseFloat(video.dataset.aspectTargetWidth),
      height: parseFloat(video.dataset.aspectTargetHeight),
      ratio: parseFloat(video.dataset.aspectTargetRatio)
    };
  }

  if (video.dataset.aspectMode === 'scale') {
    return {
      mode: 'scale',
      widthPercent: parseFloat(video.dataset.aspectScaleWidth || '100'),
      heightPercent: parseFloat(video.dataset.aspectScaleHeight || '100')
    };
  }

  return null;
}

function reapplyAspectState(video, aspectState, preserveFrameSize = false) {
  if (!aspectState) {
    return;
  }

  if (!preserveFrameSize) {
    delete video.dataset.aspectFrameWidth;
    delete video.dataset.aspectFrameHeight;
  } else if (video.dataset.windowedAspectFrameWidth && video.dataset.windowedAspectFrameHeight) {
    video.dataset.aspectFrameWidth = video.dataset.windowedAspectFrameWidth;
    video.dataset.aspectFrameHeight = video.dataset.windowedAspectFrameHeight;
  }

  if (aspectState.mode === 'ratio' && aspectState.width > 0 && aspectState.height > 0 && aspectState.ratio > 0) {
    applyContainedAspectRatio(video, aspectState.width, aspectState.height, aspectState.ratio);
  }

  if (aspectState.mode === 'scale') {
    video.dataset.aspectScaleWidth = String(aspectState.widthPercent || 100);
    video.dataset.aspectScaleHeight = String(aspectState.heightPercent || 100);
    applyScaledSize(video);
  }
}

function clearFullscreenPositioning(video) {
  delete video.dataset.fullscreenAspectFrame;
  removeExtensionLayoutProperties(video);
}

function clearVideoAspectOverride(video) {
  const aspectState = getStoredAspectState(video);
  const orientationState = getStoredOrientationState(video);

  const wasInFullscreen = video.dataset.fullscreenAspectFrame === 'true' ||
                          video.dataset.preFullscreenInlineStyleSaved === 'true' ||
                          video.dataset.restoreStyleAfterFullscreen === 'true';

  if (wasInFullscreen) {
    delete video.dataset.restoreStyleAfterFullscreen;

    if ((!aspectState || aspectState.mode === 'fullscreen-reset') && !orientationState) {
      delete video.dataset.originalInlineStyleSaved;
      delete video.dataset.originalInlineStyle;
      delete video.dataset.originalInlineTransform;
    }

    clearFullscreenPositioning(video);
    restorePreFullscreenInlineStyle(video);
  }

  const windowedWidth = video.dataset.windowedAspectFrameWidth;
  const windowedHeight = video.dataset.windowedAspectFrameHeight;

  clearAspectState(video);
  removeAspectVariables(video);

  if (windowedWidth && windowedHeight) {
    video.dataset.windowedAspectFrameWidth = windowedWidth;
    video.dataset.windowedAspectFrameHeight = windowedHeight;
    video.dataset.aspectFrameWidth = windowedWidth;
    video.dataset.aspectFrameHeight = windowedHeight;
  }

  if (aspectState && aspectState.mode !== 'fullscreen-reset') {
    reapplyAspectState(video, aspectState, Boolean(windowedWidth && windowedHeight));
  }
  reapplyOrientationState(video, orientationState);
}

function clearAllVideoAspectOverrides() {
  document.querySelectorAll([
    'video[data-aspect-mode]',
    'video[data-fullscreen-aspect-frame="true"]',
    'video[data-pre-fullscreen-inline-style-saved="true"]',
    'video[data-restore-style-after-fullscreen="true"]',
    'video[data-original-inline-style-saved="true"]'
  ].join(',')).forEach(clearVideoAspectOverride);
}

function keepFullscreenVideoVisible(video) {
  const frameRect = getFullscreenFrameRect(video) || {
    width: window.innerWidth,
    height: window.innerHeight
  };

  video.dataset.aspectMode = 'fullscreen-reset';
  video.dataset.fullscreenAspectFrame = 'true';
  video.dataset.restoreStyleAfterFullscreen = 'true';

  updateAspectFrame(video, frameRect);

  video.style.setProperty('--var-aspect-ratio', `${frameRect.width} / ${frameRect.height}`);
  video.style.setProperty('--var-frame-width', `${frameRect.width}px`);
  video.style.setProperty('--var-frame-height', `${frameRect.height}px`);
  video.style.setProperty('--var-scale-x', 1);
  video.style.setProperty('--var-scale-y', 1);
  video.style.removeProperty('aspect-ratio');

  applyTransform(video);
}

function reapplyStoredAspect(video) {
  let aspectApplied = false;

  if (video.dataset.aspectMode === 'ratio') {
    const width = parseFloat(video.dataset.aspectTargetWidth);
    const height = parseFloat(video.dataset.aspectTargetHeight);
    const ratio = parseFloat(video.dataset.aspectTargetRatio);

    if (width > 0 && height > 0 && ratio > 0) {
      applyContainedAspectRatio(video, width, height, ratio);
      aspectApplied = true;
    }
  }

  if (video.dataset.aspectMode === 'scale') {
    applyScaledSize(video);
    aspectApplied = true;
  }

  if (!aspectApplied) {
    const orientationState = getStoredOrientationState(video);
    if (orientationState) {
      reapplyOrientationState(video, orientationState);
    }
  }
}

function handleFullscreenAspectFrame() {
  const fullscreenElement = document.fullscreenElement;

  if (!fullscreenElement) {
    clearAllVideoAspectOverrides();
    updateControlPositions();
    return;
  }

  fullscreenElement.querySelectorAll?.('video[data-original-inline-style-saved="true"]').forEach(video => {
    const frameRect = getFullscreenFrameRect(video);

    if (!frameRect) {
      return;
    }

    savePreFullscreenInlineStyle(video);

    if (!video.dataset.fullscreenAspectFrame) {
      video.dataset.windowedAspectFrameWidth = video.dataset.aspectFrameWidth || '';
      video.dataset.windowedAspectFrameHeight = video.dataset.aspectFrameHeight || '';
    }

    video.dataset.fullscreenAspectFrame = 'true';
    updateAspectFrame(video, frameRect);
    reapplyStoredAspect(video);
  });

  if (fullscreenElement.matches?.('video[data-original-inline-style-saved="true"]')) {
    const frameRect = getFullscreenFrameRect(fullscreenElement);

    if (frameRect) {
      savePreFullscreenInlineStyle(fullscreenElement);

      if (!fullscreenElement.dataset.fullscreenAspectFrame) {
        fullscreenElement.dataset.windowedAspectFrameWidth = fullscreenElement.dataset.aspectFrameWidth || '';
        fullscreenElement.dataset.windowedAspectFrameHeight = fullscreenElement.dataset.aspectFrameHeight || '';
      }

      fullscreenElement.dataset.fullscreenAspectFrame = 'true';
      updateAspectFrame(fullscreenElement, frameRect);
      reapplyStoredAspect(fullscreenElement);
    }
  }

  updateControlPositions();
}

function getContainedSize(frameWidth, frameHeight, targetRatio) {
  const frameRatio = frameWidth / frameHeight;

  if (frameRatio > targetRatio) {
    return {
      width: frameHeight * targetRatio,
      height: frameHeight
    };
  }

  return {
    width: frameWidth,
    height: frameWidth / targetRatio
  };
}

function applyContainedAspectRatio(video, width, height, ratio) {
  saveOriginalInlineStyle(video);
  saveAspectFrame(video);
  resetAspectScale(video);
  video.dataset.aspectMode = 'ratio';
  video.dataset.aspectTargetWidth = String(width);
  video.dataset.aspectTargetHeight = String(height);
  video.dataset.aspectTargetRatio = String(ratio);

  const frameWidth = parseFloat(video.dataset.aspectFrameWidth);
  const frameHeight = parseFloat(video.dataset.aspectFrameHeight);

  if (!frameWidth || !frameHeight || !ratio) {
    return;
  }

  const contained = getContainedSize(frameWidth, frameHeight, ratio);
  const scaleX = contained.width / frameWidth;
  const scaleY = contained.height / frameHeight;

  video.style.setProperty('--var-aspect-ratio', `${width} / ${height}`);
  video.style.setProperty('--var-frame-width', `${frameWidth}px`);
  video.style.setProperty('--var-frame-height', `${frameHeight}px`);
  video.style.setProperty('--var-scale-x', scaleX);
  video.style.setProperty('--var-scale-y', scaleY);

  applyTransform(video);
  applyFullscreenPositioning(video);
}

function resetAspectScale(video) {
  video.dataset.aspectScaleWidth = '100';
  video.dataset.aspectScaleHeight = '100';
}

function applyScaledSize(video) {
  saveOriginalInlineStyle(video);
  saveAspectFrame(video);
  video.dataset.aspectMode = 'scale';

  const frameWidth = parseFloat(video.dataset.aspectFrameWidth);
  const frameHeight = parseFloat(video.dataset.aspectFrameHeight);
  const widthPercent = parseFloat(video.dataset.aspectScaleWidth || '100');
  const heightPercent = parseFloat(video.dataset.aspectScaleHeight || '100');

  if (!frameWidth || !frameHeight || !widthPercent || !heightPercent) {
    return;
  }

  const scaledWidth = frameWidth * widthPercent / 100;
  const scaledHeight = frameHeight * heightPercent / 100;
  const scaleX = scaledWidth / frameWidth;
  const scaleY = scaledHeight / frameHeight;

  video.style.setProperty('--var-aspect-ratio', `${scaledWidth} / ${scaledHeight}`);
  video.style.setProperty('--var-frame-width', `${frameWidth}px`);
  video.style.setProperty('--var-frame-height', `${frameHeight}px`);
  video.style.setProperty('--var-scale-x', scaleX);
  video.style.setProperty('--var-scale-y', scaleY);

  applyTransform(video);
  applyFullscreenPositioning(video);
}

function applyFullscreenPositioning(video) {
  if (video.dataset.fullscreenAspectFrame === 'true') {
    const frameWidth = video.dataset.aspectFrameWidth;
    const frameHeight = video.dataset.aspectFrameHeight;
    video.style.setProperty('object-fit', 'contain', 'important');
    video.style.setProperty('object-position', 'center center', 'important');
    video.style.setProperty('transform-origin', 'center center', 'important');
    if (frameWidth && frameHeight) {
      video.style.setProperty('width', `${frameWidth}px`, 'important');
      video.style.setProperty('height', `${frameHeight}px`, 'important');
    }
    video.style.setProperty('max-width', 'none', 'important');
    video.style.setProperty('max-height', 'none', 'important');
    video.style.setProperty('display', 'block', 'important');

    video.style.setProperty('position', 'fixed', 'important');
    video.style.setProperty('top', '50%', 'important');
    video.style.setProperty('left', '50%', 'important');
    video.style.setProperty('bottom', 'auto', 'important');
    video.style.setProperty('right', 'auto', 'important');
    video.style.setProperty('margin', '0', 'important');
    video.style.setProperty('padding', '0', 'important');
  }
}

function nudgeAspectScale(video, dimension, amount) {
  const key = dimension === 'width' ? 'aspectScaleWidth' : 'aspectScaleHeight';
  const currentValue = parseFloat(video.dataset[key] || '100');

  video.dataset[key] = String(Math.max(1, currentValue + amount));
  applyScaledSize(video);
}

function nudgePlaybackSpeed(video, amount) {
  const nextSpeed = Math.max(0.1, Math.round((video.playbackRate + amount) * 10) / 10);
  video.playbackRate = nextSpeed;
}

function resetVideoStyle(video) {
  if (isVideoInFullscreen(video)) {
    if (!video.dataset.windowedAspectFrameWidth && video.dataset.aspectFrameWidth) {
      video.dataset.windowedAspectFrameWidth = video.dataset.aspectFrameWidth;
      video.dataset.windowedAspectFrameHeight = video.dataset.aspectFrameHeight || '';
    }

    delete video.dataset.aspectScaleWidth;
    delete video.dataset.aspectScaleHeight;
    delete video.dataset.aspectTargetWidth;
    delete video.dataset.aspectTargetHeight;
    delete video.dataset.aspectTargetRatio;
    keepFullscreenVideoVisible(video);

    return;
  }

  const orientationState = getStoredOrientationState(video);

  if (video.dataset.originalInlineStyleSaved) {
    if (video.dataset.originalInlineStyle) {
      video.setAttribute('style', video.dataset.originalInlineStyle);
    } else {
      video.removeAttribute('style');
    }

    if (!orientationState) {
      delete video.dataset.originalInlineStyleSaved;
      delete video.dataset.originalInlineStyle;
      delete video.dataset.originalInlineTransform;
    }

    delete video.dataset.restoreStyleAfterFullscreen;
    clearAspectState(video);
    removeAspectVariables(video);

    reapplyOrientationState(video, orientationState);
    return;
  }

  const rect = video.getBoundingClientRect();
  const currentWidth = rect.width || video.clientWidth || video.videoWidth;
  const naturalRatio = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 16 / 9;

  video.style.removeProperty('aspect-ratio');
  removeExtensionLayoutProperties(video);
  clearAspectState(video);
  removeAspectVariables(video);

  if (currentWidth > 0) {
    video.style.setProperty('width', `${currentWidth}px`, 'important');
    video.style.setProperty('height', `${currentWidth / naturalRatio}px`, 'important');
  } else {
    video.style.removeProperty('width');
    video.style.removeProperty('height');
  }

  reapplyOrientationState(video, orientationState);
}

function applyAspectPreset(video, aspectInput) {
  const parts = aspectInput.split(':');
  const width = parseFloat(parts[0]);
  const height = parseFloat(parts[1]);

  if (width > 0 && height > 0) {
    applyContainedAspectRatio(video, width, height, width / height);
  }
}