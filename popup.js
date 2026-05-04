function sendVideoMessage(message) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

function applyAspectRatio(aspectInput) {
  const parts = aspectInput.split(':');
  if (parts.length === 2) {
    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);
    if (width > 0 && height > 0) {
      const ratio = width / height;
      sendVideoMessage({
        action: 'setAspectRatio',
        ratio: ratio,
        width: width,
        height: height
      });
    } else {
      alert('Invalid aspect ratio');
    }
  } else {
    alert('Please enter in format width:height');
  }
}

document.getElementById('apply-aspect').addEventListener('click', () => {
  applyAspectRatio(document.getElementById('aspect').value);
});

document.querySelectorAll('.aspect-preset').forEach(button => {
  button.addEventListener('click', () => {
    const aspect = button.dataset.aspect;
    document.getElementById('aspect').value = aspect;
    applyAspectRatio(aspect);
  });
});

document.getElementById('reset-aspect').addEventListener('click', () => {
  document.getElementById('aspect').value = '';
  sendVideoMessage({action: 'resetAspectRatio'});
});

document.getElementById('apply-speed').addEventListener('click', () => {
  const speed = parseFloat(document.getElementById('speed').value);

  if (Number.isNaN(speed) || speed <= 0) {
    alert('Please enter a valid playback speed');
    return;
  }

  sendVideoMessage({action: 'setPlaybackSpeed', speed: speed});
});

document.querySelectorAll('.speed-preset').forEach(button => {
  button.addEventListener('click', () => {
    const speed = parseFloat(button.dataset.speed);
    document.getElementById('speed').value = speed;
    sendVideoMessage({action: 'setPlaybackSpeed', speed: speed});
  });
});

document.getElementById('reset-speed').addEventListener('click', () => {
  document.getElementById('speed').value = 1;
  sendVideoMessage({action: 'resetPlaybackSpeed'});
});
